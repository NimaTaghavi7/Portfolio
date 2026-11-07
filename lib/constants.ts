export const SITE_NAME = "Nima Taghavi";
export const PROFESSIONAL_TITLE = "Frontend Developer | Web Designer";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://nimataghavi.ir";

export const ADMIN_ROLES = ["ADMIN", "ROOT"] as const;
export const LOCALES = ["fa", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_AVATAR = "/images/placeholders/avatar.svg";
export const DEFAULT_HERO_IMAGE = "/images/placeholders/hero.svg";
export const DEFAULT_OG_IMAGE = "/images/placeholders/og.png";
