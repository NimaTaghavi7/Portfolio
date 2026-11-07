import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { Flash, PageHeader } from "@/components/admin/AdminUI";
import ProjectForm from "@/components/admin/ProjectForm";
import { updateProjectAction } from "@/lib/admin/actions/content";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;

  const [project, categories] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.projectCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Edit project"
        description={project.titleEn}
        action={
          <span className="font-mono text-[0.66rem] text-base-content/35">/{project.slug}</span>
        }
      />
      <Flash saved={saved} error={error} />
      <ProjectForm
        project={project}
        categories={categories}
        locale={locale}
        action={updateProjectAction}
        submitLabel="Save project"
      />
    </div>
  );
}
