"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "./ui";

// "Continue with Google" through Google Identity Services: Google's own button, which
// opens Google's account chooser in a popup and hands back an ID token (`credential`).
// The API checks that token (POST /auth/google, or /auth/register with googleIdToken).
//
// NEXT_PUBLIC_GOOGLE_CLIENT_ID: the OAuth web client ID (the same one the Lambda has in
// GOOGLE_CLIENT_ID). Without it the button isn't shown.

// Switched off for now: the button is hidden on the login and register pages even when
// the client ID is set. Set to true to bring Google sign-in back.
const GOOGLE_SIGN_IN_ON = false;

const CLIENT_ID = GOOGLE_SIGN_IN_ON ? (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "") : "";
export const googleSignInEnabled = CLIENT_ID !== "";

type GoogleId = {
  initialize(options: Record<string, unknown>): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
};
declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleId } };
  }
}

// The script is loaded once, the first time a button is shown.
let scriptPromise: Promise<GoogleId> | null = null;
function loadGoogleId(): Promise<GoogleId> {
  const ready = window.google?.accounts?.id;
  if (ready) return Promise.resolve(ready);
  scriptPromise ??= new Promise<GoogleId>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      const id = window.google?.accounts?.id;
      if (id) resolve(id);
      else reject(new Error("Google sign-in didn't load"));
    };
    script.onerror = () => {
      scriptPromise = null; // try again next time
      script.remove();
      reject(new Error("Google sign-in didn't load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function GoogleSignInButton({
  onCredential,
  text = "continue_with",
  busy = false,
}: {
  onCredential: (credential: string) => void;
  /** The button's wording: "Continue with Google" or "Sign up with Google". */
  text?: "continue_with" | "signup_with";
  /** While the credential is being checked: a spinner over the button. */
  busy?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    callbackRef.current = onCredential;
  });

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGoogleId()
      .then((id) => {
        const host = hostRef.current;
        if (cancelled || !host) return;
        id.initialize({
          client_id: CLIENT_ID,
          callback: (response: { credential?: string }) => {
            if (response.credential) callbackRef.current(response.credential);
          },
          ux_mode: "popup",
          context: text === "signup_with" ? "signup" : "signin",
          itp_support: true,
        });
        // Google's button takes a fixed width in px (200 to 400): the column's width.
        const width = Math.round(Math.min(400, Math.max(200, host.offsetWidth)));
        id.renderButton(host, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text,
          logo_alignment: "center",
          width,
          locale: "en",
        });
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!CLIENT_ID) return null;

  return (
    <div>
      <div className="relative h-10">
        {/* Google draws its button in here */}
        <div ref={hostRef} className={`flex h-10 justify-center ${busy ? "pointer-events-none opacity-40" : ""}`} />
        {state === "loading" && (
          <div aria-hidden className="absolute inset-0 animate-pulse rounded-md border border-line bg-paper" />
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-semibold text-ink" role="status">
            <Spinner className="h-4 w-4 text-primary" />
            Signing in…
          </div>
        )}
      </div>
      {state === "error" && (
        <p className="mt-1.5 text-center text-xs text-slate">Couldn&apos;t load Google sign-in. Check your connection and reload.</p>
      )}
    </div>
  );
}
