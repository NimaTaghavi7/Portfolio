import { getLocale } from "next-intl/server";

import { Card, Flash, PageHeader, SubmitButton, TextArea } from "@/components/admin/AdminUI";
import { updateTextsAction } from "@/lib/admin/actions/site";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;
  const texts = await prisma.siteText.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Homepage copy"
        description="Editable headings, introductions, marquee items and footer tagline in both languages."
      />
      <Flash saved={saved} error={error} />

      <form action={updateTextsAction} className="flex flex-col gap-6">
        <input type="hidden" name="locale" value={locale} />

        <Card title="Content blocks" description="Every key is rendered somewhere on the public site.">
          <div className="flex flex-col gap-6">
            {texts.map((text) => (
              <fieldset key={text.id} className="rounded-xl border border-base-content/10 bg-base-100/30 p-4">
                <legend className="px-2 text-[0.62rem] font-mono uppercase tracking-[0.08em] text-base-content/40">
                  {text.key}
                </legend>
                <p className="mb-3 text-xs text-base-content/45">{text.label}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextArea
                    label="Persian (fa)"
                    name={`fa:${text.key}`}
                    defaultValue={text.valueFa}
                    dir="rtl"
                    rows={2}
                  />
                  <TextArea
                    label="English (en)"
                    name={`en:${text.key}`}
                    defaultValue={text.valueEn}
                    dir="ltr"
                    rows={2}
                  />
                </div>
              </fieldset>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <SubmitButton>Save copy</SubmitButton>
        </div>
      </form>
    </div>
  );
}
