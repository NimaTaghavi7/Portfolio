import { Code2, PenTool, Sparkles, Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";

import Tilt from "@/components/ui/Tilt";
import type { SkillGroupView } from "@/lib/content/site";
import { text } from "@/lib/content/site";
import type { Locale } from "@/lib/constants";

import SectionHeading, { Section } from "./SectionHeading";

const ICONS = {
  code: Code2,
  "pen-tool": PenTool,
  wrench: Wrench,
} as const;

export default async function Skills({
  groups,
  texts,
  locale,
}: {
  groups: SkillGroupView[];
  texts: Record<string, { fa: string; en: string }>;
  locale: Locale;
}) {
  const t = await getTranslations("skills");
  if (groups.length === 0) return null;

  return (
    <Section id="skills" className="container-page">
      <SectionHeading
        kicker={text(texts, "skills.kicker", locale, "SKILLS")}
        title={text(texts, "skills.subtitle", locale, "Skills")}
        description={text(texts, "skills.description", locale)}
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group, index) => {
          const Icon = ICONS[group.icon as keyof typeof ICONS] ?? Sparkles;
          return (
            <Tilt
              key={group.id}
              max={5}
              hoverScale={1.02}
              className="skill-card group relative flex h-full overflow-hidden rounded-3xl border border-base-content/10 bg-linear-to-b from-base-200/60 to-base-100/30 p-px transition-colors duration-500 hover:border-base-content/25"
            >
              <div className="relative flex h-full w-full flex-col rounded-[calc(1.5rem-1px)] bg-base-100/85 p-6 sm:p-7">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[calc(1.5rem-1px)] bg-[radial-gradient(circle_at_20%_0%,color-mix(in_oklab,var(--color-base-content)_9%,transparent),transparent_60%)] opacity-50 transition-opacity duration-500 group-hover:opacity-100"
                />

                <div className="relative flex items-start justify-between gap-4">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-base-content/15 bg-base-200/60 text-base-content/75 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-base-content)_12%,transparent)] transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:text-base-content">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[0.68rem] tabular-nums tracking-[0.2em] text-base-content/25 transition-colors group-hover:text-base-content/50">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="relative mt-6 text-lg font-semibold tracking-tight">
                  {group.name}
                </h3>

                <ul className="relative mt-5 flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full border border-base-content/10 bg-base-200/40 px-3 py-1 text-[0.7rem] text-base-content/60 transition-colors group-hover:border-base-content/15 group-hover:text-base-content/70"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-auto flex items-center gap-3 pt-7">
                  <span className="h-px flex-1 bg-linear-to-r from-base-content/20 to-transparent" />
                  <span className="size-1 rounded-full bg-base-content/30 transition-transform duration-500 group-hover:scale-150" />
                </div>
              </div>
            </Tilt>
          );
        })}
      </div>

      {groups.length === 0 && (
        <p className="mt-10 text-center text-sm text-base-content/50">{t("empty")}</p>
      )}
    </Section>
  );
}
