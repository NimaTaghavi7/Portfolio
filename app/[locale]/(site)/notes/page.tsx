import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { getPublishedNotes } from "@/lib/content/site";
import type { Locale } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("notes");
  const isFa = locale === "fa";
  return {
    title: isFa ? "یادداشت‌ها — نیما تقوی" : "Notes — Nima Taghavi",
    description: isFa
      ? "یادداشت‌های کوتاه درباره توسعه وب، طراحی و ابزارها."
      : "Short notes about web development, design and tools.",
    alternates: {
      canonical: isFa ? "/fa/notes" : "/notes",
      languages: { en: "/notes", fa: "/fa/notes" },
    },
    openGraph: {
      title: t("title"),
      type: "website",
    },
  };
}

export default async function NotesPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("notes");
  const notes = await getPublishedNotes(locale);
  const dateFormatter = new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", {
    dateStyle: "long",
  });

  return (
    <div className="container-page py-16 sm:py-20">
      <div className="max-w-2xl">
        <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-base-content/40">
          Notes
        </span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-base-content/55 sm:text-base">
          {locale === "fa"
            ? "یادداشت‌های کوتاه درباره توسعه وب، طراحی و ابزارهایی که امتحان می‌کنم."
            : "Short notes about web development, design and the tools I try."}
        </p>
      </div>

      {notes.length === 0 ? (
        <p className="mt-14 rounded-2xl border border-base-content/10 bg-base-200/30 px-6 py-12 text-center text-sm text-base-content/45">
          {t("empty")}
        </p>
      ) : (
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.slug}`}
              className="group flex flex-col rounded-2xl border border-base-content/10 bg-base-200/30 p-6 transition hover:border-base-content/25 hover:bg-base-200/60"
            >
              <span className="text-[0.66rem] uppercase tracking-[0.16em] text-base-content/35">
                {dateFormatter.format(note.createdAt)}
              </span>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-balance">
                {note.title}
              </h2>
              {note.excerpt && (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-base-content/50">
                  {note.excerpt}
                </p>
              )}
              <div className="mt-auto flex items-center justify-between pt-6">
                <div className="flex flex-wrap gap-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-base-content/10 px-2.5 py-0.5 text-[0.66rem] text-base-content/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                  className="text-base-content/30 transition group-hover:text-base-content/70"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
