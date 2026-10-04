import Image from "next/image";
import Link from "next/link";
import { revealDelay } from "@/lib/reveal";
import { PRICING_PATH, WHATSAPP_NUMBER } from "@/lib/contact";

const COMPANY_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#work", label: "Our Work" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#faq", label: "FAQ" },
  { href: PRICING_PATH, label: "Get a Quote" },
];

const SERVICE_LINKS = [
  { href: "#website-development", label: "Website Development" },
  { href: "#e-catalog", label: "E-Catalog" },
  { href: "#product-catalog-pdf", label: "Product Catalog PDF" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 header:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          <div
            data-reveal="up"
            style={revealDelay(0)}
            className="col-span-2 lg:col-span-1"
          >
            <Link href="/" className="flex items-center">
              <Image
                src="/icon/horizontal_logo_transparent3.png"
                alt="AllAboutWeb"
                width={2000}
                height={574}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-3 max-w-[240px] text-sm leading-6 text-slate">
              Websites, e-catalogs, and product catalogs — built for{" "}
              <em>your</em> business.
            </p>
          </div>

          <div data-reveal="up" style={revealDelay(100)}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">Company</p>
            <ul className="mt-3 flex flex-col gap-1">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block py-1.5 text-sm text-slate hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal="up" style={revealDelay(200)}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">Services</p>
            <ul className="mt-3 flex flex-col gap-1">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-block py-1.5 text-sm text-slate hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal="up" style={revealDelay(300)}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">Contact</p>
            <ul className="mt-3 flex flex-col gap-1">
              <li>
                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="inline-block py-1.5 text-sm text-slate hover:text-ink"
                >
                  +91 82693 29125
                </a>
              </li>
              <li>
                <Link
                  href={PRICING_PATH}
                  className="inline-block py-1.5 text-sm text-slate hover:text-ink"
                >
                  WhatsApp
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="text-sm text-slate">
            © {year} AllAboutWeb. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
