"use server";

// Server action the admin panel calls after changing products or store
// details, so the store's public catalog shows the change on its next load
// instead of after the time-based refresh (CATALOG_REVALIDATE_SECONDS).

import { updateTag } from "next/cache";
import { catalogTag } from "./catalogProducts";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

// Server actions are public endpoints, so only a valid admin session may
// expire the cache, and only for that admin's own store.
export async function refreshCatalog(token: string, deviceId: string): Promise<void> {
  if (!API_BASE || !token || !deviceId) return;

  const res = await fetch(`${API_BASE}/auth/session`, {
    headers: { authorization: `Bearer ${token}`, "x-device-id": deviceId },
    cache: "no-store",
  });
  if (!res.ok) return;

  const data: { user?: { store?: { slug?: unknown } } } = await res.json();
  const slug = data.user?.store?.slug;
  if (typeof slug === "string" && slug) updateTag(catalogTag(slug));
}

// A super admin switched a store on or off: show it on the store's link right away.
export async function refreshStoreCatalog(token: string, deviceId: string, slug: string): Promise<void> {
  if (!API_BASE || !token || !deviceId || !/^[a-z0-9]{3,30}$/.test(slug)) return;

  const res = await fetch(`${API_BASE}/auth/session`, {
    headers: { authorization: `Bearer ${token}`, "x-device-id": deviceId },
    cache: "no-store",
  });
  if (!res.ok) return;

  const data: { user?: { isSuperAdmin?: unknown } } = await res.json();
  if (data.user?.isSuperAdmin === true) updateTag(catalogTag(slug));
}
