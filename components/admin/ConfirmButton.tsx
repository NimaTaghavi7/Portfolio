"use client";

export default function ConfirmButton({
  children = "Delete",
  message = "Delete this item? This cannot be undone.",
  className,
}: {
  children?: React.ReactNode;
  message?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={
        className ||
        "inline-flex h-8 items-center rounded-full border border-error/25 px-3 text-[0.66rem] font-medium text-error/80 transition hover:border-error/50 hover:text-error"
      }
    >
      {children}
    </button>
  );
}
