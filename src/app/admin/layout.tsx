import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — AllAboutWeb",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-paper">
      {children}
    </main>
  );
}
