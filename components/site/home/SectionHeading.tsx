import type { ReactNode } from "react";

export default function SectionHeading({
  kicker,
  title,
  description,
  align = "center",
}: {
  kicker: string;
  title: string;
  description?: string;
  align?: "center" | "start";
}) {
  return (
    <div
      data-section-heading
      className={
        align === "center"
          ? "mx-auto flex max-w-2xl flex-col items-center text-center"
          : "flex max-w-2xl flex-col items-start text-start"
      }
    >
      <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-base-content/45">
        {kicker}
      </span>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-[2.6rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-sm leading-relaxed text-base-content/55 sm:text-base">
          {description}
        </p>
      ) : null}
      <span className="silver-rule mt-7 max-w-[80px]" aria-hidden="true" />
    </div>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`section-space ${className}`}>
      {children}
    </section>
  );
}
