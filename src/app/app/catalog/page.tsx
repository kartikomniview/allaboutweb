import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catalog | AllAboutWeb",
  description:
    "Browse AllAboutWeb's digital product catalogs by category. Furniture catalog is live now — more categories are on the way.",
};

function FurnitureIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="11" width="18" height="6" rx="1.5" />
      <path d="M4 17v2M20 17v2" strokeLinecap="round" />
    </svg>
  );
}

function DecorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M12 21c4-3 7-6.5 7-10.5A7 7 0 0 0 5 10.5C5 14.5 8 18 12 21Z" strokeLinejoin="round" />
      <circle cx="12" cy="10.5" r="2.5" />
    </svg>
  );
}

function CarpetIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <rect x="6.5" y="7.5" width="11" height="9" rx="1" strokeDasharray="2 2" />
    </svg>
  );
}

function CurtainsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 4h16" strokeLinecap="round" />
      <path d="M7 4c0 6-2 8-2 16M17 4c0 6 2 8 2 16M12 4c0 8-1 8-1 16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlooringIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CATEGORIES = [
  {
    slug: "furniture",
    icon: FurnitureIcon,
    title: "Furniture catalog",
    description: "Sofas, beds, dining sets, wardrobes, and more.",
    available: true,
  },
  {
    slug: "decor",
    icon: DecorIcon,
    title: "Decor catalog",
    description: "Wall art, lighting, and decorative accents.",
    available: false,
  },
  {
    slug: "carpet",
    icon: CarpetIcon,
    title: "Carpet catalog",
    description: "Area rugs and wall-to-wall carpets.",
    available: false,
  },
  {
    slug: "curtains",
    icon: CurtainsIcon,
    title: "Curtains catalog",
    description: "Drapes, blinds, and window furnishings.",
    available: false,
  },
  {
    slug: "flooring",
    icon: FlooringIcon,
    title: "Flooring catalog",
    description: "Tiles, laminate, vinyl, and wood flooring.",
    available: false,
  },
  {
    slug: "mobile-accessories",
    icon: MobileIcon,
    title: "Mobile & accessories catalog",
    description: "Phones, cases, chargers, and gadgets.",
    available: false,
  },
];

export default function CatalogPage() {
  return (
    <div className="bg-paper">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 header:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-secondary">Catalog</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Browse our catalogs
          </h1>
          <p className="mt-4 text-lg text-slate">
            Explore our products by category. Tap a catalog to start
            browsing — categories still in the works are marked coming soon.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ slug, icon: Icon, title, description, available }) =>
            available ? (
              <Link
                key={slug}
                href={`/app/catalog/${slug}`}
                className="group rounded-card border border-line bg-white p-8 transition-colors hover:border-secondary"
              >
                <div className="inline-flex items-center justify-center rounded-btn bg-tint p-2.5 text-secondary">
                  <Icon />
                </div>
                <h2 className="mt-5 text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-slate">{description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-secondary">
                  View catalog
                  <ArrowIcon />
                </span>
              </Link>
            ) : (
              <div
                key={slug}
                aria-disabled="true"
                className="rounded-card border border-line bg-white/60 p-8"
              >
                <div className="inline-flex items-center justify-center rounded-btn bg-tint p-2.5 text-secondary opacity-60">
                  <Icon />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate">
                  {title}
                </h2>
                <p className="mt-2 text-slate/80">{description}</p>
                <span className="mt-5 inline-flex items-center rounded-btn bg-line px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate">
                  Coming soon
                </span>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
