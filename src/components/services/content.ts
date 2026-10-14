/**
 * Copy for the three service pages (/website-services, /e-catalog-services,
 * /pdf-services). Prices come from FEATURED_SERVICES in the landing data so
 * the landing page and the service pages always agree.
 */
import {
  Armchair,
  BadgeIndianRupee,
  Building2,
  Camera,
  FileImage,
  Gauge,
  Globe,
  ImageIcon,
  LayoutGrid,
  Link2,
  ListChecks,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Palette,
  PencilLine,
  Printer,
  RefreshCw,
  Search,
  Send,
  Server,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Store,
  Tags,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { FEATURED_SERVICES } from "@/components/landing/data";
import type { FaqItem } from "@/components/landing/Faq";
import { SERVICE_PAGES, type ServiceKey } from "@/lib/contact";

const S3 = "https://aawsite.s3.ap-south-1.amazonaws.com/website/landing";

export type Feature = { icon: LucideIcon; title: string; description?: string };

export type ServicePage = {
  key: ServiceKey;
  name: string;
  /** Starting price in ₹, formatted */
  price: string;
  priceSuffix?: string;
  hero: {
    eyebrow: string;
    title: string;
    /** Part of the title shown in the brand colour */
    highlight: string;
    /** Used for search engines (structured data), not shown on the page */
    intro: string;
    /** Share-preview image */
    image: string;
  };
  whatsappMessage: string;
  features: Feature[];
  /** Compact second grid: who it's for / how it works / what we need */
  audience: Feature[];
  /** What the starting price includes */
  included: string[];
  faqs: FaqItem[];
};

function priceOf(key: ServiceKey) {
  const service = FEATURED_SERVICES.find((s) => s.page === SERVICE_PAGES[key]);
  if (!service) throw new Error(`No featured service for "${key}"`);
  return { price: service.price, priceSuffix: service.priceSuffix };
}

export const WEBSITE_PAGE: ServicePage = {
  key: "website",
  name: "Website Development",
  ...priceOf("website"),
  hero: {
    eyebrow: "Website development",
    title: "A website that brings you",
    highlight: "real enquiries",
    intro:
      "Fast, mobile-friendly business websites that show up on Google and send customer enquiries straight to your WhatsApp.",
    image: `${S3}/services/websites/2.webp`,
  },
  whatsappMessage: "Hi AllAboutWeb, I'm interested in a website for my business. Please share the details.",
  features: [
    { icon: Smartphone, title: "Mobile-first design" },
    { icon: Search, title: "Shows on Google" },
    { icon: MessageCircle, title: "WhatsApp & call buttons" },
    { icon: Gauge, title: "Fast loading" },
    { icon: MousePointerClick, title: "Enquiry form" },
    { icon: MapPin, title: "Google Maps" },
    { icon: Server, title: "Domain & hosting setup" },
    { icon: RefreshCw, title: "Easy updates" },
  ],
  audience: [
    { icon: Armchair, title: "Showrooms", description: "Furniture, decor, tiles and more" },
    { icon: Store, title: "Retail shops", description: "Local stores and boutiques" },
    { icon: Building2, title: "Manufacturers", description: "Wholesalers and traders" },
    { icon: Wrench, title: "Service businesses", description: "Clinics, studios, contractors" },
  ],
  included: [
    "Up to 5 pages (Home, About, Products/Services, Gallery, Contact)",
    "Mobile-friendly, fast-loading design",
    "Basic Google SEO setup",
    "WhatsApp, call and enquiry buttons",
    "Google Maps on the contact page",
    "Domain & hosting setup help",
  ],
  faqs: [
    {
      question: "How long does it take to build a website?",
      answer: "Most business websites are ready within one to two weeks, depending on the number of pages and how quickly we receive your content.",
    },
    {
      question: "Can I use the template shown on this page?",
      answer: "Yes. We customise the template with your logo, colours, photos and products, so it looks like it was made just for your business.",
    },
    {
      question: "Do you provide hosting and domain?",
      answer: "Yes — we can set up hosting and a domain for you, or work with a domain and hosting you already have, whichever is easier.",
    },
    {
      question: "Will my website show on Google?",
      answer: "We set up the SEO basics — page titles, descriptions, sitemap and Google Search Console — so Google can find and list your site.",
    },
    {
      question: "Can I update the website later?",
      answer: "Yes. Send us new products, photos or offers anytime and we'll update the website for you.",
    },
  ],
};

export const ECATALOG_PAGE: ServicePage = {
  key: "ecatalog",
  name: "E-Catalog",
  ...priceOf("ecatalog"),
  hero: {
    eyebrow: "E-Catalog",
    title: "Your full product range in",
    highlight: "one link",
    intro:
      "A mobile e-catalog customers can browse like an app — products, prices and offers in one shareable link, with enquiries coming straight to your WhatsApp.",
    image: `${S3}/services/e-catalog/1.webp`,
  },
  whatsappMessage: "Hi AllAboutWeb, I'm interested in an e-catalog for my business. Please share the details.",
  features: [
    { icon: LayoutGrid, title: "Categories & search" },
    { icon: ImageIcon, title: "Product detail pages" },
    { icon: ShoppingCart, title: "Cart → WhatsApp enquiry" },
    { icon: Tags, title: "Offers & discounts" },
    { icon: RefreshCw, title: "Update prices anytime" },
    { icon: Smartphone, title: "No app needed" },
    { icon: Link2, title: "One shareable link" },
    { icon: Server, title: "Hosting included" },
  ],
  audience: [
    { icon: Send, title: "Share the link", description: "Send it on WhatsApp or post it on social media" },
    { icon: Search, title: "Customer browses", description: "They explore categories and products on their phone" },
    { icon: ShoppingBag, title: "Adds to cart", description: "They pick the products they like" },
    { icon: MessageCircle, title: "You get the enquiry", description: "The list lands on your WhatsApp, ready to close" },
  ],
  included: [
    "Your products, prices and photos in one catalog",
    "Categories, search and product detail pages",
    "Cart that sends enquiries to your WhatsApp",
    "Hosting — no domain or server needed",
    "Price and product updates whenever you need",
  ],
  faqs: [
    {
      question: "What does ₹299/month include?",
      answer: "Hosting, your catalog link and keeping it running. Tell us how many products you have and we'll confirm the exact plan for your business.",
    },
    {
      question: "Do my customers need to install an app?",
      answer: "No. The e-catalog opens in any phone browser from a single link — just like the demo on this page.",
    },
    {
      question: "Can I update my products and prices later?",
      answer: "Yes. Send us new products, prices or images anytime and we'll update your e-catalog.",
    },
    {
      question: "Can you create the catalog from my existing product images?",
      answer: "Yes. Send over the photos and details you already have and we'll set up the catalog around them — a professional photoshoot isn't required.",
    },
    {
      question: "Can I share the e-catalog on WhatsApp?",
      answer: "Yes. Every e-catalog comes with a single shareable link that opens straight from WhatsApp, Instagram, or anywhere else.",
    },
  ],
};

export const PDF_PAGE: ServicePage = {
  key: "pdf",
  name: "Product Catalog PDF",
  ...priceOf("pdf"),
  hero: {
    eyebrow: "Product catalog PDF",
    title: "A catalog customers",
    highlight: "save and share",
    intro:
      "Neat, branded product catalogs designed as a PDF — ready to send on WhatsApp, email to buyers or print for your showroom.",
    image: `${S3}/services/pdf-catalog/1.webp`,
  },
  whatsappMessage: "Hi AllAboutWeb, I'm interested in a product catalog PDF. Please share the details.",
  features: [
    { icon: Palette, title: "Branded design" },
    { icon: Printer, title: "Print ready" },
    { icon: Send, title: "WhatsApp-friendly size" },
    { icon: BadgeIndianRupee, title: "Prices & product details" },
    { icon: Camera, title: "Uses your existing photos" },
    { icon: PencilLine, title: "Easy to update" },
  ],
  audience: [
    { icon: FileImage, title: "Product photos", description: "Whatever you have — phone photos work too" },
    { icon: ListChecks, title: "Product list", description: "Names, codes, sizes and prices" },
    { icon: Palette, title: "Your logo & colours", description: "Or we suggest a look for you" },
    { icon: Globe, title: "Contact details", description: "Phone, address, website and social links" },
  ],
  included: [
    "Custom cover and branded page layout",
    "Product pages with photos, details and prices",
    "Print-ready PDF and a WhatsApp-sized version",
    "2 rounds of revisions",
  ],
  faqs: [
    {
      question: "How long does a PDF catalog take?",
      answer: "Usually a few days to a week, depending on the number of products and how quickly we receive your photos and details.",
    },
    {
      question: "Can you create the catalog from my existing product images?",
      answer: "Yes. Send over the photos and details you already have and we'll design the catalog around them — a professional photoshoot isn't required.",
    },
    {
      question: "Will the file be small enough for WhatsApp?",
      answer: "Yes. You get a WhatsApp-friendly version for sharing and a high-resolution version for printing.",
    },
    {
      question: "Can I update the catalog later?",
      answer: "Yes. Send us new products or prices and we'll update the catalog for you.",
    },
    {
      question: "What's the difference between a PDF catalog and an e-catalog?",
      answer: "A PDF is a file customers save, print or forward. An e-catalog is a live link with search, cart and always-current prices. Many businesses use both.",
    },
  ],
};

/** PDF catalogs we've designed for clients (landscape spreads, served from public/) */
export const PDF_SAMPLES = [
  { src: "/pdf-catalog/designed/1.webp", alt: "Product catalog PDF design by AllAboutWeb" },
  { src: "/pdf-catalog/designed/2.webp", alt: "Branded catalog pages designed by AllAboutWeb" },
];

/** Ready-made PDF catalog templates (landscape spreads, served from public/) */
export const PDF_TEMPLATES = [1, 2, 3, 4, 5].map((n) => ({
  src: `/pdf-catalog/${n}.webp`,
  alt: `PDF catalog template ${n} — product pages with prices, materials and dimensions`,
}));
