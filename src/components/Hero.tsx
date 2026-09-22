import Image from "next/image";
import CtaLink from "./CtaLink";

const VISUAL_TAGS = ["Website", "E-Catalog", "PDF Catalog"];

const MICRO_TRUST = ["Simple process", "Fixed scope", "Direct communication"];

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 header:px-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:py-24">
      <div>
        <span className="inline-flex items-center rounded-btn border border-line bg-white px-3 py-1 text-xs font-medium text-slate">
          Built for small &amp; growing businesses
        </span>

        <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-[3.25rem]">
          Websites, E-Catalogs &amp; Product Catalogs for Your Business
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-7 text-slate">
          Build a professional online presence with a modern website,
          shareable e-catalog, or a product catalog PDF — designed
          specifically for your business.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <CtaLink href="#contact">Get a Quote</CtaLink>
          <CtaLink
            href="https://wa.me/918269329125"
            variant="secondary"
            external
          >
            WhatsApp Us
          </CtaLink>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate">
          {MICRO_TRUST.map((item, i) => (
            <span key={item} className="flex items-center gap-3">
              {i > 0 && (
                <span
                  className="hidden h-1 w-1 rounded-full bg-line sm:block"
                  aria-hidden="true"
                />
              )}
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-12 lg:mt-0">
        <div className="rounded-panel border border-line bg-white p-8 sm:p-10">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
            </span>
            <span className="ml-2 rounded-btn bg-paper px-3 py-1 text-xs text-slate">
              allaboutweb.in
            </span>
          </div>

          <div className="flex flex-col items-center gap-4 py-10">
            <Image
              src="/icon/horizontal_logo_transparent2.png"
              alt="AllAboutWeb"
              width={2000}
              height={574}
              className="h-auto w-48"
              priority
            />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {VISUAL_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-btn border border-line bg-tint px-3 py-2 text-center text-xs font-medium text-ink"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
