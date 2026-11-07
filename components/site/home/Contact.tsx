import { getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";

import SocialLinks from "@/components/site/SocialLinks";
import type { SiteSettingsView } from "@/lib/content/site";
import { text } from "@/lib/content/site";
import type { Locale } from "@/lib/constants";

import ContactForm from "./ContactForm";
import SectionHeading, { Section } from "./SectionHeading";

export default async function Contact({
  settings,
  texts,
  locale,
}: {
  settings: SiteSettingsView;
  texts: Record<string, { fa: string; en: string }>;
  locale: Locale;
}) {
  const t = await getTranslations("contact");

  return (
    <Section id="contact" className="container-page">
      <SectionHeading
        kicker={text(texts, "contact.kicker", locale, "CONTACT")}
        title={text(texts, "contact.subtitle", locale, "Contact")}
        description={text(texts, "contact.description", locale)}
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div className="reveal flex flex-col gap-6">
          <div className="rounded-2xl border border-base-content/10 bg-base-200/30 p-6">
            <p className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-base-content/40">
              {settings.displayName}
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight">{settings.title}</p>

            <ul className="mt-6 flex flex-col gap-3 text-sm text-base-content/60">
              {settings.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="inline-flex items-center gap-3 transition hover:text-base-content"
                  >
                    <Mail size={15} aria-hidden="true" />
                    <span dir="ltr" className="break-anywhere">
                      {settings.email}
                    </span>
                  </a>
                </li>
              )}
              {settings.phone && (
                <li>
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-3 transition hover:text-base-content"
                  >
                    <Phone size={15} aria-hidden="true" />
                    <span dir="ltr">{settings.phone}</span>
                  </a>
                </li>
              )}
              {settings.location && (
                <li className="inline-flex items-center gap-3">
                  <MapPin size={15} aria-hidden="true" />
                  {settings.location}
                </li>
              )}
            </ul>

            {settings.socials.length > 0 && (
              <SocialLinks links={settings.socials} className="mt-6" />
            )}

            {!settings.email && settings.socials.length === 0 && (
              <p className="mt-6 text-xs leading-relaxed text-base-content/40">
                {t("notConfigured")}
              </p>
            )}
          </div>
        </div>

        <div className="reveal rounded-2xl border border-base-content/10 bg-base-100 p-5 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
