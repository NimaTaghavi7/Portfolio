import { getLocale } from "next-intl/server";

import { Card, Flash, PageHeader } from "@/components/admin/AdminUI";
import ConfirmButton from "@/components/admin/ConfirmButton";
import TimelineForm from "@/components/admin/TimelineForm";
import {
  createEducationAction,
  deleteEducationAction,
  updateEducationAction,
} from "@/lib/admin/actions/content";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function EducationPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;
  const items = await prisma.education.findMany({
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Education"
        description="Only add real education. Nothing is pre-filled and the section stays hidden while empty."
      />
      <Flash saved={saved} error={error} />

      <Card title="Add education">
        <TimelineForm
          kind="education"
          locale={locale}
          action={createEducationAction}
          submitLabel="Add education"
        />
      </Card>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <details key={item.id} className="group rounded-2xl border border-base-content/10 bg-base-200/25">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-semibold">{item.degreeEn}</p>
                <p className="mt-0.5 text-xs text-base-content/35">
                  {item.institutionEn || "—"} · {item.startDate} — {item.current ? "Present" : item.endDate || ""}
                </p>
              </div>
              <span className="text-xs text-base-content/30 group-open:hidden">Edit</span>
            </summary>
            <div className="border-t border-base-content/10 p-5">
              <TimelineForm
                kind="education"
                item={item}
                locale={locale}
                action={updateEducationAction}
                submitLabel="Save education"
              />
              <form action={deleteEducationAction} className="mt-4 border-t border-base-content/10 pt-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={item.id} />
                <ConfirmButton message={`Delete education "${item.degreeEn}"?`}>Delete education</ConfirmButton>
              </form>
            </div>
          </details>
        ))}
        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-base-content/15 px-5 py-10 text-center text-sm text-base-content/35">
            No education entries. The section is hidden on the website.
          </p>
        )}
      </div>
    </div>
  );
}
