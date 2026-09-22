import Link from "next/link";

function WebsiteVisual() {
  return (
    <div className="flex h-full flex-col bg-white p-4">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
      </div>
      <div className="mt-4 h-20 rounded-btn bg-tint" />
      <div className="mt-3 grid flex-1 grid-cols-3 gap-2">
        <div className="rounded-btn bg-paper" />
        <div className="rounded-btn bg-paper" />
        <div className="rounded-btn bg-paper" />
      </div>
    </div>
  );
}

function EcatalogVisual() {
  return (
    <div className="flex h-full flex-col justify-between bg-white p-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="aspect-square rounded-btn bg-tint" />
        <div className="aspect-square rounded-btn bg-tint" />
        <div className="aspect-square rounded-btn bg-paper" />
        <div className="aspect-square rounded-btn bg-paper" />
      </div>
      <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-btn bg-paper px-3 py-1.5 text-xs font-medium text-slate">
        Shared via WhatsApp
      </div>
    </div>
  );
}

function PdfVisual() {
  return (
    <div className="relative flex h-full items-center justify-center bg-white p-6">
      <div
        className="absolute h-32 w-24 rotate-6 rounded-md border border-line bg-paper"
        aria-hidden="true"
      />
      <div
        className="absolute h-32 w-24 -rotate-3 rounded-md border border-line bg-tint"
        aria-hidden="true"
      />
      <div className="relative h-32 w-24 rounded-md border border-line bg-white p-3">
        <div className="h-1.5 w-3/4 rounded-full bg-line" />
        <div className="mt-2 h-1.5 w-full rounded-full bg-line" />
        <div className="mt-2 h-1.5 w-2/3 rounded-full bg-line" />
      </div>
    </div>
  );
}

const WORK_ITEMS = [
  {
    id: "work-website",
    category: "Website",
    title: "Business Website",
    href: undefined,
    Visual: WebsiteVisual,
  },
  {
    id: "work-ecatalog",
    category: "E-Catalog",
    title: "Furniture Product Catalog",
    href: "/app/catalog/furniture",
    Visual: EcatalogVisual,
  },
  {
    id: "work-pdf-catalog",
    category: "Product Catalog",
    title: "Furniture Collection",
    href: undefined,
    Visual: PdfVisual,
  },
] as const;

export default function Work() {
  return (
    <section id="work" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 header:px-8">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold sm:text-4xl">Our Work</h2>
          <p className="mt-4 text-lg text-slate">
            A look at what we build — real examples, not stock templates.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {WORK_ITEMS.map(({ id, category, title, href, Visual }) => {
            const visual = (
              <div className="aspect-[4/3] overflow-hidden rounded-card border border-line bg-paper">
                <Visual />
              </div>
            );

            return (
              <div key={id} id={id} className="scroll-mt-24">
                {href ? (
                  <Link href={href} className="group block">
                    {visual}
                    <p className="mt-4 text-sm font-semibold text-secondary">
                      {category}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-ink">
                      {title}
                      <span className="text-sm font-medium text-secondary opacity-0 transition-opacity group-hover:opacity-100">
                        View catalog →
                      </span>
                    </p>
                  </Link>
                ) : (
                  <div>
                    {visual}
                    <p className="mt-4 text-sm font-semibold text-secondary">
                      {category}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                      {title}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
