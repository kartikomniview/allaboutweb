"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowRight, BookOpen, Eye, EyeOff, LayoutDashboard, Lock, Mail, ShieldCheck, TriangleAlert } from "lucide-react";
import {
  AuthError,
  checkSession,
  getRememberedEmail,
  login,
  saveBrowserCredential,
  setRememberedEmail,
} from "@/lib/adminAuth";
import { Spinner } from "@/components/admin/ui";
import "@/components/admin/admin.css";

const inputClass =
  "h-11 w-full rounded-btn border border-line bg-white pl-10 pr-3.5 text-base text-ink shadow-[0_1px_2px_rgba(1,18,60,0.04)] transition placeholder:text-slate/60 hover:border-slate/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-500/15 sm:text-sm";

const FEATURES = [
  { icon: BookOpen, title: "E-Catalog", text: "Add, edit and publish catalog products." },
  { icon: LayoutDashboard, title: "Dashboard", text: "See what's live on the site at a glance." },
  { icon: ShieldCheck, title: "Device-bound sessions", text: "Each sign-in is tied to a trusted device." },
] as const;

function BrandMark({ className = "h-9 w-9 text-base" }: { className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-lg bg-primary font-bold text-white ${className}`}>
      A
    </span>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-secondary text-white lg:flex lg:w-[44%] lg:max-w-xl lg:flex-col lg:justify-between lg:p-12 xl:p-14">
      {/* Soft brand glow + grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:40px_40px]"
      />

      <div className="relative flex items-center gap-3">
        <BrandMark />
        <span className="leading-tight">
          <span className="block text-base font-bold tracking-[-0.01em]">AllAboutWeb</span>
          <span className="block text-xs font-medium text-white/60">Content Studio</span>
        </span>
      </div>

      <div className="relative">
        <h2 className="max-w-sm text-[2rem] font-bold leading-[1.15] tracking-[-0.03em]">
          Manage your website content in one place.
        </h2>
        <ul className="mt-10 flex flex-col gap-6">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-btn bg-white/10 ring-1 ring-inset ring-white/15">
                <Icon className="h-[18px] w-[18px] text-primary" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold">{title}</span>
                <span className="mt-0.5 block text-sm text-white/65">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/45">© {new Date().getFullYear()} AllAboutWeb. Authorised personnel only.</p>
    </aside>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

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
        if (saved) setEmail(saved);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  function trackCapsLock(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState("CapsLock"));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    setError(null);
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

  if (checking) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10" role="status">
        <BrandMark className="h-11 w-11 text-lg" />
        <div className="flex items-center gap-2 text-sm font-medium text-slate">
          <Spinner className="h-4 w-4 text-primary" />
          Checking session…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-1">
      <BrandPanel />

      <section className="flex flex-1 flex-col px-4 py-8 sm:px-8">
        {/* Mobile brand header */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <BrandMark className="h-8 w-8 text-sm" />
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-[-0.01em] text-ink">AllAboutWeb</span>
            <span className="block text-[11px] font-medium text-slate">Content Studio</span>
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="admin-pop-in w-full max-w-[400px]">
            <div className="mb-8">
              <span className="grid h-11 w-11 place-items-center rounded-btn bg-tint text-primary ring-1 ring-inset ring-primary/15">
                <Lock className="h-5 w-5" aria-hidden />
              </span>
              <h1 className="mt-5 text-[1.75rem] font-bold leading-tight tracking-[-0.03em] text-ink">Welcome back</h1>
              <p className="mt-1.5 text-sm leading-relaxed text-slate">
                Sign in to the admin console to manage your site.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-ink">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate/70"
                    aria-hidden
                  />
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    autoFocus={!email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!error && !email.trim()}
                    className={inputClass}
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-ink">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate/70"
                    aria-hidden
                  />
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    autoFocus={!!email}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={trackCapsLock}
                    onKeyUp={trackCapsLock}
                    onBlur={() => setCapsLock(false)}
                    aria-invalid={!!error && !password}
                    className={`${inputClass} pr-11`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate transition-colors hover:bg-ink/[0.05] hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
                {capsLock && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                    <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
                    Caps Lock is on
                  </p>
                )}
              </div>

              <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-slate">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-line accent-primary"
                />
                Remember me on this device
              </label>

              {error && (
                <div
                  role="alert"
                  className="admin-fade-in flex items-start gap-2.5 rounded-btn border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-medium text-red-700"
                >
                  <TriangleAlert className="mt-px h-4 w-4 shrink-0" aria-hidden />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-primary px-6 text-[0.9375rem] font-semibold text-white shadow-[0_1px_2px_rgba(1,18,60,0.12),0_10px_24px_-12px_rgba(252,108,38,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] transition hover:bg-[#e85f1c] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 flex items-center justify-center gap-1.5 border-t border-line pt-6 text-xs text-slate">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
              Secure sign-in · Sessions are bound to this device
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
