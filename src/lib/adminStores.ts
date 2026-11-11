// Super-admin API: every store's product limit and on/off switch
// (backend-api: GET /admin/stores, PUT /admin/stores/{slug}).

import { apiRequest, sessionCredentials } from "./adminAuth";
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
  createdAt: string | null;
};

export async function listAllStores(): Promise<ManagedStore[]> {
  return (await apiRequest<{ stores: ManagedStore[] }>("/admin/stores")).stores;
}

export async function updateStoreAccess(
  slug: string,
  change: { active?: boolean; productLimit?: number | null },
): Promise<ManagedStore> {
  const { store } = await apiRequest<{ store: ManagedStore }>(`/admin/stores/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify(change),
  });
  // Switching a store on/off shows on its link right away (best effort).
  if (change.active !== undefined) {
    const { token, deviceId } = sessionCredentials();
    refreshStoreCatalog(token, deviceId, slug).catch(() => {});
  }
  return store;
}
