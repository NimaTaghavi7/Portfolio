import { cache } from "react";

import {
  DEFAULT_AVATAR,
  DEFAULT_HERO_IMAGE,
  DEFAULT_OG_IMAGE,
  PROFESSIONAL_TITLE,
  SITE_NAME,
  type Locale,
} from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export function pick(locale: Locale, fa: string | null | undefined, en: string | null | undefined) {
  const primary = locale === "fa" ? fa : en;
  const secondary = locale === "fa" ? en : fa;
  return (primary || secondary || "").trim();
}

export function localizedField<T extends Record<string, unknown>>(
  locale: Locale,
  row: T,
  base: string
) {
  return pick(
    locale,
    row[`${base}Fa`] as string | null | undefined,
    row[`${base}En`] as string | null | undefined
  );
}

/** Only allow safe external links coming from the database or admin forms. */
export function safeUrl(
  value: string | null | undefined,
  allowMail = true,
  allowRelative = false
) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (allowRelative && trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  if (allowMail && /^mailto:[^\s]+@[^\s]+$/i.test(trimmed)) return trimmed;
  if (/^tel:[+0-9()\-\s]+$/i.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

export type SocialLink = {
  key: string;
  label: string;
  href: string;
  icon: "github" | "linkedin" | "instagram" | "telegram" | "x" | "dribbble" | "behance" | "mail";
};

export type SiteSettingsView = {
  fullName: string;
  displayName: string;
  title: string;
  bio: string;
  about: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  availability: boolean;
  availabilityText: string | null;
  avatarUrl: string;
  heroImageUrl: string;
  resumeUrl: string | null;
  socials: SocialLink[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  ogImageUrl: string;
  showStats: boolean;
};

const FALLBACK: SiteSettingsView = {
  fullName: SITE_NAME,
  displayName: SITE_NAME,
  title: PROFESSIONAL_TITLE,
  bio: "",
  about: "",
  email: null,
  phone: null,
  location: null,
  availability: false,
  availabilityText: null,
  avatarUrl: DEFAULT_AVATAR,
  heroImageUrl: DEFAULT_HERO_IMAGE,
  resumeUrl: null,
  socials: [],
  seoTitle: `${SITE_NAME} — ${PROFESSIONAL_TITLE}`,
  seoDescription:
    "Personal portfolio of Nima Taghavi, frontend developer and web designer.",
  keywords: ["Nima Taghavi", "frontend developer", "web designer"],
  ogImageUrl: DEFAULT_OG_IMAGE,
  showStats: false,
};

function buildSocials(row: {
  email: string | null;
  socialGithub: string | null;
  socialLinkedin: string | null;
  socialInstagram: string | null;
  socialTelegram: string | null;
  socialX: string | null;
  socialDribbble: string | null;
  socialBehance: string | null;
}): SocialLink[] {
  const links: Array<[SocialLink["icon"], string, string | null, string]> = [
    ["github", "GitHub", row.socialGithub, "GitHub"],
    ["linkedin", "LinkedIn", row.socialLinkedin, "LinkedIn"],
    ["instagram", "Instagram", row.socialInstagram, "Instagram"],
    ["telegram", "Telegram", row.socialTelegram, "Telegram"],
    ["x", "X", row.socialX, "X"],
    ["dribbble", "Dribbble", row.socialDribbble, "Dribbble"],
    ["behance", "Behance", row.socialBehance, "Behance"],
    ["mail", "Email", row.email ? `mailto:${row.email}` : null, "Email"],
  ];

  const result: SocialLink[] = [];
  for (const [icon, , raw, label] of links) {
    const href = safeUrl(raw);
    if (href) result.push({ key: icon, label, href, icon });
  }
  return result;
}

export const getSiteSettings = cache(async (locale: Locale = "fa"): Promise<SiteSettingsView> => {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!row) return FALLBACK;

    return {
      fullName: row.fullName,
      displayName: row.displayName,
      title: pick(locale, row.professionalTitleFa, row.professionalTitleEn) || PROFESSIONAL_TITLE,
      bio: pick(locale, row.bioFa, row.bioEn),
      about: pick(locale, row.aboutFa, row.aboutEn),
      email: row.email,
      phone: row.phone,
      location: pick(locale, row.locationFa, row.locationEn) || null,
      availability: row.availability,
      availabilityText:
        pick(locale, row.availabilityFa, row.availabilityEn) || null,
      avatarUrl: safeUrl(row.avatarUrl, false, true) || DEFAULT_AVATAR,
      heroImageUrl: safeUrl(row.heroImageUrl, false, true) || DEFAULT_HERO_IMAGE,
      resumeUrl: safeUrl(row.resumeUrl, false, true),
      socials: buildSocials(row),
      seoTitle:
        pick(locale, row.seoTitleFa, row.seoTitleEn) ||
        `${row.displayName} — ${PROFESSIONAL_TITLE}`,
      seoDescription:
        pick(locale, row.seoDescriptionFa, row.seoDescriptionEn) ||
        FALLBACK.seoDescription,
      keywords: locale === "fa" ? row.keywordsFa : row.keywordsEn,
      ogImageUrl: safeUrl(row.ogImageUrl, false, true) || DEFAULT_OG_IMAGE,
      showStats: row.showStats,
    };
  } catch (error) {
    console.error("Failed to load site settings", error);
    return FALLBACK;
  }
});

export const getSiteTexts = cache(async (): Promise<Record<string, { fa: string; en: string }>> => {
  try {
    const rows = await prisma.siteText.findMany();
    return Object.fromEntries(
      rows.map((row) => [row.key, { fa: row.valueFa, en: row.valueEn }])
    );
  } catch (error) {
    console.error("Failed to load site texts", error);
    return {};
  }
});

export function text(
  texts: Record<string, { fa: string; en: string }>,
  key: string,
  locale: Locale,
  fallback = ""
) {
  return pick(locale, texts[key]?.fa, texts[key]?.en) || fallback;
}

export type ProjectView = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  gallery: string[];
  tools: string[];
  category: string | null;
  company: string | null;
  year: number | null;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  isPlaceholder: boolean;
};

