import { getLocale } from "next-intl/server";

import {
  BilingualRow,
  Card,
  Checkbox,
  Field,
  FileField,
  Flash,
  PageHeader,
  SubmitButton,
  TextArea,
} from "@/components/admin/AdminUI";
import { updateProfileAction } from "@/lib/admin/actions/site";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile"
        description="Personal information, biography, images, contact details and social links. Empty social fields are hidden from the public site."
      />
      <Flash saved={saved} error={error} />

      <form action={updateProfileAction} className="flex flex-col gap-6">
        <input type="hidden" name="locale" value={locale} />

        <Card title="Identity" description="Used across the website, SEO and structured data.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" name="fullName" defaultValue={settings?.fullName} required />
            <Field label="Display name" name="displayName" defaultValue={settings?.displayName} required />
            <Field
              label="Professional title (fa)"
              name="professionalTitleFa"
              defaultValue={settings?.professionalTitleFa}
              required
              dir="rtl"
            />
            <Field
              label="Professional title (en)"
              name="professionalTitleEn"
              defaultValue={settings?.professionalTitleEn}
              required
              dir="ltr"
            />
            <Field
              label="Email"
              name="email"
              type="email"
              dir="ltr"
              defaultValue={settings?.email}
              hint="Leave empty to hide it. A mailto link is generated automatically."
            />
            <Field
              label="Phone"
              name="phone"
              dir="ltr"
              defaultValue={settings?.phone}
              hint="Leave empty to hide it."
            />
          </div>
        </Card>

        <Card title="Biography" description="Short intro for the hero and longer text for the About section.">
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextArea label="Hero introduction (fa)" name="bioFa" defaultValue={settings?.bioFa} dir="rtl" rows={4} />
              <TextArea label="Hero introduction (en)" name="bioEn" defaultValue={settings?.bioEn} dir="ltr" rows={4} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextArea label="About section (fa)" name="aboutFa" defaultValue={settings?.aboutFa} dir="rtl" rows={8} />
              <TextArea label="About section (en)" name="aboutEn" defaultValue={settings?.aboutEn} dir="ltr" rows={8} />
            </div>
          </div>
        </Card>

        <Card title="Images & résumé" description="Upload a replacement or paste an https URL. Uploads are limited to 5 MB (images) and 10 MB (PDF).">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Field label="Avatar URL" name="avatarUrl" defaultValue={settings?.avatarUrl} dir="ltr" />
              <FileField
                label="Upload avatar"
                name="avatarFile"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                currentUrl={settings?.avatarUrl}
                hint="Square images work best (1080×1080)."
              />
            </div>
            <div className="flex flex-col gap-4">
              <Field label="Hero image URL" name="heroImageUrl" defaultValue={settings?.heroImageUrl} dir="ltr" />
              <FileField
                label="Upload hero image"
                name="heroImageFile"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                currentUrl={settings?.heroImageUrl}
                hint="Portrait orientation (4:5) works best."
              />
            </div>
            <div className="flex flex-col gap-4">
              <Field label="Résumé URL" name="resumeUrl" defaultValue={settings?.resumeUrl} dir="ltr" hint="Leave empty to hide the download button." />
              <FileField label="Upload résumé (PDF)" name="resumeFile" accept="application/pdf" pdf currentUrl={settings?.resumeUrl} hint="Leave empty to hide the download button." />
            </div>
          </div>
        </Card>

        <Card title="Location & availability" description="The availability badge is only shown when enabled.">
          <div className="grid gap-4 md:grid-cols-2">
            <BilingualRow
              label="Location"
              nameFa="locationFa"
              nameEn="locationEn"
              valueFa={settings?.locationFa}
              valueEn={settings?.locationEn}
            />
            <div className="flex flex-col gap-4">
              <Checkbox
                label="Available for work"
                name="availability"
                defaultChecked={settings?.availability}
                hint="Shows a badge in the hero section."
              />
              <BilingualRow
                label="Availability text"
                nameFa="availabilityFa"
                nameEn="availabilityEn"
                valueFa={settings?.availabilityFa}
                valueEn={settings?.availabilityEn}
                hint="Optional. Example: Available for freelance work."
              />
            </div>
          </div>
        </Card>

        <Card
          title="Social links"
          description="Leave fields empty until you have real profiles. Empty links are not rendered anywhere."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="GitHub" name="socialGithub" defaultValue={settings?.socialGithub} dir="ltr" placeholder="https://github.com/username" />
            <Field label="LinkedIn" name="socialLinkedin" defaultValue={settings?.socialLinkedin} dir="ltr" placeholder="https://linkedin.com/in/username" />
            <Field label="Instagram" name="socialInstagram" defaultValue={settings?.socialInstagram} dir="ltr" placeholder="https://instagram.com/username" />
            <Field label="Telegram" name="socialTelegram" defaultValue={settings?.socialTelegram} dir="ltr" placeholder="https://t.me/username" />
            <Field label="X (Twitter)" name="socialX" defaultValue={settings?.socialX} dir="ltr" placeholder="https://x.com/username" />
            <Field label="Dribbble" name="socialDribbble" defaultValue={settings?.socialDribbble} dir="ltr" placeholder="https://dribbble.com/username" />
            <Field label="Behance" name="socialBehance" defaultValue={settings?.socialBehance} dir="ltr" placeholder="https://behance.net/username" />
          </div>
        </Card>

        <div className="flex justify-end">
          <SubmitButton>Save profile</SubmitButton>
        </div>
      </form>
    </div>
  );
}
