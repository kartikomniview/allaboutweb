"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { checkSession, type AdminUser } from "@/lib/adminAuth";
import { CATALOG_DEMO_BASE } from "@/lib/catalogDomain";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: CATALOG_DEMO_BASE, label: "Live demo" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

/**
 * Site header for catalog24.in: logo, a few links, Log in and the main "Create your store" button.
 * A store owner already logged in on this device also gets a strip above it with a
 * link to their dashboard.
 */
export default function Catalog24Header() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  // checkSession() returns null straight away (no API call) when this device has no token.
  useEffect(() => {
    checkSession().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled ? "border-b border-line bg-white/90 backdrop-blur-xl" : "border-b border-transparent bg-white"
      }`}
    >
      {user && (
        <div className="bg-ink text-white">
          <div className="mx-auto flex h-10 max-w-6xl items-center justify-between gap-3 px-4 text-[13px] sm:px-6 header:px-8">
            <p className="min-w-0 truncate text-white/75">
              <span className="hidden sm:inline">You&apos;re logged in as </span>
              <span className="font-semibold text-white">{user.store.name}</span>
            </p>
            <Link
              href="/admin/dashboard"
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-sm font-semibold text-white transition-colors hover:text-white/80 focus-visible:outline-none! focus-visible:ring-[3px] focus-visible:ring-white/30"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              Go to dashboard
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      )}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 header:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Catalog24 home">
          <Logo size="sm" eager />
        </Link>

        <nav className="hidden items-center gap-1 header:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink shadow-[0_1px_2px_rgba(1,18,60,0.05)] transition-colors hover:border-slate/35 hover:bg-paper sm:px-4"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="group inline-flex h-10 items-center gap-1.5 rounded-md bg-button px-3.5 text-sm font-semibold text-white transition-colors hover:bg-button-hover sm:px-4"
          >
            <span className="sm:hidden">Create store</span>
            <span className="hidden sm:inline">Create your store</span>
            <ArrowRight className="hidden h-4 w-4 transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
