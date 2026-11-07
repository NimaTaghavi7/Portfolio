import Image from "next/image";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-base-content/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-base-content/50">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({
  title,
  description,
  children,
  action,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-base-content/10 bg-base-200/25">
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-content/10 px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
            {description && (
              <p className="mt-1 text-xs text-base-content/45">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required,
  hint,
  dir,
  step,
  min,
  max,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  dir?: "ltr" | "rtl";
  step?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-base-content/45">
        {label}
        {required && <span className="ms-1 text-base-content/30">*</span>}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        dir={dir}
        step={step}
        min={min}
        max={max}
        className="input h-11 w-full rounded-xl border-base-content/10 bg-base-100/60 text-sm"
      />
      {hint && <span className="text-[0.68rem] leading-relaxed text-base-content/35">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  placeholder,
  required,
  hint,
  dir,
  mono,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  dir?: "ltr" | "rtl";
  mono?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-base-content/45">
        {label}
        {required && <span className="ms-1 text-base-content/30">*</span>}
      </span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        dir={dir}
        className={`textarea w-full resize-y rounded-xl border-base-content/10 bg-base-100/60 text-sm leading-relaxed ${
          mono ? "font-mono text-xs" : ""
        }`}
      />
      {hint && <span className="text-[0.68rem] leading-relaxed text-base-content/35">{hint}</span>}
    </label>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  children,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-base-content/45">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="select h-11 w-full rounded-xl border-base-content/10 bg-base-100/60 text-sm"
      >
        {children}
      </select>
      {hint && <span className="text-[0.68rem] leading-relaxed text-base-content/35">{hint}</span>}
    </label>
  );
}

export function Checkbox({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-base-content/10 bg-base-100/40 px-4 py-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        value="1"
        className="mt-0.5 size-4 accent-[var(--color-primary)]"
      />
      <span>
        <span className="block text-sm text-base-content/75">{label}</span>
        {hint && <span className="mt-0.5 block text-[0.68rem] text-base-content/35">{hint}</span>}
      </span>
    </label>
  );
}

export function FileField({
  label,
  name,
  accept,
  hint,
  currentUrl,
  pdf,
}: {
  label: string;
  name: string;
  accept?: string;
  hint?: string;
  currentUrl?: string | null;
  pdf?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-base-content/45">
        {label}
      </span>
      <div className="flex items-center gap-4 rounded-xl border border-dashed border-base-content/15 bg-base-100/40 p-3">
        {currentUrl && !pdf && (
          <Image
            src={currentUrl}
            alt=""
            width={56}
            height={56}
            unoptimized
            className="size-14 shrink-0 rounded-lg border border-base-content/10 object-cover"
          />
        )}
        <input
          type="file"
          name={name}
          accept={accept}
          className="file-input h-10 w-full text-xs file:me-3 file:rounded-lg file:border-0 file:bg-base-300 file:px-3 file:text-xs file:text-base-content/70"
        />
      </div>
      {currentUrl && (
        <span className="break-anywhere text-[0.66rem] text-base-content/35">
          Current: {currentUrl}
        </span>
      )}
      {hint && <span className="text-[0.68rem] leading-relaxed text-base-content/35">{hint}</span>}
    </label>
  );
}

export function BilingualRow({
  label,
  nameFa,
  nameEn,
  valueFa,
  valueEn,
  required,
  placeholderFa,
  placeholderEn,
  hint,
}: {
  label: string;
  nameFa: string;
  nameEn: string;
  valueFa?: string | null;
  valueEn?: string | null;
  required?: boolean;
  placeholderFa?: string;
  placeholderEn?: string;
  hint?: string;
}) {
  return (
    <fieldset className="rounded-xl border border-base-content/10 bg-base-100/30 p-4">
      <legend className="px-2 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-base-content/45">
        {label}
      </legend>
      <div className="mt-2 grid gap-4 md:grid-cols-2">
        <Field
          label="Persian (fa)"
          name={nameFa}
          defaultValue={valueFa}
          dir="rtl"
          placeholder={placeholderFa}
          required={required}
        />
        <Field
          label="English (en)"
          name={nameEn}
          defaultValue={valueEn}
          dir="ltr"
          placeholder={placeholderEn}
          required={required}
        />
      </div>
      {hint && <p className="mt-3 text-[0.68rem] text-base-content/35">{hint}</p>}
    </fieldset>
  );
}

export function Flash({ saved, error }: { saved?: string; error?: string }) {
  if (!saved && !error) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-error/30 bg-error/10 text-error"
          : "border-base-content/15 bg-base-200/40 text-base-content/70"
      }`}
    >
      {error || saved}
    </div>
  );
}

export function SubmitButton({
  children = "Save changes",
  variant = "primary",
}: {
  children?: ReactNode;
  variant?: "primary" | "outline";
}) {
  return (
    <button
      type="submit"
      className={
        variant === "primary"
          ? "inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-xs font-semibold text-primary-content transition hover:opacity-85"
          : "inline-flex h-10 items-center justify-center rounded-full border border-base-content/15 px-5 text-xs font-medium text-base-content/70 transition hover:border-base-content/35 hover:text-base-content"
      }
    >
      {children}
    </button>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-base-content/15 px-5 py-10 text-center text-sm text-base-content/40">
      {children}
    </p>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-base-content/15 px-2.5 py-0.5 text-[0.62rem] uppercase tracking-[0.12em] text-base-content/45">
      {children}
    </span>
  );
}
