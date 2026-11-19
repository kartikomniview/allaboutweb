"use client";

import { useState, type FormEvent } from "react";
import { Clock, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { flagField, ripple } from "./ripple";
import { Badge, Button, formatRelative, panelFieldErrorClass, panelInputClass, panelInputIconClass, panelLabelClass } from "./ui";
import { AuthError } from "@/lib/adminAuth";
import { formatWhatsapp, requestWhatsapp, withdrawWhatsappRequest, type StoreDetails } from "@/lib/adminStore";

/** "Live", "Waiting for approval" or "Not approved", for the section header. */
export function WhatsappStatusBadge({ store }: { store: StoreDetails }) {
  const request = store.whatsappRequest;
  if (request?.status === "pending")
    return (
      <Badge tone="brand" size="sm">
        Waiting for approval
      </Badge>
    );
  if (request?.status === "rejected")
    return (
      <Badge tone="danger" size="sm">
        Not approved
      </Badge>
    );
  return store.whatsapp ? (
    <Badge tone="success" dot size="sm">
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
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      {/* The number customers' enquiries go to now */}
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-emerald-50 text-whatsapp" aria-hidden>
          <WhatsAppIcon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate">Number on your catalog</p>
          <p className={`text-sm font-semibold tabular-nums ${live ? "text-ink" : "text-slate"}`}>{live || "Not added yet"}</p>
        </div>
      </div>

      {pending && request && (
        <div
          role="status"
          className={`flex flex-col gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 sm:flex-row sm:items-center ${sent ? "admin-pop-in" : ""}`}
        >
          <Clock className="hidden h-4 w-4 shrink-0 text-amber-600 sm:block" aria-hidden />
          <div className="min-w-0 flex-1 text-xs leading-relaxed text-amber-900">
            <p className="font-semibold">
              <span className="tabular-nums">{formatWhatsapp(request.number)}</span> is waiting for approval
            </p>
            <p className="text-amber-800/90">
              Requested {formatRelative(request.requestedAt).toLowerCase()}. Catalog24 checks the number, then it goes live on
              your catalog{live ? ` in place of ${live}` : ""}.
            </p>
          </div>
          <Button size="sm" className="h-10 self-start px-3 sm:h-8 sm:self-center" loading={busy === "withdraw"} onClick={withdraw}>
            Withdraw
          </Button>
        </div>
      )}

      {request?.status === "rejected" && (
        <div className="flex gap-2.5 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-800">
          <XCircle className="mt-px h-4 w-4 shrink-0 text-red-600" aria-hidden />
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
        <form onSubmit={submit} noValidate className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:gap-2">
          <div data-field className="min-w-0 flex-1">
            <label htmlFor="whatsapp-request" className={panelLabelClass}>
              {live ? "New WhatsApp number" : "Your WhatsApp number"}
            </label>
            <div className="relative">
              <WhatsAppIcon className={panelInputIconClass} aria-hidden />
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
                className={panelInputClass}
              />
            </div>
            {fieldError && (
              <p id="whatsapp-request-error" className={panelFieldErrorClass}>
                {fieldError}
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            size="touch"
            onPointerDown={ripple}
            loading={busy === "request"}
            className="w-full sm:mt-5 sm:w-auto"
          >
            {live ? "Request change" : "Request number"}
          </Button>
        </form>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate">
        <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
        To keep enquiries safe, Catalog24 checks every number before it goes live on your catalog.
      </p>
    </div>
  );
}
