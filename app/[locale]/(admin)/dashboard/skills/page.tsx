import { getLocale } from "next-intl/server";

import {
  Badge,
  Card,
  Checkbox,
  Field,
  Flash,
  PageHeader,
  SubmitButton,
  TextArea,
} from "@/components/admin/AdminUI";
import ConfirmButton from "@/components/admin/ConfirmButton";
import {
  createSkillGroupAction,
  deleteSkillGroupAction,
  updateSkillGroupAction,
} from "@/lib/admin/actions/content";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;
  const groups = await prisma.skillGroup.findMany({
    include: { skills: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Skills"
        description="Group the tools you actually use. Skills are plain names, not invented proficiency scores."
      />
      <Flash saved={saved} error={error} />

      <Card title="Add a skill group">
        <form action={createSkillGroupAction} className="flex flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name (fa)" name="nameFa" dir="rtl" required />
            <Field label="Name (en)" name="nameEn" dir="ltr" required />
            <Field label="Icon" name="icon" placeholder="code | pen-tool | wrench | sparkles" hint="Optional lucide icon key used on the public card." />
            <Field label="Order" name="order" type="number" defaultValue={groups.length + 1} />
          </div>
          <TextArea
            label="Skills"
            name="skills"
            rows={3}
            hint="One per line or comma separated: React, Next.js, TypeScript"
            required
          />
          <Checkbox label="Published" name="published" defaultChecked />
          <div className="flex justify-end">
            <SubmitButton>Add group</SubmitButton>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {groups.length === 0 && (
          <p className="rounded-xl border border-dashed border-base-content/15 px-5 py-10 text-center text-sm text-base-content/35">
            No skill groups yet.
          </p>
        )}

        {groups.map((group) => (
          <details key={group.id} className="group rounded-2xl border border-base-content/10 bg-base-200/25">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {group.nameEn} <span className="text-base-content/35">/ {group.nameFa}</span>
                </p>
                <p className="mt-0.5 text-xs text-base-content/35">
                  {group.skills.length} skills · order {group.order}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge>{group.published ? "Published" : "Hidden"}</Badge>
                <span className="text-xs text-base-content/30 group-open:hidden">Edit</span>
              </div>
            </summary>

            <div className="border-t border-base-content/10 p-5">
              <form action={updateSkillGroupAction} className="flex flex-col gap-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={group.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Name (fa)" name="nameFa" defaultValue={group.nameFa} dir="rtl" required />
                  <Field label="Name (en)" name="nameEn" defaultValue={group.nameEn} dir="ltr" required />
                  <Field label="Icon" name="icon" defaultValue={group.icon} />
                  <Field label="Order" name="order" type="number" defaultValue={group.order} />
                </div>
                <TextArea
                  label="Skills"
                  name="skills"
                  rows={4}
                  defaultValue={group.skills.map((skill) => skill.name).join("\n")}
                />
                <Checkbox label="Published" name="published" defaultChecked={group.published} />
                <div className="flex items-center justify-between gap-3">
                  <SubmitButton>Save group</SubmitButton>
                </div>
              </form>

              <form action={deleteSkillGroupAction} className="mt-4 border-t border-base-content/10 pt-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={group.id} />
                <ConfirmButton message={`Delete the "${group.nameEn}" group and all of its skills?`}>
                  Delete group
                </ConfirmButton>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
