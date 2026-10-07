import type { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";

// Pages in this group need a logged-in admin; AdminShell checks the session.
export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
