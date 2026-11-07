"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });

export default function Hero3DBackdrop({ className = "" }: { className?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = false;

    const activate = () => {
      if (active) return;
      active = true;
      setReady(true);
      window.removeEventListener("pointermove", activate);
      window.removeEventListener("scroll", activate);
      window.removeEventListener("touchstart", activate);
      window.clearTimeout(timer);
    };

    // Keep the WebGL scene out of the critical path. Real visitors get it on
    // their first interaction; a slower idle fallback covers passive viewing.
    const timer = window.setTimeout(activate, 6500);
    window.addEventListener("pointermove", activate, { passive: true });
    window.addEventListener("scroll", activate, { passive: true });
    window.addEventListener("touchstart", activate, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", activate);
      window.removeEventListener("scroll", activate);
      window.removeEventListener("touchstart", activate);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none z-0 overflow-hidden ${className}`}
    >
      {ready ? <Hero3D /> : null}
    </div>
  );
}
