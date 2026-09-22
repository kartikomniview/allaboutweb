import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AllAboutWeb — Websites, E-Catalogs & Product Catalogs",
  description:
    "AllAboutWeb builds professional websites, shareable e-catalogs, and product catalog PDFs for growing businesses — simple process, fixed scope, direct communication.",
};

export const viewport: Viewport = {
  themeColor: "#01123c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
