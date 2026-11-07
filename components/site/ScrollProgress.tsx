"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!bar.current || prefersReducedMotion()) return;

    const tween = gsap.to(bar.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.25,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-px bg-transparent"
    >
      <div
        ref={bar}
        className="h-full w-full origin-left scale-x-0 bg-linear-to-r from-base-content/10 via-base-content/70 to-base-content/10 rtl:origin-right"
      />
    </div>
  );
}
