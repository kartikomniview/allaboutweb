import localFont from "next/font/local";

// Fonts for the store catalog. Self-hosted so builds don't depend on reaching Google;
// see scripts/subset-fonts.mjs.
export const plusJakarta = localFont({
  src: "./PlusJakartaSans.woff2",
  weight: "400 800",
  style: "normal",
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const poppins = localFont({
  src: [
    { path: "./Poppins-Regular.woff2", weight: "400", style: "normal" },
    { path: "./Poppins-Medium.woff2", weight: "500", style: "normal" },
    { path: "./Poppins-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./Poppins-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});
