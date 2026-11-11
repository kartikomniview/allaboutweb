import { createHash, randomBytes } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "./firebase.mjs";
import { HttpError } from "./http.mjs";
import { businessTypesOf, isStoreActive, productLimitOf, storeInactive } from "./stores.mjs";

const USERS = "users";
const SESSIONS = "sessions";

const ttlMs = () => Number(process.env.SESSION_TTL_HOURS || 12) * 60 * 60 * 1000;

// Only the hash is stored, so reading the database never yields a usable token.
export const hashToken = (token) => createHash("sha256").update(token).digest("hex");

const unauthorized = (code, message) => new HttpError(401, code, message);

// Super admins (Lambda env SUPER_ADMIN_EMAILS, comma-separated) manage every store.
// They're never locked out by their own store being inactive.
export function isSuperAdmin(email) {
  const list = String(process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return typeof email === "string" && list.includes(email.trim().toLowerCase());
}

// One user = one device. The first login binds the device; afterwards only that
// device may log in until `deviceId` is removed manually from users/{uid}.
export async function bindDeviceOrReject(uid, email, deviceId) {
  const ref = db().collection(USERS).doc(uid);
  await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const boundDeviceId = snap.exists ? snap.get("deviceId") : undefined;

    if (boundDeviceId && boundDeviceId !== deviceId) {
      throw new HttpError(403, "DEVICE_LOCKED", "Logged in into another device");
    }

    tx.set(
      ref,
      {
        email,
        lastLoginAt: FieldValue.serverTimestamp(),
        ...(boundDeviceId
          ? {}
          : { deviceId, deviceBoundAt: FieldValue.serverTimestamp() }),
      },
      { merge: true },
    );
  });
}

export async function createSession(uid, email, deviceId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Timestamp.fromMillis(Date.now() + ttlMs());

  await db().collection(SESSIONS).doc(hashToken(token)).set({
    uid,
    email,
    deviceId,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt,
  });

  return { token, expiresAt: expiresAt.toDate().toISOString() };
}

export async function validateSession(token, deviceId) {
  if (!token) throw unauthorized("NO_SESSION", "Not logged in");
  if (!deviceId) throw unauthorized("NO_DEVICE", "Missing device id");

  const ref = db().collection(SESSIONS).doc(hashToken(token));
  const snap = await ref.get();
  if (!snap.exists) throw unauthorized("SESSION_INVALID", "Session is invalid");

  const session = snap.data();
  if (session.expiresAt.toMillis() <= Date.now()) {
    await ref.delete();
    throw unauthorized("SESSION_EXPIRED", "Session has expired");
  }
  if (session.deviceId !== deviceId) {
    throw unauthorized("SESSION_INVALID", "Session is invalid");
  }

  // If the device binding was reset (or changed) manually, end this session too.
  const user = await db().collection(USERS).doc(session.uid).get();
  if (!user.exists || user.get("deviceId") !== deviceId) {
    await ref.delete();
    throw unauthorized("DEVICE_RESET", "Device access was revoked");
  }

  // Every account belongs to one store; all /products routes are scoped to it.
  const storeSlug = user.get("storeSlug");
  if (typeof storeSlug !== "string" || !storeSlug) throw noStore();

  // A deactivated store signs its owner out on the next request.
  const store = await db().collection("stores").doc(storeSlug).get();
  const superAdmin = isSuperAdmin(session.email);
  if (!superAdmin && !isStoreActive(store.exists ? store.data() : null)) {
    await ref.delete();
    throw storeInactive();
  }

  return {
    uid: session.uid,
    email: session.email,
    storeSlug,
    productLimit: productLimitOf(store.exists ? store.data() : null),
    isSuperAdmin: superAdmin,
    expiresAt: session.expiresAt.toDate().toISOString(),
  };
}

export const noStore = () => new HttpError(403, "NO_STORE", "This account has no store. Register a store first.");

// The store an account owns, for the login and session responses.
export async function storeOfUser(uid) {
  const user = await db().collection(USERS).doc(uid).get();
  const slug = user.get("storeSlug");
  if (typeof slug !== "string" || !slug) throw noStore();
  const store = await db().collection("stores").doc(slug).get();
  const data = store.exists ? store.data() : null;
  return {
    slug,
    name: store.exists ? store.get("name") : slug,
    businessTypes: businessTypesOf(data),
    productLimit: productLimitOf(data),
    active: isStoreActive(data),
  };
}

export async function deleteSession(token) {
  if (!token) return;
  await db().collection(SESSIONS).doc(hashToken(token)).delete();
}
