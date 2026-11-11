// Loads a store's details and published products from the public API route
// (backend-api: GET /catalog/{store}/products). Called from the store pages on the server.

import { normalizeProduct, type CatalogProduct } from "./adminProducts";
import { STORE_SLUG_RE } from "./catalogDomain";
import { toCatalogStore, type CatalogStore } from "./catalogStore";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

// Admin changes expire the store's tag right away (see refreshCatalog). The
// time-based refresh is a fallback for changes made outside the admin panel.
export const catalogTag = (slug: string) => `catalog:${slug}`;
export const CATALOG_REVALIDATE_SECONDS = 60;

export type StoreCatalog = { store: CatalogStore; products: CatalogProduct[] };
/** A store switched off by a Catalog24 admin: only its name is known. */
export type InactiveStore = { inactive: true; name: string };

export const isInactive = (catalog: StoreCatalog | InactiveStore | null): catalog is InactiveStore =>
  !!catalog && "inactive" in catalog;

// Returns null when there is no such store, and InactiveStore when it is switched
// off. Throws when the API can't be reached: during a background refresh Next.js
// then keeps serving the last good page instead of caching an empty catalog.
export async function getStoreCatalog(slug: string): Promise<StoreCatalog | InactiveStore | null> {
  if (!STORE_SLUG_RE.test(slug)) return null;
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");

  const res = await fetch(`${API_BASE}/catalog/${slug}/products`, {
    next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [catalogTag(slug)] },
  });
  if (res.status === 404) return null;
  if (res.status === 403) {
    const body: { code?: string; store?: { name?: string } } = await res.json().catch(() => ({}));
    if (body.code === "STORE_INACTIVE") return { inactive: true, name: body.store?.name || slug };
  }
  if (!res.ok) throw new Error(`Catalog request for "${slug}" failed (${res.status})`);

  const data: { store?: Record<string, unknown>; products?: Record<string, unknown>[] } = await res.json();
  return {
    store: toCatalogStore(data.store ?? { slug }),
    products: (data.products ?? []).map(normalizeProduct).filter((p) => p.isActive),
  };
}
