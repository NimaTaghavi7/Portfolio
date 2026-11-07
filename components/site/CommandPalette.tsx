"use client";

import {
  ArrowUpRight,
  Command,
  Download,
  FileText,
  FolderKanban,
  Languages,
  Moon,
  Search,
  Sun,
  Terminal,
  UserRound,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/lib/constants";
import { scrollToHash } from "@/lib/scroll";

type CommandItem = {
  id: string;
  label: string;
  hint: string;
  icon: typeof Terminal;
  keywords: string;
  run: () => void;
};

export default function CommandPalette({
  open,
  onClose,
  resumeUrl,
}: {
  open: boolean;
  onClose: () => void;
  resumeUrl?: string | null;
}) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const isHome = pathname === "/" || pathname === "/fa";

  const goHash = useCallback(
    (hash: string) => {
      if (isHome) {
        scrollToHash(hash);
        return;
      }
      const prefix = locale === "fa" ? "/fa" : "";
      window.location.href = `${prefix}/${hash}`;
    },
    [isHome, locale]
  );

  const commands = useMemo<CommandItem[]>(() => {
    return [
      {
        id: "skills",
        label: t("skills"),
        hint: "#skills",
        icon: Terminal,
        keywords: "skills stack frontend tools",
        run: () => goHash("#skills"),
      },
      {
        id: "projects",
        label: t("projects"),
        hint: "#projects",
        icon: FolderKanban,
        keywords: "projects work case studies",
        run: () => goHash("#projects"),
      },
      {
        id: "about",
        label: t("about"),
        hint: "#about",
        icon: UserRound,
        keywords: "about bio experience timeline",
        run: () => goHash("#about"),
      },
      {
        id: "contact",
        label: t("contact"),
        hint: "#contact",
        icon: ArrowUpRight,
        keywords: "contact email message hire",
        run: () => goHash("#contact"),
      },
      {
        id: "notes",
        label: t("notes"),
        hint: "/notes",
        icon: FileText,
        keywords: "notes writing devlog",
        run: () => router.push("/notes"),
      },
      {
        id: "theme",
        label: resolvedTheme === "silver-light" ? tc("themeDark") : tc("themeLight"),
        hint: "theme.toggle",
        icon: resolvedTheme === "silver-light" ? Moon : Sun,
        keywords: "theme dark light appearance",
        run: () => setTheme(resolvedTheme === "silver-light" ? "silver-dark" : "silver-light"),
      },
      {
        id: "language",
        label: locale === "fa" ? "English" : "Persian",
        hint: "locale.switch",
        icon: Languages,
        keywords: "language locale english persian فارسی",
        run: () => {
          const nextLocale = locale === "fa" ? "en" : "fa";
          const base = pathname === "/" ? "" : pathname;
          window.location.href =
            nextLocale === "fa" ? `/fa${base === "/" ? "" : base}` : base || "/";
        },
      },
      {
        id: "resume",
        label: locale === "fa" ? "دانلود رزومه" : "Download resume",
        hint: "resume.pdf",
        icon: Download,
        keywords: "resume cv download pdf",
        run: () => {
          const link = document.createElement("a");
          link.href = resumeUrl || "/resume.pdf";
          link.download = "Nima-Taghavi-Resume.pdf";
          document.body.appendChild(link);
          link.click();
          link.remove();
        },
      },
    ];
  }, [goHash, locale, pathname, resolvedTheme, resumeUrl, router, setTheme, t, tc]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.hint} ${command.keywords}`.toLowerCase().includes(value)
    );
  }, [commands, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive((value) => (filtered.length ? (value + 1) % filtered.length : 0));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive((value) =>
          filtered.length ? (value - 1 + filtered.length) % filtered.length : 0
        );
      }
      if (event.key === "Enter" && filtered[active]) {
        event.preventDefault();
        filtered[active].run();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, filtered, onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        type="button"
        aria-label="Close command palette"
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-base-content/15 bg-base-100/95 shadow-[0_40px_100px_-45px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-base-content/10 px-4 py-3">
          <Search size={16} className="shrink-0 text-base-content/40" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            placeholder={locale === "fa" ? "جستجوی بخش یا دستور..." : "Search sections or commands..."}
            className="min-w-0 flex-1 bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
            aria-label="Search commands"
          />
          <kbd className="hidden rounded-md border border-base-content/15 bg-base-content/5 px-1.5 py-0.5 font-mono text-[0.6rem] text-base-content/40 sm:inline">
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-base-content/40">
              {locale === "fa" ? "چیزی پیدا نشد." : "No commands found."}
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5" role="listbox">
              {filtered.map((command, index) => {
                const Icon = command.icon;
                const isActive = index === active;
                return (
                  <li key={command.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => {
                        command.run();
                        onClose();
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition ${
                        isActive
                          ? "bg-base-200 text-base-content"
                          : "text-base-content/55 hover:bg-base-200/60 hover:text-base-content"
                      }`}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-base-content/12 bg-base-100/60">
                        <Icon size={15} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {command.label}
                      </span>
                      <span className="hidden font-mono text-[0.6rem] text-base-content/30 sm:inline">
                        {command.hint}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-base-content/10 px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-base-content/30">
          <span className="inline-flex items-center gap-1.5">
            <Command size={11} aria-hidden="true" /> command palette
          </span>
          <span>↑ ↓ navigate · enter run</span>
        </div>
      </div>
    </div>
  );
}
