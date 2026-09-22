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

const OPTIONS = [
  { id: "website", label: "Website", icon: WebsiteIcon },
  { id: "ecatalog", label: "E-Catalog", icon: CatalogIcon },
  { id: "pdf-catalog", label: "PDF Catalog", icon: PdfIcon },
];

export default function Pricing() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 header:px-8">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Tell Us What You Need
        </h2>
        <p className="mt-4 text-lg text-slate">
          Every project is scoped around what you actually need — no rigid
          packages to squeeze into.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {OPTIONS.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href="#contact"
              className="group flex flex-col items-center gap-3 rounded-card border border-line bg-white px-6 py-8 transition-colors hover:border-secondary"
            >
              <span className="inline-flex items-center justify-center rounded-btn bg-tint p-2.5 text-secondary">
                <Icon />
              </span>
              <span className="text-base font-semibold text-ink">
                {label}
              </span>
            </a>
          ))}
        </div>

        <p className="mt-8 text-slate">
          Need something specific?{" "}
          <a
            href="#contact"
            className="font-semibold text-secondary hover:text-ink"
          >
            Get a Quote →
          </a>
        </p>
      </div>
    </section>
  );
}
