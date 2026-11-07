import Link from "next/link";
import {
  Dribbble,
  Github,
  Globe2,
  Instagram,
  Linkedin,
  Mail,
  Send,
  Twitter,
} from "lucide-react";

import type { SocialLink } from "@/lib/content/site";

const ICONS = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  telegram: Send,
  x: Twitter,
  dribbble: Dribbble,
  behance: Globe2,
  mail: Mail,
} as const;

export default function SocialLinks({
  links,
  className = "",
}: {
  links: SocialLink[];
  className?: string;
}) {
  if (links.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map((link) => {
        const Icon = ICONS[link.icon];
        const isMail = link.icon === "mail";
        return (
          <li key={link.key}>
            <Link
              href={link.href}
              target={isMail ? undefined : "_blank"}
              rel={isMail ? undefined : "noopener noreferrer"}
              aria-label={link.label}
              title={link.label}
              className="inline-flex size-10 items-center justify-center rounded-full border border-base-content/10 bg-base-200/30 text-base-content/60 transition hover:-translate-y-0.5 hover:border-base-content/30 hover:text-base-content"
            >
              <Icon size={17} aria-hidden="true" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
