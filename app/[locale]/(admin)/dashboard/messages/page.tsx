import { getLocale } from "next-intl/server";
import { Archive, Check, Inbox, Trash2 } from "lucide-react";

import { Badge, Flash, PageHeader } from "@/components/admin/AdminUI";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Link } from "@/i18n/navigation";
import {
  deleteMessageAction,
  setMessageStatusAction,
} from "@/lib/admin/actions/content";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "READ", "ARCHIVED"] as const;
type Status = (typeof STATUSES)[number];

const PAGE_SIZE = 25;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    page?: string;
    saved?: string;
    error?: string;
  }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { status: rawStatus, page: rawPage, saved, error } = await searchParams;
  const status = STATUSES.includes(rawStatus as Status) ? (rawStatus as Status) : undefined;
  const where = status ? { status } : undefined;

  const [counts, total] = await Promise.all([
    prisma.contactMessage.groupBy({ by: ["status"], _count: true }),
    prisma.contactMessage.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = Number(rawPage);
  const page = Number.isInteger(requestedPage)
    ? Math.min(Math.max(1, requestedPage), totalPages)
    : 1;

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });

  const countFor = (value: Status) =>
    counts.find((row) => row.status === value)?._count ?? 0;

  const pageHref = (target: number) =>
    `/dashboard/messages?${status ? `status=${status}&` : ""}page=${target}`;

  const tabs = [
    { label: "All", href: "/dashboard/messages" },
    { label: `New (${countFor("NEW")})`, href: "/dashboard/messages?status=NEW" },
    { label: `Read (${countFor("READ")})`, href: "/dashboard/messages?status=READ" },
    { label: `Archived (${countFor("ARCHIVED")})`, href: "/dashboard/messages?status=ARCHIVED" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Messages"
        description="Every contact form submission is stored here. Email notifications are optional and independent."
      />
      <Flash saved={saved} error={error} />

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex h-9 items-center rounded-full border px-4 text-[0.66rem] font-medium transition ${
              (tab.href === "/dashboard/messages" && !status) ||
              (status && tab.href.endsWith(status))
                ? "border-base-content/30 bg-base-200 text-base-content"
                : "border-base-content/10 text-base-content/45 hover:text-base-content"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {messages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-base-content/15 px-5 py-12 text-center text-sm text-base-content/35">
          No messages in this view.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <article key={message.id} className="rounded-2xl border border-base-content/10 bg-base-200/25">
              <div className="flex flex-col gap-3 border-b border-base-content/10 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold">{message.subject}</h2>
                    <Badge>{message.status}</Badge>
                    <span className="text-[0.62rem] uppercase tracking-[0.12em] text-base-content/30">
                      {message.locale}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-base-content/45">
                    {message.name} ·{" "}
                    <a href={`mailto:${message.email}`} className="hover:text-base-content" dir="ltr">
                      {message.email}
                    </a>{" "}
                    · {message.createdAt.toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {message.status !== "READ" && (
                    <form action={setMessageStatusAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={message.id} />
                      <input type="hidden" name="status" value="READ" />
                      <button
                        type="submit"
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-base-content/15 px-3 text-[0.64rem] text-base-content/55 transition hover:text-base-content"
                      >
                        <Check size={12} aria-hidden="true" /> Read
                      </button>
                    </form>
                  )}
                  {message.status !== "NEW" && (
                    <form action={setMessageStatusAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={message.id} />
                      <input type="hidden" name="status" value="NEW" />
                      <button
                        type="submit"
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-base-content/15 px-3 text-[0.64rem] text-base-content/55 transition hover:text-base-content"
                      >
                        <Inbox size={12} aria-hidden="true" /> Unread
                      </button>
                    </form>
                  )}
                  {message.status !== "ARCHIVED" && (
                    <form action={setMessageStatusAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={message.id} />
                      <input type="hidden" name="status" value="ARCHIVED" />
                      <button
                        type="submit"
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-base-content/15 px-3 text-[0.64rem] text-base-content/55 transition hover:text-base-content"
                      >
                        <Archive size={12} aria-hidden="true" /> Archive
                      </button>
                    </form>
                  )}
                  <form action={deleteMessageAction}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={message.id} />
                    <ConfirmButton message="Delete this message permanently?">
                      <span className="inline-flex items-center gap-1.5">
                        <Trash2 size={12} aria-hidden="true" /> Delete
                      </span>
                    </ConfirmButton>
                  </form>
                </div>
              </div>
              <p className="whitespace-pre-wrap px-5 py-5 text-sm leading-relaxed text-base-content/65">
                {message.message}
              </p>
            </article>
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-content/10 pt-4 text-xs text-base-content/45">
          <span>
            Page {page} of {totalPages} · {total} messages
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={pageHref(page - 1)}
                className="inline-flex h-8 items-center rounded-full border border-base-content/15 px-3 text-base-content/60 transition hover:text-base-content"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={pageHref(page + 1)}
                className="inline-flex h-8 items-center rounded-full border border-base-content/15 px-3 text-base-content/60 transition hover:text-base-content"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
