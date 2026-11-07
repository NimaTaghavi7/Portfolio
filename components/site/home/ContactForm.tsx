"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Loader2, Send } from "lucide-react";

type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
};

type ApiResponse =
  | { ok: true; emailSent: boolean }
  | { ok: false; code: string; fields?: Record<string, string> };

export default function ContactForm() {
  const t = useTranslations("contact");
  const tv = useTranslations("validation");
  const locale = useLocale();
  const startedAt = useRef(Date.now());
  const [success, setSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const schema = z.object({
    name: z.string().trim().min(2, tv("nameMin")),
    email: z.string().trim().email(tv("emailInvalid")),
    subject: z.string().trim().min(2, tv("subjectMin")).max(100, tv("subjectMax")),
    message: z.string().trim().min(10, tv("messageMin")).max(5000, tv("messageMax")),
    website: z.string().max(200).optional(),
  });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "", website: "" },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setPending(true);
    setServerError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          locale,
          elapsedMs: Date.now() - startedAt.current,
        }),
      });

      const data = (await response.json().catch(() => null)) as ApiResponse | null;

      if (!response.ok || !data || data.ok !== true) {
        if (response.status === 429) {
          setServerError(t("rateLimited"));
        } else if (data && data.ok === false && data.fields) {
          const localizedMessages: Record<string, string> = {
            name: tv("nameMin"),
            email: tv("emailInvalid"),
            subject: tv("subjectMin"),
            message: tv("messageMin"),
          };
          for (const field of Object.keys(data.fields)) {
            if (field in localizedMessages) {
              form.setError(field as keyof ContactFormValues, {
                type: "server",
                message: localizedMessages[field],
              });
            }
          }
          setServerError(t("errorBody"));
        } else {
          setServerError(t("errorBody"));
        }
        return;
      }

      setSubmittedName(values.name.trim());
      setSuccess(true);
      form.reset();
    } catch {
      setServerError(t("errorBody"));
    } finally {
      setPending(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[22rem] flex-col items-center justify-center text-center">
        <span className="flex size-16 items-center justify-center rounded-full border border-base-content/15 bg-base-200/50">
          <CheckCircle2 size={30} className="text-base-content/70" aria-hidden="true" />
        </span>
        <h3 className="mt-6 text-xl font-semibold tracking-tight">{t("successTitle")}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-base-content/55">
          {t("successBody", { name: submittedName })}
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            startedAt.current = Date.now();
          }}
          className="mt-6 inline-flex h-10 items-center rounded-full border border-base-content/15 px-5 text-xs font-medium text-base-content/70 transition hover:border-base-content/35 hover:text-base-content"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="absolute -start-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...form.register("website")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("name")} htmlFor="name" error={form.formState.errors.name?.message}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder={t("namePlaceholder")}
            className="input h-11 w-full rounded-xl border-base-content/10 bg-base-200/30 text-sm"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register("name")}
          />
        </Field>

        <Field label={t("email")} htmlFor="email" error={form.formState.errors.email?.message}>
          <input
            id="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            className="input h-11 w-full rounded-xl border-base-content/10 bg-base-200/30 text-sm"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
        </Field>
      </div>

      <Field label={t("subject")} htmlFor="subject" error={form.formState.errors.subject?.message}>
        <input
          id="subject"
          type="text"
          placeholder={t("subjectPlaceholder")}
          className="input h-11 w-full rounded-xl border-base-content/10 bg-base-200/30 text-sm"
          aria-invalid={Boolean(form.formState.errors.subject)}
          {...form.register("subject")}
        />
      </Field>

      <Field label={t("message")} htmlFor="message" error={form.formState.errors.message?.message}>
        <textarea
          id="message"
          rows={6}
          placeholder={t("messagePlaceholder")}
          className="textarea w-full resize-y rounded-xl border-base-content/10 bg-base-200/30 text-sm leading-relaxed"
          aria-invalid={Boolean(form.formState.errors.message)}
          {...form.register("message")}
        />
      </Field>

      {serverError && (
        <p role="alert" className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.68rem] uppercase tracking-[0.14em] text-base-content/35">
          {t("required")}: {t("name")}, {t("email")}, {t("subject")}, {t("message")}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-content transition hover:opacity-85 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Send size={16} aria-hidden="true" />
          )}
          {pending ? t("sending") : t("submit")}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-base-content/45"
      >
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
