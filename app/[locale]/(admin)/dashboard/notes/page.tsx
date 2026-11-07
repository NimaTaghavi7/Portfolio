import { getLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { Badge, Flash, PageHeader } from "@/components/admin/AdminUI";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Link } from "@/i18n/navigation";
import {
  deleteNoteAction,
  toggleNotePublishedAction,
} from "@/lib/admin/actions/notes";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;
  const notes = await prisma.note.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notes"
        description="Bilingual devlog notes. Drafts stay hidden from the public site."
        action={
          <Link
            href="/dashboard/notes/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-content transition hover:opacity-85"
          >
            <Plus size={15} aria-hidden="true" />
            New note
          </Link>
        }
      />
      <Flash saved={saved} error={error} />

      {notes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-base-content/15 px-5 py-12 text-center text-sm text-base-content/35">
          No notes yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex flex-col gap-3 rounded-2xl border border-base-content/10 bg-base-200/25 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">{note.titleEn}</p>
                  <Badge>{note.published ? "Published" : "Draft"}</Badge>
                </div>
                <p className="mt-1 truncate font-mono text-[0.66rem] text-base-content/35">
                  /notes/{note.slug} · updated {note.updatedAt.toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {note.published && (
                  <Link
                    href={`/notes/${note.slug}`}
                    className="inline-flex h-8 items-center rounded-full border border-base-content/15 px-3 text-[0.66rem] text-base-content/55 transition hover:text-base-content"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/dashboard/notes/${note.id}`}
                  className="inline-flex h-8 items-center rounded-full border border-base-content/15 px-3 text-[0.66rem] text-base-content/65 transition hover:border-base-content/35 hover:text-base-content"
                >
                  Edit
                </Link>
                <form action={toggleNotePublishedAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={note.id} />
                  <button
                    type="submit"
                    className="inline-flex h-8 items-center rounded-full border border-base-content/15 px-3 text-[0.66rem] text-base-content/55 transition hover:text-base-content"
                  >
                    {note.published ? "Unpublish" : "Publish"}
                  </button>
                </form>
                <form action={deleteNoteAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={note.id} />
                  <ConfirmButton message={`Delete "${note.titleEn}"?`}>Delete</ConfirmButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
