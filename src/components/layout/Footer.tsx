import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { ALL_SERVICES } from "@/components/landing/data";
import { PRICING_PATH, WHATSAPP_NUMBER, whatsappUrl } from "@/lib/contact";

const COMPANY_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#work", label: "Our Work" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

const linkClass = "inline-block py-1.5 text-sm text-slate transition-colors hover:text-primary";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 header:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/icon/horizontal_logo_transparent3.png"
                alt="AllAboutWeb"
                width={2000}
                height={574}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate">
              Websites, e-catalogs and product catalogs for small and growing businesses.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">Company</p>
            <ul className="mt-3 flex flex-col">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">Services</p>
            <ul className="mt-3 flex flex-col">
              {ALL_SERVICES.map((service) => (
                <li key={service.id}>
                  <Link href={`/#${service.id}`} className={linkClass}>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">Contact</p>
            <ul className="mt-3 flex flex-col gap-1">
              <li>
                <a href={`tel:+${WHATSAPP_NUMBER}`} className={`${linkClass} inline-flex items-center gap-2`}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  +91 82693 29125
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} inline-flex items-center gap-2`}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </li>
              <li>
                <Link href={PRICING_PATH} className={`${linkClass} font-semibold text-primary!`}>
                  Get a free quote →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pb-tabbar mt-10 border-t border-line pt-6 text-sm text-slate header:pb-8">
          <p>© {year} AllAboutWeb. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
