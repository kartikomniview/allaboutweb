import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "./firebase.mjs";
import { HttpError } from "./http.mjs";
import { deleteImages, isStoreImageUrl } from "./storage.mjs";

// One store per registered owner. stores/{slug} holds the store's public
// details; the slug (the store name without spaces) is its subdomain:
// "Demo Store" -> demostore.catalog24.in.

const STORES = "stores";
const USERS = "users";

// Subdomains and paths that can't be store names.
const RESERVED = new Set([
  "www", "admin", "api", "app", "catalog", "catalog24", "yourstore", "login", "register",
  "mail", "help", "support", "static", "assets", "localhost", "store", "stores",
]);

export const STORE_SLUG_RE = /^[a-z0-9]{3,30}$/;
const NAME_RE = /^[\p{L}\p{N}][\p{L}\p{N} &'.-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// What a store sells. Mirrors BUSINESS_TYPES in the website's src/lib/taxonomy.ts.
export const BUSINESS_TYPE_IDS = ["furniture", "decor", "lighting", "flooring", "curtains", "fabrics", "clothing", "electronics"];
// Stores created before business types existed (the Demo store) sell furniture.
const DEFAULT_BUSINESS_TYPES = ["furniture"];

const bad = (message) => new HttpError(400, "BAD_REQUEST", message);

// A new login's email and password (registration and super admins adding a user).
export function checkLogin(body) {
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!EMAIL_RE.test(email)) throw bad("Enter a valid email address");
  if (password.length < 6 || password.length > 128) throw bad("Password must be at least 6 characters");
  return { email, password };
}

// Firebase createUser errors -> the API's messages.
export function accountError(err) {
  if (err?.code === "auth/email-already-exists") {
    return new HttpError(409, "EMAIL_TAKEN", "An account with this email already exists. Log in instead.");
  }
  if (err?.code === "auth/invalid-email") return bad("Enter a valid email address");
  if (err?.code === "auth/invalid-password") return bad("Password must be at least 6 characters");
  return err;
}

// How many products a store may have. New stores get the default; a store
// without the field (from before limits existed, e.g. the Demo store) is unlimited.
export const DEFAULT_PRODUCT_LIMIT = 20;
export const MAX_PRODUCT_LIMIT = 10_000;
export const productLimitOf = (data) =>
  typeof data?.productLimit === "number" && Number.isFinite(data.productLimit) ? data.productLimit : null;

// A store switched off by a super admin: its owner can't log in and its catalog is unavailable.
export const isStoreActive = (data) => data?.active !== false;

export const storeInactive = () =>
  new HttpError(403, "STORE_INACTIVE", "This store has been deactivated. Contact Catalog24 support.");

// A store's business types as saved, or the default for older stores.
export const businessTypesOf = (data) =>
  Array.isArray(data?.businessTypes) && data.businessTypes.length ? data.businessTypes : [...DEFAULT_BUSINESS_TYPES];

// At least one known business type; returned in the canonical order.
export function checkBusinessTypes(value) {
  if (!Array.isArray(value) || !value.every((v) => BUSINESS_TYPE_IDS.includes(v))) {
    throw bad(`businessTypes must be a list of: ${BUSINESS_TYPE_IDS.join(", ")}`);
  }
  const types = BUSINESS_TYPE_IDS.filter((id) => value.includes(id));
  if (!types.length) throw bad("Choose at least one type of business");
  return types;
}
const taken = () => new HttpError(409, "STORE_TAKEN", "This store name is already taken. Try another one.");

// "Demo Store" -> "demostore", "Sharma's Furniture" -> "sharmasfurniture".
export const toSlug = (name) =>
  String(name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "");

const tidy = (v) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "");

// Returns { name, slug } or throws a 400 explaining what to change.
export function checkStoreName(value) {
  const name = tidy(value);
  if (name.length < 3 || name.length > 40) throw bad("Store name must be 3 to 40 characters");
  if (!NAME_RE.test(name)) throw bad("Store name can use letters, numbers, spaces and & ' . -");
  const slug = toSlug(name);
  if (!STORE_SLUG_RE.test(slug)) throw bad("Store name needs at least 3 letters or numbers (at most 30)");
  if (RESERVED.has(slug)) throw taken();
  return { name, slug };
}

