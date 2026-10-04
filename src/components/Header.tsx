"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CtaLink from "./CtaLink";
import { PRICING_PATH } from "@/lib/contact";

const NAV_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#work", label: "Our Work" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#faq", label: "FAQ" },
];

const SECTION_IDS = NAV_LINKS.map((link) => link.href.slice(2));

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

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = SECTION_IDS.map((id) =>
      document.getElementById(id)
    ).filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Close the mobile menu on Escape or when the viewport grows to desktop width
  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia("(min-width: 53.75rem)");
    const close = () => setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onChange = (e: MediaQueryListEvent) => e.matches && close();
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onChange);
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full px-3 transition-all duration-300 sm:px-4 ${
        scrolled ? "pt-2" : "pt-4"
      }`}
    >
      <div
        className={`mx-auto max-w-6xl rounded-panel border transition-all duration-300 ${
          scrolled || menuOpen
            ? "border-line/80 bg-white/80 shadow-[0_12px_40px_-16px_rgba(1,18,60,0.25)] backdrop-blur-xl"
            : "border-transparent bg-white/0"
        }`}
      >
        <div
          className={`flex items-center justify-between px-3 transition-all duration-300 sm:px-4 header:px-5 ${
            scrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
          }`}
        >
          <Link href="/" className="flex items-center">
            <Image
              src="/icon/horizontal_logo_transparent3.png"
              alt="AllAboutWeb"
              width={2000}
              height={574}
              className={`w-auto transition-all duration-300 ${
                scrolled ? "h-10 sm:h-12" : "h-11 sm:h-16"
              }`}
              priority
            />
          </Link>

          <nav
            className="hidden items-center gap-1 rounded-full border border-line/70 bg-white/60 p-1 backdrop-blur header:flex"
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => {
              const isActive = active === link.href.slice(2);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-white shadow-sm"
                      : "text-slate hover:bg-tint hover:text-ink"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 header:flex">
            <Link
              href={PRICING_PATH}
              aria-label="Get pricing on WhatsApp"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-[#25d366] hover:bg-[#25d366] hover:text-white"
            >
              <WhatsAppIcon />
            </Link>
            <CtaLink
              href={PRICING_PATH}
              size="sm"
              className="group rounded-full! hover:-translate-y-0.5"
            >
              Get a Quote
              <ArrowIcon />
            </CtaLink>
          </div>

          <div className="flex items-center gap-2 header:hidden">
            <Link
              href={PRICING_PATH}
              aria-label="Get pricing on WhatsApp"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-[#25d366] hover:bg-[#25d366] hover:text-white"
            >
              <WhatsAppIcon />
            </Link>

            <button
              type="button"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                menuOpen
                  ? "border-secondary bg-secondary text-white"
                  : "border-line bg-white text-ink"
              }`}
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
                    d="M3 6h14M3 10h10M3 14h14"
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
            className="max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain border-t border-line header:hidden"
          >
            <nav className="flex flex-col gap-1 p-3" aria-label="Mobile">
              {NAV_LINKS.map((link) => {
                const isActive = active === link.href.slice(2);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex items-center justify-between rounded-btn px-3 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-tint text-ink"
                        : "text-slate hover:bg-tint hover:text-ink"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                    )}
                  </a>
                );
              })}
              <CtaLink
                href={PRICING_PATH}
                size="md"
                onClick={() => setMenuOpen(false)}
                className="group mt-2"
              >
                Get a Quote
                <ArrowIcon />
              </CtaLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
