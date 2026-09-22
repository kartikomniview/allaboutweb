"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CtaLink from "./CtaLink";

const NAV_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#work", label: "Our Work" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#faq", label: "FAQ" },
];

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.7 9.3c0 3.5 2.5 6 6 6l1.2-1.8-2.4-1-0.7 0.9a4.9 4.9 0 0 1-2.9-2.9l0.9-0.7-1-2.4-1.8 1.1Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors ${
        scrolled
          ? "border-line bg-paper/85 backdrop-blur-md"
          : "border-transparent bg-paper/0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 header:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/icon/horizontal_logo_transparent2.png"
            alt="AllAboutWeb"
            width={2000}
            height={574}
            className="h-12 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 header:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden header:block">
          <CtaLink href="/#contact" size="sm">
            Get a Quote
          </CtaLink>
        </div>

        <div className="flex items-center gap-2 header:hidden">
          <a
            href="https://wa.me/918269329125"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="inline-flex items-center justify-center rounded-btn border border-line p-2 text-ink hover:bg-tint"
          >
            <WhatsAppIcon />
          </a>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-btn border border-line p-2 text-ink"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">
              {menuOpen ? "Close menu" : "Open menu"}
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-line bg-paper header:hidden"
        >
          <nav
            className="flex flex-col gap-1 px-4 py-4"
            aria-label="Mobile"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-btn px-3 py-2 text-sm font-medium text-slate hover:bg-tint hover:text-ink"
              >
                {link.label}
              </a>
            ))}
            <CtaLink
              href="/#contact"
              size="sm"
              onClick={() => setMenuOpen(false)}
              className="mt-2"
            >
              Get a Quote
            </CtaLink>
          </nav>
        </div>
      )}
    </header>
  );
}
