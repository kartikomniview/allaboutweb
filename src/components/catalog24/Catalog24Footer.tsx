import Link from "next/link";
import { CATALOG_DEMO_BASE, MAIN_SITE_URL } from "@/lib/catalogDomain";
import { CATALOG24_WHATSAPP_HREF } from "./content";
import Logo from "./Logo";

const LINKS = [
  { href: "/register", label: "Create your store" },
  { href: "/login", label: "Log in" },
  { href: CATALOG_DEMO_BASE, label: "Live demo" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

/** Site footer for catalog24.in: the links, and one small contact line. */
export default function Catalog24Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 header:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center" aria-label="Catalog24 home">
              <Logo size="sm" />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate">Your products in one link, with enquiries on WhatsApp.</p>
          </div>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-1">
            {LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="inline-block py-1.5 text-sm text-slate transition-colors hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-line pt-6 text-xs text-slate sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Catalog24 · A product by{" "}
            <a href={MAIN_SITE_URL} className="font-semibold text-ink hover:text-primary">
              AllAboutWeb
            </a>
          </p>
          <p>
            Questions?{" "}
            <a href={CATALOG24_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink hover:text-primary">
              Message us
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