// 10-digit Indian numbers get the 91 country code; numbers with a country code
// (11-15 digits) are kept as they are. Returns digits only, as wa.me expects.
export function normalizeWhatsapp(value, { required = true } = {}) {
  const digits = String(value ?? "").replace(/\D/g, "").replace(/^0+/, "");
  if (!digits && !required) return "";
  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
  if (/^[1-9]\d{10,14}$/.test(digits)) return digits;
  throw bad("Enter a valid WhatsApp number, e.g. 98765 43210");
}

// The store fields anyone can see (the public catalog shows them).
export function publicStore(data) {
  return {
    slug: data.slug,
    name: data.name,
    whatsapp: data.whatsapp ?? "",
    phone: data.phone ?? "",
    email: data.publicEmail ?? "",
    address: data.address ?? "",
    hours: data.hours ?? "",
    tagline: data.tagline ?? "",
    category: data.category ?? "",
    since: typeof data.since === "number" ? data.since : null,
    coverImage: data.coverImage ?? "",
    logo: data.logo ?? "",
    businessTypes: businessTypesOf(data),
  };
}

export async function getStore(slug) {
  if (!STORE_SLUG_RE.test(slug ?? "")) return null;
  const snap = await db().collection(STORES).doc(slug).get();
  return snap.exists ? snap.data() : null;
}

// GET /stores/check?name=...: is a name free? Never throws for a taken name.
export async function checkAvailability(rawName) {
  let checked;
  try {
    checked = checkStoreName(rawName);
  } catch (err) {
    // Invalid or reserved names: not available, with the reason to show.
    if (err instanceof HttpError) return { slug: toSlug(rawName), available: false, message: err.message };
    throw err;
  }
  const exists = (await db().collection(STORES).doc(checked.slug).get()).exists;
  return {
    slug: checked.slug,
    available: !exists,
    message: exists ? "This store name is already taken. Try another one." : "",
  };
}

