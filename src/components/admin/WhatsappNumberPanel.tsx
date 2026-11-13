"use client";

import { useState, type FormEvent } from "react";
import { Clock, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { authFieldErrorClass, authInputClass, authInputIconClass, authLabelClass } from "./AuthLayout";
import { flagField, ripple } from "./ripple";
import { Badge, Button, formatRelative } from "./ui";
import { AuthError } from "@/lib/adminAuth";
import { formatWhatsapp, requestWhatsapp, withdrawWhatsappRequest, type StoreDetails } from "@/lib/adminStore";

/** "Live", "Waiting for approval" or "Not approved", for the section header. */
export function WhatsappStatusBadge({ store }: { store: StoreDetails }) {
  const request = store.whatsappRequest;
  if (request?.status === "pending") return <Badge tone="brand">Waiting for approval</Badge>;
  if (request?.status === "rejected") return <Badge tone="danger">Not approved</Badge>;
  return store.whatsapp ? (
    <Badge tone="success" dot>
      Live
    </Badge>
  ) : null;
}

// Store settings: the store's WhatsApp number. Owners can't set it themselves (so nobody
// can put someone else's number on their catalog): they request a number, and a Catalog24
// admin approves it before it goes live. Saved on its own, not with "Save changes".
export default function WhatsappNumberPanel({
  store,
  onUpdated,
}: {
  store: StoreDetails;
  onUpdated: (store: StoreDetails) => void;
}) {
  const [number, setNumber] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"request" | "withdraw" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const request = store.whatsappRequest;
  const pending = request?.status === "pending";
  const live = formatWhatsapp(store.whatsapp);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const digits = number.replace(/\D/g, "").replace(/^0+/, "");
    if (digits.length < 10) {
      setFieldError("Enter a 10-digit mobile number, e.g. 98765 43210.");
      return flagField(document.getElementById("whatsapp-request"));
    }
    setBusy("request");
    setError(null);
    try {
      onUpdated(await requestWhatsapp(number));
      setNumber("");
      setSent(true);
    } catch (err) {
      // A bad or unchanged number belongs under the field.
      if (err instanceof AuthError && err.status === 400) {
        setFieldError(err.message);
        flagField(document.getElementById("whatsapp-request"));
      } else {
        setError(err instanceof AuthError ? err.message : "Couldn't send the request. Please try again.");
      }
    } finally {
      setBusy(null);
    }
  }

  async function withdraw() {
    setBusy("withdraw");
    setError(null);
    try {
      onUpdated(await withdrawWhatsappRequest());
      setSent(false);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Couldn't withdraw the request. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      {/* The number customers' enquiries go to now */}
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-emerald-50 text-whatsapp" aria-hidden>
          <WhatsAppIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-slate">Number on your catalog</p>
          <p className={`text-base font-semibold tabular-nums ${live ? "text-ink" : "text-slate"}`}>{live || "Not added yet"}</p>
        </div>
      </div>

      {pending && request && (
        <div
          role="status"
          className={`flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-3 sm:flex-row sm:items-center ${sent ? "admin-pop-in" : ""}`}
        >
          <Clock className="hidden h-5 w-5 shrink-0 text-amber-600 sm:block" aria-hidden />
          <div className="min-w-0 flex-1 text-[13px] leading-relaxed text-amber-900">
            <p className="font-semibold">
              <span className="tabular-nums">{formatWhatsapp(request.number)}</span> is waiting for approval
            </p>
            <p className="text-amber-800/90">
              Requested {formatRelative(request.requestedAt).toLowerCase()}. Catalog24 checks the number, then it goes live on
              your catalog{live ? ` in place of ${live}` : ""}.
            </p>
          </div>
          <Button size="sm" className="h-10 self-start px-3.5 sm:self-center" loading={busy === "withdraw"} onClick={withdraw}>
            Withdraw
          </Button>
        </div>
      )}

      {request?.status === "rejected" && (
        <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] leading-relaxed text-red-800">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
          <div className="min-w-0">
            <p className="font-semibold">
              Your request for <span className="tabular-nums">{formatWhatsapp(request.number)}</span> wasn&apos;t approved
            </p>
            {request.reason && <p>Reason: {request.reason}</p>}
            <p className="text-red-700/90">Check the number and request it again below.</p>
          </div>
        </div>
      )}

      {!pending && (
        <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div data-field className="min-w-0 flex-1">
            <label htmlFor="whatsapp-request" className={authLabelClass}>
              {live ? "New WhatsApp number" : "Your WhatsApp number"}
            </label>
            <div className="relative">
              <WhatsAppIcon className={authInputIconClass} aria-hidden />
              <input
                id="whatsapp-request"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="send"
                maxLength={20}
                placeholder="98765 43210"
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  setFieldError(null);
                }}
                aria-invalid={!!fieldError}
                aria-describedby={fieldError ? "whatsapp-request-error" : undefined}
                className={authInputClass}
              />
            </div>
            {fieldError && (
              <p id="whatsapp-request-error" className={authFieldErrorClass}>
                {fieldError}
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            onPointerDown={ripple}
            loading={busy === "request"}
            className="h-12 w-full px-5 text-[15px] sm:mt-[1.625rem] sm:w-auto"
          >
            {live ? "Request change" : "Request number"}
          </Button>
        </form>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-medium text-red-700">
          <TriangleAlert className="mt-px h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-slate">
        <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
        To keep enquiries safe, Catalog24 checks every number before it goes live on your catalog.
      </p>
    </div>
  );
}
