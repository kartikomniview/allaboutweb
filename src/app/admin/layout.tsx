import type { Metadata, Viewport } from "next";
import { CATALOG_ICONS } from "@/lib/catalogDomain";

// The admin can be installed as an app (InstallApp.tsx): its own manifest, so only the
// admin is installable (not the AllAboutWeb site or the store catalogs), and the
// iPhone home-screen icon and title.
export const metadata: Metadata = {
  title: "Store admin — Catalog24",
  icons: { ...CATALOG_ICONS, apple: { url: "/catalog24/apple-icon-180.png", sizes: "180x180", type: "image/png" } },
  manifest: "/catalog24/admin.webmanifest",
  appleWebApp: { capable: true, title: "Catalog24", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

// Store owners mostly use this on phones: a white browser bar, and on Android the
// page shrinks for the keyboard so the pinned buttons on login/register stay above it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  interactiveWidget: "resizes-content",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-paper">
      {children}
    </main>
  );
}
