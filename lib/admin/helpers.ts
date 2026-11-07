import { redirect } from "next/navigation";

import type { Locale } from "@/lib/constants";

export function localePrefix(locale: Locale) {
  return locale === "fa" ? "/fa" : "";
}

export function getString(formData: FormData, key: string, max = 5000) {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function getOptionalString(formData: FormData, key: string, max = 5000) {
  const value = getString(formData, key, max);
  return value || null;
}

export function getBool(formData: FormData, key: string) {
  return formData.get(key) === "1" || formData.get(key) === "on";
}

export function getInt(formData: FormData, key: string, fallback = 0) {
  const value = Number(getString(formData, key, 20));
  return Number.isFinite(value) ? Math.trunc(value) : fallback;
}

export function getList(formData: FormData, key: string) {
  return getString(formData, key, 10_000)
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isValidHttpUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Accepts an empty value, an http(s) URL, or a local absolute path. */
export function isValidMediaUrl(value: string) {
  if (!value) return true;
  return isValidHttpUrl(value) || (value.startsWith("/") && !value.startsWith("//"));
}

export function getIntInRange(
  formData: FormData,
  key: string,
  min: number,
  max: number,
  fallback = 0
) {
  const value = getInt(formData, key, fallback);
  return Math.min(max, Math.max(min, value));
}

export function isValidEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export function saved(locale: Locale, path: string, message = "Saved.") {
  redirect(`${localePrefix(locale)}/dashboard/${path}?saved=${encodeURIComponent(message)}`);
}

export function failed(locale: Locale, path: string, message: string) {
  redirect(`${localePrefix(locale)}/dashboard/${path}?error=${encodeURIComponent(message)}`);
}

/**
 * Next.js implements redirect() by throwing. A catch block around an action
 * must rethrow that error or the redirect is reported as a database failure.
 */
export function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

/** Reads a File input from FormData, returning null when empty. */
export function getFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  if (!value || typeof value === "string") return null;
  if (value.size === 0) return null;
  return value;
}
