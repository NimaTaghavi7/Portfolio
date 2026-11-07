import { Checkbox, Field, SubmitButton, TextArea } from "@/components/admin/AdminUI";
import type { Locale } from "@/lib/constants";

type TimelineRecord = {
  id?: string;
  roleFa?: string | null;
  roleEn?: string | null;
  degreeFa?: string | null;
  degreeEn?: string | null;
  companyFa?: string | null;
  companyEn?: string | null;
  institutionFa?: string | null;
  institutionEn?: string | null;
  descriptionFa?: string | null;
  descriptionEn?: string | null;
  locationFa?: string | null;
  locationEn?: string | null;
  startDate?: string;
  endDate?: string | null;
  current?: boolean;
  order?: number;
  published?: boolean;
  isPlaceholder?: boolean;
};

export default function TimelineForm({
  kind,
  item,
  locale,
  action,
  submitLabel,
}: {
  kind: "experience" | "education";
  item?: TimelineRecord;
  locale: Locale;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const isExperience = kind === "experience";

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      {item?.id && <input type="hidden" name="id" value={item.id} />}

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={isExperience ? "Role (fa)" : "Degree (fa)"}
          name={isExperience ? "roleFa" : "degreeFa"}
          defaultValue={isExperience ? item?.roleFa : item?.degreeFa}
          dir="rtl"
          required
        />
        <Field
          label={isExperience ? "Role (en)" : "Degree (en)"}
          name={isExperience ? "roleEn" : "degreeEn"}
          defaultValue={isExperience ? item?.roleEn : item?.degreeEn}
          dir="ltr"
          required
        />
        <Field
          label={isExperience ? "Company (fa)" : "Institution (fa)"}
          name={isExperience ? "companyFa" : "institutionFa"}
          defaultValue={isExperience ? item?.companyFa : item?.institutionFa}
          dir="rtl"
        />
        <Field
          label={isExperience ? "Company (en)" : "Institution (en)"}
          name={isExperience ? "companyEn" : "institutionEn"}
          defaultValue={isExperience ? item?.companyEn : item?.institutionEn}
          dir="ltr"
        />
        <Field label="Start date" name="startDate" defaultValue={item?.startDate} placeholder="2024" required />
        <Field label="End date" name="endDate" defaultValue={item?.endDate} placeholder="2025 — leave empty if current" />
        <Field label="Location (fa)" name="locationFa" defaultValue={item?.locationFa} dir="rtl" />
        <Field label="Location (en)" name="locationEn" defaultValue={item?.locationEn} dir="ltr" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextArea label="Description (fa)" name="descriptionFa" defaultValue={item?.descriptionFa} dir="rtl" rows={4} />
        <TextArea label="Description (en)" name="descriptionEn" defaultValue={item?.descriptionEn} dir="ltr" rows={4} />
      </div>

      <Field label="Order" name="order" type="number" defaultValue={item?.order ?? 0} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox label="Current" name="current" defaultChecked={item?.current} />
        <Checkbox label="Published" name="published" defaultChecked={item?.published ?? true} />
        <Checkbox
          label="Sample / placeholder entry"
          name="isPlaceholder"
          defaultChecked={item?.isPlaceholder}
          hint="Marks the entry as sample content on the public timeline."
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
