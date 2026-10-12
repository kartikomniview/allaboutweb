// Loads the published e-catalog products from the public API route
// (backend-api: GET /catalog/products). Called from the catalog page on the server.

import { normalizeProduct, type CatalogProduct } from "./adminProducts";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

// Admin changes expire this tag right away (see refreshCatalog). The time-based
// refresh is a fallback for changes made outside the admin panel.
export const CATALOG_PRODUCTS_TAG = "catalog-products";
export const CATALOG_REVALIDATE_SECONDS = 60;

// Throws when the API can't be reached. During a background refresh Next.js
// then keeps serving the last good page instead of caching an empty catalog.
export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");

  const res = await fetch(`${API_BASE}/catalog/products`, {
    next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_PRODUCTS_TAG] },
  });
  if (!res.ok) throw new Error(`Catalog products request failed (${res.status})`);

  const data: { products?: Record<string, unknown>[] } = await res.json();
  return (data.products ?? []).map(normalizeProduct).filter((p) => p.isActive);
}
