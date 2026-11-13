import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "./firebase.mjs";
import { HttpError } from "./http.mjs";
import { deleteImages, deleteStoreFolder } from "./storage.mjs";
import { STORE_SLUG_RE, accountError, checkLogin } from "./stores.mjs";

// Super admin: the logins of one store. Every users/{uid} with the store's slug
// can log in to it with the same access as the owner (stores/{slug}.ownerUid,
// the account that registered it). Each login keeps its own one-device lock.

const USERS = "users";
const SESSIONS = "sessions";

export const UID_RE = /^[A-Za-z0-9]{1,128}$/;

const bad = (message) => new HttpError(400, "BAD_REQUEST", message);
const storeNotFound = () => new HttpError(404, "STORE_NOT_FOUND", "Store not found");
const userNotFound = () => new HttpError(404, "USER_NOT_FOUND", "This user isn't part of the store");

const iso = (value) => (typeof value?.toDate === "function" ? value.toDate().toISOString() : null);

function toStoreUser(doc, ownerUid) {
  const data = doc.data();
  return {
    uid: doc.id,
    email: data.email ?? "",
    isOwner: doc.id === ownerUid,
    deviceBound: typeof data.deviceId === "string" && data.deviceId !== "",
    deviceBoundAt: iso(data.deviceBoundAt),
    lastLoginAt: iso(data.lastLoginAt),
    addedAt: iso(data.addedAt),
  };
}

async function storeOwnerUid(slug) {
  if (!STORE_SLUG_RE.test(slug ?? "")) throw bad("Invalid store");
  const store = await db().collection("stores").doc(slug).get();
  if (!store.exists) throw storeNotFound();
  return store.get("ownerUid") || "";
}

// The user doc, if it belongs to the store.
async function memberOf(slug, uid) {
  if (!UID_RE.test(uid ?? "")) throw bad("Invalid user");
  const snap = await db().collection(USERS).doc(uid).get();
  if (!snap.exists || snap.get("storeSlug") !== slug) throw userNotFound();
  return snap;
}

// Ends every session of the user, on any device.
async function endSessions(uid) {
  const snap = await db().collection(SESSIONS).where("uid", "==", uid).get();
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = db().batch();
    for (const doc of snap.docs.slice(i, i + 400)) batch.delete(doc.ref);
    await batch.commit();
  }
}

// GET /admin/stores/{slug}/users: the owner first, then the others by when they were added.
export async function listStoreUsers(slug) {
  const ownerUid = await storeOwnerUid(slug);
  const snap = await db().collection(USERS).where("storeSlug", "==", slug).get();
  return snap.docs
    .map((doc) => toStoreUser(doc, ownerUid))
    .sort((a, b) => Number(b.isOwner) - Number(a.isOwner) || (a.addedAt ?? "").localeCompare(b.addedAt ?? ""));
}

// POST /admin/stores/{slug}/users/{uid}/reset-device
// Frees the device lock and logs the user out; their next login binds the new device.
export async function resetUserDevice(slug, uid) {
  const ownerUid = await storeOwnerUid(slug);
  const snap = await memberOf(slug, uid);
  await snap.ref.update({ deviceId: FieldValue.delete(), deviceBoundAt: FieldValue.delete() });
  await endSessions(uid);
  return toStoreUser(await snap.ref.get(), ownerUid);
}

// POST /admin/stores/{slug}/users  { email, password }
// Another login for the store, with the same access as its owner.
export async function addStoreUser(slug, body) {
  const ownerUid = await storeOwnerUid(slug);
  const { email, password } = checkLogin(body);

  let user;
  try {
    user = await auth().createUser({ email, password });
  } catch (err) {
    throw accountError(err);
  }
  const ref = db().collection(USERS).doc(user.uid);
  await ref.set({ email, storeSlug: slug, addedAt: FieldValue.serverTimestamp() }, { merge: true });
  return toStoreUser(await ref.get(), ownerUid);
}

// DELETE /admin/stores/{slug}/users/{uid}
// Deletes an extra login: its sessions, users/{uid} and the Firebase account.
export async function removeStoreUser(slug, uid, actingUid) {
  const ownerUid = await storeOwnerUid(slug);
  await memberOf(slug, uid);
  if (uid === ownerUid) throw bad("The store owner can't be removed");
  if (uid === actingUid) throw bad("You can't remove your own account");

  await deleteLogin(uid);
}

// Ends the login's sessions and deletes users/{uid} and its Firebase account.
async function deleteLogin(uid) {
  await endSessions(uid);
  await db().collection(USERS).doc(uid).delete();
  try {
    await auth().deleteUser(uid);
  } catch (err) {
    // Already gone from Firebase Authentication: the login is removed either way.
    if (err?.code !== "auth/user-not-found") throw err;
  }
}

/* ---------- Deleting a whole store ---------- */

// Products from before stores existed belong to it, and the landing page links to it.
const DEMO_STORE = "demo";

const strings = (value) => (Array.isArray(value) ? value.filter((v) => typeof v === "string" && v) : []);

// DELETE /admin/stores/{slug}  { confirm: "<slug>" }
// Permanently deletes the store: its products and their images, every login (sessions,
// users/{uid} and the Firebase account) and stores/{slug}. The slug is then free to
// register again. Never the demo store or the caller's own store.
// The store is switched off first and its document deleted last, so if a step fails
// the store stays locked and calling this again finishes the job.
export async function deleteStore(slug, body, acting) {
  if (!STORE_SLUG_RE.test(slug ?? "")) throw bad("Invalid store");
  if (body?.confirm !== slug) throw bad("Type the store's link name to confirm");
  if (slug === DEMO_STORE) throw bad("The demo store can't be deleted");
  if (slug === acting.storeSlug) throw bad("You can't delete your own store");

  const ref = db().collection("stores").doc(slug);
  const store = await ref.get();
  if (!store.exists) throw storeNotFound();

  // 1. Lock everyone out at once (the owner's next request fails with STORE_INACTIVE).
  await ref.update({ active: false, updatedAt: FieldValue.serverTimestamp() });

  // 2. Products and their images, the logo and the cover image.
  const products = await db().collection("products").where("storeSlug", "==", slug).get();
  const images = [
    ...products.docs.flatMap((doc) => strings(doc.get("images"))),
    ...strings([store.get("logo"), store.get("coverImage")]),
  ];
  await deleteImages(images, slug);
  await deleteStoreFolder(slug);
  for (let i = 0; i < products.docs.length; i += 400) {
    const batch = db().batch();
    for (const doc of products.docs.slice(i, i + 400)) batch.delete(doc.ref);
    await batch.commit();
  }

  // 3. Every login of the store, including the owner's account.
  const users = await db().collection(USERS).where("storeSlug", "==", slug).get();
  const uids = new Set(users.docs.map((doc) => doc.id));
  const ownerUid = store.get("ownerUid");
  if (typeof ownerUid === "string" && UID_RE.test(ownerUid)) uids.add(ownerUid);
  uids.delete(acting.uid); // never the caller (their store is another one, checked above)
  for (const uid of uids) await deleteLogin(uid);

  // 4. The store itself.
  await ref.delete();
  return { slug, products: products.size, users: uids.size };
}
