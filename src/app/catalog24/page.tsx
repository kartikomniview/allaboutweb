import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Blinds,
  Camera,
  Check,
  ChevronDown,
  Frame,
  Grid2x2,
  Lamp,
  Link2,
  MessageCircle,
  RefreshCw,
  Search,
  Shirt,
  Sofa,
  Sparkles,
  Store,
  Tv,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import Catalog24Footer from "@/components/catalog24/Catalog24Footer";
import Catalog24Header from "@/components/catalog24/Catalog24Header";
import DemoLauncher from "@/components/catalog24/DemoLauncher";
import RevealObserver from "@/components/landing/RevealObserver";
import { CATALOG_DEMO_BASE } from "@/lib/catalogDomain";

// The catalog24.in home page, served at "/" on that domain by src/proxy.ts
// (on any other domain this route redirects to catalog24.in).
// One job: get a business to create its store. Everything points at /register.

const TITLE = "Catalog24 — Your product catalog in one link";
const DESCRIPTION =
  "Create your store in minutes: add products with a photo, AI fills in the details, and customers browse your link and enquire on WhatsApp.";
const SHARE_IMAGE = {
  url: "https://aawsite.s3.ap-south-1.amazonaws.com/website/landing/sharing/diwali-e-catalog.jpg",
  alt: "Catalog24 e-catalog",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { type: "website", siteName: "Catalog24", title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE] },
};

const REGISTER = "/register";

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Store, title: "Create your store", text: "Pick a name and get your own link, like yourstore.catalog24.in." },
  { icon: Camera, title: "Add products with a photo", text: "AI fills in the name, category and details. Add a price if you like." },
  { icon: Link2, title: "Share your link", text: "Customers browse your catalog and message you on WhatsApp." },
];

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: WandSparkles, title: "AI does the typing", text: "Snap a photo; the name, category, colours and details are filled in." },
  { icon: Link2, title: "Your own link", text: "One simple link for your whole catalog. No app to install." },
  { icon: MessageCircle, title: "Enquiries on WhatsApp", text: "Customers tap a product and message you with its details." },
  { icon: Search, title: "Search and filters", text: "Customers find products by category, price, colour and more." },
  { icon: RefreshCw, title: "Always up to date", text: "Change a price or add a product and your link updates instantly." },
  { icon: Sparkles, title: "Looks great on phones", text: "A fast, clean catalog made for how your customers shop." },
];

const BUSINESSES: { icon: LucideIcon; label: string }[] = [
  { icon: Sofa, label: "Furniture" },
  { icon: Frame, label: "Home decor" },
  { icon: Lamp, label: "Lighting" },
  { icon: Grid2x2, label: "Flooring" },
  { icon: Blinds, label: "Curtains & blinds" },
  { icon: Shirt, label: "Clothing & fabrics" },
  { icon: Tv, label: "Electronics" },
];

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
      className={`group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-button px-7 text-base font-semibold text-white shadow-[0_10px_24px_-12px_rgba(20,62,59,0.8)] transition-colors hover:bg-button-hover sm:h-14 sm:px-8 ${className}`}
    >
      Create your store
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

export default function Catalog24HomePage() {
  return (
    <>
      <Catalog24Header />
      <main>
        {/* Hero */}
        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-8 sm:px-6 sm:pt-14 header:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-20 lg:pt-20">
            <div className="text-center lg:text-left">
              <p
                data-reveal="up"
                className="inline-flex items-center gap-1.5 rounded-full bg-tint px-3 py-1 text-xs font-semibold text-[#c4501a]"
              >
                <WandSparkles className="h-3.5 w-3.5" aria-hidden />
                Add products with just a photo
              </p>
              <h1
                data-reveal="up"
                className="mx-auto mt-4 max-w-xl text-[2rem] font-bold leading-[1.15] tracking-[-0.03em] text-ink [--reveal-delay:80ms] sm:text-5xl lg:mx-0 lg:text-[3.25rem]"
              >
                Your products in one link. Enquiries on WhatsApp.
              </h1>
              <p
                data-reveal="up"
                className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate [--reveal-delay:160ms] sm:text-lg sm:leading-8 lg:mx-0"
              >
                Create your online catalog in minutes. Snap a product photo, AI fills in the details, and you share one link
                with your customers.
              </p>
              <div data-reveal="up" className="mt-7 flex flex-col items-center gap-3 [--reveal-delay:240ms] lg:items-start">
                <PrimaryCta className="w-full max-w-xs sm:w-auto" />
                <p className="text-sm text-slate">
                  Already have a store?{" "}
                  <Link href="/login" className="font-semibold text-ink hover:text-primary">
                    Log in
                  </Link>
                </p>
              </div>
              <ul
                data-reveal="up"
                className="mx-auto mt-7 flex max-w-md flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate [--reveal-delay:320ms] lg:mx-0 lg:justify-start"
              >
                {["Ready in 2 minutes", "No app to install", "Works on any phone"].map((point) => (
                  <li key={point} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* The live demo */}
            <div id="demo" data-reveal="up" className="mx-auto w-full max-w-[22rem] scroll-mt-24 text-center [--reveal-delay:160ms]">
              <DemoLauncher src={CATALOG_DEMO_BASE} title="Live demo of a Catalog24 store" fullDemoHref={CATALOG_DEMO_BASE} />
              <p className="mt-3 text-xs text-slate">A real store catalog. Tap to try it.</p>
            </div>
          </div>
        </section>

        {/* Made for */}
        <section className="border-y border-line bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 header:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate">Made for every kind of shop</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {BUSINESSES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink"
                >
                  <Icon className="h-4 w-4 text-slate" strokeWidth={1.75} aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 header:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p data-reveal="up" className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                How it works
              </p>
              <h2 data-reveal="up" className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ink [--reveal-delay:80ms] sm:text-4xl">
                Live in three simple steps
              </h2>
            </div>
            <ol className="mt-10 grid gap-4 sm:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li
                  key={title}
                  data-reveal="up"
                  style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}
                  className="rounded-lg border border-line bg-white p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-tint text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate">Step {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate">{text}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 text-center">
              <PrimaryCta />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 header:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p data-reveal="up" className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Why Catalog24
              </p>
              <h2 data-reveal="up" className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ink [--reveal-delay:80ms] sm:text-4xl">
                Everything your customers need
              </h2>
            </div>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }, i) => (
                <li
                  key={title}
                  data-reveal="up"
                  style={{ ["--reveal-delay" as string]: `${(i % 3) * 80}ms` }}
                  className="flex gap-4 rounded-lg border border-line bg-white p-5"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink" strokeWidth={1.75} aria-hidden />
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-16 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
            <h2 data-reveal="up" className="text-center text-2xl font-bold tracking-[-0.02em] text-ink sm:text-4xl">
              Questions
            </h2>
            <div className="mt-8 divide-y divide-line rounded-lg border border-line">
              {FAQS.map((item) => (
                <details key={item.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="pt-2 text-sm leading-6 text-slate">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final call to action */}
        <section className="bg-secondary">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-white sm:text-4xl">Ready to share your products?</h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-7 text-white/70">
              Create your store now. It takes about two minutes.
            </p>
            <Link
              href={REGISTER}
              className="group mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-7 text-base font-semibold text-ink transition-colors hover:bg-paper sm:h-14 sm:px-8"
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
