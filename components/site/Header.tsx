"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { scrollToHash } from "@/lib/scroll";

import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { key: "skills", hash: "#skills" },
  { key: "projects", hash: "#projects" },
  { key: "about", hash: "#about" },
  { key: "contact", hash: "#contact" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/fa";

  const handleNav = (event: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (!isHome) return;
    event.preventDefault();
    scrollToHash(hash);
  };

  return (
    <header className="relative z-40 bg-transparent pb-2 pt-4 sm:pb-4">
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-6 sm:h-20">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl border border-base-content/15 bg-base-200/40 text-sm font-semibold tracking-wide text-base-content transition-colors group-hover:border-base-content/35">
            NT
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-semibold tracking-tight">Nima Taghavi</span>
            <span className="text-[0.62rem] uppercase tracking-[0.2em] text-base-content/40">
              Frontend Developer | Web Designer
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-0.5 rounded-full border border-base-content/10 bg-base-200/25 px-1.5 py-1 backdrop-blur-sm lg:flex"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={`/${item.hash}`}
              onClick={(event) => handleNav(event, item.hash)}
              className="rounded-full px-3.5 py-2 text-[0.66rem] font-medium uppercase tracking-[0.16em] text-base-content/55 transition-colors hover:bg-base-100/70 hover:text-base-content"
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            href="/notes"
            className="rounded-full px-3.5 py-2 text-[0.66rem] font-medium uppercase tracking-[0.16em] text-base-content/55 transition-colors hover:bg-base-100/70 hover:text-base-content"
          >
            {t("notes")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/#contact"
            onClick={(event) => handleNav(event, "#contact")}
            className="hidden h-10 items-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-content transition hover:opacity-85 sm:inline-flex"
          >
            {t("contact")}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
