"use client";

import dynamic from "next/dynamic";

const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });

export default function Hero3DBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none z-0 overflow-hidden ${className}`}
    >
      <Hero3D />
    </div>
  );
}
