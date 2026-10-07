import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase.mjs";
import { HttpError } from "./http.mjs";
import { deleteImages, isOwnImageUrl } from "./storage.mjs";

const PRODUCTS = "products";

export const PRODUCT_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
const MAX_IMPORT = 200;
const MAX_IMAGES = 20;

const bad = (message) => new HttpError(400, "BAD_REQUEST", message);

function text(body, field, { required = false, max = 200 } = {}) {
  const value = body[field] ?? "";
  if (typeof value !== "string") throw bad(`${field} must be text`);
  const trimmed = value.trim();
  if (required && !trimmed) throw bad(`${field} is required`);
  if (trimmed.length > max) throw bad(`${field} must be at most ${max} characters`);
  return trimmed;
}

function number(body, field, { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false } = {}) {
  const value = body[field];
  if (typeof value !== "number" || !Number.isFinite(value)) throw bad(`${field} must be a number`);
  if (integer && !Number.isInteger(value)) throw bad(`${field} must be a whole number`);
  if (value < min || value > max) throw bad(`${field} must be between ${min} and ${max}`);
  return value;
}

function textList(body, field, { maxItems = 20, max = 200 } = {}) {
  const value = body[field] ?? [];
  if (!Array.isArray(value)) throw bad(`${field} must be a list`);
  if (value.length > maxItems) throw bad(`${field} can have at most ${maxItems} items`);
  return value.map((item) => {
    if (typeof item !== "string") throw bad(`${field} must contain only text`);
    const trimmed = item.trim();
    if (trimmed.length > max) throw bad(`Each ${field} item must be at most ${max} characters`);
    return trimmed;
  }).filter(Boolean);
}

function colorList(body) {
  const value = body.colors ?? [];
  if (!Array.isArray(value)) throw bad("colors must be a list");
  if (value.length > 20) throw bad("colors can have at most 20 items");
  return value.map((color) => {
    if (!color || typeof color !== "object") throw bad("Each color needs a name and hex");
    const name = text(color, "name", { required: true, max: 60 });
    const hex = typeof color.hex === "string" ? color.hex.trim() : "";
    if (!HEX_RE.test(hex)) throw bad(`Color "${name}" needs a hex like #A1B2C3`);
    return { name, hex: hex.toUpperCase() };
  });
}

// images: uploaded e-catalog URLs only. mainImageUrl / plainImageUrl must be
// one of them (or empty); main falls back to the first image.
function imageFields(body) {
  const value = body.images ?? [];
  if (!Array.isArray(value)) throw bad("images must be a list");
  const images = [...new Set(value)];
  if (images.length > MAX_IMAGES) throw bad(`A product can have at most ${MAX_IMAGES} images`);
  if (!images.every(isOwnImageUrl)) throw bad("images must be uploaded through the admin panel");

  const pick = (field) => {
    const url = body[field] ?? "";
    if (typeof url !== "string") throw bad(`${field} must be text`);
    if (url && !images.includes(url)) throw bad(`${field} must be one of the product images`);
    return url;
  };
  return { images, mainImageUrl: pick("mainImageUrl") || images[0] || "", plainImageUrl: pick("plainImageUrl") };
}

// Whitelists and normalises the writable fields of a product.
export function validateProduct(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw bad("Product must be an object");
  }

  const product = {
    productName: text(body, "productName", { required: true, max: 120 }),
    categoryName: text(body, "categoryName", { required: true, max: 60 }),
    subcategoryName: text(body, "subcategoryName", { required: true, max: 60 }),
    price: number(body, "price", { max: 100_000_000 }),
    originalPrice: number(body, "originalPrice", { max: 100_000_000 }),
    tags: textList(body, "tags", { maxItems: 10, max: 40 }),
    rating: number(body, "rating", { max: 5 }),
    reviewCount: number(body, "reviewCount", { integer: true }),
    colors: colorList(body),
    material: text(body, "material"),
    dimensions: text(body, "dimensions"),
    woodType: text(body, "woodType"),
    stockStatus: text(body, "stockStatus", { max: 100 }),
    description: text(body, "description", { max: 2000 }),
    highlights: textList(body, "highlights", { maxItems: 10 }),
    isActive: body.isActive ?? true,
    ...imageFields(body),
  };

  if (typeof product.isActive !== "boolean") throw bad("isActive must be true or false");
  if (product.originalPrice < product.price) {
    throw bad("originalPrice (MRP) cannot be lower than price");
  }
  return product;
}

