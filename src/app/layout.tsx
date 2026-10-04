import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-open-sans",
  display: "swap",
});

const TITLE = "AllAboutWeb — Websites, E-Catalogs & Product Catalogs";
const DESCRIPTION =
  "AllAboutWeb builds professional websites, shareable e-catalogs, and product catalog PDFs for growing businesses — simple process, fixed scope, direct communication.";

// Shown as the preview card when the site link is shared (WhatsApp, social, etc.)
const SHARE_IMAGE = {
  url: "https://aawsite.s3.ap-south-1.amazonaws.com/website/landing/hero/hero.webp",
  width: 1400,
  height: 988,
  type: "image/webp",
  alt: "Examples of websites, e-catalogs, and product catalogs built by AllAboutWeb",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "AllAboutWeb",
    title: TITLE,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f7fb",
};

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {modal}
      </body>
    </html>
  );
}
