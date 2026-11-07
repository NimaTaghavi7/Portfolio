"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { scrollToHash } from "@/lib/scroll";

const NAV_ITEMS = [
  { key: "skills", hash: "#skills" },
  { key: "projects", hash: "#projects" },
  { key: "about", hash: "#about" },
  { key: "contact", hash: "#contact" },
] as const;

export default function MobileMenu() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const go = (hash: string) => {
    setOpen(false);
    const isHome = pathname === "/" || pathname === "/fa";
    if (isHome) {
      scrollToHash(hash);
      return;
    }
    window.location.href = `${locale === "fa" ? "/fa" : ""}/${hash}`;
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? tc("closeMenu") : tc("openMenu")}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-10 items-center justify-center rounded-full border border-base-content/10 text-base-content/80 transition hover:border-base-content/25 hover:text-base-content"
      >
        {open ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
      </button>

      {open && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-4 top-[5.2rem] z-50 rounded-2xl border border-base-content/10 bg-base-100/95 p-3 shadow-2xl backdrop-blur-xl"
        >
          <nav aria-label="Mobile">
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => go(item.hash)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-start text-sm font-medium text-base-content/75 transition hover:bg-base-200 hover:text-base-content"
                  >
                    {t(item.key)}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  href="/notes"
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-start text-sm font-medium text-base-content/75 transition hover:bg-base-200 hover:text-base-content"
                >
                  {t("notes")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
