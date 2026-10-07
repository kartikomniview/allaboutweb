"use client";

import { usePathname } from "next/navigation";
import { House, IndianRupee, LayoutGrid, Images, type LucideIcon } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { whatsappUrl } from "@/lib/contact";
import { useActiveSection } from "./useActiveSection";

const TABS: { id: string; href: string; label: string; icon: LucideIcon }[] = [
  { id: "top", href: "/#top", label: "Home", icon: House },
  { id: "services", href: "/#services", label: "Services", icon: LayoutGrid },
  { id: "work", href: "/#work", label: "Work", icon: Images },
  { id: "pricing", href: "/#pricing", label: "Pricing", icon: IndianRupee },
];

const SECTION_IDS = TABS.map((tab) => tab.id);

const WHATSAPP_HREF = whatsappUrl("Hi AllAboutWeb, I'd like to know more about your services.");

function Tab({ tab, active }: { tab: (typeof TABS)[number]; active: boolean }) {
  const Icon = tab.icon;
  return (
    <a
      href={tab.href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.6875rem] font-semibold transition-colors ${
        active ? "text-primary" : "text-slate"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
      {tab.label}
    </a>
  );
}

/**
 * App-style bottom navigation on mobile, plus a floating WhatsApp button on
 * desktop. Rendered by Header so every page with the site header gets it.
 */
export default function MobileTabBar() {
  const pathname = usePathname();
  const section = useActiveSection(SECTION_IDS);
  const onHome = pathname === "/";
  const isActive = (id: string) => onHome && section === id;

  return (
    <>
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-12px_rgba(1,18,60,0.18)] backdrop-blur-xl header:hidden"
      >
        <div className="mx-auto flex max-w-md items-end px-2">
          <Tab tab={TABS[0]} active={isActive(TABS[0].id)} />
          <Tab tab={TABS[1]} active={isActive(TABS[1].id)} />

          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 flex-col items-center gap-0.5 pb-2 text-[0.6875rem] font-semibold text-ink"
          >
            <span className="-mt-5 flex h-13 w-13 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-whatsapp/40 ring-4 ring-white transition active:scale-95">
              <WhatsAppIcon className="h-6 w-6" />
            </span>
            Chat
          </a>

          <Tab tab={TABS[2]} active={isActive(TABS[2].id)} />
          <Tab tab={TABS[3]} active={isActive(TABS[3].id)} />
        </div>
      </nav>

      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-6 right-6 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-whatsapp/40 transition hover:-translate-y-0.5 hover:shadow-xl header:flex"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </>
  );
}
