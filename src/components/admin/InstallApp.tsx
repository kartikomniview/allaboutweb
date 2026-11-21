"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { Download, Expand, Feather, Share, Smartphone, SquarePlus } from "lucide-react";
import { AppIcon } from "@/components/catalog24/Logo";
import { authButtonClass } from "./AuthLayout";
import { isOverlayOpen, useOverlay } from "./ecatalog/useOverlay";
import { ripple } from "./ripple";

// Installing the store admin as an app (manifest: public/catalog24/admin.webmanifest).
// - Chrome, Edge and Samsung Internet (Android and desktop) offer an install prompt
//   (beforeinstallprompt). It's kept here so our own button and popup can show it.
// - iPhone and iPad have no prompt: the popup explains Share → Add to Home Screen.
// - Other browsers (e.g. Firefox on desktop) can't install it, so nothing is shown.

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: InstallPromptEvent | null = null;
let installedNow = false;
let version = 0;
const listeners = new Set<() => void>();
const changed = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

// Listen from the moment the admin loads: the event can fire before any component mounts.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // our button and popup replace the browser's own mini-bar
    deferredPrompt = event as InstallPromptEvent;
    changed();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installedNow = true;
    changed();
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// iPadOS reports itself as a Mac; touch support tells them apart.
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// Phones and tablets: touch is the main input (a touch laptop's is still the mouse).
const isTouch = () => window.matchMedia("(pointer: coarse)").matches;

export type InstallState = {
  /** The app can be installed here and isn't yet: show the install option. */
  available: boolean;
  /** iPhone/iPad without an install prompt: show the Add to Home Screen steps instead. */
  ios: boolean;
  /**
   * Push the owner to install: phones and tablets other than iPhone/iPad. On iPhone
   * the home-screen app doesn't share Safari's storage, so it would get a new device
   * id and the one-device rule would lock the owner out; there the popup only opens
   * from the top bar's Install button.
   */
  push: boolean;
  /** Opens the browser's install prompt (not on iOS). Resolves true if the owner installed it. */
  prompt: () => Promise<boolean>;
};

export function useInstallApp(): InstallState {
  // -1 on the server and during hydration: nothing is shown until the browser is known.
  const v = useSyncExternalStore(subscribe, () => version, () => -1);
  const known = v !== -1;
  // The browser's own install prompt always wins; the manual steps are only for
  // iPhone/iPad browsers that have none.
  const ios = known && deferredPrompt === null && isIOS();
  const available = known && !installedNow && !isStandalone() && (deferredPrompt !== null || ios);
  const push = known && isTouch() && !isIOS();

  const prompt = async () => {
    const event = deferredPrompt;
    if (!event) return false;
    await event.prompt();
    const { outcome } = await event.userChoice;
    deferredPrompt = null; // a prompt can only be used once
    changed();
    return outcome === "accepted";
  };

  return { available, ios, push, prompt };
}

/* ---------- The popup ---------- */

/** On the dashboard: the first popup of the visit, a few seconds in. */
const FIRST_SHOW_MS = 4000;
/** On the dashboard: shown again this long after "Skip for now". */
const REPEAT_MS = 30_000;
/** Another dialog is open when the popup is due: look again after this. */
const RETRY_MS = 5000;

/**
 * The install popup. Owners on an Android phone or tablet are pushed to install the
 * app (`install.push`):
 * - AdminShell opens it straight after the WhatsApp number is added.
 * - On the dashboard (`autoShow`) it shows a few seconds in, then again 30 seconds
 *   after each "Skip for now", until the app is installed.
 * It never opens by itself on computers or iPhone/iPad. `open` also opens it on
 * demand (the top bar's Install button on iPhone).
 */
