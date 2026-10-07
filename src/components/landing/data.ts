/**
 * All landing-page content in one place. Edit copy, prices and images here.
 * Anything marked `TODO: replace` is placeholder content — swap it for real
 * data (or remove it) before going live.
 */
import {
  FileText,
  Globe,
  LayoutGrid,
  MapPin,
  Megaphone,
  MousePointerClick,
  Palette,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { pricingHref, whatsappUrl } from "@/lib/contact";

const S3 = "https://aawsite.s3.ap-south-1.amazonaws.com/website/landing";

const enquire = (service: string) =>
  whatsappUrl(`Hi AllAboutWeb, I'm interested in ${service}. Please share the details.`);

export type Service = {
  /** Also the element id, so `/#<id>` links scroll to the card */
  id: string;
  name: string;
  /** Short label for the mobile icon grid */
  shortName: string;
  description: string;
  /** Starting price in ₹, formatted */
  price: string;
  icon: LucideIcon;
  image?: string;
  /** Square photo for the mobile quick-access grid (`${S3}/thumbs/<id>.webp`) */
  thumb?: string;
  href: string;
  badge?: string;
  features?: string[];
};

/** Core services — open the multi-step pricing form for that service. */
export const FEATURED_SERVICES: Service[] = [
  {
    id: "website-development",
    name: "Website Development",
    shortName: "Website",
    description: "A fast, mobile-friendly website that shows up on Google and brings enquiries.",
    price: "9,999",
    icon: Globe,
    image: `${S3}/services/websites/1.webp`,
    href: pricingHref("website"),
    features: ["Works on every phone", "Shows on Google", "WhatsApp button"],
  },
  {
    id: "e-catalog",
    name: "E-Catalog",
    shortName: "E-Catalog",
    description: "All your products and prices in one link customers can browse on their phone.",
    price: "4,999",
    icon: LayoutGrid,
    image: `${S3}/services/e-catalog/1.webp`,
    href: pricingHref("ecatalog"),
    badge: "Most popular",
    features: ["One shareable link", "Update prices anytime", "No app needed"],
  },
  {
    id: "product-catalog-pdf",
    name: "Product Catalog PDF",
    shortName: "PDF Catalog",
    description: "A neat, branded catalog customers can save, print or forward on WhatsApp.",
    price: "2,999",
    icon: FileText,
    image: `${S3}/services/pdf-catalog/1.webp`,
    href: pricingHref("pdf"),
    features: ["Print ready", "Send on WhatsApp", "Easy to update"],
  },
];

/** TODO: replace — placeholder services and prices, edit or remove as needed. */
export const MORE_SERVICES: Service[] = [
  {
    id: "landing-page",
    name: "Landing Page",
    shortName: "Landing Page",
    description: "One focused page that turns ad clicks into enquiries.",
    price: "4,999",
    icon: MousePointerClick,
    href: enquire("a Landing Page"),
  },
  {
    id: "ecommerce-store",
    name: "E-commerce Store",
    shortName: "Online Store",
    description: "Sell online with cart, payments and order management.",
    price: "24,999",
    icon: ShoppingBag,
    href: enquire("an E-commerce Store"),
  },
  {
    id: "logo-branding",
    name: "Logo & Branding",
    shortName: "Branding",
    description: "Logo, brand colours and visiting card design.",
    price: "2,499",
    icon: Palette,
    href: enquire("Logo & Branding"),
  },
  {
    id: "google-business-profile",
    name: "Google Business Profile",
    shortName: "Google Profile",
    description: "Get found on Google Maps by customers near you.",
    price: "1,999",
    icon: MapPin,
    href: enquire("Google Business Profile setup"),
  },
  {
    id: "social-media-creatives",
    name: "Social Media Creatives",
    shortName: "Social Posts",
    description: "Posts and banners for Instagram, Facebook and WhatsApp.",
    price: "2,999",
    icon: Megaphone,
    href: enquire("Social Media Creatives"),
  },
];

export const ALL_SERVICES = [...FEATURED_SERVICES, ...MORE_SERVICES];

export type Banner = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  cta: { label: string; href: string };
};

/** Hero carousel slides. */
export const BANNERS: Banner[] = [
  {
    id: "website",
    eyebrow: "Websites from ₹9,999",
    title: "Get your business online — the right way",
    description: "Mobile-friendly, shows on Google, enquiries straight to WhatsApp.",
    image: `${S3}/hero/website.webp`,
    cta: { label: "Get a website", href: pricingHref("website") },
  },
  {
    id: "ecatalog",
    eyebrow: "E-Catalogs from ₹4,999",
    title: "Your full product range in one link",
    description: "Customers browse products and prices — no app needed.",
    image: `${S3}/hero/ecatalog.webp`,
    cta: { label: "Try the live demo", href: "/app/catalog/furniture" },
  },
  {
    id: "pdf",
    eyebrow: "PDF Catalogs from ₹2,999",
    title: "A catalog customers save and share",
    description: "Branded, print-ready and perfect for WhatsApp.",
    image: `${S3}/hero/pdf.webp`,
    cta: { label: "Design my catalog", href: pricingHref("pdf") },
  },
];

/** Facts, not claims — every one of these is true today. */
export const STATS = [
  { value: "₹2,999", label: "Starting price" },
  { value: "1–2 wks", label: "Typical delivery" },
  { value: "1-on-1", label: "Direct contact" },
];

export type WorkItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  link?: { href: string; label: string };
  badge?: string;
};

export const WORK: WorkItem[] = [
  {
    id: "work-website",
    category: "Website",
    title: "Home Style Furnitures",
    description: "Business website showcasing collections and bringing in enquiries.",
    image: `${S3}/works/website/1.webp`,
    link: { href: "https://homestylefurnitures.com/", label: "Visit live site" },
  },
  {
    id: "work-ecatalog",
    category: "E-Catalog",
    title: "Furniture Product Catalog",
    description: "A shareable catalog customers browse by category from one link.",
    image: `${S3}/services/e-catalog/1.webp`,
    link: { href: "/app/catalog/furniture", label: "Open live demo" },
    badge: "Live demo",
  },
  {
    id: "work-pdf-catalog",
    category: "PDF Catalog",
    title: "Catalog Designs",
    description: "Branded PDF catalogs ready to share on WhatsApp or print.",
    image: `${S3}/works/pdf-catalog/1.webp`,
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  business: string;
  city: string;
};

/**
 * TODO: replace with real client reviews (or empty the array to hide the
 * section). Never publish invented reviews.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Sample review — replace with a real quote from a client about their website or catalog.",
    name: "Client Name",
    business: "Business Name",
    city: "City",
  },
  {
    quote:
      "Sample review — replace with a real quote from a client about the process and support.",
    name: "Client Name",
    business: "Business Name",
    city: "City",
  },
  {
    quote:
      "Sample review — replace with a real quote from a client about results they saw.",
    name: "Client Name",
    business: "Business Name",
    city: "City",
  },
];
