import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "application/pdf",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const id = filename.split(".")[0];

  if (!id || id.includes("/") || id.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  let media;
  try {
    media = await prisma.media.findUnique({ where: { id } });
  } catch (error) {
    console.error("Failed to load media", error);
    return new Response("Not found", { status: 404 });
  }

  if (!media || !ALLOWED.has(media.mimeType)) {
    return new Response("Not found", { status: 404 });
  }

  const isPdf = media.mimeType === "application/pdf";
  const safeFilename = media.filename.replace(/["\r\n]/g, "").slice(0, 120);

  return new Response(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(media.data.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `${isPdf ? "attachment" : "inline"}; filename="${safeFilename}"`,
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
