import localFont from "next/font/local";

// Self-hosted so builds don't depend on reaching Google; see scripts/subset-fonts.mjs.
// Kept apart from store.ts so the root layout doesn't preload the store fonts.
// Open Sans has no ₹ glyph, so ₹ renders in the fallback font (same as with Google Fonts).
export const openSans = localFont({
  src: [
    { path: "./OpenSans.woff2", weight: "400 800", style: "normal" },
    { path: "./OpenSans-Italic.woff2", weight: "400 800", style: "italic" },
  ],
  variable: "--font-open-sans",
  display: "swap",
});
