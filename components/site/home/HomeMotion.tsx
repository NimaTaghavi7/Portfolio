"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function HomeMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const rootEl = root.current;
      if (!rootEl) return;

      const isRtl = document.documentElement.dir === "rtl";
      const fromX = isRtl ? 44 : -44;

      gsap.from(".hero-reveal", {
        y: 26,
        opacity: 0,
        duration: 0.75,
        stagger: 0.09,
        ease: "power3.out",
        delay: 0.1,
      });

      gsap.utils.toArray<HTMLElement>(".reveal", rootEl).forEach((el) => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      gsap.utils
        .toArray<HTMLElement>("[data-section-heading]", rootEl)
        .forEach((el) => {
          gsap.from(el, {
            y: 34,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

      const parallax = rootEl.querySelector<HTMLElement>(
        "[data-parallax-image]"
      );
      if (parallax) {
        gsap.fromTo(
          parallax,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: parallax,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      }

      gsap.utils.toArray<HTMLElement>(".project-card", rootEl).forEach((el) => {
        gsap.from(el, {
          x: fromX,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 84%" },
        });
      });

      gsap.utils.toArray<HTMLElement>(".skill-card", rootEl).forEach((el, index) => {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.5,
          delay: Math.min(index * 0.04, 0.24),
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
      });
    },
    { scope: root }
  );

  return <div ref={root}>{children}</div>;
}
