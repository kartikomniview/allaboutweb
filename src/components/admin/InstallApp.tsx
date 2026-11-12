"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { AppIcon } from "@/components/catalog24/Logo";
import { Button } from "./ui";

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

export type InstallState = {
  /** The app can be installed here and isn't yet: show the install option. */
  available: boolean;
  /** iPhone/iPad without an install prompt: show the Add to Home Screen steps instead. */
  ios: boolean;
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

  const prompt = async () => {
    const event = deferredPrompt;
    if (!event) return false;
    await event.prompt();
    const { outcome } = await event.userChoice;
    deferredPrompt = null; // a prompt can only be used once
    changed();
    return outcome === "accepted";
  };

  return { available, ios, prompt };
}

/* ---------- The popup ---------- */

const SNOOZE_KEY = "c24_install_snooze_until";
const SNOOZE_DAYS = 3;
const SHOW_AFTER_MS = 4000;

const snoozedUntil = () => {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY)) || 0;
  } catch {
    return 0;
  }
};
const snooze = () => {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000));
  } catch {
    // private mode: it shows again next visit
  }
};

/**
 * Shows the install popup a few seconds after the admin opens, unless the app is
 * installed, can't be installed here, or "Not now" was tapped in the last few days.
 * `open` also opens it on demand (the top bar's Install button on iPhone).
 */
export function InstallAppPopup({
  install,
  open,
  onOpenChange,
}: {
  install: InstallState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { available, ios, prompt } = install;

  useEffect(() => {
    if (!available || Date.now() < snoozedUntil()) return;
    const timer = setTimeout(() => onOpenChange(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
    // Once per page load: onOpenChange is a new function each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available]);

  if (!open || !available) return null;

  const notNow = () => {
    snooze();
    onOpenChange(false);
  };
  const installNow = async () => {
    onOpenChange(false);
    if (!(await prompt())) snooze();
  };

  return (
    <div
      role="dialog"
      aria-labelledby="install-app-title"
      className="admin-pop-in fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-md rounded-lg border border-line bg-white p-4 shadow-[0_16px_40px_-16px_rgba(1,18,60,0.4)] lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-[380px]"
    >
      <div className="flex items-start gap-3">
        <AppIcon className="h-12 w-12 rounded-md" />
        <div className="min-w-0 flex-1">
          <h2 id="install-app-title" className="text-[15px] font-semibold text-ink">
            Install the Catalog24 app
          </h2>
          <p className="mt-0.5 text-[13px] leading-snug text-slate">Open your store admin from your home screen in one tap.</p>
        </div>
        <button
          type="button"
          onClick={notNow}
          aria-label="Close"
          className="-mr-1.5 -mt-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate hover:bg-ink/[0.05] hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {ios ? (
        <>
          <ol className="mt-3 flex flex-col gap-2 rounded-md bg-paper p-3 text-[13px] text-ink">
            <li className="flex items-center gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[11px] font-bold ring-1 ring-line">1</span>
              Tap
              <Share className="h-4 w-4 text-primary" aria-label="Share" />
              <span className="font-semibold">Share</span> in the browser bar
            </li>
            <li className="flex items-center gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[11px] font-bold ring-1 ring-line">2</span>
              Choose
              <SquarePlus className="h-4 w-4 text-primary" aria-hidden />
              <span className="font-semibold">Add to Home Screen</span>
            </li>
          </ol>
          <Button className="mt-3 w-full" onClick={notNow}>
            Got it
          </Button>
        </>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button onClick={notNow}>Not now</Button>
          <Button variant="primary" onClick={installNow}>
            <Download className="h-4 w-4" aria-hidden />
            Install
          </Button>
        </div>
      )}
    </div>
  );
}
