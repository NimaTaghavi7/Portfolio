"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
      <span className="text-[0.68rem] uppercase tracking-[0.28em] text-base-content/35">
        Error
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-base-content/50">
        The page could not be rendered. This is usually temporary. Try again, and if it
        continues, check the server logs.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-content transition hover:opacity-85"
      >
        Try again
      </button>
    </div>
  );
}
