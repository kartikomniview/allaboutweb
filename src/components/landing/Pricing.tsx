import Link from "next/link";
import {
  ArrowRight,
  FileStack,
  FileText,
  Globe,
  LayoutGrid,
  Link2,
  MessageCircle,
  Package,
  Palette,
  PanelsTopLeft,
  Printer,
  RefreshCw,
  Search,
  Smartphone,
} from "lucide-react";
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
    features: [
      { icon: FileStack, label: "20 pages" },
      { icon: Palette, label: "Branded" },
      { icon: Printer, label: "Print ready" },
      { icon: RefreshCw, label: "2 revisions" },
    ],
  },
  {
    id: "ecatalog",
    service: "ecatalog" as ServiceKey,
    label: "E-Catalog",
    icon: LayoutGrid,
    price: "4,999",
    features: [
      { icon: Package, label: "100 products" },
      { icon: Link2, label: "Share link" },
      { icon: MessageCircle, label: "WhatsApp" },
      { icon: RefreshCw, label: "1 mo updates" },
    ],
    popular: true,
  },
  {
    id: "website",
    service: "website" as ServiceKey,
    label: "Website",
    icon: Globe,
    price: "9,999",
    features: [
      { icon: PanelsTopLeft, label: "5 pages" },
      { icon: Smartphone, label: "Mobile ready" },
      { icon: Search, label: "SEO setup" },
      { icon: MessageCircle, label: "WhatsApp" },
    ],
  },
];

export default function Pricing() {
  return (
    <Section id="pricing">
      <SectionHeading align="center" eyebrow="Pricing" title="Simple, honest pricing" />

      <HScroll
        label="Pricing plans"
        className="mt-6 sm:mt-12"
        gridClassName="md:mx-auto md:grid md:max-w-5xl md:grid-cols-3 md:items-center md:gap-6 md:overflow-visible md:px-0"
      >
        {PLANS.map(({ id, service, label, icon: Icon, price, features, popular }, i) => (
          <div
            key={id}
            data-reveal="up"
            style={revealDelay(i * 100)}
            className={`relative mt-3 flex w-[78%] max-w-xs shrink-0 snap-center flex-col rounded-panel p-4 transition hover:-translate-y-1 sm:p-5 md:w-auto md:max-w-none ${
              popular
                ? "order-first bg-ink text-white shadow-xl shadow-ink/20 md:order-none md:py-8"
                : "border border-line bg-white shadow-card hover:shadow-lift"
            }`}
          >
            {popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                Most popular
              </span>
            )}

            <div className="flex items-center gap-3">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  popular ? "bg-primary text-white" : "bg-tint text-primary"
                }`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className={`text-sm font-bold ${popular ? "text-white/80" : "text-slate"}`}>{label}</h3>
                <p className="text-2xl font-extrabold leading-tight sm:text-3xl">
                  <span className={`mr-1 text-xs font-medium ${popular ? "text-white/60" : "text-slate"}`}>
                    From
                  </span>
                  ₹{price}
                </p>
              </div>
            </div>

            <ul className="mt-4 grid grid-cols-2 gap-2">
              {features.map(({ icon: FeatureIcon, label: feature }) => (
                <li
                  key={feature}
                  className={`flex items-center gap-2 rounded-btn px-2.5 py-2 text-xs font-medium sm:text-sm ${
                    popular ? "bg-white/10 text-white/90" : "bg-paper text-ink"
                  }`}
                >
                  <FeatureIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="truncate">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={pricingHref(service)}
              className={`group mt-4 inline-flex items-center justify-center gap-2 rounded-btn px-6 py-3 text-sm font-semibold transition ${
                popular
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "border border-line bg-white text-ink hover:border-primary hover:text-primary"
              }`}
            >
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        ))}
      </HScroll>

      <p className="mt-2 text-center text-xs font-medium text-slate md:hidden">Swipe to compare →</p>

      <p data-reveal="up" style={revealDelay(300)} className="mt-6 text-center text-sm text-slate md:mt-10">
        Need something specific?{" "}
        <Link href={PRICING_PATH} className="font-semibold text-primary hover:text-ink">
          Get a custom quote →
        </Link>
      </p>
    </Section>
  );
}
