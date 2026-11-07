"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import {
  failed,
  getBool,
  getFile,
  getInt,
  getIntInRange,
  getList,
  getOptionalString,
  getString,
  isRedirectError,
  isValidHttpUrl,
  isValidMediaUrl,
  saved,
  slugify,
} from "@/lib/admin/helpers";
import {
  deleteMediaIfUnused,
  deleteUploadedFile,
  saveImageFile,
} from "@/lib/admin/uploads";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

function localeFrom(formData: FormData): Locale {
  return getString(formData, "locale", 5) === "en" ? "en" : "fa";
}

function slugIsValid(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function revalidateSite() {
  revalidatePath("/", "layout");
}

/* -------------------------------------------------------------------------- */
/* Skill groups                                                               */
/* -------------------------------------------------------------------------- */

export async function createSkillGroupAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const nameFa = getString(formData, "nameFa", 160);
  const nameEn = getString(formData, "nameEn", 160);

  if (!nameFa || !nameEn) return failed(locale, "skills", "Both group names are required.");

  try {
    await prisma.skillGroup.create({
      data: {
        nameFa,
        nameEn,
        icon: getOptionalString(formData, "icon", 80),
        order: getIntInRange(formData, "order", -10_000, 10_000),
        published: getBool(formData, "published"),
        skills: {
          create: getList(formData, "skills")
            .slice(0, 100)
            .map((name, index) => ({
              name: name.slice(0, 100),
              order: index + 1,
            })),
        },
      },
    });
  } catch (error) {
    console.error("createSkillGroupAction failed", error);
    return failed(locale, "skills", "Could not create the skill group.");
  }

  revalidateSite();
  saved(locale, "skills", "Skill group created.");
}

export async function updateSkillGroupAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = getString(formData, "id", 80);
  const nameFa = getString(formData, "nameFa", 160);
  const nameEn = getString(formData, "nameEn", 160);

  if (!id || !nameFa || !nameEn) return failed(locale, "skills", "Both group names are required.");

  const skills = getList(formData, "skills").slice(0, 100);

  try {
    await prisma.$transaction([
      prisma.skillGroup.update({
        where: { id },
        data: {
          nameFa,
          nameEn,
          icon: getOptionalString(formData, "icon", 80),
          order: getIntInRange(formData, "order", -10_000, 10_000),
          published: getBool(formData, "published"),
        },
      }),
      prisma.skill.deleteMany({ where: { groupId: id } }),
      prisma.skill.createMany({
        data: skills.map((name, index) => ({
          name: name.slice(0, 100),
          order: index + 1,
          groupId: id,
        })),
      }),
    ]);
  } catch (error) {
    console.error("updateSkillGroupAction failed", error);
    return failed(locale, "skills", "Could not update the skill group.");
  }

  revalidateSite();
  saved(locale, "skills", "Skill group updated.");
}

export async function deleteSkillGroupAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = getString(formData, "id", 80);
  if (!id) return failed(locale, "skills", "Missing skill group.");

  try {
    await prisma.skillGroup.delete({ where: { id } });
  } catch (error) {
    console.error("deleteSkillGroupAction failed", error);
    return failed(locale, "skills", "Could not delete the skill group.");
  }

  revalidateSite();
  saved(locale, "skills", "Skill group deleted.");
}

/* -------------------------------------------------------------------------- */
/* Project categories                                                         */
/* -------------------------------------------------------------------------- */

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const nameFa = getString(formData, "nameFa", 120);
  const nameEn = getString(formData, "nameEn", 120);
  const slug = slugify(getString(formData, "slug", 120) || nameEn);

  if (!nameFa || !nameEn || !slugIsValid(slug)) {
    return failed(locale, "categories", "Names and a valid URL slug are required.");
  }

  try {
    await prisma.projectCategory.create({
      data: { nameFa, nameEn, slug, order: getInt(formData, "order") },
    });
  } catch {
    return failed(locale, "categories", "A category with this slug already exists.");
  }

  revalidateSite();
  saved(locale, "categories", "Category created.");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = getString(formData, "id", 80);
  const nameFa = getString(formData, "nameFa", 120);
  const nameEn = getString(formData, "nameEn", 120);
  const slug = slugify(getString(formData, "slug", 120) || nameEn);

  if (!id || !nameFa || !nameEn || !slugIsValid(slug)) {
    return failed(locale, "categories", "Names and a valid URL slug are required.");
  }

  try {
    await prisma.projectCategory.update({
      where: { id },
      data: { nameFa, nameEn, slug, order: getInt(formData, "order") },
    });
  } catch {
    return failed(locale, "categories", "Could not update the category (duplicate slug?).");
  }

  revalidateSite();
  saved(locale, "categories", "Category updated.");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = getString(formData, "id", 80);
  if (!id) return failed(locale, "categories", "Missing category.");

  try {
    await prisma.projectCategory.delete({ where: { id } });
  } catch (error) {
    console.error("deleteCategoryAction failed", error);
    return failed(locale, "categories", "Could not delete the category.");
  }

  revalidateSite();
  saved(locale, "categories", "Category deleted. Projects were kept and unassigned.");
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

