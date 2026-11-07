import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let notes: Array<{ slug: string; updatedAt: Date }> = [];
  try {
    notes = await prisma.note.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Sitemap: failed to load notes", error);
  }

  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: { en: `${SITE_URL}/`, fa: `${SITE_URL}/fa` } },
    },
    {
      url: `${SITE_URL}/fa`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: { en: `${SITE_URL}/`, fa: `${SITE_URL}/fa` } },
    },
    {
      url: `${SITE_URL}/notes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/notes`,
          fa: `${SITE_URL}/fa/notes`,
        },
      },
    },
    {
      url: `${SITE_URL}/fa/notes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/notes`,
          fa: `${SITE_URL}/fa/notes`,
        },
      },
    },
  ];

  const notePages: MetadataRoute.Sitemap = notes.flatMap((note) => [
    {
      url: `${SITE_URL}/notes/${note.slug}`,
      lastModified: note.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          en: `${SITE_URL}/notes/${note.slug}`,
          fa: `${SITE_URL}/fa/notes/${note.slug}`,
        },
      },
    },
    {
      url: `${SITE_URL}/fa/notes/${note.slug}`,
      lastModified: note.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          en: `${SITE_URL}/notes/${note.slug}`,
          fa: `${SITE_URL}/fa/notes/${note.slug}`,
        },
      },
    },
  ]);

  return [...staticPages, ...notePages];
}
