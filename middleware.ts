import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";

import { routing } from "@/i18n/routing";
import { ADMIN_ROLES } from "@/lib/constants";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";

const intlMiddleware = createMiddleware(routing);

const LOCALE_PREFIX = /^\/(fa|en)(?=\/|$)/;

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Protect the credentials callback with a per-IP rate limit. NextAuth's
  // per-email limiter lives in the authorize callback; this adds a second,
  // broader layer that also covers unknown emails.
  if (pathname === "/api/auth/callback/credentials") {
    const ip = getClientIp(request.headers);
    const limiter = rateLimit(`login-ip:${ip}`, 20, 15 * 60 * 1000);
    if (!limiter.allowed) {
      return new NextResponse("Too many sign-in attempts. Try again later.", {
        status: 429,
        headers: { "Retry-After": String(limiter.retryAfterSeconds) },
      });
    }
    return NextResponse.next();
  }

  const prefixMatch = pathname.match(LOCALE_PREFIX);
  const locale = prefixMatch?.[1] ?? routing.defaultLocale;
  const pathWithoutLocale = prefixMatch
    ? pathname.slice(prefixMatch[0].length) || "/"
    : pathname;

  // `/en` is no longer canonical now that English is the default locale.
  // Redirect old English-prefixed URLs before auth/callback handling so
  // callbackUrl never points at a non-canonical path.
  if (prefixMatch && locale === routing.defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathWithoutLocale;
    return NextResponse.redirect(url, 308);
  }

  const isAdminRoute =
    pathWithoutLocale === "/dashboard" ||
    pathWithoutLocale.startsWith("/dashboard/");

  if (isAdminRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const role = token?.role as string | undefined;
    const authorized = Boolean(token) && ADMIN_ROLES.includes(role as never);

    if (!authorized) {
      const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
      const signInUrl = new URL(`${localePrefix}/auth/signin`, request.url);
      signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(signInUrl);
    }
  }

  const response = intlMiddleware(request);
  if (isAdminRoute) {
    // Admin HTML contains account/content data and must never be cached.
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|uploads|.*\\..*).*)",
    "/api/auth/callback/credentials",
  ],
};
