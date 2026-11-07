import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { Flash, PageHeader } from "@/components/admin/AdminUI";
import NoteForm from "@/components/admin/NoteForm";
import { updateNoteAction } from "@/lib/admin/actions/notes";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function EditNotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit note" description={note.titleEn} />
      <Flash saved={saved} error={error} />
      <NoteForm note={note} locale={locale} action={updateNoteAction} submitLabel="Save note" />
    </div>
  );
}
