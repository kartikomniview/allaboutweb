import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Layers,
  Link2,
  MessageCircle,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Store,
  Zap,
  type LucideIcon,
} from "lucide-react";
import BusinessShowcase, { type ShowcaseBusiness } from "@/components/catalog24/BusinessShowcase";
import Catalog24Footer from "@/components/catalog24/Catalog24Footer";
import Catalog24Header from "@/components/catalog24/Catalog24Header";
import HeroSlider from "@/components/catalog24/HeroSlider";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import RevealObserver from "@/components/landing/RevealObserver";
import { businessImage } from "@/lib/businessImages";
import { CATALOG_DEMO_BASE, CATALOG_ICONS } from "@/lib/catalogDomain";
import { categoriesFor, type BusinessTypeId } from "@/lib/taxonomy";

// The catalog24.in home page, served at "/" on that domain by src/proxy.ts
// (on any other domain this route redirects to catalog24.in).
// One job: get a business to create its store. Everything points at /register.

const TITLE = "Catalog24 — Your product catalog in one link";
const DESCRIPTION =
  "Create your store in minutes: add products with a photo, AI fills in the details, and customers browse your link and enquire on WhatsApp.";
// JPG with its size declared, so WhatsApp shows the large preview card on the first share.
const SHARE_IMAGE = {
  url: "https://aawsite.s3.ap-south-1.amazonaws.com/website/landing/sharing/catalog24share.jpg",
  width: 1724,
  height: 912,
  type: "image/jpeg",
  alt: "Catalog24: get your catalog and showcase your products",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  icons: CATALOG_ICONS,
  openGraph: { type: "website", siteName: "Catalog24", title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE] },
};

const REGISTER = "/register";

// Soft colour pairs (tile background + icon colour) that give each card its own accent.
const TONES = {
  orange: "bg-orange-50 text-orange-600 ring-orange-100",
  sky: "bg-sky-50 text-sky-600 ring-sky-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  teal: "bg-teal-50 text-teal-600 ring-teal-100",
} as const;
type Tone = keyof typeof TONES;

const STEPS: { icon: LucideIcon; title: string; text: string; tone: Tone }[] = [
  { icon: Store, title: "Create your store", text: "Pick a name and get your own link, like yourstore.catalog24.in.", tone: "orange" },
  { icon: Camera, title: "Add products with a photo", text: "AI fills in the name, category and details. Add a price if you like.", tone: "sky" },
  { icon: Link2, title: "Share your link", text: "Customers browse your catalog and message you on WhatsApp.", tone: "emerald" },
];

const FEATURES: { icon: LucideIcon; title: string; text: string; tone: Tone }[] = [
  { icon: Zap, title: "AI does the typing", text: "Snap a photo; the name, category and details are filled in.", tone: "violet" },
  { icon: Link2, title: "Your own link", text: "One simple link for your whole catalog. No app to install.", tone: "sky" },
  { icon: MessageCircle, title: "Enquiries on WhatsApp", text: "Customers tap a product and message you with its details.", tone: "emerald" },
  { icon: Search, title: "Search and filters", text: "Customers find products by category, price and more.", tone: "amber" },
  { icon: RefreshCw, title: "Always up to date", text: "Change a price or add a product and your link updates instantly.", tone: "rose" },
  { icon: Sparkles, title: "Looks great on phones", text: "A fast, clean catalog made for how your customers shop.", tone: "indigo" },
];

// "Made for every kind of shop". Each card's photo is on S3, named after its label
// (see businessImage in src/lib/businessImages.ts). `types` are the business types it covers:
// its sheet lists their categories, and "Create your store" opens registration with the first chosen.
const BUSINESSES: { label: string; types: BusinessTypeId[] }[] = [
  { label: "Furniture", types: ["furniture"] },
  { label: "Home decor", types: ["decor"] },
  { label: "Lighting", types: ["lighting"] },
  { label: "Flooring", types: ["flooring"] },
  { label: "Curtains & blinds", types: ["curtains"] },
  { label: "Bath & sanitaryware", types: ["bath"] },
  { label: "Clothing & fabrics", types: ["clothing", "fabrics"] },
  { label: "Footwear", types: ["footwear"] },
  { label: "Jewellery & accessories", types: ["jewellery"] },
  { label: "Optical & eyewear", types: ["optical"] },
  { label: "Electronics", types: ["electronics"] },
  { label: "Mobiles & accessories", types: ["mobiles"] },
];

