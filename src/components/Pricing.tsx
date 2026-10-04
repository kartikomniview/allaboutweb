import Link from "next/link";
import SectionHeading from "./SectionHeading";
import { PRICING_PATH, pricingHref, type ServiceKey } from "@/lib/contact";
import { revealDelay } from "@/lib/reveal";

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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PLANS = [
  {
    id: "pdf-catalog",
    service: "pdf" as ServiceKey,
    label: "PDF Catalog",
    icon: PdfIcon,
    price: "2,999",
    tagline: "A clean, printable catalog of your products.",
    features: ["Up to 20 pages", "Custom branded design", "Print & WhatsApp ready", "2 revision rounds"],
  },
  {
    id: "ecatalog",
    service: "ecatalog" as ServiceKey,
    label: "E-Catalog",
    icon: CatalogIcon,
    price: "4,999",
    tagline: "An online catalog customers can browse on any phone.",
    features: ["Up to 100 products", "Shareable link", "Enquire on WhatsApp", "Free updates for 1 month"],
    popular: true,
  },
  {
    id: "website",
    service: "website" as ServiceKey,
    label: "Website",
    icon: WebsiteIcon,
    price: "9,999",
    tagline: "A complete website for your business.",
    features: ["Up to 5 pages", "Mobile friendly & fast", "Basic SEO setup", "Contact form + WhatsApp"],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6 header:px-8">
        <SectionHeading
          align="center"
          eyebrow="Pricing"
          title={
            <>
              Simple, <span className="highlight">Honest</span> Pricing
            </>
          }
          description={
            <>
              Transparent starting prices —{" "}
              <strong>final quote based on what you actually need</strong>.
            </>
          }
        />

        <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 pt-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-auto md:mt-12 md:grid md:max-w-5xl md:grid-cols-3 md:items-center md:gap-6 md:overflow-visible md:p-0 [&::-webkit-scrollbar]:hidden">
          {PLANS.map(({ id, service, label, icon: Icon, price, tagline, features, popular }, i) => (
            <div
              key={id}
              data-reveal="up"
              style={revealDelay(i * 100)}
              className={`relative flex w-[82%] max-w-sm shrink-0 snap-center flex-col rounded-panel p-6 transition hover:-translate-y-1 sm:p-7 md:w-auto md:max-w-none ${
                popular
                  ? "order-first bg-ink text-white shadow-xl shadow-ink/20 md:order-none md:py-10"
                  : "border border-line bg-white hover:border-primary/50 hover:shadow-lg"
              }`}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Most Popular
                </span>
              )}

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center justify-center rounded-btn p-2.5 ${
                    popular ? "bg-primary text-white" : "bg-tint text-primary"
                  }`}
                >
                  <Icon />
                </span>
                <h3 className="text-base font-semibold sm:text-lg">{label}</h3>
              </div>

              <p className={`mt-4 text-sm ${popular ? "text-white/70" : "text-slate"}`}>
                {tagline}
              </p>

              <div className="mt-5 sm:mt-6">
                <span className={`text-xs font-semibold uppercase tracking-wider ${popular ? "text-white/60" : "text-slate"}`}>
                  Starting at
                </span>
                <p className="text-[1.75rem] font-bold sm:text-4xl">
                  ₹{price}
                </p>
              </div>

              <ul className="mt-5 space-y-2.5 text-sm sm:mt-6 sm:space-y-3 sm:text-[0.9375rem]">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        popular ? "bg-primary text-white" : "bg-tint text-primary"
                      }`}
                    >
                      <CheckIcon />
                    </span>
                    <span className={popular ? "text-white/85" : "text-ink"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={pricingHref(service)}
                className={`mt-6 inline-flex sm:mt-8 items-center justify-center rounded-btn px-6 py-3 text-sm font-semibold transition ${
                  popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-line bg-white text-ink hover:border-primary hover:text-primary"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs font-medium text-slate md:hidden">
          Swipe to compare plans →
        </p>

        <p data-reveal="up" style={revealDelay(300)} className="mt-6 text-center text-slate md:mt-10">
          <em>Need something specific?</em>{" "}
          <Link
            href={PRICING_PATH}
            className="font-semibold text-primary hover:text-ink"
          >
            Get a Quote →
          </Link>
        </p>
      </div>
    </section>
  );
}
