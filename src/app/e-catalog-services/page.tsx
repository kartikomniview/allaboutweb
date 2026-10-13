import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import CtaLink from "@/components/CtaLink";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Faq from "@/components/landing/Faq";
import LeadForm from "@/components/landing/LeadForm";
import Process from "@/components/landing/Process";
import RevealObserver from "@/components/landing/RevealObserver";
import Section from "@/components/landing/ui/Section";
import SectionHeading from "@/components/landing/ui/SectionHeading";
import { ECATALOG_PAGE as PAGE } from "@/components/services/content";
import FeatureGrid, { FeatureRow } from "@/components/services/FeatureGrid";
import { serviceMetadata } from "@/components/services/metadata";
import PhoneFrame from "@/components/services/PhoneFrame";
import PlanCard from "@/components/services/PlanCard";
import ServiceHero, { ShowcaseCaption } from "@/components/services/ServiceHero";
import ServiceJsonLd from "@/components/services/ServiceJsonLd";

const DEMO_PATH = "/app/catalog/furniture";

export const metadata: Metadata = serviceMetadata(
  PAGE,
  `E-Catalog from ₹${PAGE.price}${PAGE.priceSuffix ?? ""} — AllAboutWeb`,
  "Your products and prices in one shareable link, with enquiries on WhatsApp. Try the live furniture e-catalog demo."
);

export default function ECatalogServicesPage() {
  return (
    <>
      <ServiceJsonLd page={PAGE} />
      <Header />
      <main>
        <ServiceHero page={PAGE}>
          <div id="demo" className="mx-auto max-w-[22rem] scroll-mt-24 text-center">
            <ShowcaseCaption eyebrow="Live demo" title="Furniture e-catalog — tap around" />
            <PhoneFrame src={DEMO_PATH} title="Live demo of a furniture e-catalog" />
            <CtaLink href={DEMO_PATH} variant="secondary" className="group mt-5 gap-2">
              Open full demo
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </CtaLink>
          </div>
        </ServiceHero>

        <Section id="features">
          <SectionHeading eyebrow="Features" title="Everything customers need to browse and buy" />
          <div className="mt-6 sm:mt-10">
            <FeatureRow items={PAGE.features} label="Features" />
          </div>
        </Section>

        <Section id="how-customers-use-it" tone="paper">
          <SectionHeading eyebrow="How it works for you" title="From one link to a WhatsApp enquiry" />
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
        <Faq items={PAGE.faqs} description="Common questions about our e-catalog service." />
        <LeadForm initialService={PAGE.key} />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
