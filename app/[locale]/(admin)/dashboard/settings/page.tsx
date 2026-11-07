import { getLocale } from "next-intl/server";

import {
  Card,
  Checkbox,
  Field,
  FileField,
  Flash,
  PageHeader,
  SubmitButton,
  TextArea,
} from "@/components/admin/AdminUI";
import { updateSettingsAction } from "@/lib/admin/actions/site";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="SEO & settings"
        description="Language-specific metadata, Open Graph image and visibility of optional sections."
      />
      <Flash saved={saved} error={error} />

      <form action={updateSettingsAction} className="flex flex-col gap-6">
        <input type="hidden" name="locale" value={locale} />

        <Card title="Search metadata" description="Used in page titles, meta descriptions and social previews.">
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="SEO title (fa)" name="seoTitleFa" defaultValue={settings?.seoTitleFa} dir="rtl" />
              <Field label="SEO title (en)" name="seoTitleEn" defaultValue={settings?.seoTitleEn} dir="ltr" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextArea label="Meta description (fa)" name="seoDescriptionFa" defaultValue={settings?.seoDescriptionFa} dir="rtl" rows={4} />
              <TextArea label="Meta description (en)" name="seoDescriptionEn" defaultValue={settings?.seoDescriptionEn} dir="ltr" rows={4} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Keywords (fa)"
                name="keywordsFa"
                defaultValue={settings?.keywordsFa.join(", ")}
                dir="rtl"
                hint="Comma separated."
              />
              <Field
                label="Keywords (en)"
                name="keywordsEn"
                defaultValue={settings?.keywordsEn.join(", ")}
                dir="ltr"
                hint="Comma separated."
              />
            </div>
          </div>
        </Card>

        <Card title="Social preview image" description="Recommended size: 1200×630. Used for Open Graph and Twitter cards.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Open Graph image URL" name="ogImageUrl" defaultValue={settings?.ogImageUrl} dir="ltr" />
            <FileField
              label="Upload Open Graph image"
              name="ogImageFile"
              accept="image/jpeg,image/png,image/webp,image/avif"
              currentUrl={settings?.ogImageUrl}
            />
          </div>
        </Card>

        <Card title="Sections" description="Optional homepage blocks stay hidden until real content exists.">
          <Checkbox
            label="Show statistics section"
            name="showStats"
            defaultChecked={settings?.showStats}
            hint="Only enable this after adding real numbers in the Statistics section."
          />
        </Card>

        <div className="flex justify-end">
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </form>
    </div>
  );
}
