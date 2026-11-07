"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useLocale } from "next-intl";

export default function SignOutButton() {
  const locale = useLocale();
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: locale === "fa" ? "/fa/auth/signin" : "/auth/signin" })}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-base-content/15 px-3 text-[0.68rem] font-medium text-base-content/55 transition hover:border-base-content/30 hover:text-base-content"
    >
      <LogOut size={13} aria-hidden="true" />
      Sign out
    </button>
  );
}