// Creates the store, the Firebase account and users/{uid}. The store doc is
// created first with create() (fails if it exists), so two people can't claim
// the same name at once; if the account can't be created it's removed again.
export async function registerStoreOwner(body) {
  const { name, slug } = checkStoreName(body?.storeName);
  // Optional at sign-up: the owner adds it in Store settings.
  const whatsapp = normalizeWhatsapp(body?.whatsapp, { required: false });
  const businessTypes = checkBusinessTypes(body?.businessTypes);
  const { email, password } = checkLogin(body);

  const storeRef = db().collection(STORES).doc(slug);
  try {
    await storeRef.create({
      name,
      slug,
      ownerUid: "",
      email,
      whatsapp,
      businessTypes,
      productLimit: DEFAULT_PRODUCT_LIMIT,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    if (err?.code === 6 || /ALREADY_EXISTS/i.test(String(err?.message))) throw taken();
    throw err;
  }

  let user;
  try {
    user = await auth().createUser({ email, password });
  } catch (err) {
    await storeRef.delete().catch(() => {});
    throw accountError(err);
  }

  await storeRef.update({ ownerUid: user.uid });
  await db().collection(USERS).doc(user.uid).set({ email, storeSlug: slug }, { merge: true });
  return {
    uid: user.uid,
    email,
    store: { slug, name, businessTypes, productLimit: DEFAULT_PRODUCT_LIMIT, active: true },
  };
}

const text = (body, field, max) => {
  const value = body[field] ?? "";
  if (typeof value !== "string") throw bad(`${field} must be text`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw bad(`${field} must be at most ${max} characters`);
  return trimmed;
};

// PUT /store: the owner's store details. The slug (subdomain) never changes.
export async function updateStore(slug, body) {
  if (!body || typeof body !== "object") throw bad("Body must be an object");
  const ref = db().collection(STORES).doc(slug);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpError(404, "NOT_FOUND", "Store not found");

  const name = tidy(body.name);
  if (name.length < 3 || name.length > 40 || !NAME_RE.test(name)) {
    throw bad("Store name must be 3 to 40 characters of letters, numbers, spaces and & ' . -");
  }
  const since = body.since === null || body.since === "" || body.since === undefined ? null : Number(body.since);
  if (since !== null && (!Number.isInteger(since) || since < 1900 || since > new Date().getFullYear())) {
    throw bad("Year started must be a year like 2012");
  }
  const coverImage = text(body, "coverImage", 500);
  if (coverImage && !isStoreImageUrl(coverImage, slug)) throw bad("coverImage must be an uploaded image");
  const publicEmail = text(body, "email", 120);
  if (publicEmail && !EMAIL_RE.test(publicEmail)) throw bad("Enter a valid store email, or leave it empty");
  // The store logo: an uploaded image, "" to remove it, or left as is when not sent (older admin builds).
  const previousLogo = snap.data().logo ?? "";
  const logo = body.logo === undefined ? previousLogo : text(body, "logo", 500);
  if (logo && !isStoreImageUrl(logo, slug)) throw bad("logo must be an uploaded image");

  await ref.update({
    name,
    whatsapp: normalizeWhatsapp(body.whatsapp),
    phone: text(body, "phone", 30),
    publicEmail,
    address: text(body, "address", 300),
    hours: text(body, "hours", 100),
    tagline: text(body, "tagline", 60),
    category: text(body, "category", 60),
    since,
    coverImage,
    logo,
    // Left as is when not sent (older admin builds).
    businessTypes: body.businessTypes === undefined ? businessTypesOf(snap.data()) : checkBusinessTypes(body.businessTypes),
    updatedAt: FieldValue.serverTimestamp(),
  });
  // A replaced or removed logo file is deleted (best effort).
  if (previousLogo && previousLogo !== logo) await deleteImages([previousLogo], slug);
  return publicStore((await ref.get()).data());
}

/* ---------- Super admin: every store ---------- */

const countWhereStore = async (collection, slug) =>
  (await db().collection(collection).where("storeSlug", "==", slug).count().get()).data().count;

// A store as the All stores page shows it, with its product and login counts.
async function managedStore(slug, data) {
  const [productCount, userCount] = await Promise.all([
    countWhereStore("products", slug),
    countWhereStore(USERS, slug),
  ]);
  return {
    slug,
    name: data.name ?? slug,
    email: data.email ?? "",
    active: isStoreActive(data),
    productLimit: productLimitOf(data),
    productCount,
    userCount,
    createdAt: typeof data.createdAt?.toDate === "function" ? data.createdAt.toDate().toISOString() : null,
  };
}

// GET /admin/stores: each store with its owner, limit, status, product and user counts.
export async function listAllStores() {
  const snap = await db().collection(STORES).get();
  const stores = await Promise.all(snap.docs.map((doc) => managedStore(doc.id, doc.data())));
  return stores.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "") || a.slug.localeCompare(b.slug));
}

// PUT /admin/stores/{slug}  { active?: boolean, productLimit?: number | null (unlimited) }
export async function updateStoreAccess(slug, body) {
  if (!STORE_SLUG_RE.test(slug ?? "")) throw bad("Invalid store");
  if (!body || typeof body !== "object") throw bad("Body must be an object");
  const change = {};
  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") throw bad("active must be true or false");
    change.active = body.active;
  }
  if (body.productLimit !== undefined) {
    const limit = body.productLimit;
    if (limit !== null && (!Number.isInteger(limit) || limit < 0 || limit > MAX_PRODUCT_LIMIT)) {
      throw bad(`productLimit must be a whole number from 0 to ${MAX_PRODUCT_LIMIT}, or null for unlimited`);
    }
    change.productLimit = limit;
  }
  if (!Object.keys(change).length) throw bad("Nothing to change");

  const ref = db().collection(STORES).doc(slug);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpError(404, "STORE_NOT_FOUND", "Store not found");
  await ref.update({ ...change, updatedAt: FieldValue.serverTimestamp() });

  return managedStore(slug, (await ref.get()).data());
}
