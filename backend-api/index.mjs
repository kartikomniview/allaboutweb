import { signInWithPassword } from "./src/auth.mjs";
import { bearerToken, header, HttpError, json, parseBody } from "./src/http.mjs";
import {
  bindDeviceOrReject,
  createSession,
  deleteSession,
  isSuperAdmin,
  storeOfUser,
  validateSession,
} from "./src/session.mjs";
import {
  createProduct,
  deleteProduct,
  importProducts,
  listProducts,
  listPublicProducts,
  PRODUCT_ID_RE,
  updateProduct,
} from "./src/products.mjs";
import { deleteImages, presignImageUploads } from "./src/storage.mjs";
import { detectProduct } from "./src/detect.mjs";
import {
  checkAvailability,
  getStore,
  isStoreActive,
  listAllStores,
  publicStore,
  registerStoreOwner,
  storeInactive,
  updateStore,
  updateStoreAccess,
} from "./src/stores.mjs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEVICE_ID_RE = /^[A-Za-z0-9-]{8,128}$/;

// Products from before stores existed, and the old GET /catalog/products route.
const DEMO_STORE = "demo";

function deviceIdOf(value) {
  if (typeof value !== "string" || !DEVICE_ID_RE.test(value)) {
    throw new HttpError(400, "BAD_REQUEST", "A valid deviceId is required");
  }
  return value;
}

// POST /auth/login  { email, password, deviceId }
async function login(event) {
  const { email, password, deviceId } = parseBody(event);

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    throw new HttpError(400, "BAD_REQUEST", "A valid email is required");
  }
  if (typeof password !== "string" || password.length === 0) {
    throw new HttpError(400, "BAD_REQUEST", "Password is required");
  }
  deviceIdOf(deviceId);

  const user = await signInWithPassword(email.trim(), password);
  const store = await storeOfUser(user.uid);
  const superAdmin = isSuperAdmin(user.email);
  // A deactivated store can't log in (checked before the device is bound).
  if (!store.active && !superAdmin) throw storeInactive();
  await bindDeviceOrReject(user.uid, user.email, deviceId);
  const session = await createSession(user.uid, user.email, deviceId);

  return json(200, { ...session, user: { ...user, store, isSuperAdmin: superAdmin } });
}

// POST /auth/register  { storeName, whatsapp, email, password, deviceId }
// Public. Creates the store and the owner's account, then logs them in.
async function register(event) {
  const body = parseBody(event);
  const deviceId = deviceIdOf(body.deviceId);

  const owner = await registerStoreOwner(body);
  // The one-device rule applies from the start: this device is bound.
  await bindDeviceOrReject(owner.uid, owner.email, deviceId);
  const session = await createSession(owner.uid, owner.email, deviceId);

  return json(201, { ...session, user: { ...owner, isSuperAdmin: isSuperAdmin(owner.email) } });
}

// GET /stores/check?name=Demo%20Store  (public)
// Whether a store name is free, for the registration form's live check.
async function getStoreCheck(event) {
  const name = event.queryStringParameters?.name ?? "";
  return json(200, await checkAvailability(name));
}

// GET /auth/session  (Authorization: Bearer <token>, X-Device-Id: <id>)
async function session(event) {
  const result = await validateSession(bearerToken(event), header(event, "x-device-id"));
  return json(200, {
    user: {
      uid: result.uid,
      email: result.email,
      store: await storeOfUser(result.uid),
      isSuperAdmin: result.isSuperAdmin,
    },
    expiresAt: result.expiresAt,
  });
}

// POST /auth/logout  (Authorization: Bearer <token>)
// Ends the session only; the device binding stays in users/{uid}.
async function logout(event) {
  await deleteSession(bearerToken(event));
  return json(200, { ok: true });
}

// GET /catalog/{store}/products  (public)
// A store's details and its published products, for the public e-catalog.
async function getStoreCatalog(event) {
  const slug = String(event.pathParameters?.store ?? "").toLowerCase();
  const store = await getStore(slug);
  if (!store) throw new HttpError(404, "STORE_NOT_FOUND", "Store not found");
  // Deactivated: only the name, for the "Store unavailable" page.
  if (!isStoreActive(store)) {
    const { message } = storeInactive();
    return json(403, { code: "STORE_INACTIVE", message, store: { slug, name: store.name ?? slug } });
  }
  return json(200, { store: publicStore(store), products: await listPublicProducts(slug) });
}

// GET /catalog/products  (public): the demo store, for older website builds.
async function getCatalogProducts() {
  if (!isStoreActive(await getStore(DEMO_STORE))) throw storeInactive();
  return json(200, { products: await listPublicProducts(DEMO_STORE) });
}

// Every /products and /store route needs a session, and works on its store only.
const requireSession = (event) =>
  validateSession(bearerToken(event), header(event, "x-device-id"));

function productId(event) {
  const id = event.pathParameters?.id;
  if (typeof id !== "string" || !PRODUCT_ID_RE.test(id)) {
    throw new HttpError(400, "BAD_REQUEST", "Invalid product id");
  }
  return id;
}

