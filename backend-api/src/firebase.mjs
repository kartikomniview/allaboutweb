import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let firestore;

// Initialised lazily so a warm Lambda reuses the same client across invocations.
export function db() {
  if (firestore) return firestore;

  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!encoded) throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set");
  const serviceAccount = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));

  const app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });
  firestore = getFirestore(app);
  // REST transport starts faster than gRPC on Lambda cold starts.
  firestore.settings({ preferRest: true });
  return firestore;
}
