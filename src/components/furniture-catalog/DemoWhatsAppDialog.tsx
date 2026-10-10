"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { WhatsAppIcon } from "./shared";

// This catalog is a demo of the e-catalog service. Instead of sending enquiries to the
// store, the WhatsApp buttons open the visitor's own chat ("message yourself") with the
// enquiry pre-filled — so a prospective client sees exactly what their customers'
// messages will look like. The number is kept only in this browser.
const STORAGE_KEY = "fc-demo-whatsapp-number";
const COUNTRY_CODE = "91";

const readSavedNumber = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};

const saveNumber = (number: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, number);
  } catch {
    // Storage blocked (private mode etc.) — they'll just be asked again next time.
  }
};

// Accepts "98765 43210", "+91 98765-43210", "098765 43210"; returns the 10-digit
// Indian mobile number, or null if it isn't one.
const toMobileNumber = (input: string) => {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith(COUNTRY_CODE)) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
};

export default function DemoWhatsAppDialog({ message, onClose }: { message: string; onClose: () => void }) {
  const [number, setNumber] = useState(readSavedNumber);
  // Saved number → focus the button (one tap to open); otherwise focus the input.
  const [hadSavedNumber] = useState(() => number !== "");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const mobile = toMobileNumber(number);
    if (!mobile) {
      setError("Enter a valid 10-digit WhatsApp number");
      inputRef.current?.focus();
      return;
    }
    saveNumber(mobile);
    window.open(`https://wa.me/${COUNTRY_CODE}${mobile}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-whatsapp-title"
        onClick={(e) => e.stopPropagation()}
        className="fc-page-enter w-full rounded-t-3xl bg-white p-5 pb-safe shadow-2xl sm:max-w-[400px] sm:rounded-3xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
            <WhatsAppIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="demo-whatsapp-title" className="text-base font-bold text-[#111111]">
              See it on your WhatsApp
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
              This is a demo. Enter your number and this enquiry opens in your own WhatsApp — just like your
              customers&apos; messages will reach you.
            </p>
          </div>
          <button onClick={onClose} className="-mr-1 -mt-1 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preview of the message they'll receive */}
        <div className="mt-4 rounded-2xl bg-[#ECE5DD] p-3">
          <p className="ml-auto w-fit max-w-[90%] rounded-xl rounded-tr-sm bg-[#DCF8C6] px-3 py-2 text-[11px] leading-relaxed text-neutral-800 shadow-sm">
            {/* Clamp on an unpadded inner element so a cut line can't peek through the padding */}
            <span className="block whitespace-pre-line line-clamp-8">{message}</span>
          </p>
        </div>

        <form onSubmit={submit} noValidate className="mt-4 space-y-2">
          <label htmlFor="demo-whatsapp-number" className="text-xs font-semibold text-neutral-700">
            Your WhatsApp number
          </label>
          <div
            className={`flex items-center overflow-hidden rounded-xl border bg-white focus-within:ring-2 ${
              error ? "border-red-400 focus-within:ring-red-200" : "border-neutral-200 focus-within:ring-[#25D366]/30"
            }`}
          >
            <span className="border-r border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm font-medium text-neutral-600">
              +{COUNTRY_CODE}
            </span>
            <input
              ref={inputRef}
              autoFocus={!hadSavedNumber}
              id="demo-whatsapp-number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
                setError("");
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "demo-whatsapp-error" : undefined}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </div>
          {error && (
            <p id="demo-whatsapp-error" className="text-[11px] font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            autoFocus={hadSavedNumber}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#20bd5a] active:scale-[0.98] transition-all"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Open in WhatsApp
          </button>
          <p className="text-center text-[10px] text-neutral-400">Saved only on this device. We never message you.</p>
        </form>
      </div>
    </div>
  );
}
