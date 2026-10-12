"use server";

// Server action the admin panel calls after changing products, so the public
// e-catalog shows the change on its next load instead of after the
// time-based refresh (CATALOG_REVALIDATE_SECONDS).

import { updateTag } from "next/cache";
import { CATALOG_PRODUCTS_TAG } from "./catalogProducts";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

// Server actions are public endpoints, so only a valid admin session may
// expire the cache (otherwise anyone could force a refetch on every request).
export async function refreshCatalog(token: string, deviceId: string): Promise<void> {
  if (!API_BASE || !token || !deviceId) return;

  const res = await fetch(`${API_BASE}/auth/session`, {
    headers: { authorization: `Bearer ${token}`, "x-device-id": deviceId },
    cache: "no-store",
  });
  if (!res.ok) return;

  updateTag(CATALOG_PRODUCTS_TAG);
}