// GET /products
async function getProducts(event) {
  const { storeSlug } = await requireSession(event);
  return json(200, { products: await listProducts(storeSlug) });
}

// POST /products  { ...product }
async function postProduct(event) {
  const { storeSlug, productLimit } = await requireSession(event);
  return json(201, { product: await createProduct(storeSlug, parseBody(event), productLimit) });
}

// POST /products/import  { products: [{ id, ...product }] }
async function postImport(event) {
  const { storeSlug, productLimit } = await requireSession(event);
  return json(200, await importProducts(storeSlug, parseBody(event).products, productLimit));
}

// POST /products/uploads  { categoryName, subcategoryName, productName, files: [{ contentType, size }] }
// Returns signed S3 upload forms; the browser uploads the files directly.
async function postUploads(event) {
  const { storeSlug } = await requireSession(event);
  return json(200, { uploads: await presignImageUploads(storeSlug, parseBody(event)) });
}

// POST /products/uploads/discard  { urls }
// Removes images uploaded in the editor that were never saved to a product.
async function postDiscardUploads(event) {
  const { storeSlug } = await requireSession(event);
  const { urls } = parseBody(event);
  if (!Array.isArray(urls) || urls.length > 50) {
    throw new HttpError(400, "BAD_REQUEST", "urls must be a list of at most 50 items");
  }
  await deleteImages(urls, storeSlug);
  return json(200, { ok: true });
}

// POST /products/detect  { categories, image: { data, mediaType } } or { categories, imageUrl }
// Detects the name, category, subcategory and details from a product photo.
async function postDetect(event) {
  const { storeSlug } = await requireSession(event);
  return json(200, { detected: await detectProduct(storeSlug, parseBody(event)) });
}

// PUT /products/{id}  { ...product }
async function putProduct(event) {
  const { storeSlug } = await requireSession(event);
  return json(200, { product: await updateProduct(storeSlug, productId(event), parseBody(event)) });
}

// DELETE /products/{id}
async function removeProduct(event) {
  const { storeSlug } = await requireSession(event);
  await deleteProduct(storeSlug, productId(event));
  return json(200, { ok: true });
}

// GET /store: the logged-in owner's store details.
async function getOwnStore(event) {
  const { storeSlug } = await requireSession(event);
  const store = await getStore(storeSlug);
  if (!store) throw new HttpError(404, "STORE_NOT_FOUND", "Store not found");
  return json(200, { store: publicStore(store) });
}

// PUT /store  { name, whatsapp, phone, email, address, hours, tagline, category, since, coverImage }
async function putOwnStore(event) {
  const { storeSlug } = await requireSession(event);
  return json(200, { store: await updateStore(storeSlug, parseBody(event)) });
}

// The super-admin routes: a valid session whose email is in SUPER_ADMIN_EMAILS.
async function requireSuperAdmin(event) {
  const session = await requireSession(event);
  if (!session.isSuperAdmin) throw new HttpError(403, "FORBIDDEN", "Only Catalog24 admins can do this");
  return session;
}

// GET /admin/stores: every store with its owner, limit, status and product count.
async function getAllStores(event) {
  await requireSuperAdmin(event);
  return json(200, { stores: await listAllStores() });
}

// PUT /admin/stores/{slug}  { active?, productLimit? }
async function putStoreAccess(event) {
  await requireSuperAdmin(event);
  const slug = String(event.pathParameters?.slug ?? "").toLowerCase();
  return json(200, { store: await updateStoreAccess(slug, parseBody(event)) });
}

const routes = {
  "POST /auth/login": login,
  "POST /auth/register": register,
  "GET /auth/session": session,
  "POST /auth/logout": logout,
  "GET /stores/check": getStoreCheck,
  "GET /catalog/products": getCatalogProducts,
  "GET /catalog/{store}/products": getStoreCatalog,
  "GET /store": getOwnStore,
  "PUT /store": putOwnStore,
  "GET /products": getProducts,
  "POST /products": postProduct,
  "POST /products/import": postImport,
  "POST /products/uploads": postUploads,
  "POST /products/uploads/discard": postDiscardUploads,
  "POST /products/detect": postDetect,
  "PUT /products/{id}": putProduct,
  "DELETE /products/{id}": removeProduct,
  "GET /admin/stores": getAllStores,
  "PUT /admin/stores/{slug}": putStoreAccess,
};

export async function handler(event) {
  // API Gateway answers CORS preflight itself; this is only a fallback.
  if (event.requestContext?.http?.method === "OPTIONS") return { statusCode: 204 };

  const route = routes[event.routeKey];
  if (!route) return json(404, { code: "NOT_FOUND", message: "Route not found" });

  try {
    return await route(event);
  } catch (err) {
    if (err instanceof HttpError) {
      return json(err.status, { code: err.code, message: err.message });
    }
    console.error(err);
    return json(500, { code: "INTERNAL", message: "Something went wrong" });
  }
}