const SHOWCASE: ShowcaseBusiness[] = BUSINESSES.map(({ label, types }) => ({
  label,
  image: businessImage(label),
  registerHref: `${REGISTER}?type=${types[0]}`,
  categories: categoriesFor(types).map((c) => c.label),
}));

// Monthly plans, cheapest first. `featured` is the highlighted one.
const PLANS = [
  { price: 200, products: 100, featured: true },
  { price: 500, products: 300, featured: false },
  { price: 1000, products: 1000, featured: false },
];

// What every plan includes.
const PLAN_FEATURES: { icon: ({ className }: { className?: string }) => React.ReactNode; label: string }[] = [
  { icon: Link2, label: "Your own link" },
  { icon: WhatsAppIcon, label: "Enquiries on WhatsApp" },
  { icon: RefreshCw, label: "Always up to date" },
];

const inr = (n: number) => n.toLocaleString("en-IN");

const FAQS = [
  {
    q: "How long does it take to set up?",
    a: "A couple of minutes. Pick your store name, choose what you sell, and add your first product with a photo.",
  },
  {
    q: "Do I need to type all the product details?",
    a: "No. Take or upload a photo and AI fills in the product name, category, colours and details. You just check them and add a price if you want.",
  },
  {
    q: "How do customers contact me?",
    a: "Every product has a WhatsApp button. Customers message you directly with the product's name and price in the message.",
  },
  {
    q: "What kind of businesses is it for?",
    a: "Any shop with products to show: furniture, home decor, lighting, flooring, curtains, fabrics, clothing, electronics and more.",
  },
  {
    q: "Can I change things later?",
    a: "Yes. Edit products, prices, photos and your store details any time from your phone. Your link updates right away.",
  },
];

