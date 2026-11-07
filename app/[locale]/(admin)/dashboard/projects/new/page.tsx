import { getLocale } from "next-intl/server";

import { Flash, PageHeader } from "@/components/admin/AdminUI";
import ProjectForm from "@/components/admin/ProjectForm";
import { createProjectAction } from "@/lib/admin/actions/content";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { error } = await searchParams;
  const categories = await prisma.projectCategory.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="New project" description="Create a bilingual portfolio project." />
      <Flash error={error} />
      <ProjectForm
        categories={categories}
        locale={locale}
        action={createProjectAction}
        submitLabel="Create project"
      />
    </div>
  );
}
