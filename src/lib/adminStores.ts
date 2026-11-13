// Super-admin API: every store's product limit and on/off switch, and its logins
// (backend-api: GET /admin/stores, PUT and DELETE /admin/stores/{slug}, /admin/stores/{slug}/users).

import { apiRequest, sessionCredentials } from "./adminAuth";
import type { WhatsappRequest } from "./adminStore";
import { refreshStoreCatalog } from "./catalogActions";

export type ManagedStore = {
  slug: string;
  name: string;
  /** The owner's login email. */
  email: string;
  active: boolean;
  /** Most products the store may have; null = unlimited. */
  productLimit: number | null;
  productCount: number;
  /** Logins of the store (the owner plus any added by a super admin). Missing from older API builds. */
  userCount?: number;
  /** The live WhatsApp number (digits); "" if none. Missing from older API builds. */
  whatsapp?: string;
  /** A number the owner asked for, waiting for approval (or rejected). */
  whatsappRequest?: WhatsappRequest | null;
  createdAt: string | null;
};

/** A change a super admin makes to a store. */
export type StoreAccessChange = {
  active?: boolean;
  productLimit?: number | null;
  /** Set the live number directly ("" removes it); also clears any request. */
  whatsapp?: string;
  /** Decide the owner's pending request. */
  whatsappDecision?: "approve" | "reject";
  rejectReason?: string;
};

/** One login of a store. Each is locked to the first device it logs in on. */
export type StoreUser = {
  uid: string;
  email: string;
  /** The account that registered the store; it can't be removed. */
  isOwner: boolean;
  deviceBound: boolean;
  deviceBoundAt: string | null;
  lastLoginAt: string | null;
  addedAt: string | null;
};

const usersPath = (slug: string, uid?: string) =>
  `/admin/stores/${encodeURIComponent(slug)}/users${uid ? `/${encodeURIComponent(uid)}` : ""}`;

export async function listStoreUsers(slug: string): Promise<StoreUser[]> {
  return (await apiRequest<{ users: StoreUser[] }>(usersPath(slug))).users;
}

/** Another login for the store, with the same access as its owner. */
export async function addStoreUser(slug: string, login: { email: string; password: string }): Promise<StoreUser> {
  return (await apiRequest<{ user: StoreUser }>(usersPath(slug), { method: "POST", body: JSON.stringify(login) })).user;
}

/** Frees the user's device lock and logs them out; their next login binds the new device. */
export async function resetUserDevice(slug: string, uid: string): Promise<StoreUser> {
  return (await apiRequest<{ user: StoreUser }>(`${usersPath(slug, uid)}/reset-device`, { method: "POST" })).user;
}

/** Deletes an extra login (never the store owner). */
export async function removeStoreUser(slug: string, uid: string): Promise<void> {
  await apiRequest(usersPath(slug, uid), { method: "DELETE" });
}

/** The Demo store: the landing page links to it, so it can't be deleted. */
export const DEMO_STORE_SLUG = "demo";

/**
 * Deletes the store for good: its products and images, every login (the owner's too)
 * and the store itself. `confirm` must be the slug. Not the Demo store or your own.
 */
export async function deleteStore(slug: string): Promise<{ products: number; users: number }> {
  const { deleted } = await apiRequest<{ deleted: { slug: string; products: number; users: number } }>(
    `/admin/stores/${encodeURIComponent(slug)}`,
    { method: "DELETE", body: JSON.stringify({ confirm: slug }) },
  );
  // Its link shows "Store unavailable" right away instead of the cached catalog (best effort).
  const { token, deviceId } = sessionCredentials();
  refreshStoreCatalog(token, deviceId, slug).catch(() => {});
  return deleted;
}

export async function listAllStores(): Promise<ManagedStore[]> {
  return (await apiRequest<{ stores: ManagedStore[] }>("/admin/stores")).stores;
}

export async function updateStoreAccess(slug: string, change: StoreAccessChange): Promise<ManagedStore> {
  const { store } = await apiRequest<{ store: ManagedStore }>(`/admin/stores/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify(change),
  });
  // Switching a store on/off or changing its WhatsApp number shows on its link right away (best effort).
  if (change.active !== undefined || change.whatsapp !== undefined || change.whatsappDecision === "approve") {
    const { token, deviceId } = sessionCredentials();
    refreshStoreCatalog(token, deviceId, slug).catch(() => {});
  }
  return store;
}
