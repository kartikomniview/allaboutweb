import { signInWithPassword } from "./src/auth.mjs";
import { bearerToken, header, HttpError, json, parseBody } from "./src/http.mjs";
import {
  bindDeviceOrReject,
  createSession,
  deleteSession,
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEVICE_ID_RE = /^[A-Za-z0-9-]{8,128}$/;

// POST /auth/login  { email, password, deviceId }
async function login(event) {
  const { email, password, deviceId } = parseBody(event);

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    throw new HttpError(400, "BAD_REQUEST", "A valid email is required");
  }
  if (typeof password !== "string" || password.length === 0) {
    throw new HttpError(400, "BAD_REQUEST", "Password is required");
  }
  if (typeof deviceId !== "string" || !DEVICE_ID_RE.test(deviceId)) {
    throw new HttpError(400, "BAD_REQUEST", "A valid deviceId is required");
  }

  const user = await signInWithPassword(email.trim(), password);
  await bindDeviceOrReject(user.uid, user.email, deviceId);
  const session = await createSession(user.uid, user.email, deviceId);

  return json(200, { ...session, user });
}

// GET /auth/session  (Authorization: Bearer <token>, X-Device-Id: <id>)
async function session(event) {
  const result = await validateSession(bearerToken(event), header(event, "x-device-id"));
  return json(200, {
    user: { uid: result.uid, email: result.email },
    expiresAt: result.expiresAt,
  });
}

// POST /auth/logout  (Authorization: Bearer <token>)
// Ends the session only; the device binding stays in users/{uid}.
async function logout(event) {
  await deleteSession(bearerToken(event));
  return json(200, { ok: true });
}

// GET /catalog/products
// Public (no login): the published products shown on the website's e-catalog.
async function getCatalogProducts() {
  return json(200, { products: await listPublicProducts() });
}

// Every /products route is admin-only.
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
  await requireSession(event);
  return json(200, { products: await listProducts() });
}

// POST /products  { ...product }
async function postProduct(event) {
  await requireSession(event);
  return json(201, { product: await createProduct(parseBody(event)) });
}

// POST /products/import  { products: [{ id, ...product }] }
async function postImport(event) {
  await requireSession(event);
  return json(200, await importProducts(parseBody(event).products));
}

// POST /products/uploads  { categoryName, subcategoryName, productName, files: [{ contentType, size }] }
// Returns signed S3 upload forms; the browser uploads the files directly.
async function postUploads(event) {
  await requireSession(event);
  return json(200, { uploads: await presignImageUploads(parseBody(event)) });
}

// POST /products/uploads/discard  { urls }
// Removes images uploaded in the editor that were never saved to a product.
async function postDiscardUploads(event) {
  await requireSession(event);
  const { urls } = parseBody(event);
  if (!Array.isArray(urls) || urls.length > 50) {
    throw new HttpError(400, "BAD_REQUEST", "urls must be a list of at most 50 items");
  }
  await deleteImages(urls);
  return json(200, { ok: true });
}

// PUT /products/{id}  { ...product }
async function putProduct(event) {
  await requireSession(event);
  return json(200, { product: await updateProduct(productId(event), parseBody(event)) });
}

// DELETE /products/{id}
async function removeProduct(event) {
  await requireSession(event);
  await deleteProduct(productId(event));
  return json(200, { ok: true });
}

const routes = {
  "POST /auth/login": login,
  "GET /auth/session": session,
  "POST /auth/logout": logout,
  "GET /catalog/products": getCatalogProducts,
  "GET /products": getProducts,
  "POST /products": postProduct,
  "POST /products/import": postImport,
  "POST /products/uploads": postUploads,
  "POST /products/uploads/discard": postDiscardUploads,
  "PUT /products/{id}": putProduct,
  "DELETE /products/{id}": removeProduct,
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
