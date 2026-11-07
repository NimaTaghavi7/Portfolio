import Image from "next/image";
import { getTranslations } from "next-intl/server";

import AboutLinks from "@/components/site/AboutLinks";
import type { SiteSettingsView, TimelineItem } from "@/lib/content/site";
import { text } from "@/lib/content/site";
import type { Locale } from "@/lib/constants";

import Timeline from "./Timeline";
import SectionHeading, { Section } from "./SectionHeading";

export default async function About({
  settings,
  texts,
  locale,
  experience,
  education,
}: {
  settings: SiteSettingsView;
  texts: Record<string, { fa: string; en: string }>;
  locale: Locale;
  experience: TimelineItem[];
  education: TimelineItem[];
}) {
  const t = await getTranslations("about");
  const ts = await getTranslations("sections");
  const isPlaceholderImage = settings.avatarUrl.includes("/placeholders/");

  return (
    <Section id="about" className="container-page">
      <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="reveal relative mx-auto w-full max-w-[430px] lg:sticky lg:top-28">
          <div
            data-parallax-image
            className="relative overflow-hidden rounded-[2rem] border border-base-content/12 bg-base-200"
          >
            <Image
              src={settings.avatarUrl}
              alt={
                isPlaceholderImage
                  ? `${settings.fullName} — placeholder portrait`
                  : `${settings.fullName} — portrait`
              }
              width={1080}
              height={1080}
              unoptimized={settings.avatarUrl.endsWith(".svg")}
              sizes="(max-width: 1024px) 90vw, 36vw"
              className="aspect-square w-full object-cover"
            />
            {isPlaceholderImage && (
              <span className="placeholder-badge absolute start-4 bottom-4 bg-base-100/80 backdrop-blur">
                Placeholder
              </span>
            )}
          </div>
        </div>

        <div>
          <SectionHeading
            align="start"
            kicker={text(texts, "about.kicker", locale, ts("about"))}
            title={text(texts, "about.subtitle", locale, settings.displayName)}
            description={text(texts, "about.description", locale)}
          />
          <div className="reveal mt-7 space-y-4 text-sm leading-relaxed text-base-content/60 sm:text-base">
            {(settings.about || settings.bio || t("empty"))
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
          <AboutLinks settings={settings} className="reveal mt-7" />
        </div>
      </div>

      {(experience.length > 0 || education.length > 0) && (
        <div className="mt-20 grid gap-12 border-t border-base-content/10 pt-14 lg:grid-cols-2 lg:gap-16">
          {experience.length > 0 && (
            <Timeline
              heading={ts("experience")}
              items={experience}
              presentLabel={ts("present")}
            />
          )}
          {education.length > 0 && (
            <Timeline
              heading={ts("education")}
              items={education}
              presentLabel={ts("present")}
            />
          )}
        </div>
      )}
    </Section>
  );
}
