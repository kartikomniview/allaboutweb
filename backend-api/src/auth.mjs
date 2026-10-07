import { HttpError } from "./http.mjs";

const SIGN_IN_URL =
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";

const INVALID = [401, "INVALID_CREDENTIALS", "Invalid email or password"];
const FIREBASE_ERRORS = {
  INVALID_LOGIN_CREDENTIALS: INVALID,
  EMAIL_NOT_FOUND: INVALID,
  INVALID_PASSWORD: INVALID,
  INVALID_EMAIL: INVALID,
  USER_DISABLED: [403, "USER_DISABLED", "This account has been disabled"],
  TOO_MANY_ATTEMPTS_TRY_LATER: [
    429,
    "TOO_MANY_ATTEMPTS",
    "Too many failed attempts. Please try again later",
  ],
};

// Verifies email/password against Firebase Authentication.
export async function signInWithPassword(email, password) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) throw new Error("FIREBASE_WEB_API_KEY is not set");

  const res = await fetch(`${SIGN_IN_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Firebase sometimes appends details, e.g. "TOO_MANY_ATTEMPTS_TRY_LATER : Access ..."
    const firebaseCode = String(data?.error?.message ?? "").split(" ")[0];
    const mapped = FIREBASE_ERRORS[firebaseCode];
    if (mapped) throw new HttpError(...mapped);
    console.error("Firebase sign-in failed", res.status, data?.error);
    throw new HttpError(502, "AUTH_PROVIDER_ERROR", "Could not verify credentials");
  }

  return { uid: data.localId, email: data.email };
}
