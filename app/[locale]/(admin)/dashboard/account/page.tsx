import { getLocale } from "next-intl/server";

import {
  Badge,
  Card,
  Field,
  Flash,
  PageHeader,
  SubmitButton,
} from "@/components/admin/AdminUI";
import { changePasswordAction, updateAccountAction } from "@/lib/admin/actions/account";
import { getAdminSession } from "@/lib/auth/session";
import type { Locale } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await getAdminSession();
  const locale = (await getLocale()) as Locale;
  const { saved, error } = await searchParams;
  const user = session?.user.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Account"
        description="Your admin credentials. There is no public sign-up; this account is created by the seed script."
        action={<Badge>{user?.role ?? "ADMIN"}</Badge>}
      />
      <Flash saved={saved} error={error} />

      <Card title="Account details" description="Changing your email changes the sign-in identifier.">
        <form action={updateAccountAction} className="flex flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" name="name" defaultValue={user?.name} required />
            <Field label="Email" name="email" type="email" defaultValue={user?.email} dir="ltr" required />
            <Field
              label="Current password"
              name="currentPassword"
              type="password"
              dir="ltr"
              hint="Required only when changing the email address."
            />
          </div>
          <div className="flex justify-end">
            <SubmitButton>Save account</SubmitButton>
          </div>
        </form>
      </Card>

      <Card title="Change password" description="Minimum 12 characters. The current password is required.">
        <form action={changePasswordAction} className="flex flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Current password" name="currentPassword" type="password" dir="ltr" required />
            <span />
            <Field label="New password" name="newPassword" type="password" dir="ltr" required />
            <Field label="Confirm new password" name="confirmPassword" type="password" dir="ltr" required />
          </div>
          <div className="flex justify-end">
            <SubmitButton>Update password</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
