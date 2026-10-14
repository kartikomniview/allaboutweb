import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Faq from "@/components/landing/Faq";
import LeadForm from "@/components/landing/LeadForm";
import Process from "@/components/landing/Process";
import RevealObserver from "@/components/landing/RevealObserver";
import HScroll from "@/components/landing/ui/HScroll";
import Section from "@/components/landing/ui/Section";
import SectionHeading from "@/components/landing/ui/SectionHeading";
import { PDF_PAGE as PAGE, PDF_SAMPLES, PDF_TEMPLATES } from "@/components/services/content";
import FeatureGrid, { FeatureRow } from "@/components/services/FeatureGrid";
import { serviceMetadata } from "@/components/services/metadata";
import PlanCard from "@/components/services/PlanCard";
import ServiceHero, { ShowcaseCaption } from "@/components/services/ServiceHero";
import ServiceJsonLd from "@/components/services/ServiceJsonLd";

export const metadata: Metadata = serviceMetadata(
  PAGE,
  `Product Catalog PDF from ₹${PAGE.price} — AllAboutWeb`,
  "Branded, print-ready product catalog PDFs that customers save and share on WhatsApp. Designed from your existing photos."
);

export default function PdfServicesPage() {
  return (
    <>
      <ServiceJsonLd page={PAGE} />
      <Header />
      <main>
        <ServiceHero page={PAGE}>
          <div id="samples" className="scroll-mt-24">
            <ShowcaseCaption eyebrow="Recent work" title="Catalogs we've designed" />
            <HScroll
              label="Sample catalog designs"
              gridClassName="items-start md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0"
            >
              {PDF_SAMPLES.map((sample, i) => (
                <div
                  key={sample.src}
                  className="w-[85%] shrink-0 snap-start overflow-hidden rounded-card border border-line bg-white shadow-card md:w-auto"
                >
                  <Image
                    src={sample.src}
                    alt={sample.alt}
                    width={1400}
                    height={988}
                    sizes="(min-width: 1152px) 560px, (min-width: 768px) 50vw, 85vw"
                    className="block h-auto w-full transition duration-500 hover:scale-105"
                    priority={i === 0}
                  />
                </div>
              ))}
            </HScroll>
          </div>
        </ServiceHero>

        <Section id="templates" tone="paper">
          <SectionHeading
            eyebrow="Templates"
            title="Browse our templates"
            description="Pick a layout you like and we'll fill it with your products, prices and brand."
          />
          <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-4 sm:mt-10 sm:gap-6">
            {PDF_TEMPLATES.map((template) => (
              <div
                key={template.src}
                data-reveal="up"
                className="overflow-hidden rounded-card border border-line bg-white shadow-card"
              >
                <Image
                  src={template.src}
                  alt={template.alt}
                  width={1400}
                  height={988}
                  sizes="(min-width: 896px) 896px, 100vw"
                  className="block h-auto w-full"
                />
              </div>
            ))}
          </div>
        </Section>

        <Section id="features">
          <SectionHeading eyebrow="What you get" title="A catalog that sells for you" />
          <div className="mt-6 sm:mt-10">
            <FeatureRow items={PAGE.features} label="What you get" />
          </div>
        </Section>

        <Section id="what-we-need" tone="paper">
          <SectionHeading
            eyebrow="Getting started"
            title="What we need from you"
            description="Send these on WhatsApp and we'll take care of the rest."
          />
          <div className="mt-6 sm:mt-10">
            <FeatureGrid items={PAGE.audience} />
          </div>
        </Section>

        <Section id="pricing">
          <SectionHeading align="center" eyebrow="Pricing" title="Simple, honest pricing" />
          <div className="mt-6 sm:mt-10">
            <PlanCard page={PAGE} />
          </div>
        </Section>

        <Process />
        <Faq items={PAGE.faqs} description="Common questions about our PDF catalog service." />
        <LeadForm initialService={PAGE.key} />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
