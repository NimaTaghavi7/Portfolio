"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const nextLocale = locale === "fa" ? "en" : "fa";
  const nextLabel = nextLocale === "fa" ? "فارسی" : "English";

  return (
    <button
      type="button"
      disabled={pending}
      title={`${t("language")}: ${nextLabel}`}
      onClick={() =>
        startTransition(() => {
          router.replace(pathname, { locale: nextLocale, scroll: false });
        })
      }
      className={`inline-flex h-10 items-center gap-2 rounded-full border border-base-content/10 bg-base-200/40 px-3 text-xs font-medium uppercase tracking-wider text-base-content/70 transition hover:border-base-content/25 hover:text-base-content disabled:opacity-60 ${className}`}
    >
      <Globe size={15} aria-hidden="true" />
      <span>{nextLocale}</span>
      <span className="sr-only">{nextLabel}</span>
    </button>
  );
}
