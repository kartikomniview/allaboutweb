"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, BookOpen, LayoutDashboard, LogOut, Menu, TriangleAlert, X } from "lucide-react";
import { checkSession, logout, type AdminUser } from "@/lib/adminAuth";
import { Button, Spinner } from "./ui";
import "./admin.css";

const AdminUserContext = createContext<AdminUser | null>(null);

// The logged-in admin. Only usable inside <AdminShell>, which renders its
// children once the session has been verified.
export function useAdminUser(): AdminUser {
  const user = useContext(AdminUserContext);
  if (!user) throw new Error("useAdminUser must be used inside <AdminShell>");
  return user;
}

const NAV = [
  { group: "Overview", items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { group: "Content", items: [{ href: "/admin/ecatalog", label: "E-Catalog", icon: BookOpen }] },
] as const;

export const LIVE_CATALOG_PATH = "/app/catalog/furniture";

function BrandMark({ className = "h-8 w-8 text-sm" }: { className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-lg bg-primary font-bold text-white ${className}`}>
      A
    </span>
  );
}

function Brand() {
  return (
    <Link href="/admin/dashboard" className="flex items-center gap-2.5">
      <BrandMark />
      <span className="leading-tight">
        <span className="block text-[15px] font-bold tracking-[-0.01em] text-ink">AllAboutWeb</span>
        <span className="block text-[11px] font-medium text-slate">Content Studio</span>
      </span>
    </Link>
  );
}

function SidebarContent({
  user,
  pathname,
  onNavigate,
}: {
  user: AdminUser;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map(({ group, items }) => (
          <div key={group} className="mb-5">
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate/80">{group}</p>
            <ul className="flex flex-col gap-0.5">
              {items.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`group flex h-9 items-center gap-2.5 rounded-btn px-3 text-sm transition-colors ${
                        active
                          ? "bg-ink/[0.06] font-semibold text-ink"
                          : "font-medium text-slate hover:bg-ink/[0.04] hover:text-ink"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${active ? "text-primary" : "text-slate/80 group-hover:text-ink"}`}
                        aria-hidden
                      />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="border-t border-line pt-4">
          <a
            href={LIVE_CATALOG_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-2.5 rounded-btn px-3 text-sm font-medium text-slate transition-colors hover:bg-ink/[0.04] hover:text-ink"
          >
            <ArrowUpRight className="h-4 w-4 text-slate/80" aria-hidden />
            View live catalog
          </a>
        </div>
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-btn px-2 py-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[13px] font-semibold uppercase text-white">
            {user.email.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink" title={user.email}>
              {user.email}
            </p>
            <p className="text-[11px] text-slate">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const verify = useCallback(() => {
    checkSession()
      .then((u) => {
        if (u) setUser(u);
        else router.replace("/admin");
      })
      .catch(() => setError("We couldn't verify your session. Check your connection and try again."));
  }, [router]);

  useEffect(verify, [verify]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setMobileNavOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace("/admin");
    }
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="admin-pop-in w-full max-w-sm rounded-card border border-line bg-white p-6 text-center shadow-sm">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600">
            <TriangleAlert className="h-5 w-5" aria-hidden />
          </span>
          <h1 className="mt-4 text-base font-semibold text-ink">Connection problem</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate">{error}</p>
          <Button
            variant="primary"
            className="mt-5 w-full"
            onClick={() => {
              setError(null);
              verify();
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10" role="status">
        <BrandMark className="h-11 w-11 text-lg" />
        <div className="flex items-center gap-2 text-sm font-medium text-slate">
          <Spinner className="h-4 w-4 text-primary" />
          Loading your workspace…
        </div>
      </div>
    );
  }

  const sidebarProps = { user, pathname };
  const pageTitle = NAV.flatMap((g): readonly { href: string; label: string }[] => g.items).find((i) =>
    pathname.startsWith(i.href),
  )?.label;

  return (
    <AdminUserContext.Provider value={user}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
          <Brand />
        </div>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="admin-fade-in absolute inset-0 bg-ink/40" onClick={() => setMobileNavOpen(false)} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="admin-slide-in absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-btn text-slate hover:bg-ink/[0.05] hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <SidebarContent {...sidebarProps} onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-white/90 px-3 backdrop-blur sm:px-4 lg:h-16 lg:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="grid h-9 w-9 place-items-center rounded-btn text-ink hover:bg-ink/[0.05] lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <div className="lg:hidden">
              <Brand />
            </div>
            {pageTitle && <h2 className="hidden truncate text-[15px] font-semibold text-ink lg:block">{pageTitle}</h2>}
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout} loading={loggingOut} aria-label="Log out">
            {!loggingOut && <LogOut className="h-4 w-4" aria-hidden />}
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </header>
        <div className="w-full flex-1 px-3 py-5 sm:px-4 lg:px-5 lg:py-6">{children}</div>
      </div>
    </AdminUserContext.Provider>
  );
}
