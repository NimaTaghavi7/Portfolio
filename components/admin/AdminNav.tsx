"use client";

import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Palette,
  Settings,
  Tags,
  UserRound,
  Wrench,
} from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";

const GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { href: "/dashboard/profile", label: "Profile", icon: UserRound },
      { href: "/dashboard/content", label: "Homepage copy", icon: Home },
      { href: "/dashboard/skills", label: "Skills", icon: Wrench },
      { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
      { href: "/dashboard/categories", label: "Categories", icon: Tags },
      { href: "/dashboard/experience", label: "Experience", icon: BriefcaseBusiness },
      { href: "/dashboard/education", label: "Education", icon: GraduationCap },
      { href: "/dashboard/stats", label: "Statistics", icon: BarChart3 },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
      { href: "/dashboard/notes", label: "Notes", icon: BookOpen },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/dashboard/media", label: "Media", icon: ImageIcon },
      { href: "/dashboard/settings", label: "SEO & settings", icon: Settings },
      { href: "/dashboard/account", label: "Account", icon: Palette },
    ],
  },
];

export default function AdminNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className={compact ? "flex flex-col gap-6" : "flex flex-col gap-7"}>
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-base-content/30">
            {group.label}
          </p>
          <ul className="mt-2 flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                      active
                        ? "bg-base-200 text-base-content"
                        : "text-base-content/50 hover:bg-base-200/60 hover:text-base-content/80"
                    }`}
                  >
                    <Icon size={15} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
