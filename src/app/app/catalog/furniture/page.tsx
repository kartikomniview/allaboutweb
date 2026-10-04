import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/CtaLink";
import { whatsappUrl } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Furniture Catalog | AllAboutWeb",
  description:
    "Browse the AllAboutWeb furniture catalog — sofas, beds, dining sets, wardrobes, and more. Enquire on WhatsApp for pricing and availability.",
};

function FurniturePieceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-10 w-10"
      aria-hidden="true"
    >
      <path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="11" width="18" height="6" rx="1.5" />
      <path d="M4 17v2M20 17v2" strokeLinecap="round" />
    </svg>
  );
}

const PRODUCTS = [
  {
    id: "comfort-sofa-set",
    name: "Comfort Sofa Set",
    room: "Living room",
    description: "3-seater sofa set with cushioned armrests and durable upholstery.",
  },
  {
    id: "oakwood-dining-table",
    name: "Oakwood Dining Table",
    room: "Dining",
    description: "6-seater solid wood dining table with a matte finish.",
  },
  {
    id: "serenity-bed-frame",
    name: "Serenity Bed Frame",
    room: "Bedroom",
    description: "Queen-size bed frame with an upholstered headboard.",
  },
  {
    id: "classic-wardrobe",
    name: "Classic Wardrobe",
    room: "Bedroom",
    description: "3-door wardrobe with mirror panel and internal shelving.",
  },
  {
    id: "ergo-office-chair",
    name: "Ergo Office Chair",
    room: "Office",
    description: "Adjustable-height chair with lumbar support and armrests.",
  },
  {
    id: "glass-coffee-table",
    name: "Glass Coffee Table",
    room: "Living room",
    description: "Tempered-glass top coffee table with a metal frame.",
  },
  {
    id: "modern-tv-unit",
    name: "Modern TV Unit",
    room: "Living room",
    description: "Wall-mounted TV unit with closed storage and cable management.",
  },
  {
    id: "wall-bookshelf",
    name: "Wall Bookshelf",
    room: "Storage",
    description: "5-tier open bookshelf, freestanding or wall-fixed.",
  },
];

export default function FurnitureCatalogPage() {
  return (
    <div className="bg-paper">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 header:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-slate">
          <Link href="/app/catalog" className="hover:text-ink">
            Catalog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">Furniture</span>
        </nav>

        <div className="mt-4 max-w-2xl">
          <h1 className="text-3xl font-bold sm:text-4xl">Furniture catalog</h1>
          <p className="mt-4 text-lg text-slate">
            Browse our furniture range below. Enquire on WhatsApp for pricing,
            availability, and customization.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product) => {
            const whatsappHref = whatsappUrl(
              `Hi, I'm interested in the ${product.name}.`
            );

            return (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded-card border border-line bg-white"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-tint text-primary">
                  <FurniturePieceIcon />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate">
                    {product.room}
                  </span>
                  <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
                  <p className="mt-2 flex-1 text-sm text-slate">
                    {product.description}
                  </p>
                  <CtaLink
                    href={whatsappHref}
                    variant="secondary"
                    size="sm"
                    external
                    className="mt-5 self-start"
                  >
                    Enquire on WhatsApp
                  </CtaLink>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
