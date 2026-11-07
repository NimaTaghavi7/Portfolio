"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useTranslations("common");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex size-10 items-center justify-center rounded-full border border-base-content/10 ${className}`}
      />
    );
  }

  const isDark = resolvedTheme !== "silver-light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "silver-light" : "silver-dark")}
      aria-label={`${t("theme")}: ${isDark ? t("themeLight") : t("themeDark")}`}
      title={`${t("theme")}: ${isDark ? t("themeLight") : t("themeDark")}`}
      className={`inline-flex size-10 items-center justify-center rounded-full border border-base-content/10 bg-base-200/40 text-base-content/70 transition hover:border-base-content/25 hover:text-base-content ${className}`}
    >
      {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
    </button>
  );
}
