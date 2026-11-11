// The logged-in owner's store details (backend-api: GET/PUT /store).

import { apiRequest, sessionCredentials } from "./adminAuth";
import { refreshCatalog } from "./catalogActions";
import type { PublicStore } from "./catalogStore";
import { toBusinessTypes } from "./taxonomy";

export type StoreDetails = PublicStore;
/** The editable fields; the slug (the store's subdomain) never changes. */
export type StoreDetailsInput = Omit<StoreDetails, "slug">;

export async function getOwnStore(): Promise<StoreDetails> {
  const { store } = await apiRequest<{ store: StoreDetails }>("/store");
  return { ...store, businessTypes: toBusinessTypes(store.businessTypes) };
}

export async function updateOwnStore(input: StoreDetailsInput): Promise<StoreDetails> {
  const { store } = await apiRequest<{ store: StoreDetails }>("/store", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  // Show the change on the public catalog right away (best effort).
  const { token, deviceId } = sessionCredentials();
  refreshCatalog(token, deviceId).catch(() => {});
  return { ...store, businessTypes: toBusinessTypes(store.businessTypes) };
}