export function InstallAppPopup({
  install,
  open,
  onOpenChange,
  autoShow,
}: {
  install: InstallState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoShow: boolean;
}) {
  const { available, ios, push, prompt } = install;
  const shownBefore = useRef(false);

  useEffect(() => {
    if (open) shownBefore.current = true;
  }, [open]);

  useEffect(() => {
    if (!autoShow || !push || !available || open) return;
    let timer: ReturnType<typeof setTimeout>;
    const showAfter = (ms: number) => {
      timer = setTimeout(() => {
        // Don't cover a dialog the owner is using (e.g. Share catalog).
        if (isOverlayOpen()) showAfter(RETRY_MS);
        else onOpenChange(true);
      }, ms);
    };
    showAfter(shownBefore.current ? REPEAT_MS : FIRST_SHOW_MS);
    return () => clearTimeout(timer);
  }, [autoShow, push, available, open, onOpenChange]);

  if (!open || !available) return null;

  return (
    <InstallDialog
      ios={ios}
      onSkip={() => onOpenChange(false)}
      onInstall={() => {
        onOpenChange(false);
        void prompt();
      }}
    />
  );
}

function InstallDialog({ ios, onSkip, onInstall }: { ios: boolean; onSkip: () => void; onInstall: () => void }) {
  const panelRef = useOverlay<HTMLDivElement>(onSkip);

  return (
    <div className="admin-fade-in fixed inset-0 z-[120] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-app-title"
        aria-describedby="install-app-text"
        tabIndex={-1}
        className="admin-pop-in max-h-full w-full max-w-sm overflow-y-auto rounded-lg bg-white px-6 pb-3 pt-8 shadow-2xl focus:outline-none focus-visible:outline-none!"
      >
        <div className="text-center">
          <AppIcon className="mx-auto h-[72px] w-[72px] rounded-lg shadow-[0_8px_20px_-8px_rgba(1,18,60,0.35)]" />
          <h2
            id="install-app-title"
            className="mt-5 text-[1.375rem] font-bold leading-tight tracking-[-0.025em] text-ink"
          >
            Install the Catalog24 app
          </h2>
          <p id="install-app-text" className="mt-2 text-sm leading-relaxed text-slate">
            {ios
              ? "Add it to your home screen to manage your store like any other app."
              : "Manage your store from your home screen, like any other app."}
          </p>
        </div>

        {ios ? (
          <ol className="mt-6 flex flex-col gap-3 rounded-md bg-paper p-4 text-sm text-ink">
            <Step n={1}>
              <span>
                Tap <Share className="inline h-4 w-4 align-[-3px] text-primary" aria-label="Share" />{" "}
                <span className="font-semibold">Share</span> in the browser bar
                <span className="block text-xs text-slate">On newer iPhones, tap ••• first</span>
              </span>
            </Step>
            <Step n={2}>
              <span>
                Choose <SquarePlus className="inline h-4 w-4 align-[-3px] text-primary" aria-hidden />{" "}
                <span className="font-semibold">Add to Home Screen</span>
              </span>
            </Step>
            <Step n={3}>
              <span>
                Tap <span className="font-semibold">Add</span>, then open Catalog24 from your home screen
              </span>
            </Step>
          </ol>
        ) : (
          <>
            <ul className="mt-6 flex flex-col gap-3 text-sm text-ink">
              <Benefit icon={<Smartphone className="h-[18px] w-[18px]" aria-hidden />}>
                Opens in one tap from your home screen
              </Benefit>
              <Benefit icon={<Expand className="h-[18px] w-[18px]" aria-hidden />}>
                Full screen, without the browser bars
              </Benefit>
              <Benefit icon={<Feather className="h-[18px] w-[18px]" aria-hidden />}>
                Light: uses almost no storage
              </Benefit>
            </ul>
            <button type="button" onClick={onInstall} onPointerDown={ripple} className={`${authButtonClass} mt-7`}>
              <Download className="h-[18px] w-[18px]" aria-hidden />
              Install app
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onSkip}
          className="mx-auto mt-3 flex min-h-11 items-center rounded-sm px-4 text-[13px] font-medium text-slate hover:text-ink hover:underline focus-visible:outline-none! focus-visible:ring-[3px] focus-visible:ring-primary/20"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-xs font-bold ring-1 ring-line">
        {n}
      </span>
      {children}
    </li>
  );
}

function Benefit({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-tint/60 text-primary">{icon}</span>
      {children}
    </li>
  );
}
