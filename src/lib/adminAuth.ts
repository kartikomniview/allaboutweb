// Client-side helpers for the admin auth API (backend-api/ → API Gateway + Lambda).
// Browser-only: everything here touches localStorage.

import { toBusinessTypes, type BusinessTypeId } from "./taxonomy";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
const DEVICE_KEY = "aaw_device_id";
const TOKEN_KEY = "aaw_admin_token";
const EMAIL_KEY = "aaw_admin_email";

/** The store the account owns: `slug` is its subdomain (demostore.catalog24.in). */
export type AdminStore = {
  slug: string;
  name: string;
  businessTypes: BusinessTypeId[];
  /** Most products the store may have; null = unlimited. */
  productLimit: number | null;
  active: boolean;
};

// Fills fields missing from older stores and API builds.
const withStore = (user: AdminUser): AdminUser => ({
  ...user,
  isSuperAdmin: user.isSuperAdmin === true,
  store: {
    ...user.store,
    businessTypes: toBusinessTypes(user.store.businessTypes),
    productLimit: typeof user.store.productLimit === "number" ? user.store.productLimit : null,
    active: user.store.active !== false,
  },
});
/** isSuperAdmin: may manage every store (the All stores page). */
export type AdminUser = { uid: string; email: string; store: AdminStore; isSuperAdmin: boolean };

export class AuthError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// A random id created once per browser. Clearing site data makes this browser
// a "new device", which then needs a manual reset in Firestore.
export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

// "Remember me" only keeps the email. The password goes to the browser's own
// password manager (see saveBrowserCredential), never to localStorage.
export function getRememberedEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}

export function setRememberedEmail(email: string | null): void {
  if (email) localStorage.setItem(EMAIL_KEY, email);
  else localStorage.removeItem(EMAIL_KEY);
}

// Credential Management API (Chromium only, not in TS's DOM lib). Asks the
// browser to save the email/password in its password manager, which stores
// it encrypted and autofills the form next time. Other browsers fall back to
// their usual "save password?" prompt triggered by the form's autocomplete attrs.
type PasswordCredentialCtor = new (data: { id: string; password: string; name?: string }) => Credential;

export async function saveBrowserCredential(email: string, password: string): Promise<void> {
  const Ctor = (window as unknown as { PasswordCredential?: PasswordCredentialCtor }).PasswordCredential;
  if (!Ctor || !navigator.credentials) return;
  try {
    await navigator.credentials.store(new Ctor({ id: email, password, name: email }));
  } catch {
    // The user dismissed the prompt or the browser blocked it — not an error.
  }
}

const getToken = () => localStorage.getItem(TOKEN_KEY);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// For server actions that check the admin session with the API themselves.
export const sessionCredentials = () => ({ token: getToken() ?? "", deviceId: getDeviceId() });

// Calls the admin API with this device's id and session token attached.
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE) {
    throw new AuthError(0, "CONFIG", "NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const headers = new Headers(init.headers);
  headers.set("x-device-id", getDeviceId());
  const token = getToken();
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (init.body) headers.set("content-type", "application/json");

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new AuthError(0, "NETWORK", "Could not reach the server. Check your connection.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new AuthError(
      res.status,
      data.code ?? "ERROR",
      data.message ?? "Something went wrong. Please try again.",
    );
  }
  return data as T;
}

export async function login(email: string, password: string): Promise<AdminUser> {
  const data = await apiRequest<{ token: string; user: AdminUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, deviceId: getDeviceId() }),
  });
  // An API from before stores existed logs in without a store; the admin can't work with that.
  if (!data.user?.store?.slug) {
    throw new AuthError(
      500,
      "NO_STORE",
      "This account has no store yet. Deploy the latest backend and run the Demo store migration.",
    );
  }
  localStorage.setItem(TOKEN_KEY, data.token);
  return withStore(data.user);
}

export type Registration = {
  storeName: string;
  /** Optional: added later in Store settings. */
  whatsapp?: string;
  businessTypes: BusinessTypeId[];
  email: string;
  password: string;
};

// Creates the store and the owner's account, and logs them in on this device.
export async function register(details: Registration): Promise<AdminUser> {
  const data = await apiRequest<{ token: string; user: AdminUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...details, deviceId: getDeviceId() }),
  });
  localStorage.setItem(TOKEN_KEY, data.token);
  return withStore(data.user);
}

export type StoreNameCheck = { slug: string; available: boolean; message: string };

// Whether a store name is still free (for the registration form's live check).
export function checkStoreName(name: string): Promise<StoreNameCheck> {
  return apiRequest<StoreNameCheck>(`/stores/check?name=${encodeURIComponent(name)}`);
}

// Returns the logged-in user, or null when there is no valid session.
export async function checkSession(): Promise<AdminUser | null> {
  if (!getToken()) return null;
  try {
    const data = await apiRequest<{ user: AdminUser }>("/auth/session");
    if (!data.user?.store?.slug) {
      clearToken();
      return null;
    }
    return withStore(data.user);
  } catch (err) {
    // 401: no valid session. 403 NO_STORE: an account without a store.
    // 403 STORE_INACTIVE: the store was deactivated (the login page explains it).
    if (err instanceof AuthError && (err.status === 401 || err.code === "NO_STORE" || err.code === "STORE_INACTIVE")) {
      clearToken();
      return null;
    }
    throw err;
  }
}

export async function logout(): Promise<void> {
  try {
    if (getToken()) await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    clearToken();
  }
}
