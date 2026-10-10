import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import Work from "@/components/landing/Work";
import Process from "@/components/landing/Process";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import LeadForm from "@/components/landing/LeadForm";
import RevealObserver from "@/components/landing/RevealObserver";
import { FEATURED_SERVICES } from "@/components/landing/data";
import { WHATSAPP_NUMBER } from "@/lib/contact";

// Structured data so search engines know what we offer and where
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "AllAboutWeb",
  description:
    "Websites, shareable e-catalogs and product catalog PDFs for small and growing businesses across India.",
  telephone: `+${WHATSAPP_NUMBER}`,
  areaServed: { "@type": "Country", name: "India" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: FEATURED_SERVICES.map((service) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: service.name, description: service.description },
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "INR",
        minPrice: Number(service.price.replace(/,/g, "")),
      },
    })),
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main>
        <Hero />
        <Services />
        <Work />
        <Process />
        <Pricing />
        <Faq />
        <LeadForm />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
