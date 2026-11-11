import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Store admin — Catalog24",
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
