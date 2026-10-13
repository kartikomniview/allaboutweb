import { WHATSAPP_NUMBER } from "@/lib/contact";
import type { ServicePage } from "./content";

/** Structured data telling search engines what the service is and what it costs. */
export default function ServiceJsonLd({ page }: { page: ServicePage }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.name,
    description: page.hero.intro,
    areaServed: { "@type": "Country", name: "India" },
    provider: {
      "@type": "ProfessionalService",
      name: "AllAboutWeb",
      telephone: `+${WHATSAPP_NUMBER}`,
    },
    offers: {
      "@type": "Offer",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        priceCurrency: "INR",
        minPrice: Number(page.price.replace(/,/g, "")),
        ...(page.priceSuffix === "/month" && { unitText: "MONTH" }),
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
