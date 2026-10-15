import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import CtaLink from "@/components/CtaLink";
import Catalog24Footer from "@/components/catalog24/Catalog24Footer";
import Catalog24Header from "@/components/catalog24/Catalog24Header";
import Faq from "@/components/landing/Faq";
import LeadForm from "@/components/landing/LeadForm";
import Process from "@/components/landing/Process";
import RevealObserver from "@/components/landing/RevealObserver";
import HScroll from "@/components/landing/ui/HScroll";
import Section from "@/components/landing/ui/Section";
import SectionHeading from "@/components/landing/ui/SectionHeading";
import { ECATALOG_PAGE as PAGE, PDF_SAMPLES, PDF_TEMPLATES } from "@/components/services/content";
import FeatureGrid, { FeatureRow } from "@/components/services/FeatureGrid";
import DemoLauncher from "@/components/catalog24/DemoLauncher";
import PlanCard from "@/components/services/PlanCard";
import ServiceHero, { ShowcaseCaption } from "@/components/services/ServiceHero";
import ServiceJsonLd from "@/components/services/ServiceJsonLd";
import { CATALOG_DEMO_BASE } from "@/lib/catalogDomain";
import { pricingHref } from "@/lib/contact";

// The catalog24.in home page, served at "/" on that domain by src/proxy.ts
// (on any other domain this route redirects to catalog24.in).

const TITLE = "Catalog24 — Your product catalog in one link";
const DESCRIPTION =
  "A mobile e-catalog for your business: products, prices and offers in one shareable link, with enquiries straight to your WhatsApp. Try the live demo.";
const SHARE_IMAGE = { url: PAGE.hero.image, alt: "Catalog24 e-catalog by AllAboutWeb" };

// The ready-made templates, then catalogs designed for clients (same images as /pdf-services).
const PDF_DESIGNS = [...PDF_TEMPLATES, ...PDF_SAMPLES];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { type: "website", siteName: "Catalog24", title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE] },
};

function DesignImage({
  src,
  alt,
  sizes,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-card border border-line bg-white shadow-card ${className}`}>
      <Image src={src} alt={alt} width={1400} height={988} sizes={sizes} className="block h-auto w-full" />
    </div>
  );
}

export default function Catalog24HomePage() {
  return (
    <>
      <ServiceJsonLd page={PAGE} />
      <Catalog24Header />
      <main>
        <ServiceHero page={PAGE}>
          <div id="demo" className="mx-auto max-w-[24rem] scroll-mt-24 text-center">
            <ShowcaseCaption eyebrow="Live demo" title="Furniture e-catalog — tap around" />
            <DemoLauncher
              src={CATALOG_DEMO_BASE}
              title="Live demo of a furniture e-catalog"
              fullDemoHref={CATALOG_DEMO_BASE}
            />
            <CtaLink href={CATALOG_DEMO_BASE} variant="secondary" className="group mt-5 gap-2">
              Open full demo
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </CtaLink>
          </div>
        </ServiceHero>

        <Section id="work">
          <SectionHeading
            eyebrow="Our work"
            title="Choose your catalog design"
            description="We also design print-ready PDF catalogs — send them on WhatsApp alongside your e-catalog link."
          />
          {/* Mobile: one below the other. Larger screens: a side-scrolling row. */}
          <div className="mt-6 flex flex-col gap-4 md:hidden">
            {PDF_DESIGNS.map((design) => (
              <DesignImage key={design.src} {...design} sizes="100vw" />
            ))}
          </div>
          <HScroll label="Catalog designs" className="mt-10 hidden md:block">
            {PDF_DESIGNS.map((design) => (
              <DesignImage
                key={design.src}
                {...design}
                sizes="(min-width: 1152px) 560px, 50vw"
                className="w-[calc(50%-0.75rem)] shrink-0 snap-start"
              />
            ))}
          </HScroll>
          <p className="mt-6 text-center text-sm text-slate">
            Want a PDF catalog too?{" "}
            <Link href={pricingHref("pdf")} className="font-semibold text-primary hover:text-ink">
              Get a quote →
            </Link>
          </p>
        </Section>

        <Section id="features" tone="paper">
          <SectionHeading eyebrow="Features" title="Everything customers need to browse and buy" />
          <div className="mt-6 sm:mt-10">
            <FeatureRow items={PAGE.features} label="Features" />
          </div>
        </Section>

        <Section id="how-customers-use-it">
          <SectionHeading eyebrow="How it works for you" title="From one link to a WhatsApp enquiry" />
          <div className="mt-6 sm:mt-10">
            <FeatureGrid items={PAGE.audience} />
          </div>
        </Section>

        <Section id="pricing" tone="paper">
          <SectionHeading align="center" eyebrow="Pricing" title="Simple, honest pricing" />
          <div className="mt-6 sm:mt-10">
            <PlanCard page={PAGE} />
          </div>
        </Section>

        <Process />
        <Faq items={PAGE.faqs} description="Common questions about Catalog24 e-catalogs." />
        <LeadForm initialService={PAGE.key} />
      </main>
      <Catalog24Footer />
      <RevealObserver />
    </>
  );
}
