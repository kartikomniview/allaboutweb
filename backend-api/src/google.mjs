import { OAuth2Client } from "google-auth-library";
import { auth, db } from "./firebase.mjs";
import { HttpError } from "./http.mjs";

// "Continue with Google": the website gets an ID token from Google Identity Services
// and sends it here. We check it ourselves (signature, expiry, and that it was issued
// for our OAuth client), then use the same users/sessions as password logins.
//
// Lambda env GOOGLE_CLIENT_ID: the OAuth web client ID (the one Firebase shows under
// Authentication → Sign-in method → Google → Web SDK configuration). Several can be
// given, comma-separated.

const USERS = "users";
let client;

const clientIds = () =>
  String(process.env.GOOGLE_CLIENT_ID ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

const invalid = () => new HttpError(401, "GOOGLE_INVALID", "Google sign-in failed. Please try again.");

/** The Google account behind an ID token: { sub, email, name }. */
export async function verifyGoogleIdToken(idToken) {
  const audience = clientIds();
  if (!audience.length) throw new Error("GOOGLE_CLIENT_ID is not set");
  if (typeof idToken !== "string" || idToken.length < 20 || idToken.length > 4096) {
    throw new HttpError(400, "BAD_REQUEST", "A Google credential is required");
  }

  client ??= new OAuth2Client();
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken, audience });
    payload = ticket.getPayload();
  } catch {
    throw invalid();
  }
  if (!payload?.sub || !payload.email) throw invalid();
  // Only an address Google has verified can stand in for a login.
  if (payload.email_verified !== true) {
    throw new HttpError(403, "GOOGLE_EMAIL_UNVERIFIED", "This Google account's email isn't verified.");
  }
  return { sub: payload.sub, email: payload.email.toLowerCase(), name: payload.name ?? "" };
}

/**
 * The account (Firebase uid) a Google account signs in to, or null:
 * the one already linked to it, else the account with the same email (then linked).
 */
export async function findGoogleAccount(google) {
  const linked = await db().collection(USERS).where("googleSub", "==", google.sub).limit(1).get();
  if (!linked.empty) return { uid: linked.docs[0].id, email: linked.docs[0].get("email") ?? google.email };

  let user;
  try {
    user = await auth().getUserByEmail(google.email);
  } catch (err) {
    if (err?.code === "auth/user-not-found") return null;
    throw err;
  }
  await db().collection(USERS).doc(user.uid).set({ googleSub: google.sub }, { merge: true });
  return { uid: user.uid, email: user.email ?? google.email };
}
