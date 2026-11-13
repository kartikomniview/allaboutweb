import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Link2,
  MessageCircle,
  RefreshCw,
  Search,
  Sparkles,
  Store,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import Catalog24Footer from "@/components/catalog24/Catalog24Footer";
import Catalog24Header from "@/components/catalog24/Catalog24Header";
import DemoLauncher from "@/components/catalog24/DemoLauncher";
import RevealObserver from "@/components/landing/RevealObserver";
import { businessImage } from "@/lib/businessImages";
import { CATALOG_DEMO_BASE, CATALOG_ICONS } from "@/lib/catalogDomain";

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
  { icon: WandSparkles, title: "AI does the typing", text: "Snap a photo; the name, category and details are filled in.", tone: "violet" },
  { icon: Link2, title: "Your own link", text: "One simple link for your whole catalog. No app to install.", tone: "sky" },
  { icon: MessageCircle, title: "Enquiries on WhatsApp", text: "Customers tap a product and message you with its details.", tone: "emerald" },
  { icon: Search, title: "Search and filters", text: "Customers find products by category, price and more.", tone: "amber" },
  { icon: RefreshCw, title: "Always up to date", text: "Change a price or add a product and your link updates instantly.", tone: "rose" },
  { icon: Sparkles, title: "Looks great on phones", text: "A fast, clean catalog made for how your customers shop.", tone: "indigo" },
];

// "Made for every kind of shop". Each card's photo is on S3, named after its label
// (see businessImage in src/lib/businessImages.ts).
const BUSINESSES = [
  "Furniture",
  "Home decor",
  "Lighting",
  "Flooring",
  "Curtains & blinds",
  "Bath & sanitaryware",
  "Clothing & fabrics",
  "Footwear",
  "Jewellery & accessories",
  "Optical & eyewear",
  "Electronics",
  "Mobiles & accessories",
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
      className={`group inline-flex h-11 items-center justify-center gap-2 rounded-md bg-button px-7 text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(20,62,59,0.8)] transition-colors hover:bg-button-hover sm:h-14 sm:px-8 sm:text-base ${className}`}
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
        {/* Hero: a soft orange wash on phones, white on large screens */}
        <section className="bg-linear-to-b from-tint via-white to-white lg:bg-none lg:bg-white">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-14 header:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-20 lg:pt-20">
            <div className="text-center lg:text-left">
              <p
                data-reveal="up"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#c4501a] shadow-[0_1px_2px_rgba(196,80,26,0.15)] ring-1 ring-inset ring-primary/20 sm:bg-tint sm:text-xs sm:shadow-none sm:ring-0"
              >
                <WandSparkles className="h-3.5 w-3.5" aria-hidden />
                Add products with just a photo
              </p>
              <h1
                data-reveal="up"
                className="mx-auto mt-3 max-w-xl text-[1.625rem] font-bold leading-[1.2] tracking-[-0.025em] text-ink [--reveal-delay:80ms] sm:mt-4 sm:text-5xl sm:leading-[1.15] sm:tracking-[-0.03em] lg:mx-0 lg:text-[3.25rem]"
              >
                Your products in <span className="text-primary">one link</span>. Enquiries on{" "}
                <span className="text-emerald-600">WhatsApp</span>.
              </h1>
              <p
                data-reveal="up"
                className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate [--reveal-delay:160ms] sm:mt-4 sm:text-lg sm:leading-8 lg:mx-0"
              >
                Create your online catalog in minutes. Snap a product photo, AI fills in the details, and you share one link
                with your customers.
              </p>
              <div data-reveal="up" className="mt-6 flex flex-col items-center gap-2.5 [--reveal-delay:240ms] sm:mt-7 sm:gap-3 lg:items-start">
                <PrimaryCta className="w-full max-w-xs sm:w-auto" />
                <p className="text-[13px] text-slate sm:text-sm">
                  Already have a store?{" "}
                  <Link href="/login" className="font-semibold text-ink hover:text-primary">
                    Log in
                  </Link>
                </p>
              </div>
              <ul
                data-reveal="up"
                className="mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-1.5 [--reveal-delay:320ms] sm:mt-7 sm:gap-2 lg:mx-0 lg:justify-start"
              >
                {["Ready in 2 minutes", "No app to install", "Works on any phone"].map((point) => (
                  <li
                    key={point}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 ring-1 ring-inset ring-emerald-100 sm:text-[13px]"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* The live demo: a small button on phones, the phone preview on larger screens */}
            <div id="demo" data-reveal="up" className="-mt-2 mx-auto w-full max-w-[20rem] scroll-mt-24 text-center [--reveal-delay:160ms] sm:mt-0 sm:max-w-[22rem]">
              <DemoLauncher
                src={CATALOG_DEMO_BASE}
                title="Live demo of a Catalog24 store"
                fullDemoHref={CATALOG_DEMO_BASE}
                compactOnPhones
              />
              <p className="mt-3 hidden text-xs text-slate sm:block">A real store catalog. Tap to try it.</p>
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
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
              {BUSINESSES.map((label, i) => (
                <li
                  key={label}
                  data-reveal="up"
                  style={{ "--reveal-delay": `${(i % 4) * 60}ms` } as React.CSSProperties}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg bg-line/60"
                >
                  <Image
                    src={businessImage(label)}
                    alt=""
                    fill
                    sizes="(min-width: 1152px) 270px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                  {/* Keeps the label readable on any photo */}
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 px-2.5 py-2 text-xs font-semibold leading-tight text-white sm:px-3 sm:py-2.5 sm:text-sm lg:text-[15px]">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
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
              className="group mt-6 inline-flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-md bg-white px-7 text-[15px] font-semibold text-ink transition-colors hover:bg-paper sm:mt-7 sm:h-14 sm:w-auto sm:px-8 sm:text-base"
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
