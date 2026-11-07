"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { scrollToHash } from "@/lib/scroll";

export default function FooterHashLink({
  href,
  hash,
  className,
  children,
}: {
  href: string;
  hash: string;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/fa";

  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (!isHome) return;
        event.preventDefault();
        scrollToHash(`#${hash}`);
      }}
    >
      {children}
    </a>
  );
}
