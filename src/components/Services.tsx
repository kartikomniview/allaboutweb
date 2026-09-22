function WebsiteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" strokeLinecap="round" />
      <circle cx="6" cy="7" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="8.6" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CatalogIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="8" height="8" rx="1.5" />
      <rect x="13" y="4" width="8" height="8" rx="1.5" />
      <rect x="3" y="14" width="8" height="6" rx="1.5" />
      <rect x="13" y="14" width="8" height="6" rx="1.5" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M14 3v4h4" strokeLinejoin="round" />
      <path d="M9 13h6M9 16h4" strokeLinecap="round" />
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

const SERVICES = [
  {
    id: "website-development",
    workId: "work-website",
    icon: WebsiteIcon,
    title: "Website Development",
    description:
      "Professional websites for businesses that want to establish their online presence.",
    features: [
      "Business websites",
      "Product showcase websites",
      "Service websites",
      "Mobile-friendly design",
      "WhatsApp enquiry integration",
    ],
  },
  {
    id: "e-catalog",
    workId: "work-ecatalog",
    icon: CatalogIcon,
    title: "E-Catalog",
    description:
      "Shareable digital catalogs your customers can browse on WhatsApp, Instagram, or your website — always up to date.",
    features: [
      "Organized by category",
      "Update products & prices anytime",
      "Shareable via a single link",
      "Mobile-friendly browsing",
      "No app required",
    ],
  },
  {
    id: "product-catalog-pdf",
    workId: "work-pdf-catalog",
    icon: PdfIcon,
    title: "Product Catalog PDF",
    description:
      "Downloadable PDF catalogs your customers can save, print, or forward — ready to share anywhere.",
    features: [
      "Professionally designed layout",
      "Product images, details & pricing",
      "Easy to update each season",
      "Optimized for WhatsApp sharing",
      "Print-ready format",
    ],
  },
];

export default function Services() {
  return (
    <section id="services" className="scroll-mt-24 bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 header:px-8">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold sm:text-4xl">What We Create</h2>
          <p className="mt-4 text-lg text-slate">
            Three ways to put your business online — pick one, or combine
            them.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {SERVICES.map(
            ({ id, workId, icon: Icon, title, description, features }) => (
              <div
                key={id}
                id={id}
                className="scroll-mt-24 rounded-card border border-line bg-white p-8"
              >
                <div className="inline-flex items-center justify-center rounded-btn bg-tint p-2.5 text-secondary">
                  <Icon />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-slate">{description}</p>
                <ul className="mt-5 flex flex-col gap-2">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-slate"
                    >
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-secondary"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={`#${workId}`}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:text-ink"
                >
                  Learn More
                  <ArrowIcon />
                </a>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
