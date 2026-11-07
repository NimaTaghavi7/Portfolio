import Image from "next/image";
import { getLocale } from "next-intl/server";
import { FileText } from "lucide-react";

import { Badge, Flash, PageHeader } from "@/components/admin/AdminUI";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteMediaAction } from "@/lib/admin/actions/content";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;
  const files = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, filename: true, mimeType: true, size: true, createdAt: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Media"
        description="Images and résumés are stored in PostgreSQL, so uploads survive serverless deployments. Files are limited to 4 MB."
      />
      <Flash saved={saved} error={error} />

      {files.length === 0 ? (
        <p className="rounded-xl border border-dashed border-base-content/15 px-5 py-12 text-center text-sm text-base-content/35">
          No uploaded files yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => {
            const url = `/uploads/${file.id}`;
            const isImage = file.mimeType.startsWith("image/");
            return (
              <div key={file.id} className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-200/25">
                <div className="relative flex aspect-[16/10] items-center justify-center border-b border-base-content/10 bg-base-300/40">
                  {isImage ? (
                    <Image
                      src={url}
                      alt=""
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <FileText size={30} className="text-base-content/30" aria-hidden="true" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-mono text-[0.66rem] text-base-content/55">
                      {file.filename}
                    </p>
                    <Badge>{isImage ? "Image" : "PDF"}</Badge>
                  </div>
                  <p className="mt-1 text-[0.66rem] text-base-content/30">
                    {formatSize(file.size)} · {file.createdAt.toLocaleDateString()}
                  </p>
                  <p className="mt-2 break-all rounded-lg bg-base-100/50 px-2 py-1 font-mono text-[0.62rem] text-base-content/40">
                    {url}
                  </p>
                  <form action={deleteMediaAction} className="mt-3">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="url" value={url} />
                    <ConfirmButton message={`Delete ${file.filename}?`}>Delete file</ConfirmButton>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
