"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="silver-dark"
      enableSystem={false}
      themes={["silver-dark", "silver-light"]}
      disableTransitionOnChange
      storageKey="nima-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
