"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Check, Eye, EyeOff, Lock, Store, TriangleAlert, UserRound, X } from "lucide-react";
import {
  AuthError,
  LOGIN_DOMAIN,
  USERNAME_RE,
  checkSession,
  checkStoreName,
  register,
  type StoreNameCheck,
} from "@/lib/adminAuth";
import { Spinner } from "@/components/admin/ui";
import AuthLayout, {
  AuthActions,
  AuthLoading,
  AuthProgress,
  authButtonClass,
  authFieldErrorClass as fieldErrorClass,
  authFormClass,
  authInputClass as inputClass,
  authInputIconClass as iconClass,
  authLabelClass as labelClass,
  authSecondaryButtonClass,
} from "@/components/admin/AuthLayout";
import BusinessTypePicker from "@/components/admin/BusinessTypePicker";
import PasswordStrength from "@/components/admin/PasswordStrength";
import { flagField, ripple } from "@/components/admin/ripple";
import type { BusinessTypeId } from "@/lib/taxonomy";
import "@/components/admin/admin.css";

// Same rule as the API (backend-api/src/stores.mjs): "Demo Store" -> "demostore".
const toSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "");


type NameStatus =
  | { state: "idle" }
  | { state: "checking"; slug: string }
  | { state: "done"; result: StoreNameCheck }
  | { state: "error" };

type Field = "storeName" | "businessTypes" | "email" | "password" | "confirm";
type FieldErrors = Partial<Record<Field, string>>;

// The registration steps: the store's name (its link), what it sells, then the
// owner's login. The WhatsApp number and other details are added in Store settings.
const STEPS = [
  { title: "Name your store", subtitle: "This is also your catalog's link. You can change the name later, not the link.", label: "Store" },
  { title: "What do you sell?", subtitle: "Choose all that apply. We suggest product categories for these.", label: "Business" },
  { title: "Create your login", subtitle: "You'll use these to manage your store.", label: "Login" },
] as const;

