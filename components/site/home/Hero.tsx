import Image from "next/image";
import { ArrowUpRight, Download, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";

import SocialLinks from "@/components/site/SocialLinks";
import { Link } from "@/i18n/navigation";
import Hero3DBackdrop from "@/components/site/home/Hero3DBackdrop";
import type { SiteSettingsView } from "@/lib/content/site";
import { text } from "@/lib/content/site";
import type { Locale } from "@/lib/constants";

export default async function Hero({
  settings,
  texts,
  locale,
}: {
  settings: SiteSettingsView;
  texts: Record<string, { fa: string; en: string }>;
  locale: Locale;
}) {
  const t = await getTranslations("hero");
  const kicker = text(texts, "hero.kicker", locale, settings.title);
  const heading = text(texts, "hero.heading", locale, settings.fullName);
  const intro = text(texts, "hero.intro", locale, settings.bio);
  const cta = text(texts, "hero.cta", locale, t("contactCta"));
  const isPlaceholderImage = settings.heroImageUrl.includes("/placeholders/");
  const availabilityLabel =
    settings.availabilityText &&
    !/admin dashboard|پنل مدیریت/i.test(settings.availabilityText)
      ? settings.availabilityText
      : t("available");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--color-base-content) 7%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--color-base-content) 7%, transparent) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at 50% 20%, black, transparent 72%)",
        }}
      />

      {/* dir="ltr" keeps the photo on the right and the intro on the left in
          both languages. The text itself keeps its own RTL/LTR direction. */}
      <div
        dir="ltr"
        className="container-page grid min-h-[calc(100svh-6rem)] items-center gap-x-12 gap-y-7 pb-14 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-20 lg:pt-12"
      >
        <div
          dir={locale === "fa" ? "rtl" : "ltr"}
          className="relative z-10 order-1 flex min-w-0 flex-col items-start lg:order-2"
        >
          {settings.availability && (
            <span className="hero-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-base-content/15 bg-base-200/50 px-3.5 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-base-content/60">
              <span className="size-1.5 rounded-full bg-base-content/60" aria-hidden="true" />
              {availabilityLabel}
            </span>
          )}

          <p className="hero-reveal text-[0.68rem] font-medium uppercase tracking-[0.3em] text-base-content/45">
            {kicker}
          </p>

          <h1
            id="hero-title"
            className="hero-reveal mt-4 text-4xl font-semibold leading-[1.12] tracking-tight text-balance sm:text-5xl lg:text-[4.1rem]"
          >
            {heading}
          </h1>

          <p className="hero-reveal mt-3 text-xl font-medium text-base-content/75 sm:text-2xl">
            <span className="silver-text">{settings.title}</span>
          </p>

          {intro && (
            <p className="hero-reveal mt-6 max-w-xl text-sm leading-relaxed text-base-content/55 sm:text-base">
              {intro}
            </p>
          )}

          {settings.location && (
            <p className="hero-reveal mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-base-content/40">
              <MapPin size={14} aria-hidden="true" />
              {settings.location}
            </p>
          )}

          <div className="hero-reveal mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/#contact"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-content transition hover:opacity-85"
            >
              {cta}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <a
              href={settings.resumeUrl || "/resume.pdf"}
              download
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-base-content/70 px-6 text-sm font-medium text-base-content transition-colors duration-300 hover:bg-base-content hover:text-base-100"
            >
              <Download size={16} aria-hidden="true" />
              {text(texts, "hero.resume", locale, t("downloadResume"))}
            </a>
          </div>

          {settings.socials.length > 0 && (
            <SocialLinks links={settings.socials} className="hero-reveal mt-8" />
          )}
        </div>

        <Hero3DBackdrop className="absolute inset-0 z-0 overflow-hidden opacity-100" />

        <div className="relative z-10 order-3 min-w-0 lg:order-1">
          <div className="relative mx-auto w-full max-w-[660px]">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[2.8rem] border border-base-content/10 bg-linear-to-br from-base-content/[0.04] to-transparent"
            />
            <div className="relative rounded-[2.25rem] border border-base-content/15 bg-base-200/50 p-2.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)] backdrop-blur-sm sm:p-3">
              <div className="overflow-hidden rounded-[1.6rem] border border-base-content/12 bg-base-100">
                <div className="flex h-8 items-center gap-1.5 border-b border-base-content/10 px-4">
                  <span className="size-1.5 rounded-full bg-base-content/25" />
                  <span className="size-1.5 rounded-full bg-base-content/15" />
                  <span className="size-1.5 rounded-full bg-base-content/10" />
                  <span className="ms-3 text-[0.6rem] tracking-[0.12em] text-base-content/30">
                    nimataghavi.ir
                  </span>
                </div>
                <div className="relative aspect-[16/10]">
                  <Image
                    src={settings.heroImageUrl}
                    alt={
                      isPlaceholderImage
                        ? `${settings.fullName} — placeholder monitor preview`
                        : `${settings.fullName} — portfolio preview`
                    }
                    fill
                    priority
                    unoptimized={settings.heroImageUrl.endsWith(".svg")}
                    sizes="(max-width: 1024px) 92vw, 52vw"
                    className="object-cover"
                  />
                  {isPlaceholderImage && (
                    <span className="placeholder-badge absolute start-4 bottom-4 bg-base-100/80 backdrop-blur">
                      Placeholder
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mx-auto h-3 w-24 rounded-b-xl border-x border-b border-base-content/10 bg-base-300/60" />
            <div className="mx-auto h-1.5 w-44 rounded-full bg-base-content/15" />
            <p className="mt-4 text-center text-[0.66rem] uppercase tracking-[0.22em] text-base-content/35">
              {settings.fullName}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
