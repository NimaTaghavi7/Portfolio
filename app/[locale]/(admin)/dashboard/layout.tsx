import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";

import AdminMobileNav from "@/components/admin/AdminMobileNav";
import AdminNav from "@/components/admin/AdminNav";
import SignOutButton from "@/components/admin/SignOutButton";
import ThemeToggle from "@/components/site/ThemeToggle";
import { Link } from "@/i18n/navigation";
import { getAdminSession } from "@/lib/auth/session";
import type { Locale } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  const locale = (await getLocale()) as Locale;
  const prefix = locale === "fa" ? "/fa" : "";

  if (!session) {
    redirect(`${prefix}/auth/signin`);
  }

  return (
    <div className="min-h-screen bg-base-100">
      <aside className="fixed inset-y-0 start-0 hidden w-64 flex-col border-e border-base-content/10 bg-base-200/20 lg:flex">
        <div className="border-b border-base-content/10 px-5 py-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border border-base-content/15 text-xs font-semibold tracking-wide">
              NT
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Nima Taghavi</span>
              <span className="text-[0.6rem] uppercase tracking-[0.16em] text-base-content/35">
                Admin dashboard
              </span>
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <AdminNav />
        </div>
        <div className="border-t border-base-content/10 p-4">
          <p className="truncate text-[0.66rem] text-base-content/35">{session.user.email}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <SignOutButton />
            <Link
              href="/"
              className="inline-flex size-9 items-center justify-center rounded-full border border-base-content/15 text-base-content/50 transition hover:text-base-content"
              aria-label="View website"
              title="View website"
            >
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </aside>

      <div className="lg:ps-64">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-base-content/10 bg-base-100/85 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <AdminMobileNav />
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.18em] text-base-content/35">
                Admin
              </p>
              <p className="text-xs font-medium text-base-content/70">
                {session.user.name || session.user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="lg:hidden">
              <SignOutButton />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
