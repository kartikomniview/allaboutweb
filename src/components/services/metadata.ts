import type { Metadata } from "next";
import type { ServicePage } from "./content";

/**
 * Page metadata for a service page. A page's `openGraph` replaces the root
 * layout's entirely, so the site name and share image are set again here.
 */
export function serviceMetadata(page: ServicePage, title: string, description: string): Metadata {
  const image = { url: page.hero.image, alt: `${page.name} by AllAboutWeb` };

  return {
    title,
    description,
    openGraph: { type: "website", siteName: "AllAboutWeb", title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
