import { getLocale } from "next-intl/server";

import {
  Card,
  Field,
  Flash,
  PageHeader,
  SubmitButton,
} from "@/components/admin/AdminUI";
import ConfirmButton from "@/components/admin/ConfirmButton";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/lib/admin/actions/content";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;
  const categories = await prisma.projectCategory.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { order: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Project categories"
        description="Categories group projects on the public site. Deleting a category keeps its projects and unassigns them."
      />
      <Flash saved={saved} error={error} />

      <Card title="Add category">
        <form action={createCategoryAction} className="flex flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name (fa)" name="nameFa" dir="rtl" required />
            <Field label="Name (en)" name="nameEn" dir="ltr" required />
            <Field label="Slug" name="slug" dir="ltr" placeholder="web-app" hint="Leave empty to derive it from the English name." />
            <Field label="Order" name="order" type="number" defaultValue={categories.length + 1} />
          </div>
          <div className="flex justify-end">
            <SubmitButton>Add category</SubmitButton>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {categories.map((category) => (
          <details key={category.id} className="group rounded-2xl border border-base-content/10 bg-base-200/25">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-semibold">
                  {category.nameEn} <span className="text-base-content/35">/ {category.nameFa}</span>
                </p>
                <p className="mt-0.5 font-mono text-[0.66rem] text-base-content/35">
                  {category.slug} · {category._count.projects} projects
                </p>
              </div>
              <span className="text-xs text-base-content/30 group-open:hidden">Edit</span>
            </summary>
            <div className="border-t border-base-content/10 p-5">
              <form action={updateCategoryAction} className="flex flex-col gap-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={category.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Name (fa)" name="nameFa" defaultValue={category.nameFa} dir="rtl" required />
                  <Field label="Name (en)" name="nameEn" defaultValue={category.nameEn} dir="ltr" required />
                  <Field label="Slug" name="slug" defaultValue={category.slug} dir="ltr" required />
                  <Field label="Order" name="order" type="number" defaultValue={category.order} />
                </div>
                <SubmitButton>Save category</SubmitButton>
              </form>
              <form action={deleteCategoryAction} className="mt-4 border-t border-base-content/10 pt-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={category.id} />
                <ConfirmButton message={`Delete category "${category.nameEn}"? Projects will be kept.`}>
                  Delete category
                </ConfirmButton>
              </form>
            </div>
          </details>
        ))}
        {categories.length === 0 && (
          <p className="rounded-xl border border-dashed border-base-content/15 px-5 py-10 text-center text-sm text-base-content/35">
            No categories yet.
          </p>
        )}
      </div>
    </div>
  );
}
