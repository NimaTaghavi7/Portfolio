import Link from "next/link";
import {
  ArrowUpRight,
  Dribbble,
  Github,
  Globe2,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Send,
  Twitter,
} from "lucide-react";

import type { SiteSettingsView } from "@/lib/content/site";

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

export default function AboutLinks({
  settings,
  className = "",
}: {
  settings: SiteSettingsView;
  className?: string;
}) {
  const socialLinks = settings.socials.map((link) => ({
    key: link.key,
    label: link.icon === "mail" ? "Email" : link.label,
    href: link.href,
    icon: ICONS[link.icon],
    external: link.href.startsWith("http"),
  }));

  const phone = settings.phone
    ? {
        key: "phone",
        label: "Phone",
        href: `tel:${settings.phone.replace(/[^\d+]/g, "")}`,
        icon: Phone,
        external: false,
      }
    : null;

  const order = [
    "github",
    "linkedin",
    "telegram",
    "instagram",
    "x",
    "phone",
    "mail",
    "dribbble",
    "behance",
  ];
  const links = (phone ? [...socialLinks, phone] : socialLinks).sort(
    (a, b) => order.indexOf(a.key) - order.indexOf(b.key)
  );

  if (links.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-3 ${className}`}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <li key={link.key}>
            <Link
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              dir={link.key === "mail" || link.key === "phone" ? "ltr" : undefined}
              title={
                link.key === "mail" && settings.email
                  ? settings.email
                  : link.key === "phone" && settings.phone
                    ? settings.phone
                    : link.label
              }
              aria-label={
                link.key === "mail" && settings.email
                  ? `Email ${settings.email}`
                  : link.key === "phone" && settings.phone
                    ? `Phone ${settings.phone}`
                    : link.label
              }
              className="group inline-flex items-center gap-2 text-sm text-base-content/55 transition-colors hover:text-base-content"
            >
              <Icon
                size={17}
                aria-hidden="true"
                className="text-base-content/45 transition-colors group-hover:text-base-content"
              />
              <span className="break-anywhere">{link.label}</span>
              <ArrowUpRight
                size={14}
                aria-hidden="true"
                className="text-base-content/25 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-base-content/70 rtl:group-hover:-translate-x-0.5"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
