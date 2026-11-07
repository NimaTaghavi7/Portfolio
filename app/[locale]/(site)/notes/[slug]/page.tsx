import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { getNoteBySlug } from "@/lib/content/site";
import type { Locale } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const note = await getNoteBySlug(locale, slug);
  if (!note) return { title: "Note not found" };
  return {
    title: note.title,
    description: note.excerpt,
    alternates: {
      canonical: `${locale === "fa" ? "/fa" : ""}/notes/${note.slug}`,
      languages: {
        en: `/notes/${note.slug}`,
        fa: `/fa/notes/${note.slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: note.title,
      description: note.excerpt,
      publishedTime: note.createdAt.toISOString(),
    },
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("notes");
  const note = await getNoteBySlug(locale, slug);
  if (!note) notFound();

  const dateFormatter = new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", {
    dateStyle: "long",
  });

  return (
    <article className="container-page max-w-3xl py-16 sm:py-20">
      <Link
        href="/notes"
        className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-base-content/45 transition hover:text-base-content"
      >
        <ArrowLeft size={14} aria-hidden="true" className="rtl:rotate-180" />
        {t("back")}
      </Link>

      <header className="mt-8 border-b border-base-content/10 pb-8">
        <span className="text-[0.68rem] uppercase tracking-[0.16em] text-base-content/35">
          {dateFormatter.format(note.createdAt)}
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {note.title}
        </h1>
        {note.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-base-content/10 px-2.5 py-0.5 text-[0.66rem] text-base-content/40"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="note-content mt-8">
        <ReactMarkdown>{note.content}</ReactMarkdown>
      </div>
    </article>
  );
}
