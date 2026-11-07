import type { Metadata } from "next";
import Link from "next/link";

import { inter, vazirmatn } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 — Page not found | Nima Taghavi",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${vazirmatn.variable}`}>
      <body className="min-h-screen bg-base-100 text-base-content antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <span className="text-[0.68rem] uppercase tracking-[0.28em] text-base-content/35">
            404
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-base-content/50">
            The page you are looking for does not exist or has moved.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-content transition hover:opacity-85"
          >
            Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}