async function saveProjectFromForm(formData: FormData, id?: string) {
  const locale = localeFrom(formData);
  const titleFa = getString(formData, "titleFa", 200);
  const titleEn = getString(formData, "titleEn", 200);
  const slug = slugify(getString(formData, "slug", 200) || titleEn);

  if (!titleFa || !titleEn || !slugIsValid(slug)) {
    return { error: "Both titles and a valid URL slug are required." as const, locale };
  }

  const liveUrl = getString(formData, "liveUrl", 1000);
  const githubUrl = getString(formData, "githubUrl", 1000);
  if (!isValidHttpUrl(liveUrl) || !isValidHttpUrl(githubUrl)) {
    return { error: "Project links must be valid https URLs.", locale };
  }

  const categoryId = getOptionalString(formData, "categoryId", 80);
  if (categoryId) {
    const category = await prisma.projectCategory.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) return { error: "The selected category no longer exists.", locale };
  }

  const yearRaw = getString(formData, "year", 8);
  let year: number | null = null;
  if (yearRaw) {
    const parsed = Number(yearRaw);
    if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) {
      return { error: "Year must be an integer between 1900 and 2100.", locale };
    }
    year = parsed;
  }

  const imageInput = getOptionalString(formData, "imageUrl", 1000);
  if (!isValidMediaUrl(imageInput ?? "")) {
    return { error: "Image must be an https URL or an uploaded file.", locale };
  }

  const gallery = getList(formData, "gallery").slice(0, 20);
  if (gallery.some((url) => !isValidMediaUrl(url))) {
    return { error: "Gallery entries must be https URLs or uploaded files.", locale };
  }

  const previous = id
    ? await prisma.project.findUnique({ where: { id }, select: { imageUrl: true } })
    : null;

  let imageUrl = imageInput;
  let uploadedImage: string | null = null;
  const imageFile = getFile(formData, "imageFile");

  if (imageFile) {
    imageUrl = await saveImageFile(imageFile);
    uploadedImage = imageUrl;
  }

  const data = {
    slug,
    titleFa,
    titleEn,
    descriptionFa: getString(formData, "descriptionFa", 10_000),
    descriptionEn: getString(formData, "descriptionEn", 10_000),
    imageUrl,
    gallery,
    tools: getList(formData, "tools")
      .slice(0, 50)
      .map((tool) => tool.slice(0, 80)),
    categoryId,
    companyFa: getOptionalString(formData, "companyFa", 160),
    companyEn: getOptionalString(formData, "companyEn", 160),
    year,
    liveUrl: liveUrl || null,
    githubUrl: githubUrl || null,
    featured: getBool(formData, "featured"),
    published: getBool(formData, "published"),
    isPlaceholder: getBool(formData, "isPlaceholder"),
    order: getIntInRange(formData, "order", -10_000, 10_000),
  };

  try {
    if (id) {
      await prisma.project.update({ where: { id }, data });
    } else {
      await prisma.project.create({ data });
    }
  } catch (error) {
    if (uploadedImage) await deleteUploadedFile(uploadedImage);
    throw error;
  }

  // Only delete old media after the database points at the new image.
  if (previous?.imageUrl && previous.imageUrl !== imageUrl) {
    await deleteMediaIfUnused(previous.imageUrl);
  }

  revalidateSite();
  return { ok: true as const, locale };
}

