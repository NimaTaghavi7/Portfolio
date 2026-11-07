import { ArrowUp, ArrowUpRight, Download, Mail, MapPin, Phone } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import SocialLinks from "@/components/site/SocialLinks";
import { getPathname } from "@/i18n/navigation";
import { getSiteSettings, getSiteTexts, text } from "@/lib/content/site";
import type { Locale } from "@/lib/constants";

export default async function Footer() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const settings = await getSiteSettings(locale);
  const texts = await getSiteTexts();
  const tagline = text(texts, "footer.tagline", locale);
  const year = new Date().getFullYear();
  const isFa = locale === "fa";

  const homeHref = getPathname({ href: "/", locale });
  const navLinks = [
    {
      label: tn("notes"),
      href: getPathname({ href: "/notes", locale }),
      kind: "page" as const,
    },
    {
      label: tn("projects"),
      href: `${homeHref}#projects`,
      kind: "anchor" as const,
    },
    {
      label: tn("contact"),
      href: `${homeHref}#contact`,
      kind: "anchor" as const,
    },
    {
      label: isFa ? "رزومه" : "Resume",
      href: settings.resumeUrl || "/resume.pdf",
      kind: "download" as const,
    },
  ];

  const availabilityLabel =
    settings.availabilityText &&
    !/admin dashboard|پنل مدیریت/i.test(settings.availabilityText)
      ? settings.availabilityText
      : isFa
        ? "آماده همکاری"
        : "Available for select projects";

  return (
    <footer className="footer-shell relative mt-32 overflow-hidden border-t border-base-content/10">
      <span
        aria-hidden="true"
        className="footer-watermark pointer-events-none absolute -top-16 end-0 select-none text-[12rem] font-bold leading-none tracking-tighter sm:text-[19rem]"
      >
        NT
      </span>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="footer-aura footer-aura-end" />
        <div className="footer-aura footer-aura-start" />
        <div className="footer-grid-lines" />
      </div>

      <div className="container-page relative">
        <div className="flex flex-col gap-10 border-b border-base-content/10 pb-14 pt-20 sm:pt-24 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-20">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-base-content/35">
              <span className="h-px w-8 bg-base-content/30" aria-hidden="true" />
              {isFa ? "همکاری" : "Collaboration"}
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {isFa ? "بیایید چیزی " : "Let's build something "}
              <span className="silver-text">
                {isFa ? "ماندگار بسازیم" : "great"}
              </span>
              {isFa ? "." : "."}
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-base-content/50 sm:text-base">
              {isFa
                ? "برای همکاری، طراحی یا هر ایده‌ای که در ذهن دارید، پیام بدهید."
                : "Have a project, a role, or an idea worth discussing? Let's talk."}
            </p>
          </div>

          <a
            href={`${homeHref}#contact`}
            className="footer-cta group inline-flex h-12 w-max items-center gap-3 rounded-full bg-primary px-6 text-sm font-semibold text-primary-content transition hover:-translate-y-0.5 hover:opacity-90"
          >
            {isFa ? "شروع گفتگو" : "Start a conversation"}
            <ArrowUpRight
              size={17}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
            />
          </a>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.65fr_0.9fr] lg:gap-16 lg:py-16">
          <div className="max-w-md lg:pe-10">
            <div className="flex items-center gap-4">
              <span className="footer-brand-mark mt-2.5" aria-hidden="true">
                <span>NT</span>
              </span>
              <div className="min-w-0">
                <p className="text-xl font-semibold tracking-tight">
                  {settings.displayName}
                </p>
                <p className="mt-1 text-[0.6rem] uppercase tracking-[0.18em] text-base-content/40">
                  {settings.title}
                </p>
              </div>
            </div>

            {tagline && (
              <p className="mt-6 text-sm leading-relaxed text-base-content/50">
                {tagline}
              </p>
            )}

            {settings.availability && (
              <span className="footer-status mt-5">
                <span className="footer-status-dot" aria-hidden="true" />
                {availabilityLabel}
              </span>
            )}

            {settings.socials.length > 0 && (
              <SocialLinks links={settings.socials} className="mt-6" />
            )}
          </div>

          <nav aria-label={isFa ? "پیمایش فوتر" : "Footer"}>
            <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-base-content/30">
              {isFa ? "مسیرها" : "Explore"}
            </h3>
            <ul className="mt-4 flex flex-col">
              {navLinks.map((link, index) => {
                const className =
                  "footer-link group -mx-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-base-content/60 transition hover:bg-base-content/[0.035] hover:text-base-content";
                const content = (
                  <>
                    <span className="font-mono text-[0.6rem] tabular-nums text-base-content/25">
                      0{index + 1}
                    </span>
                    <span className="flex-1">{link.label}</span>
                    {link.kind === "download" ? (
                      <Download
                        size={14}
                        aria-hidden="true"
                        className="text-base-content/20 transition-transform duration-200 group-hover:translate-y-0.5 group-hover:text-base-content/60"
                      />
                    ) : (
                      <ArrowUpRight
                        size={14}
                        aria-hidden="true"
                        className="text-base-content/20 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-base-content/60 rtl:group-hover:-translate-x-0.5"
                      />
                    )}
                  </>
                );

                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      download={link.kind === "download" ? "" : undefined}
                      className={className}
                    >
                      {content}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div>
            <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-base-content/30">
              {isFa ? "تماس" : "Contact"}
            </h3>
            <div className="mt-4 flex flex-col gap-1">
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="footer-contact-row group"
                >
                  <span className="footer-contact-icon">
                    <Mail size={15} aria-hidden="true" />
                  </span>
                  <span
                    dir="ltr"
                    className="break-anywhere text-sm text-base-content/60 transition group-hover:text-base-content"
                  >
                    {settings.email}
                  </span>
                </a>
              )}
              {settings.phone && (
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  className="footer-contact-row group"
                >
                  <span className="footer-contact-icon">
                    <Phone size={15} aria-hidden="true" />
                  </span>
                  <span
                    dir="ltr"
                    className="text-sm text-base-content/60 transition group-hover:text-base-content"
                  >
                    {settings.phone}
                  </span>
                </a>
              )}
              {settings.location && (
                <p className="footer-contact-row">
                  <span className="footer-contact-icon">
                    <MapPin size={15} aria-hidden="true" />
                  </span>
                  <span className="text-sm text-base-content/50">
                    {settings.location}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="silver-rule" aria-hidden="true" />

        <div className="flex flex-col gap-4 py-6 text-[0.68rem] text-base-content/35 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <span>
              © {year} {settings.fullName}.
            </span>
            <span className="hidden text-base-content/20 sm:inline">/</span>
            <span>{t("rights")}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="tracking-[0.16em] uppercase">nimataghavi.ir</span>
            <a
              href="#main-content"
              className="footer-backtop group inline-flex items-center gap-1.5 text-base-content/45 transition hover:text-base-content"
            >
              {isFa ? "بازگشت به بالا" : "Back to top"}
              <ArrowUp
                size={13}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
