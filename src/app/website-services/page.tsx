import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Faq from "@/components/landing/Faq";
import LeadForm from "@/components/landing/LeadForm";
import Process from "@/components/landing/Process";
import RevealObserver from "@/components/landing/RevealObserver";
import Section from "@/components/landing/ui/Section";
import SectionHeading from "@/components/landing/ui/SectionHeading";
import { WEBSITE_PAGE as PAGE } from "@/components/services/content";
import FeatureGrid, { FeatureRow } from "@/components/services/FeatureGrid";
import { serviceMetadata } from "@/components/services/metadata";
import PlanCard from "@/components/services/PlanCard";
import ServiceHero, { ShowcaseCaption } from "@/components/services/ServiceHero";
import ServiceJsonLd from "@/components/services/ServiceJsonLd";
import SitePreview from "@/components/services/SitePreview";

export const metadata: Metadata = serviceMetadata(
  PAGE,
  `Website Development from ₹${PAGE.price} — AllAboutWeb`,
  "Mobile-friendly business websites that show up on Google and send enquiries to your WhatsApp. See a live template and our recent work."
);

export default function WebsiteServicesPage() {
  return (
    <>
      <ServiceJsonLd page={PAGE} />
      <Header />
      <main>
        <ServiceHero page={PAGE}>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-6">
            <div id="template" className="scroll-mt-24">
              <ShowcaseCaption eyebrow="Live template" title="Furniture store website" />
              <SitePreview
                src="https://furnora-omega.vercel.app/"
                label="Furniture store template"
                title="Live preview of a furniture store website template"
              />
            </div>
            <div id="recent-project" className="scroll-mt-24">
              <ShowcaseCaption eyebrow="Recent project" title="Home Style Furnitures" />
              <SitePreview
                src="https://homestylefurnitures.com/"
                label="Home Style Furnitures"
                title="Live preview of the Home Style Furnitures website"
                liveHref="https://homestylefurnitures.com/"
              />
            </div>
          </div>
        </ServiceHero>

        <Section id="features">
          <SectionHeading eyebrow="What you get" title="Everything a business website needs" />
          <div className="mt-6 sm:mt-10">
            <FeatureRow items={PAGE.features} label="What you get" />
          </div>
        </Section>

        <Section id="who-its-for" tone="paper">
          <SectionHeading eyebrow="Who it's for" title="Built for growing local businesses" />
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
        <Faq items={PAGE.faqs} description="Common questions about our website service." />
        <LeadForm initialService={PAGE.key} />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
