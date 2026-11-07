"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, LogIn } from "lucide-react";

export default function SignInForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultDashboard = locale === "fa" ? "/fa/dashboard" : "/dashboard";
  const callbackUrl = searchParams.get("callbackUrl") || defaultDashboard;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("invalid"));
        return;
      }

      const safeCallback =
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("//") &&
        !callbackUrl.includes("\\") &&
        !/[\u0000-\u001f]/.test(callbackUrl)
          ? callbackUrl
          : defaultDashboard;

      router.push(safeCallback);
      router.refresh();
    } catch {
      setError(t("invalid"));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-[0.66rem] font-medium uppercase tracking-[0.16em] text-base-content/45"
        >
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input h-11 w-full rounded-xl border-base-content/10 bg-base-100/60 text-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-[0.66rem] font-medium uppercase tracking-[0.16em] text-base-content/45"
        >
          {t("password")}
        </label>
        <input
          id="password"
          type="password"
          dir="ltr"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="input h-11 w-full rounded-xl border-base-content/10 bg-base-100/60 text-sm"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-content transition hover:opacity-85 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <LogIn size={16} aria-hidden="true" />
        )}
        {pending ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}
