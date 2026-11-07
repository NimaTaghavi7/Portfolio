import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import SignInForm from "@/components/admin/SignInForm";
import { Link } from "@/i18n/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { PROFESSIONAL_TITLE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const locale = await getLocale();
  const session = await getAdminSession();
  if (session) redirect(locale === "fa" ? "/fa/dashboard" : "/dashboard");

  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-base-content/45 transition hover:text-base-content"
        >
          <ArrowLeft size={14} aria-hidden="true" className="rtl:rotate-180" />
          {locale === "fa" ? "بازگشت به سایت" : "Back to site"}
        </Link>

        <div className="mt-8 rounded-3xl border border-base-content/10 bg-base-200/30 p-7 sm:p-8">
          <span className="flex size-11 items-center justify-center rounded-xl border border-base-content/15 bg-base-100/60 text-sm font-semibold tracking-wide">
            NT
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-base-content/50">{t("subtitle")}</p>
          <p className="mt-3 text-[0.62rem] uppercase tracking-[0.2em] text-base-content/30">
            {PROFESSIONAL_TITLE}
          </p>

          <Suspense fallback={null}>
            <SignInForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-[0.66rem] uppercase tracking-[0.16em] text-base-content/30">
          nimataghavi.ir
        </p>
      </div>
    </div>
  );
}
