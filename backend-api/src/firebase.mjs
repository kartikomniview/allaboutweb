import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let firestore;

// Initialised lazily so a warm Lambda reuses the same app across invocations.
function app() {
  const existing = getApps()[0];
  if (existing) return existing;

  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!encoded) throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set");
  const serviceAccount = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  return initializeApp({ credential: cert(serviceAccount) });
}

export function db() {
  if (firestore) return firestore;
  firestore = getFirestore(app());
  // REST transport starts faster than gRPC on Lambda cold starts.
  firestore.settings({ preferRest: true });
  return firestore;
}

// Firebase Authentication (Admin SDK): used to create accounts at registration.
export const auth = () => getAuth(app());