export async function createProjectAction(formData: FormData) {
  await requireAdmin();
  try {
    const result = await saveProjectFromForm(formData);
    if ("error" in result) {
      return failed(result.locale, "projects/new", result.error ?? "Could not save.");
    }
    saved(result.locale, "projects", "Project created.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("createProjectAction failed", error);
    return failed(localeFrom(formData), "projects/new", "Could not create the project (duplicate slug?).");
  }
}

export async function updateProjectAction(formData: FormData) {
  await requireAdmin();
  const id = getString(formData, "id", 80);
  if (!id) return failed(localeFrom(formData), "projects", "Missing project.");

  try {
    const result = await saveProjectFromForm(formData, id);
    if ("error" in result) {
      return failed(result.locale, "projects", result.error ?? "Could not save.");
    }
    saved(result.locale, "projects", "Project updated.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("updateProjectAction failed", error);
    return failed(localeFrom(formData), "projects", "Could not update the project (duplicate slug?).");
  }
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = getString(formData, "id", 80);
  if (!id) return failed(locale, "projects", "Missing project.");

  try {
    const project = await prisma.project.delete({ where: { id } });
    await deleteMediaIfUnused(project.imageUrl);
  } catch (error) {
    console.error("deleteProjectAction failed", error);
    return failed(locale, "projects", "Could not delete the project.");
  }

  revalidateSite();
  saved(locale, "projects", "Project deleted.");
}

/* -------------------------------------------------------------------------- */
/* Experience & education                                                     */
/* -------------------------------------------------------------------------- */

async function saveTimelineEntry(
  formData: FormData,
  kind: "experience" | "education",
  id?: string
) {
  const locale = localeFrom(formData);
  const isExperience = kind === "experience";
  const titleFa = getString(formData, isExperience ? "roleFa" : "degreeFa", 200);
  const titleEn = getString(formData, isExperience ? "roleEn" : "degreeEn", 200);
  const startDate = getString(formData, "startDate", 40);
  const urlName = isExperience ? "experience" : "education";

  if (!titleFa || !titleEn || !startDate) {
    return { error: "Titles and a start date are required.", locale, path: urlName };
  }

  const current = getBool(formData, "current");
  const endDate = current ? null : getOptionalString(formData, "endDate", 40);
  const order = getIntInRange(formData, "order", -10_000, 10_000);

  const common = {
    descriptionFa: getString(formData, "descriptionFa", 5000),
    descriptionEn: getString(formData, "descriptionEn", 5000),
    locationFa: getOptionalString(formData, "locationFa", 160),
    locationEn: getOptionalString(formData, "locationEn", 160),
    startDate,
    endDate,
    current,
    order,
    published: getBool(formData, "published"),
    isPlaceholder: getBool(formData, "isPlaceholder"),
  };

  try {
    if (isExperience) {
      const data = {
        ...common,
        roleFa: titleFa,
        roleEn: titleEn,
        companyFa: getString(formData, "companyFa", 200),
        companyEn: getString(formData, "companyEn", 200),
      };
      if (id) {
        await prisma.experience.update({ where: { id }, data });
      } else {
        await prisma.experience.create({ data });
      }
    } else {
      const data = {
        ...common,
        degreeFa: titleFa,
        degreeEn: titleEn,
        institutionFa: getString(formData, "institutionFa", 200),
        institutionEn: getString(formData, "institutionEn", 200),
      };
      if (id) {
        await prisma.education.update({ where: { id }, data });
      } else {
        await prisma.education.create({ data });
      }
    }
  } catch (error) {
    console.error(`saveTimelineEntry(${kind}) failed`, error);
    return {
      error: "Could not save the entry. It may have been deleted.",
      locale,
      path: urlName,
    };
  }

  revalidateSite();
  return { ok: true as const, locale, path: urlName };
}

export async function createExperienceAction(formData: FormData) {
  await requireAdmin();
  const result = await saveTimelineEntry(formData, "experience");
  if ("error" in result) return failed(result.locale, result.path, result.error ?? "Could not save.");
  saved(result.locale, result.path, "Experience added.");
}

export async function updateExperienceAction(formData: FormData) {
  await requireAdmin();
  const id = getString(formData, "id", 80);
  const result = await saveTimelineEntry(formData, "experience", id || undefined);
  if ("error" in result) return failed(result.locale, result.path, result.error ?? "Could not save.");
  saved(result.locale, result.path, "Experience updated.");
}

export async function deleteExperienceAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  try {
    await prisma.experience.delete({ where: { id: getString(formData, "id", 80) } });
  } catch (error) {
    console.error("deleteExperienceAction failed", error);
    return failed(locale, "experience", "Could not delete the experience entry.");
  }
  revalidateSite();
  saved(locale, "experience", "Experience deleted.");
}

export async function createEducationAction(formData: FormData) {
  await requireAdmin();
  const result = await saveTimelineEntry(formData, "education");
  if ("error" in result) return failed(result.locale, result.path, result.error ?? "Could not save.");
  saved(result.locale, result.path, "Education added.");
}

export async function updateEducationAction(formData: FormData) {
  await requireAdmin();
  const id = getString(formData, "id", 80);
  const result = await saveTimelineEntry(formData, "education", id || undefined);
  if ("error" in result) return failed(result.locale, result.path, result.error ?? "Could not save.");
  saved(result.locale, result.path, "Education updated.");
}

export async function deleteEducationAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  try {
    await prisma.education.delete({ where: { id: getString(formData, "id", 80) } });
  } catch (error) {
    console.error("deleteEducationAction failed", error);
    return failed(locale, "education", "Could not delete the education entry.");
  }
  revalidateSite();
  saved(locale, "education", "Education deleted.");
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

export async function createStatAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const labelFa = getString(formData, "labelFa", 160);
  const labelEn = getString(formData, "labelEn", 160);

  if (!labelFa || !labelEn) return failed(locale, "stats", "Both labels are required.");

  try {
    await prisma.stat.create({
      data: {
        value: getIntInRange(formData, "value", 0, 1_000_000_000),
        suffix: getString(formData, "suffix", 20),
        labelFa,
        labelEn,
        order: getIntInRange(formData, "order", -10_000, 10_000),
        published: getBool(formData, "published"),
        isPlaceholder: getBool(formData, "isPlaceholder"),
      },
    });
  } catch (error) {
    console.error("createStatAction failed", error);
    return failed(locale, "stats", "Could not create the statistic.");
  }

  revalidateSite();
  saved(locale, "stats", "Statistic added.");
}

