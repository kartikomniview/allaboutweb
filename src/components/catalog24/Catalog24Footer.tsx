import Link from "next/link";
import { Phone } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { CATALOG_DEMO_BASE, MAIN_SITE_URL } from "@/lib/catalogDomain";
import { WHATSAPP_NUMBER, pricingHref } from "@/lib/contact";
import { CATALOG24_WHATSAPP_HREF } from "./content";
import Logo from "./Logo";

const LINKS = [
  { href: CATALOG_DEMO_BASE, label: "Live Demo" },
  { href: "/#work", label: "Our Work" },
  { href: "/#features", label: "Features" },
  { href: "/#how-customers-use-it", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

const linkClass = "inline-block py-1.5 text-sm text-slate transition-colors hover:text-primary";

/** Site footer for catalog24.in. */
export default function Catalog24Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16 header:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.6fr_1fr_1.2fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center" aria-label="Catalog24 home">
              <Logo />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate">
              Your products and prices in one shareable link, with enquiries straight to your WhatsApp.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">E-Catalog</p>
            <ul className="mt-3 flex flex-col">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
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
                  href={CATALOG24_WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} inline-flex items-center gap-2`}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </li>
              <li>
                <Link href={pricingHref("ecatalog")} className={`${linkClass} font-semibold text-primary!`}>
                  Get a free quote →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pb-tabbar mt-10 flex flex-col gap-1 border-t border-line pt-6 text-sm text-slate sm:flex-row sm:justify-between header:pb-8">
          <p>© {year} Catalog24. All rights reserved.</p>
          <p>
            A product by{" "}
            <a href={MAIN_SITE_URL} className="font-semibold text-ink hover:text-primary">
              AllAboutWeb
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
