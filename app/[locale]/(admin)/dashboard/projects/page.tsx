import Image from "next/image";
import { getLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { Badge, Flash, PageHeader } from "@/components/admin/AdminUI";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Link } from "@/i18n/navigation";
import { deleteProjectAction } from "@/lib/admin/actions/content";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;
  const projects = await prisma.project.findMany({
    include: { category: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Projects"
        description="Add, edit and publish portfolio projects in Persian and English."
        action={
          <Link
            href="/dashboard/projects/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-content transition hover:opacity-85"
          >
            <Plus size={15} aria-hidden="true" />
            New project
          </Link>
        }
      />
      <Flash saved={saved} error={error} />

      {projects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-base-content/15 px-5 py-12 text-center text-sm text-base-content/35">
          No projects yet. Create your first project.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col gap-4 rounded-2xl border border-base-content/10 bg-base-200/25 p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl border border-base-content/10 bg-base-300/40 sm:h-16 sm:w-28">
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[0.6rem] uppercase tracking-widest text-base-content/25">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">{project.titleEn}</p>
                  <Badge>{project.published ? "Published" : "Draft"}</Badge>
                  {project.isPlaceholder && <Badge>Sample</Badge>}
                  {project.featured && <Badge>Featured</Badge>}
                </div>
                <p className="mt-1 truncate font-mono text-[0.66rem] text-base-content/35">
                  /{project.slug}
                  {project.category ? ` · ${project.category.nameEn}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="inline-flex h-8 items-center rounded-full border border-base-content/15 px-3 text-[0.66rem] font-medium text-base-content/65 transition hover:border-base-content/35 hover:text-base-content"
                >
                  Edit
                </Link>
                <form action={deleteProjectAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={project.id} />
                  <ConfirmButton message={`Delete "${project.titleEn}"? This cannot be undone.`}>
                    Delete
                  </ConfirmButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
