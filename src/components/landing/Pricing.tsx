import Link from "next/link";
import { Check, FileText, Globe, LayoutGrid } from "lucide-react";
import { PRICING_PATH, pricingHref, type ServiceKey } from "@/lib/contact";
import { revealDelay } from "@/lib/reveal";
import HScroll from "./ui/HScroll";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";

const PLANS = [
  {
    id: "pdf-catalog",
    service: "pdf" as ServiceKey,
    label: "PDF Catalog",
    icon: FileText,
    price: "2,999",
    tagline: "A clean, printable catalog of your products.",
    features: ["Up to 20 pages", "Custom branded design", "Print & WhatsApp ready", "2 revision rounds"],
  },
  {
    id: "ecatalog",
    service: "ecatalog" as ServiceKey,
    label: "E-Catalog",
    icon: LayoutGrid,
    price: "4,999",
    tagline: "An online catalog customers can browse on any phone.",
    features: ["Up to 100 products", "Shareable link", "Enquire on WhatsApp", "Free updates for 1 month"],
    popular: true,
  },
  {
    id: "website",
    service: "website" as ServiceKey,
    label: "Website",
    icon: Globe,
    price: "9,999",
    tagline: "A complete website for your business.",
    features: ["Up to 5 pages", "Mobile friendly & fast", "Basic SEO setup", "Contact form + WhatsApp"],
  },
];

export default function Pricing() {
  return (
    <Section id="pricing">
      <SectionHeading
        align="center"
        eyebrow="Pricing"
        title="Simple, honest pricing"
        description={
          <>
            Transparent starting prices — <strong>final quote based on what you actually need</strong>.
          </>
        }
      />

      <HScroll
        label="Pricing plans"
        className="mt-6 sm:mt-12"
        gridClassName="md:mx-auto md:grid md:max-w-5xl md:grid-cols-3 md:items-center md:gap-6 md:overflow-visible md:px-0"
      >
        {PLANS.map(({ id, service, label, icon: Icon, price, tagline, features, popular }, i) => (
          <div
            key={id}
            data-reveal="up"
            style={revealDelay(i * 100)}
            className={`relative mt-3 flex w-[82%] max-w-sm shrink-0 snap-center flex-col rounded-panel p-6 transition hover:-translate-y-1 sm:p-7 md:w-auto md:max-w-none ${
              popular
                ? "order-first bg-ink text-white shadow-xl shadow-ink/20 md:order-none md:py-10"
                : "border border-line bg-white shadow-card hover:shadow-lift"
            }`}
          >
            {popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Most popular
              </span>
            )}

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center justify-center rounded-btn p-2.5 ${
                  popular ? "bg-primary text-white" : "bg-tint text-primary"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-base font-bold sm:text-lg">{label}</h3>
            </div>

            <p className={`mt-4 text-sm ${popular ? "text-white/70" : "text-slate"}`}>{tagline}</p>

            <div className="mt-5 sm:mt-6">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  popular ? "text-white/60" : "text-slate"
                }`}
              >
                Starting at
              </span>
              <p className="text-[1.75rem] font-extrabold sm:text-4xl">₹{price}</p>
            </div>

            <ul className="mt-5 space-y-2.5 text-sm sm:mt-6 sm:space-y-3 sm:text-[0.9375rem]">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      popular ? "bg-primary text-white" : "bg-tint text-primary"
                    }`}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className={popular ? "text-white/85" : "text-ink"}>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={pricingHref(service)}
              className={`mt-6 inline-flex items-center justify-center rounded-btn px-6 py-3 text-sm font-semibold transition sm:mt-8 ${
                popular
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "border border-line bg-white text-ink hover:border-primary hover:text-primary"
              }`}
            >
              Get started
            </Link>
          </div>
        ))}
      </HScroll>

      <p className="mt-2 text-center text-xs font-medium text-slate md:hidden">Swipe to compare plans →</p>

      <p data-reveal="up" style={revealDelay(300)} className="mt-6 text-center text-slate md:mt-10">
        <em>Need something specific?</em>{" "}
        <Link href={PRICING_PATH} className="font-semibold text-primary hover:text-ink">
          Get a custom quote →
        </Link>
      </p>
    </Section>
  );
}
