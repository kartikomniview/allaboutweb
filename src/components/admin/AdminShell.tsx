"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, BookOpen, Building2, LayoutDashboard, LogOut, Menu, Store, TriangleAlert, X } from "lucide-react";
import { checkSession, logout, type AdminStore, type AdminUser } from "@/lib/adminAuth";
import { storeUrlFor } from "@/lib/catalogDomain";
import { Button, Spinner } from "./ui";
import "./admin.css";

type AdminContextValue = { user: AdminUser; setStore: (change: Partial<AdminStore>) => void };
const AdminUserContext = createContext<AdminContextValue | null>(null);

function useAdminContext(): AdminContextValue {
  const ctx = useContext(AdminUserContext);
  if (!ctx) throw new Error("useAdminUser must be used inside <AdminShell>");
  return ctx;
}

// The logged-in store owner. Only usable inside <AdminShell>, which renders its
// children once the session has been verified.
export const useAdminUser = (): AdminUser => useAdminContext().user;

/** Updates the store name shown in the panel after it's changed in Store settings. */
export const useSetAdminStore = () => useAdminContext().setStore;

/** The store's public catalog: https://demostore.catalog24.in (dev: http://demostore.localhost:3000). */
export function useLiveCatalogUrl(): string {
  const { store } = useAdminUser();
  return storeUrlFor(store.slug, typeof window === "undefined" ? undefined : window.location);
}

const NAV = [
  { group: "Overview", items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { group: "Content", items: [{ href: "/admin/ecatalog", label: "E-Catalog", icon: BookOpen }] },
  { group: "Store", items: [{ href: "/admin/settings", label: "Store settings", icon: Store }] },
] as const;

// Only for super admins (SUPER_ADMIN_EMAILS in the API).
const SUPER_ADMIN_NAV = { group: "Catalog24", items: [{ href: "/admin/stores", label: "All stores", icon: Building2 }] } as const;

const navFor = (user: AdminUser) => (user.isSuperAdmin ? [...NAV, SUPER_ADMIN_NAV] : NAV);

const FOCUS_ROUTES = ["/admin/ecatalog/new"];

function BrandMark({ letter = "C", className = "h-8 w-8 text-sm" }: { letter?: string; className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-lg bg-primary font-bold uppercase text-white ${className}`}>
      {letter}
    </span>
  );
}

// The store's name, under the Catalog24 product name.
function Brand({ storeName }: { storeName: string }) {
  return (
    <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-2.5">
      <BrandMark letter={storeName.charAt(0) || "C"} />
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[15px] font-bold tracking-[-0.01em] text-ink" title={storeName}>
          {storeName}
        </span>
        <span className="block text-[11px] font-medium text-slate">Catalog24 · Store admin</span>
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
  const liveUrl = storeUrlFor(user.store.slug, window.location);
  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navFor(user).map(({ group, items }) => (
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
                      className={`group flex h-9 items-center gap-2.5 rounded-md px-3 text-sm transition-colors ${
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
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-2.5 rounded-md px-3 text-sm font-medium text-slate transition-colors hover:bg-ink/[0.04] hover:text-ink"
          >
            <ArrowUpRight className="h-4 w-4 text-slate/80" aria-hidden />
            View live catalog
          </a>
          <p className="truncate px-3 text-[11px] text-slate/80" title={liveUrl}>
            {liveUrl.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[13px] font-semibold uppercase text-white">
            {user.email.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink" title={user.email}>
              {user.email}
            </p>
            <p className="text-[11px] text-slate">Store owner</p>
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
        <div className="admin-pop-in w-full max-w-sm rounded-lg border border-line bg-white p-6 text-center shadow-sm">
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
  const storeName = user.store.name;
  const contextValue: AdminContextValue = {
    user,
    setStore: (change) => setUser((u) => (u ? { ...u, store: { ...u.store, ...change } } : u)),
  };
  // Focused flows (e.g. Add product) get the whole screen: no sidebar or header.
  if (FOCUS_ROUTES.includes(pathname)) {
    return (
      <AdminUserContext.Provider value={contextValue}>
        <div className="flex flex-1 flex-col">{children}</div>
      </AdminUserContext.Provider>
    );
  }

  const pageTitle = navFor(user).flatMap((g): readonly { href: string; label: string }[] => g.items).find((i) =>
    pathname.startsWith(i.href),
  )?.label;

  return (
    <AdminUserContext.Provider value={contextValue}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
          <Brand storeName={storeName} />
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
              <Brand storeName={storeName} />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-md text-slate hover:bg-ink/[0.05] hover:text-ink"
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
              className="grid h-9 w-9 place-items-center rounded-md text-ink hover:bg-ink/[0.05] lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <div className="min-w-0 lg:hidden">
              <Brand storeName={storeName} />
            </div>
            {pageTitle && <h2 className="hidden truncate text-[15px] font-semibold text-ink lg:block">{pageTitle}</h2>}
          </div>
          <Button variant="danger-soft" size="sm" onClick={handleLogout} loading={loggingOut}>
            {!loggingOut && <LogOut className="h-4 w-4" aria-hidden />}
            {loggingOut ? "Logging out…" : "Log out"}
          </Button>
        </header>
        <div className="w-full flex-1 px-3 py-3 sm:px-4 sm:py-5 lg:px-5 lg:py-6">{children}</div>
      </div>
    </AdminUserContext.Provider>
  );
}
