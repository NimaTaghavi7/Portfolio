import localFont from "next/font/local";

export const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-latin",
  display: "swap",
  weight: "100 900",
  fallback: ["system-ui", "sans-serif"],
});

export const vazirmatn = localFont({
  src: "./fonts/Vazirmatn-Arabic.woff2",
  variable: "--font-fa",
  display: "swap",
  weight: "100 900",
  fallback: ["Tahoma", "sans-serif"],
  preload: true,
});
