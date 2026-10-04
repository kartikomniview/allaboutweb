import Link from "next/link";
import ImageSlider from "./ImageSlider";
import SectionHeading from "./SectionHeading";

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

function EcatalogVisual() {
  return (
    <div className="flex aspect-[1400/988] flex-col justify-between overflow-hidden rounded-panel border border-line bg-white p-6 shadow-[0_24px_60px_-20px_rgba(1,18,60,0.25)]">
      <div className="grid flex-1 grid-cols-4 gap-3">
        <div className="rounded-btn bg-tint" />
        <div className="rounded-btn bg-tint" />
        <div className="rounded-btn bg-paper" />
        <div className="rounded-btn bg-paper" />
        <div className="rounded-btn bg-paper" />
        <div className="rounded-btn bg-paper" />
        <div className="rounded-btn bg-tint" />
        <div className="rounded-btn bg-tint" />
      </div>
      <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-btn bg-paper px-3 py-1.5 text-xs font-medium text-slate">
        Shared via WhatsApp
      </div>
    </div>
  );
}

const IMAGE_BASE =
  "https://aawsite.s3.ap-south-1.amazonaws.com/website/landing/works";

const slides = (folder: string, count = 4) =>
  Array.from({ length: count }, (_, i) => `${IMAGE_BASE}/${folder}/${i + 1}.webp`);

type WorkItem = {
  id: string;
  category: string;
  title: string;
  description: React.ReactNode;
  images?: string[];
  imageFit?: "cover" | "contain";
  link?: { href: string; label: string; external?: boolean };
};

const WORK_ITEMS: WorkItem[] = [
  {
    id: "work-website",
    category: "Website",
    title: "Home Style Furnitures",
    description: (
      <>
        A <strong>mobile-friendly business website</strong> for a furniture
        brand — showcasing collections and bringing in enquiries online.
      </>
    ),
    images: slides("website"),
    link: {
      href: "https://homestylefurnitures.com/",
      label: "Visit live site",
      external: true,
    },
  },
  {
    id: "work-pdf-catalog",
    category: "PDF Catalog",
    title: "Catalog Designs",
    description: (
      <>
        <strong>Professionally designed PDF catalogs</strong> — ready to share
        on WhatsApp, save on a phone, or print.
      </>
    ),
    images: slides("pdf-catalog", 2),
    imageFit: "contain",
  },
  {
    id: "work-ecatalog",
    category: "E-Catalog",
    title: "Furniture Product Catalog",
    description: (
      <>
        A <strong>shareable digital catalog</strong> customers can browse from
        a single link — organized by category, always up to date.
      </>
    ),
    link: { href: "/app/catalog/furniture", label: "View catalog" },
  },
];

export default function Work() {
  return (
    <section id="work" className="scroll-mt-24 overflow-hidden bg-tertiary">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6 header:px-8 lg:py-28">
        <SectionHeading
          align="center"
          eyebrow="Portfolio"
          title={
            <>
              Our <span className="highlight">Work</span>
            </>
          }
          description={
            <>
              Websites and catalogs we&apos;ve built for{" "}
              <strong>real businesses</strong> — <em>designed to win customers.</em>
            </>
          }
        />

        <div className="mt-12 flex flex-col gap-16 sm:mt-16 sm:gap-20 lg:mt-20 lg:gap-28">
          {WORK_ITEMS.map(
            ({ id, category, title, description, images, imageFit, link }, i) => {
              const reversed = i % 2 === 1;
              const linkClass =
                "group flex w-full items-center justify-center gap-2 rounded-btn bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary sm:inline-flex sm:w-auto";
              const linkContent = link && (
                <>
                  {link.label}
                  <span className="transition-transform group-hover:translate-x-1">
                    <ArrowIcon />
                  </span>
                </>
              );

              return (
                <article
                  key={id}
                  id={id}
                  className="scroll-mt-24 grid grid-cols-1 gap-y-10 sm:gap-y-12 lg:grid-cols-2 lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-16 lg:gap-y-0"
                >
                  {/* Heading: first on mobile, top of the text column on desktop */}
                  <div
                    className={`lg:row-start-2 ${
                      reversed ? "lg:col-start-1" : "lg:col-start-2"
                    }`}
                  >
                    <p
                      data-reveal="up"
                      className="text-xs font-bold uppercase tracking-[0.16em] text-primary"
                    >
                      {category}
                    </p>
                    <h3
                      data-reveal="up"
                      className="mt-2 text-xl font-semibold leading-tight [--reveal-delay:120ms] sm:text-3xl"
                    >
                      {title}
                    </h3>
                    <p
                      data-reveal="up"
                      className="mt-3 text-[0.9375rem] leading-6.5 text-slate [--reveal-delay:180ms] sm:text-lg sm:leading-8"
                    >
                      {description}
                    </p>
                  </div>

                  <div
                    data-reveal={reversed ? "right" : "left"}
                    className={`relative lg:row-span-4 lg:row-start-1 lg:self-center ${
                      reversed ? "lg:col-start-2" : "lg:col-start-1"
                    }`}
                  >
                    <div
                      className={`absolute -inset-4 rounded-[28px] bg-white/70 shadow-sm sm:-inset-6 ${
                        reversed ? "rotate-2" : "-rotate-2"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="relative">
                      {images ? (
                        <ImageSlider
                          images={images}
                          alt={`${title} — ${category}`}
                          fit={imageFit}
                        />
                      ) : (
                        <EcatalogVisual />
                      )}
                    </div>
                  </div>

                  {link && (
                    <div
                      data-reveal="up"
                      className={`lg:row-start-3 lg:mt-7 [--reveal-delay:240ms] ${
                        reversed ? "lg:col-start-1" : "lg:col-start-2"
                      }`}
                    >
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClass}
                        >
                          {linkContent}
                        </a>
                      ) : (
                        <Link href={link.href} className={linkClass}>
                          {linkContent}
                        </Link>
                      )}
                    </div>
                  )}
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}
