"use client";

import { useRef, useState, type FormEvent } from "react";
import { Check, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { AuthError, loginNameOf } from "@/lib/adminAuth";
import { formatWhatsapp, requestWhatsapp, whatsappInputError, type StoreDetails } from "@/lib/adminStore";
import AuthLayout, {
  AuthActions,
  AuthSupportLink,
  authButtonClass,
  authFieldErrorClass,
  authFormClass,
  authInputClass,
  authInputIconClass,
  authLabelClass,
} from "./AuthLayout";
import { flagField, ripple } from "./ripple";
import { Spinner } from "./ui";

// Every store needs a WhatsApp number: the catalog's enquiries go there. AdminShell shows
// this screen in place of the admin while a store has none (just registered, from before
// the number was required, or its request was rejected). As in Store settings, the owner
// requests the number and a Catalog24 admin approves it; they can carry on meanwhile.
export default function WhatsappSetup({
  store,
  email,
  onDone,
  onLogout,
  loggingOut,
}: {
  store: StoreDetails;
  /** The logged-in account, so owners can tell which store they're in. */
  email: string;
  onDone: () => void;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  const [number, setNumber] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const rejected = store.whatsappRequest?.status === "rejected" ? store.whatsappRequest : null;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const problem = whatsappInputError(number);
    if (problem) {
      setFieldError(problem);
      return flagField(inputRef.current);
    }
    setBusy(true);
    setError(null);
    try {
      const saved = await requestWhatsapp(number);
      setSent(saved.whatsappRequest?.number ?? saved.whatsapp);
      // A moment to see the confirmation, then into the admin.
      setTimeout(onDone, 800);
    } catch (err) {
      setBusy(false);
      // A bad number belongs under the field.
      if (err instanceof AuthError && err.status === 400) {
        setFieldError(err.message);
        flagField(inputRef.current);
      } else {
        setError(err instanceof AuthError ? err.message : "Couldn't save the number. Please try again.");
      }
    }
  }

  if (sent !== null) {
    return (
      <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 bg-white px-6 text-center sm:bg-paper" role="status">
        <span className="admin-pop-check grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
          <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
        </span>
        <div className="admin-fade-in">
          <p className="text-lg font-bold text-ink">WhatsApp number added</p>
          <p className="mt-1 text-sm text-slate">
            <span className="font-semibold tabular-nums text-ink">{formatWhatsapp(sent)}</span> goes live once Catalog24 checks it
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Add your WhatsApp number"
      subtitle="Customers enquire from your catalog on WhatsApp, so their messages come to this number."
    >
      <form onSubmit={submit} noValidate className={authFormClass}>
        <div className="flex flex-col gap-5">
          {rejected && (
            <div className="admin-fade-in flex gap-2.5 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] leading-relaxed text-red-800">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
              <div className="min-w-0">
                <p className="font-semibold">
                  <span className="tabular-nums">{formatWhatsapp(rejected.number)}</span> wasn&apos;t approved
                </p>
                {rejected.reason && <p>Reason: {rejected.reason}</p>}
                <p className="text-red-700/90">Please add the right number below.</p>
              </div>
            </div>
          )}

          <div data-field>
            <label htmlFor="whatsapp-number" className={authLabelClass}>
              WhatsApp number
            </label>
            <div className="relative">
              <WhatsAppIcon className={authInputIconClass} aria-hidden />
              <input
                ref={inputRef}
                id="whatsapp-number"
                name="tel"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="done"
                data-autofocus=""
                maxLength={20}
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  setFieldError(null);
                }}
                aria-invalid={!!fieldError}
                aria-describedby={fieldError ? "whatsapp-number-error" : "whatsapp-number-help"}
                className={`${authInputClass} tabular-nums`}
                placeholder="98765 43210"
              />
            </div>
            {fieldError ? (
              <p id="whatsapp-number-error" className={authFieldErrorClass}>
                {fieldError}
              </p>
            ) : (
              <p id="whatsapp-number-help" className="mt-1.5 text-xs text-slate">
                Your 10-digit mobile number. For a number outside India, start with its country code.
              </p>
            )}
          </div>
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
          <button type="submit" disabled={busy || loggingOut} onPointerDown={ripple} className={authButtonClass}>
            {busy ? (
              <>
                <Spinner className="h-4 w-4" />
                Saving…
              </>
            ) : (
              "Continue"
            )}
          </button>
          <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[11px] leading-relaxed text-slate/80">
            <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
            Catalog24 checks every number before it goes live.
          </p>
          <p className="mt-2 text-center text-[13px] text-slate">
            Logged in as <span className="font-semibold text-ink">{loginNameOf(email)}</span> ·{" "}
            <button
              type="button"
              onClick={onLogout}
              disabled={busy || loggingOut}
              className="rounded-sm font-semibold text-primary hover:underline focus-visible:outline-none! focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:opacity-60"
            >
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </p>
          <AuthSupportLink prompt="Need help?" message="Hi Catalog24 support, I need help adding my WhatsApp number." />
        </AuthActions>
      </form>
    </AuthLayout>
  );
}
