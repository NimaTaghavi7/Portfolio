"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import type { StatView } from "@/lib/content/site";
import type { Locale } from "@/lib/constants";
import { prefersReducedMotion } from "@/lib/scroll";

export default function Stats({
  stats,
  locale,
}: {
  stats: StatView[];
  locale: Locale;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl) return;

    const formatter = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US");
    const values = Array.from(
      rootEl.querySelectorAll<HTMLElement>("[data-stat-value]")
    );

    if (prefersReducedMotion()) {
      values.forEach((el) => {
        el.textContent = `${formatter.format(Number(el.dataset.value || 0))}${
          el.dataset.suffix || ""
        }`;
      });
      return;
    }

    // Server HTML shows the final value. Only reset to zero when the counter
    // actually enters the viewport, so an observer failure can never leave a
    // visible "0+" behind.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);

          const target = Number(el.dataset.value || 0);
          const suffix = el.dataset.suffix || "";
          const counter = { value: 0 };
          el.textContent = `${formatter.format(0)}${suffix}`;

          gsap.to(counter, {
            value: target,
            duration: 1.7,
            ease: "power2.out",
            snap: { value: 1 },
            onUpdate: () => {
              el.textContent = `${formatter.format(Math.round(counter.value))}${suffix}`;
            },
            onComplete: () => {
              el.textContent = `${formatter.format(target)}${suffix}`;
            },
          });
        }
      },
      { threshold: 0.35 }
    );

    values.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [stats, locale]);

  if (stats.length === 0) return null;

  return (
    <section className="container-page section-space" ref={root}>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-base-content/10 bg-base-content/10 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="stat-card group relative flex flex-col items-center justify-center gap-2 bg-base-100 px-4 py-10 text-center transition-colors hover:bg-base-200/50"
            aria-label={`${stat.value}${stat.suffix} ${stat.label}`}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-base-content/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            <span
              data-stat-value
              data-value={stat.value}
              data-suffix={stat.suffix}
              aria-hidden="true"
              className="text-4xl font-semibold tracking-tight text-base-content tabular-nums md:text-5xl"
            >
              {stat.value}
              {stat.suffix}
            </span>
            <span className="text-[0.66rem] font-medium uppercase tracking-[0.18em] text-base-content/45">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