const str = (v) => (typeof v === "string" ? v : "");
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const isoDate = (v) => (typeof v?.toDate === "function" ? v.toDate().toISOString() : null);
const strList = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);

// Documents added by hand in the Firebase console can miss fields; always
// return the full product shape so clients don't have to guard every field.
function toProduct(snap) {
  const data = snap.data();
  const price = num(data.price);
  return {
    id: snap.id,
    productName: str(data.productName),
    categoryName: str(data.categoryName),
    subcategoryName: str(data.subcategoryName),
    price,
    originalPrice: typeof data.originalPrice === "number" ? data.originalPrice : price,
    tags: strList(data.tags),
    rating: num(data.rating),
    reviewCount: num(data.reviewCount),
    colors: Array.isArray(data.colors)
      ? data.colors
          .filter((c) => typeof c?.name === "string" && typeof c?.hex === "string")
          .map((c) => ({ name: c.name, hex: c.hex }))
      : [],
    material: str(data.material),
    dimensions: str(data.dimensions),
    woodType: str(data.woodType),
    stockStatus: str(data.stockStatus),
    description: str(data.description),
    highlights: strList(data.highlights),
    isActive: data.isActive !== false,
    mainImageUrl: str(data.mainImageUrl),
    plainImageUrl: str(data.plainImageUrl),
    images: strList(data.images),
    createdAt: isoDate(data.createdAt),
    updatedAt: isoDate(data.updatedAt),
  };
}

const notFound = () => new HttpError(404, "NOT_FOUND", "Product not found");

// Sorted in memory: ordering by two fields in Firestore needs a composite index,
// and the catalog is small enough to read in one go.
export async function listProducts() {
  const snap = await db().collection(PRODUCTS).get();
  return snap.docs
    .map(toProduct)
    .sort(
      (a, b) =>
        a.categoryName.localeCompare(b.categoryName) ||
        (a.createdAt ?? "").localeCompare(b.createdAt ?? "") ||
        a.id.localeCompare(b.id),
    );
}

// Published products for the public e-catalog. Hidden products and the
// admin-only timestamps are left out.
export async function listPublicProducts() {
  const products = await listProducts();
  return products
    .filter((p) => p.isActive)
    .map(({ createdAt, updatedAt, ...product }) => product);
}

export async function createProduct(body) {
  const product = validateProduct(body);
  const ref = db().collection(PRODUCTS).doc();
  await ref.create({
    ...product,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return toProduct(await ref.get());
}

// Images dropped from the product are deleted from S3 after the save.
export async function updateProduct(id, body) {
  const product = validateProduct(body);
  const ref = db().collection(PRODUCTS).doc(id);
  const before = await ref.get();
  if (!before.exists) throw notFound();

  await ref.update({ ...product, updatedAt: FieldValue.serverTimestamp() });
  await deleteImages(strList(before.get("images")).filter((url) => !product.images.includes(url)));
  return toProduct(await ref.get());
}

export async function deleteProduct(id) {
  const ref = db().collection(PRODUCTS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw notFound();
  await ref.delete();
  await deleteImages(strList(snap.get("images")));
}

// Bulk-creates products with fixed ids (the starter catalog). Ids that already
// exist are skipped, so running the import twice is harmless.
export async function importProducts(list) {
  if (!Array.isArray(list) || list.length === 0) throw bad("products must be a non-empty list");
  if (list.length > MAX_IMPORT) throw bad(`At most ${MAX_IMPORT} products per import`);

  const items = list.map((item, i) => {
    if (typeof item?.id !== "string" || !PRODUCT_ID_RE.test(item.id)) {
      throw bad(`Product #${i + 1} needs an id of letters, numbers, - or _`);
    }
    return { id: item.id, product: validateProduct(item) };
  });
  if (new Set(items.map(({ id }) => id)).size !== items.length) {
    throw bad("Product ids in an import must be unique");
  }

  const collection = db().collection(PRODUCTS);
  const snaps = await db().getAll(...items.map(({ id }) => collection.doc(id)));
  const existing = new Set(snaps.filter((s) => s.exists).map((s) => s.id));

  const batch = db().batch();
  const created = [];
  for (const { id, product } of items) {
    if (existing.has(id)) continue;
    batch.create(collection.doc(id), {
      ...product,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    created.push(id);
  }
  if (created.length) await batch.commit();

  return { created: created.length, skipped: existing.size };
}
