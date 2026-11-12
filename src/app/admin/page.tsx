"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, ShieldCheck, TriangleAlert, UserRound } from "lucide-react";
import {
  AuthError,
  checkSession,
  LOGIN_DOMAIN,
  USERNAME_RE,
  cleanUsername,
  getRememberedEmail,
  loginNameOf,
  login,
  saveBrowserCredential,
  setRememberedEmail,
  toLoginEmail,
} from "@/lib/adminAuth";
import { Spinner } from "@/components/admin/ui";
import AuthLayout, {
  AuthActions,
  AuthLoading,
  authButtonClass,
  authFieldErrorClass as fieldErrorClass,
  authFormClass,
  authInputClass as inputClass,
  authInputIconClass as iconClass,
  authLabelClass as labelClass,
} from "@/components/admin/AuthLayout";
import { flagField, ripple } from "@/components/admin/ripple";
import "@/components/admin/admin.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = { email?: string; password?: string };

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Skip the form if this device already has a valid session; otherwise
  // prefill the email remembered from the last successful sign-in.
  useEffect(() => {
    checkSession()
      .then((user) => {
        if (user) {
          router.replace("/admin/dashboard");
          return;
        }
        const saved = getRememberedEmail();
        if (saved) setEmail(loginNameOf(saved));
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  function trackCapsLock(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState("CapsLock"));
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const value = email.trim().toLowerCase();
    if (!value) next.email = "Enter your username.";
    else if (value.includes("@") ? !EMAIL_RE.test(value) : !USERNAME_RE.test(value)) {
      next.email = "Check your username: letters, numbers, dots, dashes or underscores.";
    }
    if (!password) next.password = "Enter your password.";
    return next;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    setError(null);
    if (errors.email) return flagField(emailRef.current);
    if (errors.password) return flagField(passwordRef.current);

    // "mystore" logs in as mystore@catalog24.in; a full email is used as it is.
    const trimmed = toLoginEmail(email);
    setSubmitting(true);
    try {
      await login(trimmed, password);
      setRememberedEmail(remember ? trimmed : null);
      if (remember) await saveBrowserCredential(trimmed, password);
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (checking) return <AuthLoading label="Checking session…" />;

  return (
    <AuthLayout title="Log in" subtitle="Manage your store's products and details." contentClassName="admin-fade-in">
      <form onSubmit={handleSubmit} noValidate className={authFormClass}>
        <div className="flex flex-col gap-5">
          <div data-field>
            <label htmlFor="admin-email" className={labelClass}>
              Username
            </label>
            <div className="relative">
              <UserRound className={iconClass} aria-hidden />
              <input
                ref={emailRef}
                id="admin-email"
                name="username"
                type="text"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="next"
                data-autofocus={email ? undefined : ""}
                value={email}
                onChange={(e) => {
                  setEmail(cleanUsername(e.target.value));
                  if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
                }}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "admin-email-error" : "admin-email-domain"}
                className={`${inputClass} ${email.includes("@") ? "" : "pr-[8.5rem]"}`}
                placeholder="yourstore"
              />
              {/* The fixed domain, shown after the username (hidden if a full email is typed) */}
              {!email.includes("@") && (
                <span
                  id="admin-email-domain"
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[15px] text-slate"
                >
                  @{LOGIN_DOMAIN}
                </span>
              )}
            </div>
            {fieldErrors.email && (
              <p id="admin-email-error" className={fieldErrorClass}>
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div data-field>
            <label htmlFor="admin-password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <Lock className={iconClass} aria-hidden />
              <input
                ref={passwordRef}
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="go"
                data-autofocus={email ? "" : undefined}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
                }}
                onKeyDown={trackCapsLock}
                onKeyUp={trackCapsLock}
                onBlur={() => setCapsLock(false)}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "admin-password-error" : undefined}
                className={`${inputClass} pr-12`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                onPointerDown={ripple}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-0.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center overflow-hidden rounded-md text-slate transition-colors hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" aria-hidden /> : <Eye className="h-[18px] w-[18px]" aria-hidden />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p id="admin-password-error" className={fieldErrorClass}>
                {fieldErrors.password}
              </p>
            ) : (
              capsLock && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                  <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
                  Caps Lock is on
                </p>
              )
            )}
          </div>

          <label className="-my-1.5 flex min-h-11 cursor-pointer select-none items-center gap-3 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-[18px] w-[18px] cursor-pointer rounded-sm border-line accent-primary"
            />
            Remember me on this device
          </label>
        </div>

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
          <button type="submit" disabled={submitting} onPointerDown={ripple} className={authButtonClass}>
            {submitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Logging in…
              </>
            ) : (
              "Log in"
            )}
          </button>
          <p className="mt-3 text-center text-sm text-slate">
            New to Catalog24?{" "}
            <Link href="/admin/register" className="font-semibold text-primary hover:underline">
              Create your store
            </Link>
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate/80">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
            Secure sign-in · Sessions are bound to this device
          </p>
        </AuthActions>
      </form>
    </AuthLayout>
  );
}
