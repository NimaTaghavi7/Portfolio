"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";

import AdminNav from "./AdminNav";

export default function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when the route changes, without an effect (avoids a flash).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Toggle admin navigation"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-9 items-center justify-center rounded-full border border-base-content/15 text-base-content/60"
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>

      {open && (
        <div className="absolute inset-x-3 top-16 z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-2xl">
          <AdminNav compact />
          <Link
            href="/"
            className="mt-5 block border-t border-base-content/10 pt-4 text-xs text-base-content/40"
          >
            ← Back to website
          </Link>
        </div>
      )}
    </div>
  );
}
