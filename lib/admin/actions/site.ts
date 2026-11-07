"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import {
  failed,
  getBool,
  getFile,
  getOptionalString,
  getString,
  isValidEmail,
  isValidHttpUrl,
  isValidMediaUrl,
  saved,
} from "@/lib/admin/helpers";
import {
  deleteMediaIfUnused,
  deleteUploadedFile,
  saveImageFile,
  savePdfFile,
} from "@/lib/admin/uploads";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

function localeFrom(formData: FormData): Locale {
  return getString(formData, "locale", 5) === "en" ? "en" : "fa";
}

function revalidateSite() {
  revalidatePath("/", "layout");
}

const SOCIAL_FIELDS = [
  "socialGithub",
  "socialLinkedin",
  "socialInstagram",
  "socialTelegram",
  "socialX",
  "socialDribbble",
  "socialBehance",
] as const;

export async function updateProfileAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const path = "profile";

  const fullName = getString(formData, "fullName", 120);
  const displayName = getString(formData, "displayName", 120);
  const titleFa = getString(formData, "professionalTitleFa", 160);
  const titleEn = getString(formData, "professionalTitleEn", 160);
  const email = getString(formData, "email", 254);
  const phone = getString(formData, "phone", 40);

  if (!fullName || !displayName) return failed(locale, path, "Name fields are required.");
  if (!titleFa || !titleEn) return failed(locale, path, "Both professional titles are required.");
  if (!isValidEmail(email)) return failed(locale, path, "Email address is invalid.");
  if (phone && !/^[+0-9()\-\s]{5,40}$/.test(phone)) {
    return failed(locale, path, "Phone number contains invalid characters.");
  }

  for (const field of SOCIAL_FIELDS) {
    const value = getString(formData, field, 500);
    if (value && !isValidHttpUrl(value)) {
      return failed(locale, path, `${field} must be a valid https URL.`);
    }
  }

  const avatarInput = getOptionalString(formData, "avatarUrl", 1000);
  const heroInput = getOptionalString(formData, "heroImageUrl", 1000);
  const resumeInput = getOptionalString(formData, "resumeUrl", 1000);
  if (!isValidMediaUrl(avatarInput ?? "")) {
    return failed(locale, path, "Avatar must be an https URL or an uploaded file.");
  }
  if (!isValidMediaUrl(heroInput ?? "")) {
    return failed(locale, path, "Hero image must be an https URL or an uploaded file.");
  }
  if (!isValidMediaUrl(resumeInput ?? "")) {
    return failed(locale, path, "Résumé must be an https URL or an uploaded file.");
  }

  const uploaded: string[] = [];
  let avatarUrl = avatarInput;
  let heroImageUrl = heroInput;
  let resumeUrl = resumeInput;

  try {
    const previous = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

    const avatarFile = getFile(formData, "avatarFile");
    if (avatarFile) {
      avatarUrl = await saveImageFile(avatarFile);
      uploaded.push(avatarUrl);
    }

    const heroFile = getFile(formData, "heroImageFile");
    if (heroFile) {
      heroImageUrl = await saveImageFile(heroFile);
      uploaded.push(heroImageUrl);
    }

    const resumeFile = getFile(formData, "resumeFile");
    if (resumeFile) {
      resumeUrl = await savePdfFile(resumeFile);
      uploaded.push(resumeUrl);
    }

    const data = {
      fullName,
      displayName,
      professionalTitleFa: titleFa,
      professionalTitleEn: titleEn,
      bioFa: getString(formData, "bioFa", 3000),
      bioEn: getString(formData, "bioEn", 3000),
      aboutFa: getString(formData, "aboutFa", 8000),
      aboutEn: getString(formData, "aboutEn", 8000),
      email: email || null,
      phone: phone || null,
      locationFa: getOptionalString(formData, "locationFa", 160),
      locationEn: getOptionalString(formData, "locationEn", 160),
      availability: getBool(formData, "availability"),
      availabilityFa: getOptionalString(formData, "availabilityFa", 200),
      availabilityEn: getOptionalString(formData, "availabilityEn", 200),
      avatarUrl,
      heroImageUrl,
      resumeUrl,
      socialGithub: getOptionalString(formData, "socialGithub", 500),
      socialLinkedin: getOptionalString(formData, "socialLinkedin", 500),
      socialInstagram: getOptionalString(formData, "socialInstagram", 500),
      socialTelegram: getOptionalString(formData, "socialTelegram", 500),
      socialX: getOptionalString(formData, "socialX", 500),
      socialDribbble: getOptionalString(formData, "socialDribbble", 500),
      socialBehance: getOptionalString(formData, "socialBehance", 500),
    };

    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    // Only delete old media after the database points at the new file.
    if (previous?.avatarUrl && previous.avatarUrl !== avatarUrl) {
      await deleteMediaIfUnused(previous.avatarUrl);
    }
    if (previous?.heroImageUrl && previous.heroImageUrl !== heroImageUrl) {
      await deleteMediaIfUnused(previous.heroImageUrl);
    }
    if (previous?.resumeUrl && previous.resumeUrl !== resumeUrl) {
      await deleteMediaIfUnused(previous.resumeUrl);
    }
  } catch (error) {
    // Never leave orphaned uploads behind when the write fails.
    for (const url of uploaded) await deleteUploadedFile(url);
    console.error("updateProfileAction failed", error);
    return failed(locale, path, "Could not save the profile. Check the uploaded files.");
  }

  revalidateSite();
  saved(locale, path, "Profile updated.");
}

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const path = "settings";

  for (const field of SOCIAL_FIELDS) {
    const value = getString(formData, field, 500);
    if (value && !isValidHttpUrl(value)) {
      return failed(locale, path, `${field} must be a valid https URL.`);
    }
  }

  const ogImageInput = getOptionalString(formData, "ogImageUrl", 1000);
  if (!isValidMediaUrl(ogImageInput ?? "")) {
    return failed(locale, path, "Open Graph image must be an https URL or uploaded file.");
  }

  let uploadedOg: string | null = null;

  try {
    const previous = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    let finalOgImage = ogImageInput;
    const ogFile = getFile(formData, "ogImageFile");

    if (ogFile) {
      finalOgImage = await saveImageFile(ogFile);
      uploadedOg = finalOgImage;
    }

    const data = {
      seoTitleFa: getOptionalString(formData, "seoTitleFa", 200),
      seoTitleEn: getOptionalString(formData, "seoTitleEn", 200),
      seoDescriptionFa: getOptionalString(formData, "seoDescriptionFa", 400),
      seoDescriptionEn: getOptionalString(formData, "seoDescriptionEn", 400),
      keywordsFa: getString(formData, "keywordsFa", 1000)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 30),
      keywordsEn: getString(formData, "keywordsEn", 1000)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 30),
      ogImageUrl: finalOgImage,
      showStats: getBool(formData, "showStats"),
    };

    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    if (previous?.ogImageUrl && previous.ogImageUrl !== finalOgImage) {
      await deleteMediaIfUnused(previous.ogImageUrl);
    }
  } catch (error) {
    if (uploadedOg) await deleteUploadedFile(uploadedOg);
    console.error("updateSettingsAction failed", error);
    return failed(locale, path, "Could not save settings.");
  }

  revalidateSite();
  saved(locale, path, "Settings updated.");
}

export async function updateTextsAction(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const path = "content";

  try {
    const rows = await prisma.siteText.findMany();

    await prisma.$transaction(
      rows.map((row) =>
        prisma.siteText.update({
          where: { id: row.id },
          data: {
            valueFa: getString(formData, `fa:${row.key}`, 5000),
            valueEn: getString(formData, `en:${row.key}`, 5000),
          },
        })
      )
    );
  } catch (error) {
    console.error("updateTextsAction failed", error);
    return failed(locale, path, "Could not save homepage copy.");
  }

  revalidateSite();
  saved(locale, path, "Homepage copy updated.");
}
