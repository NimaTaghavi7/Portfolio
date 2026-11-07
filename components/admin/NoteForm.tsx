import {
  Card,
  Checkbox,
  Field,
  SubmitButton,
  TextArea,
} from "@/components/admin/AdminUI";
import type { Locale } from "@/lib/constants";

type NoteRecord = {
  id: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  excerptFa: string;
  excerptEn: string;
  contentFa: string;
  contentEn: string;
  tags: string[];
  published: boolean;
};

export default function NoteForm({
  note,
  locale,
  action,
  submitLabel,
}: {
  note?: NoteRecord;
  locale: Locale;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      {note && <input type="hidden" name="id" value={note.id} />}

      <Card title="Note details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Slug"
            name="slug"
            defaultValue={note?.slug}
            dir="ltr"
            placeholder="my-technical-note"
            hint="Lowercase letters, numbers and hyphens. Required for a stable URL."
          />
          <Field label="Tags" name="tags" defaultValue={note?.tags.join(", ")} hint="Comma separated." />
          <Field label="Title (fa)" name="titleFa" defaultValue={note?.titleFa} dir="rtl" required />
          <Field label="Title (en)" name="titleEn" defaultValue={note?.titleEn} dir="ltr" required />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextArea label="Excerpt (fa)" name="excerptFa" defaultValue={note?.excerptFa} dir="rtl" rows={3} />
          <TextArea label="Excerpt (en)" name="excerptEn" defaultValue={note?.excerptEn} dir="ltr" rows={3} />
        </div>
      </Card>

      <Card title="Content" description="Markdown is supported. Empty content in one language falls back to the other.">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextArea
            label="Content (fa) — Markdown"
            name="contentFa"
            defaultValue={note?.contentFa}
            dir="rtl"
            rows={16}
            mono
          />
          <TextArea
            label="Content (en) — Markdown"
            name="contentEn"
            defaultValue={note?.contentEn}
            dir="ltr"
            rows={16}
            mono
          />
        </div>
      </Card>

      <Card title="Visibility">
        <Checkbox label="Published" name="published" defaultChecked={note?.published ?? false} hint="Drafts are only visible in the admin dashboard." />
      </Card>

      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
