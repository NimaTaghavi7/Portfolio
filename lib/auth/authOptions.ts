import { compare } from "bcrypt";
import type { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { ADMIN_ROLES } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import {
  consumeRateLimit,
  hashRateLimitKey,
} from "@/lib/security/rate-limit-db";

const INVALID_PASSWORD_HASH =
  "$2b$12$z9sxfHzKem7w/ZWUj8/Jbe1n5ds9JKQEHtTZWGgF78e/mmVI2vFT.";

const isProd = process.env.NODE_ENV === "production";
// Secure cookies require HTTPS. Local production testing often runs on
// http://localhost, so derive this from NEXTAUTH_URL instead of NODE_ENV.
const useSecureCookies =
  isProd && (process.env.NEXTAUTH_URL ?? "").startsWith("https://");

const authSecret = process.env.NEXTAUTH_SECRET;
if (!authSecret || authSecret.length < 32) {
  throw new Error(
    "NEXTAUTH_SECRET is missing or too short. Set a random value of at least 32 characters."
  );
}

export const authOptions: AuthOptions = {
  secret: authSecret,
  useSecureCookies,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 15,
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;
        if (password.length > 128) return null;

        try {
          const limiter = await consumeRateLimit(
            hashRateLimitKey("login", email),
            8,
            15 * 60 * 1000
          );
          if (!limiter.allowed) return null;
        } catch (error) {
          // Fail closed: if the limiter store is unavailable, do not allow
          // unlimited password guessing.
          console.error("Login rate limiter failed", error);
          return null;
        }

        let user = null;
        try {
          user = await prisma.user.findUnique({ where: { email } });
        } catch (error) {
          console.error("Failed to look up admin user", error);
          return null;
        }

        // Always perform a bcrypt comparison to reduce user-enumeration timing.
        const passwordHash = user?.passwordHash ?? INVALID_PASSWORD_HASH;
        const passwordMatches = await compare(password, passwordHash);

        if (!user || !passwordMatches) return null;
        if (!ADMIN_ROLES.includes(user.role)) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: useSecureCookies
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: useSecureCookies
        ? "__Secure-next-auth.callback-url"
        : "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: useSecureCookies
        ? "__Host-next-auth.csrf-token"
        : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.sessionVersion = token.sessionVersion as number;
      }
      return session;
    },
  },
};
