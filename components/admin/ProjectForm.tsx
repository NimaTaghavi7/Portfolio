import {
  Card,
  Checkbox,
  Field,
  FileField,
  Select,
  SubmitButton,
  TextArea,
} from "@/components/admin/AdminUI";
import type { Locale } from "@/lib/constants";

type ProjectRecord = {
  id: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  imageUrl: string | null;
  gallery: string[];
  tools: string[];
  categoryId: string | null;
  companyFa: string | null;
  companyEn: string | null;
  year: number | null;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  published: boolean;
  isPlaceholder: boolean;
  order: number;
};

export default function ProjectForm({
  project,
  categories,
  locale,
  action,
  submitLabel,
}: {
  project?: ProjectRecord;
  categories: Array<{ id: string; nameEn: string; nameFa: string }>;
  locale: Locale;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      {project && <input type="hidden" name="id" value={project.id} />}

      <Card title="Basics">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Slug"
            name="slug"
            defaultValue={project?.slug}
            dir="ltr"
            placeholder="my-project"
            hint="Lowercase letters, numbers and hyphens. Used in the URL and admin."
          />
          <Select label="Category" name="categoryId" defaultValue={project?.categoryId}>
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameEn} / {category.nameFa}
              </option>
            ))}
          </Select>
          <Field label="Title (fa)" name="titleFa" defaultValue={project?.titleFa} dir="rtl" required />
          <Field label="Title (en)" name="titleEn" defaultValue={project?.titleEn} dir="ltr" required />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextArea label="Description (fa)" name="descriptionFa" defaultValue={project?.descriptionFa} dir="rtl" rows={6} />
          <TextArea label="Description (en)" name="descriptionEn" defaultValue={project?.descriptionEn} dir="ltr" rows={6} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Company (fa)" name="companyFa" defaultValue={project?.companyFa} dir="rtl" hint="Optional. Hidden when empty." />
          <Field label="Company (en)" name="companyEn" defaultValue={project?.companyEn} dir="ltr" hint="Optional. Hidden when empty." />
          <Field label="Year" name="year" type="number" defaultValue={project?.year} hint="Optional. Hidden when empty." />
          <Field label="Order" name="order" type="number" defaultValue={project?.order ?? 0} />
        </div>
      </Card>

      <Card title="Media & links" description="Upload an image or paste an https URL. Images are limited to 5 MB.">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Image URL" name="imageUrl" defaultValue={project?.imageUrl} dir="ltr" />
          <FileField
            label="Upload project image"
            name="imageFile"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            currentUrl={project?.imageUrl}
            hint="Recommended 1600×1000 (16:10)."
          />
          <Field label="Live demo URL" name="liveUrl" defaultValue={project?.liveUrl} dir="ltr" placeholder="https://…" />
          <Field label="Source code URL" name="githubUrl" defaultValue={project?.githubUrl} dir="ltr" placeholder="https://…" />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextArea
            label="Tools"
            name="tools"
            defaultValue={project?.tools.join(", ")}
            rows={3}
            hint="Comma separated: Next.js, TypeScript, Tailwind CSS"
          />
          <TextArea
            label="Gallery URLs"
            name="gallery"
            defaultValue={project?.gallery.join("\n")}
            rows={3}
            hint="Optional, one URL per line. Reserved for future project detail pages."
          />
        </div>
      </Card>

      <Card title="Visibility">
        <div className="grid gap-3 sm:grid-cols-3">
          <Checkbox label="Published" name="published" defaultChecked={project?.published ?? true} />
          <Checkbox label="Featured" name="featured" defaultChecked={project?.featured} hint="Featured projects sort first." />
          <Checkbox
            label="Sample / placeholder"
            name="isPlaceholder"
            defaultChecked={project?.isPlaceholder}
            hint="Shows a clear Sample badge on the public card."
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
