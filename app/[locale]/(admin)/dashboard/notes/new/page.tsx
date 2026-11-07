import { getLocale } from "next-intl/server";

import { Flash, PageHeader } from "@/components/admin/AdminUI";
import NoteForm from "@/components/admin/NoteForm";
import { createNoteAction } from "@/lib/admin/actions/notes";
import type { Locale } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="New note" description="Write a bilingual Markdown note." />
      <Flash error={error} />
      <NoteForm locale={locale} action={createNoteAction} submitLabel="Create note" />
    </div>
  );
}
