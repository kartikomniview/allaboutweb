import { createHash, randomBytes } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "./firebase.mjs";
import { HttpError } from "./http.mjs";

const USERS = "users";
const SESSIONS = "sessions";

const ttlMs = () => Number(process.env.SESSION_TTL_HOURS || 12) * 60 * 60 * 1000;

// Only the hash is stored, so reading the database never yields a usable token.
export const hashToken = (token) => createHash("sha256").update(token).digest("hex");

const unauthorized = (code, message) => new HttpError(401, code, message);

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

  return {
    uid: session.uid,
    email: session.email,
    expiresAt: session.expiresAt.toDate().toISOString(),
  };
}

export async function deleteSession(token) {
  if (!token) return;
  await db().collection(SESSIONS).doc(hashToken(token)).delete();
}