export const getProjects = cache(async (locale: Locale): Promise<ProjectView[]> => {
  try {
    const rows = await prisma.project.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: pick(locale, row.titleFa, row.titleEn),
      description: pick(locale, row.descriptionFa, row.descriptionEn),
      imageUrl: safeUrl(row.imageUrl, false, true),
      gallery: row.gallery,
      tools: row.tools,
      category: row.category
        ? pick(locale, row.category.nameFa, row.category.nameEn)
        : null,
      company: pick(locale, row.companyFa, row.companyEn) || null,
      year: row.year,
      liveUrl: safeUrl(row.liveUrl),
      githubUrl: safeUrl(row.githubUrl),
      featured: row.featured,
      isPlaceholder: row.isPlaceholder,
    }));
  } catch (error) {
    console.error("Failed to load projects", error);
    return [];
  }
});

export type SkillGroupView = {
  id: string;
  name: string;
  icon: string | null;
  skills: string[];
};

export const getSkillGroups = cache(async (locale: Locale): Promise<SkillGroupView[]> => {
  try {
    const rows = await prisma.skillGroup.findMany({
      where: { published: true },
      include: { skills: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });

    return rows.map((row) => ({
      id: row.id,
      name: pick(locale, row.nameFa, row.nameEn),
      icon: row.icon,
      skills: row.skills.map((skill) => skill.name),
    }));
  } catch (error) {
    console.error("Failed to load skills", error);
    return [];
  }
});

export type TimelineItem = {
  id: string;
  title: string;
  organization: string;
  description: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  isPlaceholder: boolean;
};

export const getExperience = cache(async (locale: Locale): Promise<TimelineItem[]> => {
  try {
    const rows = await prisma.experience.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { startDate: "desc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      title: pick(locale, row.roleFa, row.roleEn),
      organization: pick(locale, row.companyFa, row.companyEn),
      description: pick(locale, row.descriptionFa, row.descriptionEn),
      location: pick(locale, row.locationFa, row.locationEn) || null,
      startDate: row.startDate,
      endDate: row.endDate,
      current: row.current,
      isPlaceholder: row.isPlaceholder,
    }));
  } catch (error) {
    console.error("Failed to load experience", error);
    return [];
  }
});

export const getEducation = cache(async (locale: Locale): Promise<TimelineItem[]> => {
  try {
    const rows = await prisma.education.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { startDate: "desc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      title: pick(locale, row.degreeFa, row.degreeEn),
      organization: pick(locale, row.institutionFa, row.institutionEn),
      description: pick(locale, row.descriptionFa, row.descriptionEn),
      location: pick(locale, row.locationFa, row.locationEn) || null,
      startDate: row.startDate,
      endDate: row.endDate,
      current: row.current,
      isPlaceholder: row.isPlaceholder,
    }));
  } catch (error) {
    console.error("Failed to load education", error);
    return [];
  }
});

export type StatView = {
  id: string;
  value: number;
  suffix: string;
  label: string;
};

export const getStats = cache(async (locale: Locale): Promise<StatView[]> => {
  try {
    const rows = await prisma.stat.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    return rows.map((row) => ({
      id: row.id,
      value: row.value,
      suffix: row.suffix,
      label: pick(locale, row.labelFa, row.labelEn),
    }));
  } catch (error) {
    console.error("Failed to load stats", error);
    return [];
  }
});

export type NoteView = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function toNoteView(
  locale: Locale,
  row: {
    id: string;
    slug: string;
    titleFa: string;
    titleEn: string;
    excerptFa: string;
    excerptEn: string;
    contentFa: string;
    contentEn: string;
    tags: string[];
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
): NoteView {
  return {
    id: row.id,
    slug: row.slug,
    title: pick(locale, row.titleFa, row.titleEn),
    excerpt: pick(locale, row.excerptFa, row.excerptEn),
    content: pick(locale, row.contentFa, row.contentEn),
    tags: row.tags,
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const getPublishedNotes = cache(async (locale: Locale): Promise<NoteView[]> => {
  try {
    const rows = await prisma.note.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => toNoteView(locale, row));
  } catch (error) {
    console.error("Failed to load notes", error);
    return [];
  }
});

export const getNoteBySlug = cache(
  async (locale: Locale, slug: string): Promise<NoteView | null> => {
    try {
      const row = await prisma.note.findFirst({ where: { slug, published: true } });
      return row ? toNoteView(locale, row) : null;
    } catch (error) {
      console.error("Failed to load note", error);
      return null;
    }
  }
);