export default function RegisterStorePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [storeName, setStoreName] = useState("");
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeId[]>([]);
  // The login username (the account email is username@catalog24.in). Until the owner
  // edits it, it follows the store's link name: "My Store" -> mystore.
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const [checking, setChecking] = useState(true);

  const storeNameRef = useRef<HTMLInputElement>(null);
  const typesRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  // Already logged in on this device: straight to the dashboard.
  useEffect(() => {
    checkSession()
      .then((user) => (user ? router.replace("/admin/dashboard") : setChecking(false)))
      .catch(() => setChecking(false));
  }, [router]);

  const slug = toSlug(storeName.trim());
  const username = usernameEdited ? usernameInput : slug.slice(0, 30);

  // Live "is this name free?" check, a moment after typing stops. The status shown
  // is derived from the latest answer, so it's "checking" until one for this slug arrives.
  const [lastCheck, setLastCheck] = useState<{ slug: string; result: StoreNameCheck | null } | null>(null);
  useEffect(() => {
    const name = storeName.trim();
    if (toSlug(name).length < 3) return;
    const timer = setTimeout(() => {
      checkStoreName(name)
        .then((result) => setLastCheck({ slug: toSlug(name), result }))
        .catch(() => setLastCheck({ slug: toSlug(name), result: null }));
    }, 400);
    return () => clearTimeout(timer);
  }, [storeName]);

  const nameStatus: NameStatus =
    slug.length < 3
      ? { state: "idle" }
      : lastCheck?.slug !== slug
        ? { state: "checking", slug }
        : lastCheck.result
          ? { state: "done", result: lastCheck.result }
          : { state: "error" };
  const nameTaken = nameStatus.state === "done" && !nameStatus.result.available;

  // The problems in a step, by field (empty when the step is complete).
  function stepErrors(i: number): FieldErrors {
    const errors: FieldErrors = {};
    if (i === 0) {
      if (storeName.trim().length < 3 || slug.length < 3) errors.storeName = "Enter at least 3 letters or numbers.";
      else if (nameTaken) errors.storeName = nameStatus.result.message || "This name is already taken. Try another.";
    }
    if (i === 1 && !businessTypes.length) errors.businessTypes = "Choose at least one.";
    if (i === 2) {
      if (!username) errors.email = "Choose a username.";
      else if (!USERNAME_RE.test(username)) errors.email = "Use 3 to 30 letters, numbers, dots, dashes or underscores.";
      if (password.length < 6) errors.password = "Use at least 6 characters.";
      if (password.length >= 6 && confirm !== password) errors.confirm = "The passwords don't match.";
    }
    return errors;
  }

  // Focus (and shake) the first field with a problem.
  function flagFirst(errors: FieldErrors) {
    if (errors.storeName) flagField(storeNameRef.current);
    else if (errors.businessTypes) flagField(typesRef.current?.querySelector("button") ?? null);
    else if (errors.email) flagField(emailRef.current);
    else if (errors.password) flagField(passwordRef.current);
    else if (errors.confirm) flagField(confirmRef.current);
  }

  const clearError = (field: Field) => fieldErrors[field] && setFieldErrors((f) => ({ ...f, [field]: undefined }));

  // Steps live in the URL (?step=1) and the browser history, so the phone's back
  // button or gesture goes back a step instead of leaving the page. (The URL, not
  // history.state: Next.js rewrites the state of the current entry.)
  // Errors to show once a history step change lands (see STORE_TAKEN below).
  const pendingErrors = useRef<FieldErrors | null>(null);
  const stepErrorsRef = useRef(stepErrors);
  const stepRef = useRef(step);
  useEffect(() => {
    stepErrorsRef.current = stepErrors;
    stepRef.current = step;
  });
  useEffect(() => {
    if (checking) return;
    // Reloaded in the middle: the form starts over at the first step.
    if (new URLSearchParams(window.location.search).has("step")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    const onPopState = () => {
      const raw = Number(new URLSearchParams(window.location.search).get("step") ?? 0);
      const target = Number.isInteger(raw) ? Math.min(Math.max(raw, 0), STEPS.length - 1) : 0;
      const current = stepRef.current;
      // Browser "forward": only into steps whose earlier steps are complete.
      if (target > current && Object.keys(stepErrorsRef.current(current)).length) {
        window.history.go(current - target);
        return;
      }
      setDirection(target < current ? "left" : "right");
      setError(null);
      setFieldErrors(pendingErrors.current ?? {});
      pendingErrors.current = null;
      setStep(target);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [checking]);

  const goBack = () => window.history.back();

  function goForward() {
    const next = step + 1;
    const url = new URL(window.location.href);
    url.searchParams.set("step", String(next));
    // No custom state: Next.js copies its own in and keeps its router in sync with the URL.
    window.history.pushState(null, "", url.pathname + url.search);
    setDirection("right");
    setError(null);
    setFieldErrors({});
    setStep(next);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors = stepErrors(step);
    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length) return flagFirst(errors);
    if (step < STEPS.length - 1) return goForward();

    setSubmitting(true);
    try {
      await register({ storeName: storeName.trim(), businessTypes, email: `${username}@${LOGIN_DOMAIN}`, password });
      setCreated(true);
      // A moment to see the confirmation, then into the dashboard.
      setTimeout(() => router.replace("/admin/dashboard"), 700);
    } catch (err) {
      setSubmitting(false);
      const message = err instanceof AuthError ? err.message : "Something went wrong. Please try again.";
      if (err instanceof AuthError && err.code === "STORE_TAKEN") {
        // Someone took the name in the meantime: back to the first step.
        pendingErrors.current = { storeName: message };
        setLastCheck(null);
        window.history.go(-step);
        return;
      }
      if (err instanceof AuthError && err.code === "EMAIL_TAKEN") {
        setFieldErrors({ email: "This username is taken. Try another one." });
        return flagField(emailRef.current);
      }
      setError(message);
    }
  }

  if (checking) return <AuthLoading label="Loading…" />;

  if (created) {
    return (
      <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 bg-white px-6 text-center sm:bg-paper" role="status">
        <span className="admin-pop-check grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
          <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
        </span>
        <div className="admin-fade-in">
          <p className="text-lg font-bold text-ink">Your store is ready</p>
          <p className="mt-1 text-sm text-slate">
            <span className="font-semibold text-ink">{slug}</span>.catalog24.in
          </p>
        </div>
      </div>
    );
  }

  const { title, subtitle } = STEPS[step];
  const waitingForCheck = step === 0 && nameStatus.state === "checking";

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
      progress={<AuthProgress current={step} total={STEPS.length} label={STEPS[step].label} />}
      onBack={step > 0 ? goBack : undefined}
      contentKey={step}
      contentClassName={direction === "right" ? "admin-step-in-right" : "admin-step-in-left"}
    >
      <form onSubmit={handleSubmit} noValidate className={authFormClass}>
        {step === 0 && (
          <div data-field>
            <label htmlFor="store-name" className={labelClass}>
              Store name
            </label>
            <div className="relative">
              <Store className={iconClass} aria-hidden />
              <input
                ref={storeNameRef}
                id="store-name"
                name="organization"
                autoComplete="organization"
                autoCapitalize="words"
                enterKeyHint="next"
                data-autofocus=""
                value={storeName}
                onChange={(e) => {
                  setStoreName(e.target.value);
                  clearError("storeName");
                }}
                maxLength={40}
                aria-invalid={!!fieldErrors.storeName || nameTaken}
                aria-describedby="store-link"
                className={inputClass}
                placeholder="e.g. Sharma Home Store"
              />
            </div>
            <div
              id="store-link"
              aria-live="polite"
              className="mt-3 flex min-h-11 items-center gap-2 rounded-md border border-line bg-paper px-3.5 py-2.5 text-[13px]"
            >
              {slug.length >= 3 ? (
                <>
                  <span className="min-w-0 flex-1 truncate text-slate">
                    <span className="font-semibold text-ink">{slug}</span>.catalog24.in
                  </span>
                  {nameStatus.state === "checking" && <Spinner className="h-3.5 w-3.5 shrink-0 text-slate" />}
                  {nameStatus.state === "done" &&
                    (nameStatus.result.available ? (
                      <span className="admin-fade-in inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        Available
                      </span>
                    ) : (
                      <span className="admin-fade-in inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-red-600">
                        <X className="h-3.5 w-3.5" aria-hidden />
                        Taken
                      </span>
                    ))}
                </>
              ) : (
                <span className="text-slate">
                  Your link: <span className="font-semibold text-ink">yourstore</span>.catalog24.in
                </span>
              )}
            </div>
            {(fieldErrors.storeName || nameTaken) && (
              <p className={fieldErrorClass}>{fieldErrors.storeName ?? (nameTaken ? nameStatus.result.message : "")}</p>
            )}
          </div>
        )}

        {step === 1 && (
          <div ref={typesRef} data-field>
            <span id="store-types-label" className="sr-only">
              What do you sell?
            </span>
            <BusinessTypePicker
              value={businessTypes}
              onChange={(next) => {
                setBusinessTypes(next);
                clearError("businessTypes");
              }}
              labelledBy="store-types-label"
            />
            {fieldErrors.businessTypes && <p className={fieldErrorClass}>{fieldErrors.businessTypes}</p>}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div data-field>
              <label htmlFor="store-email" className={labelClass}>
                Username
              </label>
              <div className="relative">
                <UserRound className={iconClass} aria-hidden />
                <input
                  ref={emailRef}
                  id="store-email"
                  name="username"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="next"
                  data-autofocus=""
                  maxLength={30}
                  value={username}
                  onChange={(e) => {
                    setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""));
                    setUsernameEdited(true);
                    clearError("email");
                  }}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "store-email-error" : "store-email-help"}
                  className={`${inputClass} pr-[8.5rem]`}
                  placeholder="yourstore"
                />
                {/* The fixed domain after the username */}
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[15px] text-slate">
                  @{LOGIN_DOMAIN}
                </span>
              </div>
              {fieldErrors.email ? (
                <p id="store-email-error" className={fieldErrorClass}>
                  {fieldErrors.email}
                </p>
              ) : (
                <p id="store-email-help" className="mt-1.5 text-xs text-slate">
                  You&apos;ll log in with <span className="font-semibold text-ink">{username || "yourstore"}</span>. We suggested
                  your store&apos;s name; change it if you like.
                </p>
              )}
            </div>

            <div data-field>
              <label htmlFor="store-password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <Lock className={iconClass} aria-hidden />
                <input
                  ref={passwordRef}
                  id="store-password"
                  name="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="next"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby="store-password-help"
                  className={`${inputClass} pr-12`}
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  onPointerDown={ripple}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-0.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center overflow-hidden rounded-md text-slate transition-colors hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" aria-hidden />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" aria-hidden />
                  )}
                </button>
              </div>
              <div id="store-password-help">
                {fieldErrors.password ? (
                  <p className={fieldErrorClass}>{fieldErrors.password}</p>
                ) : (
                  password && <PasswordStrength password={password} />
                )}
              </div>
            </div>

            <div data-field>
              <label htmlFor="store-confirm" className={labelClass}>
                Confirm password
              </label>
              <div className="relative">
                <Lock className={iconClass} aria-hidden />
                <input
                  ref={confirmRef}
                  id="store-confirm"
                  name="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="done"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    clearError("confirm");
                  }}
                  aria-invalid={!!fieldErrors.confirm}
                  aria-describedby={fieldErrors.confirm ? "store-confirm-error" : undefined}
                  className={inputClass}
                  placeholder="Type it again"
                />
                {confirm && confirm === password && (
                  <Check
                    className="admin-pop-check pointer-events-none absolute right-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-emerald-600"
                    aria-label="Passwords match"
                  />
                )}
              </div>
              {fieldErrors.confirm && (
                <p id="store-confirm-error" className={fieldErrorClass}>
                  {fieldErrors.confirm}
                </p>
              )}
            </div>
          </div>
        )}

        <AuthActions>
          {error && (
            <div
              role="alert"
              className="admin-fade-in mb-3 flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-medium text-red-700"
            >
              <TriangleAlert className="mt-px h-4 w-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-2.5">
            {/* Larger screens: back next to Continue (phones use the top bar's arrow). */}
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                onPointerDown={ripple}
                disabled={submitting}
                aria-label="Back"
                className={`${authSecondaryButtonClass} hidden w-12 shrink-0 px-0 sm:inline-flex`}
              >
                <ArrowLeft className="h-[18px] w-[18px]" aria-hidden />
              </button>
            )}
            <button type="submit" disabled={submitting || waitingForCheck} onPointerDown={ripple} className={authButtonClass}>
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Creating your store…
                </>
              ) : step < STEPS.length - 1 ? (
                "Continue"
              ) : (
                "Create store"
              )}
            </button>
          </div>
          {step === 0 ? (
            <p className="mt-3 text-center text-sm text-slate">
              Already have a store?{" "}
              <Link href="/admin" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </p>
          ) : (
            step === STEPS.length - 1 && (
              <p className="mt-3 text-center text-[11px] leading-relaxed text-slate/80">
                For security, your account works on this device only.
              </p>
            )
          )}
        </AuthActions>
      </form>
    </AuthLayout>
  );
}
