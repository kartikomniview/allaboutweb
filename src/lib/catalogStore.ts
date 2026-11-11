// A store's details as the public catalog shows them. They come from the
// store's own settings (backend-api: stores/{slug}), entered at registration
// and in the admin's Store settings.

import { STORE } from "@/components/furniture-catalog/data";
import { DEMO_STORE_SLUG } from "./catalogDomain";
import { toBusinessTypes, type BusinessTypeId } from "./taxonomy";

/** The store fields returned by GET /catalog/{store}/products. */
export type PublicStore = {
  slug: string;
  name: string;
  /** Digits only, with the country code (wa.me format), e.g. 919876543210. */
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  tagline: string;
  category: string;
  since: number | null;
  coverImage: string;
  /** What the store sells (src/lib/taxonomy.ts). */
  businessTypes: BusinessTypeId[];
};

export type CatalogStore = PublicStore & {
  /** The letter in the round logo. */
  initial: string;
  /** The demo store keeps the "try it" WhatsApp dialog and the sample rating. */
  isDemo: boolean;
  rating: number | null;
  reviewCount: number | null;
  deliveryArea: string;
};

const str = (v: unknown) => (typeof v === "string" ? v : "");

export function toCatalogStore(raw: Record<string, unknown>): CatalogStore {
  const slug = str(raw.slug);
  const name = str(raw.name) || slug;
  const isDemo = slug === DEMO_STORE_SLUG;
  return {
    slug,
    name,
    whatsapp: str(raw.whatsapp).replace(/\D/g, ""),
    phone: str(raw.phone),
    email: str(raw.email),
    address: str(raw.address),
    hours: str(raw.hours),
    tagline: str(raw.tagline),
    category: str(raw.category),
    since: typeof raw.since === "number" ? raw.since : null,
    coverImage: str(raw.coverImage),
    businessTypes: toBusinessTypes(raw.businessTypes),
    initial: (name.match(/[\p{L}\p{N}]/u)?.[0] ?? "S").toUpperCase(),
    isDemo,
    // Sample figures for the demo only; real stores show no made-up rating.
    rating: isDemo ? STORE.rating : null,
    reviewCount: isDemo ? STORE.reviewCount : null,
    deliveryArea: isDemo ? STORE.deliveryArea : "",
  };
}

/** A tel: link for a phone number as typed ("+91 98765 43210" -> "tel:+919876543210"). */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
