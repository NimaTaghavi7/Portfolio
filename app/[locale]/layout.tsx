import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";

import { inter, vazirmatn } from "@/app/fonts";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { routing } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/content/site";
import { SITE_URL, type Locale } from "@/lib/constants";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070707" },
    { media: "(prefers-color-scheme: light)", color: "#d7d9dc" },
  ],
  colorScheme: "dark light",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const settings = await getSiteSettings(locale as Locale);
  const canonical = locale === "fa" ? "/fa" : "/";
  const hasCustomOg = Boolean(
    settings.ogImageUrl && !settings.ogImageUrl.includes("/placeholders/")
  );
  const ogImage = hasCustomOg
    ? settings.ogImageUrl
    : "/images/placeholders/og.png";

  return {
    metadataBase: new URL(SITE_URL),
    title: settings.seoTitle,
    description: settings.seoDescription,
    keywords: settings.keywords,
    authors: [{ name: settings.fullName }],
    creator: settings.fullName,
    publisher: settings.fullName,
    applicationName: settings.fullName,
    alternates: {
      canonical,
      languages: {
        en: "/",
        fa: "/fa",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: settings.fullName,
      title: settings.seoTitle,
      description: settings.seoDescription,
      locale: locale === "fa" ? "fa_IR" : "en_US",
      alternateLocale: locale === "fa" ? "en_US" : "fa_IR",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${settings.fullName} — ${settings.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    icons: {
      icon: "/icon.svg",
      apple: "/icon.svg",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const settings = await getSiteSettings(locale as Locale);
  const dir = locale === "fa" ? "rtl" : "ltr";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: settings.fullName,
        alternateName: settings.displayName,
        url: SITE_URL,
        jobTitle: settings.title,
        description: settings.bio,
        image: settings.avatarUrl.startsWith("http")
          ? settings.avatarUrl
          : `${SITE_URL}${settings.avatarUrl}`,
        sameAs: settings.socials
          .filter((link) => link.href.startsWith("http"))
          .map((link) => link.href),
      },
      {
        "@type": "WebSite",
        name: settings.fullName,
        url: SITE_URL,
        inLanguage: locale,
      },
    ],
  };

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className={`${inter.variable} ${vazirmatn.variable} min-h-screen bg-base-100 text-base-content antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster
                position={locale === "fa" ? "bottom-left" : "bottom-right"}
                richColors={false}
                closeButton
                toastOptions={{
                  style: {
                    background: "var(--color-base-200)",
                    color: "var(--color-base-content)",
                    border: "1px solid color-mix(in oklab, var(--color-base-content) 14%, transparent)",
                  },
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
