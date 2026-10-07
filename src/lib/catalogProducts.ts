// Loads the published e-catalog products from the public API route
// (backend-api: GET /catalog/products). Called from the catalog page on the server.

import { normalizeProduct, type CatalogProduct } from "./adminProducts";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

// The page is regenerated in the background at most once per minute, so admin
// changes show up on the catalog within about a minute.
export const CATALOG_REVALIDATE_SECONDS = 60;

// Throws when the API can't be reached. During a background refresh Next.js
// then keeps serving the last good page instead of caching an empty catalog.
export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");

  const res = await fetch(`${API_BASE}/catalog/products`, {
    next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["catalog-products"] },
  });
  if (!res.ok) throw new Error(`Catalog products request failed (${res.status})`);

  const data: { products?: Record<string, unknown>[] } = await res.json();
  return (data.products ?? []).map(normalizeProduct).filter((p) => p.isActive);
}
