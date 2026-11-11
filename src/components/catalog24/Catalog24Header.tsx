"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "/#demo", label: "Live demo" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

/** Site header for catalog24.in: logo, a few links, Log in and the main "Create your store" button. */
export default function Catalog24Header() {
  const [scrolled, setScrolled] = useState(false);

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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 header:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Catalog24 home">
          <Logo size="sm" />
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

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link href="/login" className="rounded-md px-2.5 py-2 text-sm font-semibold text-ink transition-colors hover:text-primary">
            Log in
          </Link>
          <Link
            href="/register"
            className="group inline-flex h-10 items-center gap-1.5 rounded-md bg-button px-4 text-sm font-semibold text-white transition-colors hover:bg-button-hover"
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
