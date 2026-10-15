"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, House, IndianRupee, LayoutGrid, Smartphone } from "lucide-react";
import CtaLink from "@/components/CtaLink";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import MobileTabBar, { type TabBarTab } from "@/components/layout/MobileTabBar";
import { useActiveSection } from "@/components/layout/useActiveSection";
import { pricingHref } from "@/lib/contact";
import { CATALOG_LANDING_ROUTE } from "@/lib/catalogDomain";
import { CATALOG24_WHATSAPP_HREF } from "./content";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "/#demo", label: "Live Demo" },
  { href: "/#work", label: "Our Work" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ", wideOnly: true },
];

const SECTION_IDS = NAV_LINKS.map((link) => link.href.slice(2));

const TABS: TabBarTab[] = [
  { id: "top", href: "/#top", label: "Home", icon: House },
  { id: "demo", href: "/#demo", label: "Demo", icon: Smartphone },
  { id: "features", href: "/#features", label: "Features", icon: LayoutGrid },
  { id: "pricing", href: "/#pricing", label: "Pricing", icon: IndianRupee },
];

const TAB_SECTION_IDS = TABS.map((tab) => tab.id);

// The landing page is served at catalog24.in/ from the /catalog24 route.
const HOME_PATHS = ["/", CATALOG_LANDING_ROUTE];

/** Site header for catalog24.in — same behaviour as the AllAboutWeb header, e-catalog nav only. */
export default function Catalog24Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const section = useActiveSection(SECTION_IDS);
  const active = HOME_PATHS.includes(pathname) ? section : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-line/80 bg-white/90 shadow-[0_8px_30px_-16px_rgba(1,18,60,0.25)] backdrop-blur-xl"
            : "border-b border-transparent bg-paper"
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6 header:px-8 ${
            scrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
          }`}
        >
          <Link href="/" className="flex shrink-0 items-center" aria-label="Catalog24 home">
            <Logo size={scrolled ? "sm" : "md"} />
          </Link>

          <nav className="hidden items-center gap-1 header:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.href.slice(2);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-4 ${
                    isActive ? "text-ink" : "text-slate hover:text-ink"
                  } ${link.wideOnly ? "hidden lg:block" : ""}`}
                >
                  {link.label}
                  <span
                    className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary transition-transform duration-300 lg:inset-x-4 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={CATALOG24_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-whatsapp header:hidden lg:inline-flex transition hover:border-whatsapp hover:bg-whatsapp hover:text-white"
            >
              <WhatsAppIcon />
            </a>
            <CtaLink
              href={pricingHref("ecatalog")}
              size="sm"
              className="group shrink-0 gap-1.5 whitespace-nowrap rounded-full! py-2.5! sm:px-5!"
            >
              <span className="sm:hidden">Get Quote</span>
              <span className="hidden sm:inline">Get Free Quote</span>
              <ArrowRight
                className="hidden h-4 w-4 transition-transform group-hover:translate-x-0.5 sm:block"
                aria-hidden="true"
              />
            </CtaLink>
          </div>
        </div>
      </header>
      <MobileTabBar
        tabs={TABS}
        sectionIds={TAB_SECTION_IDS}
        whatsappHref={CATALOG24_WHATSAPP_HREF}
        homePaths={HOME_PATHS}
      />
    </>
  );
}
