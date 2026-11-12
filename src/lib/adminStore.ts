// The logged-in owner's store details (backend-api: GET/PUT /store).

import { apiRequest, sessionCredentials } from "./adminAuth";
import { checkImageFile, checkImageSize, requestImageUploads, uploadToS3 } from "./adminProducts";
import { refreshCatalog } from "./catalogActions";
import type { PublicStore } from "./catalogStore";
import { toWebP } from "./imageToWebp";
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

/** The editable fields of a loaded store, e.g. to save one change (the logo) right away. */
export function toStoreInput(store: StoreDetails): StoreDetailsInput {
  const input: Partial<StoreDetails> = { ...store };
  delete input.slug;
  return input as StoreDetailsInput;
}

/**
 * Uploads a logo picked by the owner and returns its URL (saved with updateOwnStore).
 * Resized to 512px and turned into WebP first; stored in the store's own image folder.
 * Throws an Error with a message to show.
 */
export async function uploadStoreLogo(file: File): Promise<string> {
  const problem = checkImageFile(file);
  if (problem) throw new Error(problem);
  const optimized = await toWebP(file, 512);
  const tooBig = checkImageSize(optimized);
  if (tooBig) throw new Error(tooBig);
  const [upload] = await requestImageUploads(
    { categoryName: "store", subcategoryName: "branding", productName: "logo" },
    [optimized],
  );
  return uploadToS3(upload, optimized);
}
