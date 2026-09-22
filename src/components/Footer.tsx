import Image from "next/image";
import Link from "next/link";

const COMPANY_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#work", label: "Our Work" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Get a Quote" },
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
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center">
              <Image
                src="/icon/horizontal_logo_transparent2.png"
                alt="AllAboutWeb"
                width={2000}
                height={574}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-3 max-w-[220px] text-sm text-slate">
              Websites, e-catalogs, and product catalogs — built for your
              business.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Company</p>
            <ul className="mt-4 flex flex-col gap-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Services</p>
            <ul className="mt-4 flex flex-col gap-3">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Contact</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a
                  href="tel:+918269329125"
                  className="text-sm text-slate hover:text-ink"
                >
                  +91 82693 29125
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/918269329125"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate hover:text-ink"
                >
                  WhatsApp
                </a>
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
