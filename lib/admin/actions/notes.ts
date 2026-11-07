"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import {
  failed,
  getBool,
  getList,
  getString,
  isRedirectError,
  saved,
  slugify,
} from "@/lib/admin/helpers";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

function localeFrom(formData: FormData): Locale {
  return getString(formData, "locale", 5) === "en" ? "en" : "fa";
}

function validateNote(formData: FormData) {
  const titleFa = getString(formData, "titleFa", 200);
  const titleEn = getString(formData, "titleEn", 200);
  const slug = slugify(getString(formData, "slug", 200) || titleEn);

  if (!titleFa || !titleEn) return { error: "Both titles are required." as const };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Slug must use lowercase letters, numbers and hyphens." as const };
  }

  return {
    data: {
      slug,
      titleFa,
      titleEn,
      excerptFa: getString(formData, "excerptFa", 400),
      excerptEn: getString(formData, "excerptEn", 400),
      contentFa: getString(formData, "contentFa", 60_000),
      contentEn: getString(formData, "contentEn", 60_000),
      tags: getList(formData, "tags"),
      published: getBool(formData, "published"),
    },
  };
}

function revalidateNotes() {
  revalidatePath("/", "layout");
  revalidatePath("/notes");
  revalidatePath("/fa/notes");
}

export async function createNoteAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const result = validateNote(formData);
  if ("error" in result) return failed(locale, "notes/new", result.error ?? "Could not save.");

  try {
    await prisma.note.create({ data: result.data });
  } catch {
    return failed(locale, "notes/new", "A note with this slug already exists.");
  }

  revalidateNotes();
  saved(locale, "notes", "Note created.");
}

export async function updateNoteAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = getString(formData, "id", 80);
  const result = validateNote(formData);
  if (!id) return failed(locale, "notes", "Missing note.");
  if ("error" in result) return failed(locale, `notes/${id}`, result.error ?? "Could not save.");

  try {
    await prisma.note.update({ where: { id }, data: result.data });
  } catch {
    return failed(locale, `notes/${id}`, "A note with this slug already exists.");
  }

  revalidateNotes();
  saved(locale, "notes", "Note updated.");
}

export async function deleteNoteAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  try {
    await prisma.note.delete({ where: { id: getString(formData, "id", 80) } });
  } catch (error) {
    console.error("deleteNoteAction failed", error);
    return failed(locale, "notes", "Could not delete the note.");
  }
  revalidateNotes();
  saved(locale, "notes", "Note deleted.");
}

export async function toggleNotePublishedAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = getString(formData, "id", 80);
  try {
    const note = await prisma.note.findUnique({
      where: { id },
      select: { published: true },
    });
    if (!note) return failed(locale, "notes", "Note not found.");

    await prisma.note.update({
      where: { id },
      data: { published: !note.published },
    });
    revalidateNotes();
    saved(locale, "notes", note.published ? "Note unpublished." : "Note published.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("toggleNotePublishedAction failed", error);
    return failed(locale, "notes", "Could not update the note.");
  }
}
