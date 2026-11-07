import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/db/prisma";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_PDF_BYTES = 4 * 1024 * 1024;

export const UPLOAD_PUBLIC_PREFIX = "/uploads/";

type DetectedType = { extension: string; mimeType: string };

function detectImageType(buffer: Buffer): DetectedType | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }
  if (
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { extension: "png", mimeType: "image/png" };
  }
  if (buffer.subarray(0, 3).toString("ascii") === "GIF") {
    return { extension: "gif", mimeType: "image/gif" };
  }
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { extension: "webp", mimeType: "image/webp" };
  }
  if (buffer.subarray(4, 12).toString("ascii").includes("ftypavif")) {
    return { extension: "avif", mimeType: "image/avif" };
  }
  return null;
}

async function storeMedia(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const media = await prisma.media.create({
    data: {
      filename,
      mimeType,
      size: buffer.length,
      data: new Uint8Array(buffer),
    },
    select: { id: true },
  });

  return `${UPLOAD_PUBLIC_PREFIX}${media.id}`;
}

export async function saveImageFile(file: File): Promise<string> {
  if (!file || typeof file === "string" || file.size === 0) {
    throw new Error("No file provided.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is larger than 4 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error("Image is larger than 4 MB.");
  }
  const detected = detectImageType(buffer);
  if (!detected) {
    throw new Error("Unsupported image format. Use JPG, PNG, WebP, GIF or AVIF.");
  }

  const safeBase = (file.name || "upload")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .slice(0, 60);
  const filename = `${safeBase || "upload"}-${randomBytes(6).toString("hex")}.${detected.extension}`;

  return storeMedia(buffer, filename, detected.mimeType);
}

export async function savePdfFile(file: File): Promise<string> {
  if (!file || typeof file === "string" || file.size === 0) {
    throw new Error("No file provided.");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error("PDF is larger than 4 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_PDF_BYTES) {
    throw new Error("PDF is larger than 4 MB.");
  }
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("Only PDF files are accepted for the résumé.");
  }

  const filename = `resume-${randomBytes(6).toString("hex")}.pdf`;
  return storeMedia(buffer, filename, "application/pdf");
}

/** Deletes a database-backed upload referenced by a `/uploads/<id>` URL. */
export async function deleteUploadedFile(publicUrl: string | null | undefined) {
  if (!publicUrl || !publicUrl.startsWith(UPLOAD_PUBLIC_PREFIX)) return;
  const id = publicUrl.slice(UPLOAD_PUBLIC_PREFIX.length).split(/[?#]/)[0];
  if (!id || id.includes("/")) return;
  try {
    await prisma.media.delete({ where: { id } });
  } catch {
    // Already gone; nothing to do.
  }
}

/**
 * Deletes an upload only when nothing still references it. Used when replacing
 * an image so a URL reused by another project/note is never broken.
 */
export async function deleteMediaIfUnused(publicUrl: string | null | undefined) {
  if (!publicUrl || !publicUrl.startsWith(UPLOAD_PUBLIC_PREFIX)) return;

  try {
    const [settings, project, galleryProject, note, text] = await Promise.all([
      prisma.siteSettings.findFirst({
        where: {
          OR: [
            { avatarUrl: publicUrl },
            { heroImageUrl: publicUrl },
            { resumeUrl: publicUrl },
            { ogImageUrl: publicUrl },
          ],
        },
        select: { id: true },
      }),
      prisma.project.findFirst({
        where: { imageUrl: publicUrl },
        select: { id: true },
      }),
      prisma.project.findFirst({
        where: { gallery: { has: publicUrl } },
        select: { id: true },
      }),
      prisma.note.findFirst({
        where: {
          OR: [
            { contentFa: { contains: publicUrl } },
            { contentEn: { contains: publicUrl } },
          ],
        },
        select: { id: true },
      }),
      prisma.siteText.findFirst({
        where: {
          OR: [
            { valueFa: { contains: publicUrl } },
            { valueEn: { contains: publicUrl } },
          ],
        },
        select: { id: true },
      }),
    ]);

    if (settings || project || galleryProject || note || text) return;
  } catch (error) {
    // Never fail a successful content write because cleanup could not verify
    // references. Leaving an orphan is safer than deleting a used file.
    console.error("Failed to check media references", error);
    return;
  }

  await deleteUploadedFile(publicUrl);
}