export async function updateStatAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = getString(formData, "id", 80);
  const labelFa = getString(formData, "labelFa", 160);
  const labelEn = getString(formData, "labelEn", 160);
  if (!id || !labelFa || !labelEn) return failed(locale, "stats", "Both labels are required.");

  try {
    await prisma.stat.update({
      where: { id },
      data: {
        value: getIntInRange(formData, "value", 0, 1_000_000_000),
        suffix: getString(formData, "suffix", 20),
        labelFa,
        labelEn,
        order: getIntInRange(formData, "order", -10_000, 10_000),
        published: getBool(formData, "published"),
        isPlaceholder: getBool(formData, "isPlaceholder"),
      },
    });
  } catch (error) {
    console.error("updateStatAction failed", error);
    return failed(locale, "stats", "Could not update the statistic.");
  }

  revalidateSite();
  saved(locale, "stats", "Statistic updated.");
}

export async function deleteStatAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  try {
    await prisma.stat.delete({ where: { id: getString(formData, "id", 80) } });
  } catch (error) {
    console.error("deleteStatAction failed", error);
    return failed(locale, "stats", "Could not delete the statistic.");
  }
  revalidateSite();
  saved(locale, "stats", "Statistic deleted.");
}

/* -------------------------------------------------------------------------- */
/* Messages                                                                   */
/* -------------------------------------------------------------------------- */

export async function setMessageStatusAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = getString(formData, "id", 80);
  const status = getString(formData, "status", 20);

  if (!id || !["NEW", "READ", "ARCHIVED"].includes(status)) {
    return failed(locale, "messages", "Invalid message status.");
  }

  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { status: status as "NEW" | "READ" | "ARCHIVED" },
    });
  } catch (error) {
    console.error("setMessageStatusAction failed", error);
    return failed(locale, "messages", "Could not update the message.");
  }
  saved(locale, "messages", "Message updated.");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  try {
    await prisma.contactMessage.delete({ where: { id: getString(formData, "id", 80) } });
  } catch (error) {
    console.error("deleteMessageAction failed", error);
    return failed(locale, "messages", "Could not delete the message.");
  }
  saved(locale, "messages", "Message deleted.");
}

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

export async function deleteMediaAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const url = getString(formData, "url", 1000);

  if (!url.startsWith("/uploads/")) return failed(locale, "media", "Invalid media path.");

  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (settings) {
      const referenced =
        settings.avatarUrl === url ||
        settings.heroImageUrl === url ||
        settings.ogImageUrl === url ||
        settings.resumeUrl === url;

      if (referenced) {
        return failed(
          locale,
          "media",
          "This file is still referenced by the profile or SEO settings. Replace it first."
        );
      }
    }

    const [projectUsingImage, projectUsingGallery, noteUsingMedia, textUsingMedia] =
      await Promise.all([
        prisma.project.findFirst({ where: { imageUrl: url }, select: { id: true } }),
        prisma.project.findFirst({ where: { gallery: { has: url } }, select: { id: true } }),
        prisma.note.findFirst({
          where: {
            OR: [
              { contentFa: { contains: url } },
              { contentEn: { contains: url } },
            ],
          },
          select: { id: true },
        }),
        prisma.siteText.findFirst({
          where: {
            OR: [
              { valueFa: { contains: url } },
              { valueEn: { contains: url } },
            ],
          },
          select: { id: true },
        }),
      ]);

    if (projectUsingImage || projectUsingGallery) {
      return failed(
        locale,
        "media",
        "This file is used by a project. Change the project image first."
      );
    }
    if (noteUsingMedia || textUsingMedia) {
      return failed(
        locale,
        "media",
        "This file is referenced in content. Remove that reference first."
      );
    }

    await deleteUploadedFile(url);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("deleteMediaAction failed", error);
    return failed(locale, "media", "Could not delete the file.");
  }

  revalidateSite();
  saved(locale, "media", "File deleted.");
}