function PrimaryCta({ className = "" }: { className?: string }) {
  return (
    <Link
      href={REGISTER}
      className={`group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-button px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(20,62,59,0.8)] transition-colors hover:bg-button-hover sm:px-7 ${className}`}
    >
      Create your store
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

export default function Catalog24HomePage() {
  return (
    <>
      <Catalog24Header />
      <main>
        {/* Hero: a soft orange wash on phones, white on large screens */}
        <section className="bg-linear-to-b from-tint via-white to-white lg:bg-none lg:bg-white">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-7 sm:px-6 sm:pb-14 sm:pt-12 header:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pb-16 lg:pt-14">
            <div className="text-center lg:text-left">
              <p
                data-reveal="up"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#c4501a] shadow-[0_1px_2px_rgba(196,80,26,0.15)] ring-1 ring-inset ring-primary/20 sm:bg-tint sm:text-xs sm:shadow-none sm:ring-0"
              >
                <Store className="h-3.5 w-3.5" aria-hidden />
                Works for every business
              </p>
              <h1
                data-reveal="up"
                className="mt-3 text-[1.625rem] font-bold leading-[1.18] tracking-[-0.025em] text-ink [--reveal-delay:80ms] sm:mt-4 sm:text-4xl sm:leading-[1.12] sm:tracking-[-0.03em] lg:text-[2.75rem]"
              >
                Create your own <span className="block text-primary">digital catalog</span>
              </h1>
              <p
                data-reveal="up"
                className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate [--reveal-delay:160ms] sm:mt-4 sm:text-base sm:leading-7 lg:mx-0"
              >
                Add products with just a photo and AI fills in the details. Share one link, and customers enquire on
                WhatsApp.
              </p>
              <div data-reveal="up" className="mt-6 flex justify-center [--reveal-delay:240ms] sm:mt-7 lg:justify-start">
                <PrimaryCta className="w-full max-w-xs sm:w-auto" />
              </div>
              <ul
                data-reveal="up"
                className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 [--reveal-delay:320ms] sm:mt-8 sm:gap-x-6 lg:justify-start lg:border-t lg:border-line lg:pt-6"
              >
                {["Ready in 2 minutes", "No app to install", "Works on any phone"].map((point) => (
                  <li key={point} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate sm:text-[13px]">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sliding phone screenshots of real stores, each with its own floating badges */}
            <div data-reveal="up" className="mx-auto w-full max-w-[21rem] [--reveal-delay:160ms] sm:max-w-[24rem] lg:max-w-[26rem]">
              <HeroSlider />
            </div>
          </div>
        </section>

        {/* Made for: 4:3 photo cards, 2 across on phones, 3 on tablets, 4 on desktops (3 rows) */}
        <section className="border-y border-line bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14 header:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p data-reveal="up" className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary sm:text-xs">
                Made for every kind of shop
              </p>
              <h2 data-reveal="up" className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-ink [--reveal-delay:80ms] sm:mt-2 sm:text-3xl">
                Whatever you sell, show it well
              </h2>
              <p data-reveal="up" className="mt-1.5 text-[13px] text-slate [--reveal-delay:120ms] sm:mt-2 sm:text-base">
                Tap your business to see what you get.
              </p>
            </div>
            <BusinessShowcase businesses={SHOWCASE} />
            <div className="mt-6 text-center sm:mt-10">
              <PrimaryCta className="w-full max-w-xs sm:w-auto" />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20 header:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p data-reveal="up" className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary sm:text-xs">
                How it works
              </p>
              <h2 data-reveal="up" className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-ink [--reveal-delay:80ms] sm:mt-2 sm:text-4xl">
                Live in three simple steps
              </h2>
            </div>
            <ol className="mt-6 grid gap-2.5 sm:mt-10 sm:grid-cols-3 sm:gap-4">
              {STEPS.map(({ icon: Icon, title, text, tone }, i) => (
                <li
                  key={title}
                  data-reveal="up"
                  style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}
                  className="flex gap-3.5 rounded-lg border border-line bg-white p-4 shadow-[0_1px_2px_rgba(1,18,60,0.04)] sm:flex-col sm:gap-0 sm:p-5"
                >
                  <span className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-md ring-1 ring-inset ${TONES[tone]}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-white ring-2 ring-white">
                      {i + 1}
                    </span>
                  </span>
                  <div className="min-w-0 sm:mt-4">
                    <h3 className="text-sm font-semibold text-ink sm:text-base">{title}</h3>
                    <p className="mt-0.5 text-[13px] leading-5 text-slate sm:mt-1 sm:text-sm sm:leading-6">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-7 text-center sm:mt-10">
              <PrimaryCta className="w-full max-w-xs sm:w-auto" />
            </div>
          </div>
        </section>

        {/* Features: a two-column grid of colourful cards on phones */}
        <section className="bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20 header:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p data-reveal="up" className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary sm:text-xs">
                Why Catalog24
              </p>
              <h2 data-reveal="up" className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-ink [--reveal-delay:80ms] sm:mt-2 sm:text-4xl">
                Everything your customers need
              </h2>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-3 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text, tone }, i) => (
                <li
                  key={title}
                  data-reveal="up"
                  style={{ ["--reveal-delay" as string]: `${(i % 3) * 80}ms` }}
                  className="rounded-lg border border-line bg-white p-3.5 sm:flex sm:gap-4 sm:p-5"
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ring-1 ring-inset sm:h-10 sm:w-10 ${TONES[tone]}`}>
                    <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="mt-2.5 sm:mt-0">
                    <h3 className="text-[13px] font-semibold leading-snug text-ink sm:text-[15px]">{title}</h3>
                    <p className="mt-1 text-xs leading-[1.45] text-slate sm:text-sm sm:leading-6">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Live demo strip: a slim band between the features and pricing */}
        <section className="border-y border-primary/15 bg-tint">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3.5 px-4 py-5 text-center sm:flex-row sm:justify-between sm:gap-6 sm:px-6 sm:py-6 sm:text-left header:px-8">
            <div data-reveal="up" className="flex items-center gap-3.5">
              <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-primary shadow-[0_1px_2px_rgba(196,80,26,0.15)] ring-1 ring-inset ring-primary/20 sm:grid">
                <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-ink sm:text-base">See a real store in action</p>
                <p className="mt-0.5 text-[13px] leading-5 text-slate sm:text-sm">
                  Browse our demo catalog the way your customers will.
                </p>
              </div>
            </div>
            <Link
              data-reveal="up"
              href={CATALOG_DEMO_BASE}
              className="group inline-flex h-11 w-full max-w-xs shrink-0 items-center justify-center gap-2 rounded-md border border-primary/25 bg-white px-6 text-[15px] font-semibold text-ink shadow-[0_1px_2px_rgba(196,80,26,0.12)] transition-colors [--reveal-delay:80ms] hover:border-primary/45 sm:w-auto"
            >
              View live demo
              <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </section>

        {/* Pricing: three monthly plans, stacked on phones (the featured one first) */}
        <section id="pricing" className="scroll-mt-16 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20 header:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p data-reveal="up" className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary sm:text-xs">
                Pricing
              </p>
              <h2 data-reveal="up" className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-ink [--reveal-delay:80ms] sm:mt-2 sm:text-4xl">
                Simple, affordable plans
              </h2>
              <p data-reveal="up" className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate [--reveal-delay:160ms] sm:mt-3 sm:text-base sm:leading-7">
                Choose the plan that fits your business. Every plan has the same features; only the number of products
                changes.
              </p>
            </div>
            <ul className="mx-auto mt-7 grid max-w-sm gap-3 sm:mt-12 sm:max-w-none sm:grid-cols-3 sm:items-center sm:gap-4 lg:gap-6">
              {PLANS.map(({ price, products, featured }, i) => (
                <li
                  key={price}
                  data-reveal="up"
                  style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}
                  className={`relative flex flex-col rounded-lg bg-white p-5 lg:p-6 ${
                    featured
                      ? "border-2 border-primary shadow-[0_20px_44px_-24px_rgba(252,108,38,0.55)] sm:py-7 lg:py-8"
                      : "border border-line shadow-[0_1px_2px_rgba(1,18,60,0.04)]"
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                      Most popular
                    </span>
                  )}
                  <p className="flex items-baseline gap-1 text-ink">
                    <span className={`font-bold tracking-[-0.03em] tabular-nums ${featured ? "text-4xl lg:text-5xl" : "text-3xl lg:text-4xl"}`}>
                      ₹{inr(price)}
                    </span>
                    <span className="text-sm font-medium text-slate">/month</span>
                  </p>
                  <div
                    className={`mt-4 flex items-center gap-3 rounded-md px-4 py-3 ring-1 ring-inset ${
                      featured ? "bg-tint text-primary ring-primary/15" : "bg-paper text-sky-600 ring-line"
                    }`}
                  >
                    <Layers className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
                    <p className="text-ink">
                      <span className="text-xl font-bold tabular-nums">{inr(products)}</span>{" "}
                      <span className="text-sm font-medium text-slate">products</span>
                    </p>
                  </div>
                  <ul className="mt-4 divide-y divide-line">
                    {PLAN_FEATURES.map(({ icon: Icon, label }) => (
                      <li key={label} className="flex items-center gap-3 py-2.5 text-sm text-ink">
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 ${
                            Icon === WhatsAppIcon ? "text-whatsapp" : featured ? "text-primary" : "text-sky-600"
                          }`}
                        />
                        {label}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={REGISTER}
                    className={`mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-[15px] font-semibold transition-colors ${
                      featured
                        ? "bg-button text-white hover:bg-button-hover"
                        : "border border-line bg-white text-ink hover:border-slate/35 hover:bg-paper"
                    }`}
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ: one card per question */}
        <section id="faq" className="scroll-mt-16 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-20">
            <h2 data-reveal="up" className="text-center text-xl font-bold tracking-[-0.02em] text-ink sm:text-4xl">
              Questions
            </h2>
            <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:gap-2.5">
              {FAQS.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-lg border border-line bg-white px-4 py-3.5 transition-colors open:border-primary/30 open:bg-tint/40 sm:px-5 sm:py-4"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink sm:text-[15px] [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper text-slate transition-colors group-open:bg-white group-open:text-primary">
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
                    </span>
                  </summary>
                  <p className="pt-2 text-[13px] leading-6 text-slate sm:text-sm">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final call to action */}
        <section className="bg-secondary">
          <div className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 sm:py-20">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-white sm:text-4xl">Ready to share your products?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/70 sm:mt-3 sm:text-base sm:leading-7">
              Create your store now. It takes about two minutes.
            </p>
            <Link
              href={REGISTER}
              className="group mt-6 inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-md bg-white px-7 text-[15px] font-semibold text-ink transition-colors hover:bg-paper sm:mt-7 sm:h-14 sm:w-auto sm:px-8 sm:text-base"
            >
              Create your store
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </section>
      </main>
      <Catalog24Footer />
      <RevealObserver />
    </>
  );
}
