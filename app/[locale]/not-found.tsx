import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="text-[0.68rem] uppercase tracking-[0.28em] text-base-content/35">404</span>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-base-content/50">{t("body")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-content transition hover:opacity-85"
      >
        {t("back")}
      </Link>
    </div>
  );
}
