"use server";

import { compare, hash } from "bcrypt";

import { requireAdmin } from "@/lib/auth/session";
import {
  failed,
  getString,
  isRedirectError,
  isValidEmail,
  saved,
} from "@/lib/admin/helpers";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import {
  consumeRateLimit,
  hashRateLimitKey,
} from "@/lib/security/rate-limit-db";

function localeFrom(formData: FormData): Locale {
  return getString(formData, "locale", 5) === "en" ? "en" : "fa";
}

export async function updateAccountAction(formData: FormData) {
  const session = await requireAdmin();
  const locale = localeFrom(formData);
  const name = getString(formData, "name", 120);
  const email = getString(formData, "email", 254).toLowerCase();
  const currentPassword = getString(formData, "currentPassword", 200);

  if (!name || !email || !isValidEmail(email)) {
    return failed(locale, "account", "Name and a valid email are required.");
  }

  try {
    const current = await prisma.user.findUnique({
      where: { id: session.user.id! },
      select: { email: true, passwordHash: true },
    });
    if (!current) return failed(locale, "account", "Account not found.");

    const emailChanged = current.email !== email;

    if (emailChanged) {
      const limiter = await consumeRateLimit(
        hashRateLimitKey("account-email-change", session.user.id!),
        5,
        15 * 60 * 1000
      );
      if (!limiter.allowed) {
        return failed(locale, "account", "Too many attempts. Try again later.");
      }
      if (!currentPassword) {
        return failed(
          locale,
          "account",
          "Enter your current password to change the email address."
        );
      }
      const passwordMatches = await compare(currentPassword, current.passwordHash);
      if (!passwordMatches) {
        return failed(locale, "account", "Current password is incorrect.");
      }
    }

    await prisma.user.update({
      where: { id: session.user.id! },
      data: {
        name,
        email,
        // Changing the sign-in identifier invalidates every existing JWT.
        ...(emailChanged ? { sessionVersion: { increment: 1 } } : {}),
      },
    });

    if (emailChanged) {
      return saved(
        locale,
        "account",
        "Account updated. Sign in again with the new email."
      );
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return failed(locale, "account", "That email is already in use.");
    }
    console.error("updateAccountAction failed", error);
    return failed(locale, "account", "Could not update the account.");
  }

  saved(locale, "account", "Account details updated.");
}

export async function changePasswordAction(formData: FormData) {
  const session = await requireAdmin();
  const locale = localeFrom(formData);
  const currentPassword = getString(formData, "currentPassword", 200);
  const newPassword = getString(formData, "newPassword", 128);
  const confirmPassword = getString(formData, "confirmPassword", 128);

  if (!currentPassword || !newPassword) {
    return failed(locale, "account", "All password fields are required.");
  }
  if (newPassword.length < 12) {
    return failed(locale, "account", "New password must be at least 12 characters.");
  }
  if (newPassword.length > 128) {
    return failed(locale, "account", "New password must not exceed 128 characters.");
  }
  if (newPassword !== confirmPassword) {
    return failed(locale, "account", "New passwords do not match.");
  }
  if (newPassword === currentPassword) {
    return failed(locale, "account", "New password must be different from the current one.");
  }

  try {
    const limiter = await consumeRateLimit(
      hashRateLimitKey("password-change", session.user.id!),
      5,
      15 * 60 * 1000
    );
    if (!limiter.allowed) {
      return failed(locale, "account", "Too many attempts. Try again later.");
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id! } });
    if (!user) return failed(locale, "account", "Account not found.");

    const valid = await compare(currentPassword, user.passwordHash);
    if (!valid) return failed(locale, "account", "Current password is incorrect.");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hash(newPassword, 12),
        // Invalidate all existing sessions, including this one.
        sessionVersion: { increment: 1 },
      },
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("changePasswordAction failed", error);
    return failed(locale, "account", "Could not update the password.");
  }

  saved(locale, "account", "Password updated. Please sign in again.");
}
