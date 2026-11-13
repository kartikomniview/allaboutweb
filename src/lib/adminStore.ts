// The logged-in owner's store details (backend-api: GET/PUT /store, POST /store/whatsapp-request).

import { apiRequest, sessionCredentials } from "./adminAuth";
import { checkImageFile, checkImageSize, requestImageUploads, uploadToS3 } from "./adminProducts";
import { refreshCatalog } from "./catalogActions";
import type { PublicStore } from "./catalogStore";
import { toWebP } from "./imageToWebp";
import { toBusinessTypes } from "./taxonomy";

/**
 * A WhatsApp number the owner asked for. Owners can't set the number themselves: a
 * Catalog24 admin approves the request (the number goes live) or rejects it with a reason.
 */
export type WhatsappRequest = {
  /** Digits with the country code, e.g. "919876543210". */
  number: string;
  status: "pending" | "rejected";
  requestedAt: string | null;
  /** Why it was rejected ("" if no reason was given). */
  reason: string;
  decidedAt: string | null;
};

/** `whatsapp` is the live number (on the catalog); `whatsappRequest` a pending or rejected one. */
export type StoreDetails = PublicStore & { whatsappRequest: WhatsappRequest | null };
/** The editable fields. The slug (the store's subdomain) never changes, and the WhatsApp number is requested separately. */
export type StoreDetailsInput = Omit<StoreDetails, "slug" | "whatsapp" | "whatsappRequest">;

/** "+91 98765 43210" for display ("" stays ""). */
export function formatWhatsapp(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (!d) return "";
  if (/^91\d{10}$/.test(d)) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return `+${d}`;
}

const toDetails = (store: StoreDetails): StoreDetails => ({
  ...store,
  businessTypes: toBusinessTypes(store.businessTypes),
  whatsappRequest: store.whatsappRequest ?? null, // older API builds
});

export async function getOwnStore(): Promise<StoreDetails> {
  const { store } = await apiRequest<{ store: StoreDetails }>("/store");
  return toDetails(store);
}

/** Asks a Catalog24 admin to set this WhatsApp number (it isn't live until approved). */
export async function requestWhatsapp(number: string): Promise<StoreDetails> {
  const { store } = await apiRequest<{ store: StoreDetails }>("/store/whatsapp-request", {
    method: "POST",
    body: JSON.stringify({ whatsapp: number }),
  });
  return toDetails(store);
}

/** Withdraws a pending request (or clears a rejected one). */
export async function withdrawWhatsappRequest(): Promise<StoreDetails> {
  return requestWhatsapp("");
}

export async function updateOwnStore(input: StoreDetailsInput): Promise<StoreDetails> {
  const { store } = await apiRequest<{ store: StoreDetails }>("/store", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  // Show the change on the public catalog right away (best effort).
  const { token, deviceId } = sessionCredentials();
  refreshCatalog(token, deviceId).catch(() => {});
  return toDetails(store);
}

/** The editable fields of a loaded store, e.g. to save one change (the logo) right away. */
export function toStoreInput(store: StoreDetails): StoreDetailsInput {
  const input: Partial<StoreDetails> = { ...store };
  delete input.slug;
  delete input.whatsapp;
  delete input.whatsappRequest;
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
