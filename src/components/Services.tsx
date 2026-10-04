import Link from "next/link";
import ImageSlider from "./ImageSlider";
import { pricingHref, type ServiceKey } from "@/lib/contact";
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const IMAGE_BASE =
  "https://aawsite.s3.ap-south-1.amazonaws.com/website/landing/services";

const SERVICES = [
  {
    id: "website-development",
    workId: "work-website",
    slug: "websites",
    service: "website" as ServiceKey,
    cta: "Get Your Website",
    examplesLabel: "See examples",
    name: "Website Development",
    title: (
      <>
        Your business, now <span className="highlight">online</span>.
      </>
    ),
    tagline: "Customers find you on Google and message you on WhatsApp.",
    features: ["Works on mobile", "Shows on Google", "WhatsApp button"],
  },
  {
    id: "e-catalog",
    workId: "work-ecatalog",
    slug: "e-catalog",
    service: "ecatalog" as ServiceKey,
    cta: "Create My E-Catalog",
    examplesLabel: "See examples",
    name: "E-Catalog",
    title: (
      <>
        All your products on <span className="highlight">their phone</span>.
      </>
    ),
    tagline: "Send one link. Customers see every product and price.",
    features: ["Easy to share", "Change prices anytime", "No app needed"],
  },
  {
    id: "product-catalog-pdf",
    workId: "work-pdf-catalog",
    slug: "pdf-catalog",
    service: "pdf" as ServiceKey,
    cta: "Design My PDF Catalog",
    examplesLabel: "See examples",
    name: "Product Catalog PDF",
    title: (
      <>
        A catalog you can <span className="highlight">send anywhere</span>.
      </>
    ),
    tagline: "A neat PDF customers can save, print or share.",
    features: ["Ready to print", "Send on WhatsApp", "Easy to update"],
  },
];

export default function Services() {
  return (
    <section id="services" className="scroll-mt-24 overflow-hidden bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6 header:px-8 lg:py-28">
        <SectionHeading
          align="center"
          eyebrow="Our Services"
          title={
            <>
              What We <span className="highlight">Create</span>
            </>
          }
          description={
            <>
              Everything you need to <strong>showcase your products</strong>{" "}
              and <strong>win more customers</strong> online.
            </>
          }
        />

        <div className="mt-12 flex flex-col gap-16 sm:mt-16 sm:gap-20 lg:mt-20 lg:gap-28">
          {SERVICES.map(
            (
              { id, workId, slug, service, cta, examplesLabel, name, title, tagline, features },
              i
            ) => {
              const reversed = i % 2 === 1;
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
                      className="inline-block bg-primary px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white"
                    >
                      {name}
                    </p>
                    <h3
                      data-reveal="up"
                      className="mt-4 text-2xl font-semibold leading-tight [--reveal-delay:120ms] sm:text-3xl lg:text-4xl"
                    >
                      {title}
                    </h3>
                    <p
                      data-reveal="up"
                      className="mt-4 text-base text-slate [--reveal-delay:180ms] sm:text-lg"
                    >
                      {tagline}
                    </p>
                  </div>

                  <div
                    data-reveal={reversed ? "right" : "left"}
                    className={`relative lg:row-span-4 lg:row-start-1 lg:self-center ${
                      reversed ? "lg:col-start-2" : "lg:col-start-1"
                    }`}
                  >
                    <div
                      className={`absolute -inset-4 rounded-[28px] bg-tint sm:-inset-6 ${
                        reversed ? "rotate-2" : "-rotate-2"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="relative">
                      <ImageSlider
                        images={[1, 2, 3].map(
                          (n) => `${IMAGE_BASE}/${slug}/${n}.webp`
                        )}
                        alt={`${name} by AllAboutWeb`}
                      />
                    </div>
                  </div>

                  <div
                    className={`lg:row-start-3 lg:mt-6 ${
                      reversed ? "lg:col-start-1" : "lg:col-start-2"
                    }`}
                  >
                    <ul
                      data-reveal="up"
                      className="flex flex-wrap gap-2 [--reveal-delay:240ms]"
                    >
                      {features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink sm:text-sm"
                        >
                          <span className="text-primary">
                            <CheckIcon />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div
                      data-reveal="up"
                      className="mt-7 flex flex-col gap-3 [--reveal-delay:300ms] sm:flex-row sm:items-center sm:gap-5"
                    >
                      <Link
                        href={pricingHref(service)}
                        className="group flex w-full items-center justify-center gap-2 rounded-btn bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary sm:inline-flex sm:w-auto"
                      >
                        {cta}
                        <span className="transition-transform group-hover:translate-x-1">
                          <ArrowIcon />
                        </span>
                      </Link>
                      <a
                        href={`#${workId}`}
                        className="text-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {examplesLabel}
                      </a>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}
