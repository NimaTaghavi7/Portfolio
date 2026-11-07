import { getLocale } from "next-intl/server";

import {
  Card,
  Checkbox,
  Field,
  Flash,
  PageHeader,
  SubmitButton,
} from "@/components/admin/AdminUI";
import ConfirmButton from "@/components/admin/ConfirmButton";
import {
  createStatAction,
  deleteStatAction,
  updateStatAction,
} from "@/lib/admin/actions/content";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;
  const stats = await prisma.stat.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Statistics"
        description="Optional numeric highlights. Nothing is pre-filled. Only publish numbers you can stand behind, then enable the section in SEO & settings."
      />
      <Flash saved={saved} error={error} />

      <Card title="Add statistic">
        <form action={createStatAction} className="flex flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Value" name="value" type="number" required />
            <Field label="Suffix" name="suffix" placeholder="+" />
            <Field label="Label (fa)" name="labelFa" dir="rtl" required />
            <Field label="Label (en)" name="labelEn" dir="ltr" required />
            <Field label="Order" name="order" type="number" defaultValue={stats.length + 1} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Checkbox label="Published" name="published" defaultChecked />
            <Checkbox label="Sample / placeholder" name="isPlaceholder" />
          </div>
          <div className="flex justify-end">
            <SubmitButton>Add statistic</SubmitButton>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {stats.map((stat) => (
          <details key={stat.id} className="group rounded-2xl border border-base-content/10 bg-base-200/25">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-semibold tabular-nums">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="mt-0.5 text-xs text-base-content/35">{stat.labelEn}</p>
              </div>
              <span className="text-xs text-base-content/30 group-open:hidden">Edit</span>
            </summary>
            <div className="border-t border-base-content/10 p-5">
              <form action={updateStatAction} className="flex flex-col gap-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={stat.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Value" name="value" type="number" defaultValue={stat.value} required />
                  <Field label="Suffix" name="suffix" defaultValue={stat.suffix} />
                  <Field label="Label (fa)" name="labelFa" defaultValue={stat.labelFa} dir="rtl" required />
                  <Field label="Label (en)" name="labelEn" defaultValue={stat.labelEn} dir="ltr" required />
                  <Field label="Order" name="order" type="number" defaultValue={stat.order} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Checkbox label="Published" name="published" defaultChecked={stat.published} />
                  <Checkbox label="Sample / placeholder" name="isPlaceholder" defaultChecked={stat.isPlaceholder} />
                </div>
                <SubmitButton>Save statistic</SubmitButton>
              </form>
              <form action={deleteStatAction} className="mt-4 border-t border-base-content/10 pt-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={stat.id} />
                <ConfirmButton message="Delete this statistic?">Delete statistic</ConfirmButton>
              </form>
            </div>
          </details>
        ))}
        {stats.length === 0 && (
          <p className="rounded-xl border border-dashed border-base-content/15 px-5 py-10 text-center text-sm text-base-content/35">
            No statistics. The section is hidden on the website.
          </p>
        )}
      </div>
    </div>
  );
}
