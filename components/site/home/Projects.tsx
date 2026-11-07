import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { ProjectView } from "@/lib/content/site";
import { text } from "@/lib/content/site";
import type { Locale } from "@/lib/constants";

import SectionHeading, { Section } from "./SectionHeading";

export default async function Projects({
  projects,
  texts,
  locale,
}: {
  projects: ProjectView[];
  texts: Record<string, { fa: string; en: string }>;
  locale: Locale;
}) {
  const t = await getTranslations("projects");
  const tc = await getTranslations("common");

  return (
    <Section id="projects" className="container-page">
      <SectionHeading
        kicker={text(texts, "projects.kicker", locale, "PROJECTS")}
        title={text(texts, "projects.subtitle", locale, "Projects")}
        description={text(texts, "projects.description", locale)}
      />

      {projects.length === 0 ? (
        <p className="mt-12 text-center text-sm text-base-content/50">{t("empty")}</p>
      ) : (
        <div className="mt-12 flex flex-col gap-8">
          {projects.map((project, index) => (
            <article
              key={project.id}
              className="project-card grid overflow-hidden rounded-3xl border border-base-content/10 bg-base-200/30 lg:grid-cols-2"
            >
              <div
                className={`relative aspect-[16/10] overflow-hidden border-b border-base-content/10 bg-base-300/40 lg:aspect-auto lg:min-h-[360px] lg:border-b-0 ${
                  index % 2 === 1
                    ? "lg:order-2 lg:border-s"
                    : "lg:border-e"
                }`}
              >
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    unoptimized={project.imageUrl.endsWith(".svg")}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full min-h-64 items-center justify-center text-xs uppercase tracking-[0.2em] text-base-content/35">
                    {tc("noContent")}
                  </div>
                )}
                {project.isPlaceholder && (
                  <span className="placeholder-badge absolute start-4 top-4 bg-base-100/85 backdrop-blur">
                    {tc("sample")}
                  </span>
                )}
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-9">
                <div className="flex flex-wrap items-center gap-3 text-[0.66rem] font-medium uppercase tracking-[0.18em] text-base-content/40">
                  {project.category && <span>{project.category}</span>}
                  {project.category && (project.company || project.year) && (
                    <span className="size-1 rounded-full bg-base-content/25" aria-hidden="true" />
                  )}
                  {project.company && <span>{project.company}</span>}
                  {project.company && project.year && (
                    <span className="size-1 rounded-full bg-base-content/25" aria-hidden="true" />
                  )}
                  {project.year && <span className="tabular-nums">{project.year}</span>}
                </div>

                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-balance">
                  {project.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-base-content/55">
                  {project.description}
                </p>

                {project.tools.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <li
                        key={tool}
                        className="rounded-full border border-base-content/10 px-2.5 py-1 text-[0.7rem] text-base-content/50"
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>
                )}

                {(project.liveUrl || project.githubUrl) && (
                  <div className="mt-7 flex flex-wrap gap-3">
                    {project.liveUrl && (
                      <Link
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-content transition hover:opacity-85"
                      >
                        {tc("viewLive")}
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    )}
                    {project.githubUrl && (
                      <Link
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-base-content/15 px-4 text-xs font-medium text-base-content/70 transition hover:border-base-content/35 hover:text-base-content"
                      >
                        <Github size={14} aria-hidden="true" />
                        {tc("sourceCode")}
                      </Link>
                    )}
                  </div>
                )}

                {project.isPlaceholder && (
                  <p className="mt-5 text-[0.7rem] leading-relaxed text-base-content/35">
                    {t("placeholderNote")}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
