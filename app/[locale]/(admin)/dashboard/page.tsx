import { ArrowUpRight, BookOpen, FolderKanban, MessageSquare, Wrench } from "lucide-react";

import { PageHeader } from "@/components/admin/AdminUI";
import { Link } from "@/i18n/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getAdminSession();

  const [projects, messages, notes, skillGroups, recentMessages] = await Promise.all([
    prisma.project.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.note.count(),
    prisma.skillGroup.count(),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const cards = [
    { label: "Projects", value: projects, href: "/dashboard/projects", icon: FolderKanban },
    { label: "New messages", value: messages, href: "/dashboard/messages", icon: MessageSquare },
    { label: "Notes", value: notes, href: "/dashboard/notes", icon: BookOpen },
    { label: "Skill groups", value: skillGroups, href: "/dashboard/skills", icon: Wrench },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="Manage every part of your public portfolio without touching source code."
        action={
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-base-content/15 px-4 text-xs font-medium text-base-content/60 transition hover:border-base-content/30 hover:text-base-content"
          >
            View website
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-2xl border border-base-content/10 bg-base-200/25 p-5 transition hover:border-base-content/25"
            >
              <div className="flex items-center justify-between">
                <Icon size={18} className="text-base-content/40" aria-hidden="true" />
                <ArrowUpRight
                  size={15}
                  className="text-base-content/20 transition group-hover:text-base-content/60"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums">
                {card.value}
              </p>
              <p className="mt-1 text-[0.66rem] uppercase tracking-[0.16em] text-base-content/40">
                {card.label}
              </p>
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border border-base-content/10 bg-base-200/25">
        <div className="flex items-center justify-between border-b border-base-content/10 px-5 py-4">
          <h2 className="text-sm font-semibold">Latest messages</h2>
          <Link href="/dashboard/messages" className="text-xs text-base-content/45 hover:text-base-content">
            View all
          </Link>
        </div>
        {recentMessages.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-base-content/35">
            No messages yet.
          </p>
        ) : (
          <ul className="divide-y divide-base-content/10">
            {recentMessages.map((message) => (
              <li key={message.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{message.subject}</p>
                  <p className="truncate text-xs text-base-content/40">
                    {message.name} · {message.email}
                  </p>
                </div>
                <span className="shrink-0 text-[0.66rem] uppercase tracking-[0.12em] text-base-content/30">
                  {message.status} · {message.createdAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-base-content/10 bg-base-200/25 p-5">
        <h2 className="text-sm font-semibold">Signed in</h2>
        <p className="mt-2 text-sm text-base-content/50">
          {session?.user.name} · {session?.user.email} · role {session?.user.role}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-base-content/35">
          Remember: public pages read from PostgreSQL. Changes made here are revalidated
          immediately. Content that has not been provided (experience, education, statistics)
          stays hidden instead of showing invented information.
        </p>
      </section>
    </div>
  );
}
