import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { ECATALOG_PAGE, WEBSITE_PAGE } from "@/components/services/content";
import { SERVICE_PAGES } from "@/lib/contact";

const S3 = "https://aawsite.s3.ap-south-1.amazonaws.com/website/landing";

const BANNERS = {
  ecatalog: {
    eyebrow: "Live demo · No sign-up",
    title: (
      <>
        Tap, browse, add to cart — <span className="text-primary">try a real e-catalog</span>
      </>
    ),
    description: "See exactly what your customers will see on their phone.",
    price: `From ₹${ECATALOG_PAGE.price}${ECATALOG_PAGE.priceSuffix ?? ""}`,
    cta: "View E-Catalog Demo",
    href: "/app/catalog/furniture",
    image: `${S3}/services/e-catalog/1.webp`,
    frameLabel: "Furniture e-catalog",
  },
  website: {
    eyebrow: "Live template",
    title: (
      <>
        Your website could <span className="text-primary">look like this</span>
      </>
    ),
    description: "Click through a ready-made store template — we customise it with your brand.",
    price: `From ₹${WEBSITE_PAGE.price}`,
    cta: "View Website Template Demo",
    // The template's own URL stays private, so the demo opens on our page
    href: `${SERVICE_PAGES.website}#template`,
    image: `${S3}/services/websites/2.webp`,
    frameLabel: "Furniture store template",
  },
};

/** Eye-catching strip between landing sections that sends visitors to a live demo. */
export default function DemoBanner({
  variant,
  className = "",
}: {
  variant: keyof typeof BANNERS;
  /** Extra classes for the outer section, e.g. bottom padding before a different-tone section */
  className?: string;
}) {
  const { eyebrow, title, description, price, cta, href, image, frameLabel } = BANNERS[variant];
  const flip = variant === "website";

  return (
    <section className={`bg-white ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 header:px-8">
        <Link
          href={href}
          data-reveal="zoom"
          className="group relative isolate grid overflow-hidden rounded-panel bg-secondary shadow-lift md:grid-cols-2 md:items-center"
        >
          <div
            className="absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-primary/25 blur-3xl transition duration-700 group-hover:bg-primary/35"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-32 -right-20 -z-10 h-80 w-80 rounded-full bg-[#0f5a57]/70 blur-3xl"
            aria-hidden="true"
          />

          <div className={`p-5 sm:p-8 lg:p-12 ${flip ? "md:order-last" : ""}`}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" aria-hidden="true" />
              {eyebrow}
            </span>
            <p className="mt-3 text-xl font-bold leading-tight text-white sm:text-3xl lg:text-[2.125rem]">{title}</p>
            <p className="mt-2 text-sm text-white/70 sm:text-base">{description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 sm:mt-7">
              <span className="inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition group-hover:bg-primary/90 sm:text-base">
                <MousePointerClick className="h-4 w-4" aria-hidden="true" />
                {cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-white/80">{price}</span>
            </div>
          </div>

          <div className="px-5 pb-5 sm:px-8 sm:pb-8 md:p-8 lg:p-10">
            <div
              className={`overflow-hidden rounded-card border border-white/15 bg-white shadow-2xl transition duration-500 group-hover:rotate-0 group-hover:scale-[1.02] ${
                flip ? "md:-rotate-2" : "md:rotate-2"
              }`}
            >
              <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 truncate rounded-full bg-white px-3 py-0.5 text-[0.6875rem] font-medium text-slate">
                  {frameLabel}
                </span>
              </div>
              <div className="relative aspect-[16/9]">
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
