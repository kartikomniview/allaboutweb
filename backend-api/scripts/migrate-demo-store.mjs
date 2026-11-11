// One-time migration to stores: puts every existing product (and the existing
// admin account) into the store "Demo" (slug "demo", demo.catalog24.in).
//
// Run from backend-api/, with the same service account the Lambda uses:
//
//   $env:FIREBASE_SERVICE_ACCOUNT_BASE64 = "<base64 of the service account JSON>"
//   node scripts/migrate-demo-store.mjs --admin-email=you@example.com --dry-run
//   node scripts/migrate-demo-store.mjs --admin-email=you@example.com
//
// Safe to run again: products that already have a store and an existing
// stores/demo document are left as they are. It also clears the admin's device
// binding (see step 2), so log in on catalog24.in right after running it.

import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "../src/firebase.mjs";

const SLUG = "demo";
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.length ? rest.join("=") : true];
  }),
);
const dryRun = Boolean(args["dry-run"]);
const adminEmail = typeof args["admin-email"] === "string" ? args["admin-email"].trim().toLowerCase() : "";

if (!adminEmail) {
  console.error("Pass the existing admin's login email: --admin-email=you@example.com");
  process.exit(1);
}

// The details the demo catalog showed before stores existed
// (STORE in src/components/furniture-catalog/data.ts, WHATSAPP_NUMBER in src/lib/contact.ts).
const DEMO_DETAILS = {
  name: "Demo",
  slug: SLUG,
  whatsapp: "918269329125",
  phone: "+91 8269329125",
  publicEmail: "hello@mystore.example",
  address: "Shop No. 12, Example Furniture Market, MG Road, Your City – 560001",
  hours: "Mon – Sun · 10:30 AM – 8:30 PM",
  tagline: "Solid Wood",
  category: "Solid Wood Furniture Store",
  since: 2012,
  coverImage: "",
};

const log = (...parts) => console.log(dryRun ? "[dry run]" : "", ...parts);

const admin = await auth().getUserByEmail(adminEmail);
log(`Admin account: ${admin.email} (${admin.uid})`);

// 1. The store.
const storeRef = db().collection("stores").doc(SLUG);
const store = await storeRef.get();
if (store.exists) {
  log(`stores/${SLUG} already exists (owner ${store.get("ownerUid") || "none"}), left as is`);
} else {
  log(`Creating stores/${SLUG} "${DEMO_DETAILS.name}"`);
  if (!dryRun) {
    await storeRef.create({
      ...DEMO_DETAILS,
      ownerUid: admin.uid,
      email: admin.email,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

// 2. The admin account owns it. The admin panel moves from allaboutw3b.in to
// catalog24.in, where the browser has a new device id, so the device binding is
// cleared once: the next login (on catalog24.in) binds the device again.
log(`Setting users/${admin.uid}.storeSlug = "${SLUG}" and clearing its device binding`);
if (!dryRun) {
  await db()
    .collection("users")
    .doc(admin.uid)
    .set({ email: admin.email, storeSlug: SLUG, deviceId: FieldValue.delete() }, { merge: true });
}

// 3. Products without a store.
const products = await db().collection("products").get();
const toMove = products.docs.filter((doc) => !doc.get("storeSlug"));
log(`${products.size} products, ${toMove.length} without a store`);
for (let i = 0; i < toMove.length; i += 400) {
  const batch = db().batch();
  for (const doc of toMove.slice(i, i + 400)) batch.update(doc.ref, { storeSlug: SLUG });
  if (!dryRun) await batch.commit();
}
log(`Moved ${toMove.length} products to "${SLUG}"`);
log(dryRun ? "Nothing was written. Run again without --dry-run to apply." : "Done.");
