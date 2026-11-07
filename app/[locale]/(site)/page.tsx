import { getLocale } from "next-intl/server";

import About from "@/components/site/home/About";
import Contact from "@/components/site/home/Contact";
import Hero from "@/components/site/home/Hero";
import HomeMotion from "@/components/site/home/HomeMotion";
import Marquee from "@/components/site/home/Marquee";
import Projects from "@/components/site/home/Projects";
import Skills from "@/components/site/home/Skills";
import Stats from "@/components/site/home/Stats";
import type { Locale } from "@/lib/constants";
import {
  getEducation,
  getExperience,
  getProjects,
  getSiteSettings,
  getSiteTexts,
  getSkillGroups,
  getStats,
  text,
} from "@/lib/content/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;

  const [settings, texts, projects, skillGroups, experience, education, stats] =
    await Promise.all([
      getSiteSettings(locale),
      getSiteTexts(),
      getProjects(locale),
      getSkillGroups(locale),
      getExperience(locale),
      getEducation(locale),
      getStats(locale),
    ]);

  // The ticker intentionally stays English in both locales.
  const marqueeItems = text(texts, "marquee.items", "en")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <HomeMotion>
      <Hero settings={settings} texts={texts} locale={locale} />
      <Marquee items={marqueeItems} />
      {settings.showStats && <Stats stats={stats} locale={locale} />}
      <Skills groups={skillGroups} texts={texts} locale={locale} />
      <Projects projects={projects} texts={texts} locale={locale} />
      <About
        settings={settings}
        texts={texts}
        locale={locale}
        experience={experience}
        education={education}
      />
      <Contact settings={settings} texts={texts} locale={locale} />
    </HomeMotion>
  );
}
