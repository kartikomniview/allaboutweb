"use client";

import { useRef, useState } from "react";
import { ChevronRight, ImagePlus, Trash2 } from "lucide-react";
import { uploadStoreLogo } from "@/lib/adminStore";
import { ripple } from "./ripple";
import { Button, Spinner } from "./ui";

/** The store's logo, or its first letter when there's none. `className` sets the size. */
export function StoreLogo({ logo, name, className = "h-10 w-10 text-base" }: { logo: string; name: string; className?: string }) {
  const initial = (name.match(/[\p{L}\p{N}]/u)?.[0] ?? "S").toUpperCase();
  if (logo) {
    return (
      <span className={`block shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-inset ring-line ${className}`}>
        {/* Plain img: the URL comes from the store's settings. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={`${name} logo`} className="h-full w-full object-contain" />
      </span>
    );
  }
  return (
    <span className={`grid shrink-0 place-items-center rounded-md bg-primary font-bold text-white ${className}`} aria-hidden>
      {initial}
    </span>
  );
}

/** The empty logo spot: a dashed tile with an upload icon (or a spinner while uploading). */
function LogoPlaceholder({ uploading, className }: { uploading: boolean; className: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-md border-2 border-dashed border-primary/45 bg-tint/60 text-primary transition-colors ${className}`}
      aria-hidden
    >
      {uploading ? <Spinner className="h-5 w-5" /> : <ImagePlus className="h-[45%] w-[45%]" strokeWidth={1.75} />}
    </span>
  );
}

// Picks, uploads and removes the store logo. `onChange` gets the new URL ("" to remove);
// it can be async (the dashboard saves straight away) and the picker waits for it.
// Without a logo it shows a dashed placeholder to tap, so adding one is hard to miss.
export default function StoreLogoPicker({
  logo,
  storeName,
  onChange,
  layout = "settings",
}: {
  logo: string;
  storeName: string;
  onChange: (url: string) => void | Promise<void>;
  /** "settings": preview, buttons and help text. "dashboard": a full-width row for a card. */
  layout?: "settings" | "dashboard";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploading = busy === "upload";
  const openPicker = () => busy === null && inputRef.current?.click();

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy("upload");
    setError(null);
    try {
      await onChange(await uploadStoreLogo(file));
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't upload the logo. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("remove");
    setError(null);
    try {
      await onChange("");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't remove the logo. Try again.");
    } finally {
      setBusy(null);
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/png,image/jpeg,image/webp,image/avif"
      className="sr-only"
      tabIndex={-1}
      onChange={(e) => {
        pick(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  const buttons = (size: "sm" | "md") => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size={size} onClick={openPicker} disabled={busy !== null}>
        {uploading ? <Spinner className="h-4 w-4" /> : <ImagePlus className="h-4 w-4 text-slate" aria-hidden />}
        {uploading ? "Uploading…" : logo ? "Change logo" : "Upload logo"}
      </Button>
      {logo && (
        <Button size={size} variant="danger-ghost" onClick={remove} disabled={busy !== null} loading={busy === "remove"}>
          {busy !== "remove" && <Trash2 className="h-4 w-4" aria-hidden />}
          Remove
        </Button>
      )}
    </div>
  );

  const errorText = error && (
    <p role="alert" className="admin-fade-in mt-1.5 text-[13px] font-medium text-red-600">
      {error}
    </p>
  );

  if (layout === "dashboard") {
    // No logo yet: the whole row is the upload button, with the placeholder in front.
    if (!logo) {
      return (
        <div>
          <button
            type="button"
            onClick={openPicker}
            onPointerDown={ripple}
            disabled={busy !== null}
            className="group relative flex min-h-16 w-full items-center gap-3 overflow-hidden px-3.5 py-3 text-left transition-colors hover:bg-tint/30 disabled:cursor-wait sm:px-4"
          >
            <LogoPlaceholder uploading={uploading} className="h-12 w-12 group-hover:bg-tint" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{uploading ? "Uploading your logo…" : "Add your store logo"}</span>
              <span className="block text-xs text-slate">Customers see it at the top of your catalog.</span>
            </span>
            {!uploading && (
              <span className="inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold text-primary">
                Upload
                <ChevronRight className="h-4 w-4" aria-hidden />
              </span>
            )}
          </button>
          {error && <div className="px-3.5 pb-3 sm:px-4">{errorText}</div>}
          {fileInput}
        </div>
      );
    }
    return (
      <div className="px-3.5 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <span className="text-xs text-slate">Your logo</span>
          {buttons("sm")}
        </div>
        {errorText}
        {fileInput}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        {logo ? (
          <StoreLogo logo={logo} name={storeName} className="h-16 w-16 text-2xl" />
        ) : (
          <button
            type="button"
            onClick={openPicker}
            onPointerDown={ripple}
            disabled={busy !== null}
            aria-label="Upload logo"
            className="group relative shrink-0 overflow-hidden rounded-md disabled:cursor-wait"
          >
            <LogoPlaceholder uploading={uploading} className="h-16 w-16 group-hover:bg-tint" />
          </button>
        )}
        <div className="min-w-0">
          {buttons("md")}
          <p className="mt-1.5 text-[11px] leading-snug text-slate">
            A square logo works best (PNG with a transparent background, or JPG). Shown at the top of your catalog.
          </p>
        </div>
      </div>
      {errorText}
      {fileInput}
    </div>
  );
}
