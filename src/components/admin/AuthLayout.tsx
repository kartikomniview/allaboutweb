"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { AppIcon, Wordmark } from "@/components/catalog24/Logo";
import { ripple } from "./ripple";
import { Spinner } from "./ui";

// The frame around the store owners' login and registration pages.
// - Phones (most owners): a full-screen app screen. A top bar with the logo (and a
//   back arrow between registration steps), a left-aligned title, the form, and
//   the main button pinned to the bottom so it stays in reach, even above the keyboard.
// - Tablets and desktops: the same content in a white card in the middle of a grey page.
//
// Pages put their <form> inside, with className={authFormClass} and the buttons in
// <AuthActions> at its end.

export const authInputClass =
  "h-12 w-full rounded-md border border-line bg-white pl-11 pr-3.5 text-base text-ink transition-[border-color,box-shadow] placeholder:text-slate/55 hover:border-slate/35 focus:border-primary focus:outline-none focus-visible:outline-none! focus:ring-[3px] focus:ring-primary/15 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/15";

/** Icon inside an auth input (the input needs `authInputClass`, which leaves room for it). */
export const authInputIconClass =
  "pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate/55";

export const authLabelClass = "mb-1.5 block text-[13px] font-semibold text-ink";

/** Error text under a field. */
export const authFieldErrorClass = "admin-fade-in mt-1.5 text-[13px] font-medium text-red-600";

export const authButtonClass =
  "relative inline-flex h-12 w-full select-none items-center justify-center gap-2 overflow-hidden rounded-md bg-button px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-button-hover active:scale-[0.98] focus-visible:outline-none! focus-visible:ring-[3px] focus-visible:ring-button/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

export const authSecondaryButtonClass =
  "relative inline-flex h-12 select-none items-center justify-center gap-2 overflow-hidden rounded-md border border-line bg-white px-5 text-[15px] font-semibold text-ink transition-[background-color,border-color,transform] duration-150 hover:border-slate/35 hover:bg-paper active:scale-[0.98] focus-visible:outline-none! focus-visible:ring-[3px] focus-visible:ring-primary/15 disabled:opacity-60";

/** The page's <form>: grows to fill the screen so <AuthActions> can sit at the bottom. */
export const authFormClass = "flex flex-1 flex-col";

function Logo({ href }: { href?: string }) {
  const mark = <Wordmark className="h-6" eager />;
  if (!href) return mark;
  return (
    <Link href={href} aria-label="Catalog24 home" className="rounded-sm focus-visible:outline-none! focus-visible:ring-[3px] focus-visible:ring-primary/20">
      {mark}
    </Link>
  );
}

/** "Step 2 of 3" with a segmented bar. */
export function AuthProgress({ current, total, label }: { current: number; total: number; label?: string }) {
  return (
    <div>
      <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-line">
            <span
              className={`block h-full rounded-full bg-primary transition-transform duration-300 ease-out ${
                i <= current ? "translate-x-0" : "-translate-x-full"
              }`}
            />
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs font-medium text-slate">
        Step {current + 1} of {total}
        {label && <span className="text-slate/70"> · {label}</span>}
      </p>
    </div>
  );
}

/**
 * The form's buttons and links. Pinned to the bottom of the screen on phones
 * (above the keyboard and the home indicator); at the end of the card on larger screens.
 */
// True while a text field has focus, i.e. the on-screen keyboard is likely open.
export function useTyping() {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      el.matches("input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]), textarea, select");
    const onFocusIn = (e: FocusEvent) => isField(e.target) && setTyping(true);
    // Focus may be moving to the next field: check where it lands.
    const onFocusOut = () => setTimeout(() => setTyping(isField(document.activeElement)), 0);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);
  return typing;
}

export function AuthActions({ children }: { children: ReactNode }) {
  // While typing on a phone the keyboard shrinks the screen; a pinned bar would
  // ride up over the field being filled, so it drops back to the end of the form.
  const typing = useTyping();
  return (
    <>
      <div className="min-h-6 flex-1 sm:min-h-0 sm:flex-none" aria-hidden />
      <div className={`${typing ? "relative" : "sticky bottom-0"} z-10 -mx-5 border-t border-line bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:static sm:mx-0 sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none`}>
        {children}
      </div>
    </>
  );
}

export default function AuthLayout({
  title,
  subtitle,
  progress,
  onBack,
  homeHref,
  contentKey,
  contentClassName = "",
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  /** Shown above the title, e.g. <AuthProgress />. */
  progress?: ReactNode;
  /** Phones: a back arrow in the top bar (registration steps). */
  onBack?: () => void;
  /**
   * The Catalog24 home page (login): the logo links there, phones get a back arrow
   * to it in the top bar (unless onBack is set), and larger screens a link under the card.
   */
  homeHref?: string;
  /** Changing it replays contentClassName's animation (e.g. a new registration step). */
  contentKey?: string | number;
  contentClassName?: string;
  children: ReactNode;
}) {
  // Focus the screen's first field (the input marked data-autofocus) on tablets and
  // desktops only. On phones it would open the keyboard, with the pinned button above
  // it, before the owner has even seen the screen. Runs again for each new step.
  useEffect(() => {
    if (!window.matchMedia("(min-width: 640px)").matches) return;
    document.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [contentKey]);

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-white sm:items-center sm:justify-center sm:bg-paper sm:px-6 sm:py-12">
      {/* Larger screens: logo above the card */}
      <div className="mb-6 hidden sm:flex">
        <Logo href={homeHref} />
      </div>

      <div className="flex w-full flex-1 flex-col sm:max-w-[420px] sm:flex-none sm:rounded-lg sm:border sm:border-line sm:bg-white sm:shadow-[0_1px_2px_rgba(1,18,60,0.04),0_16px_40px_-20px_rgba(1,18,60,0.18)]">
        {/* Phones: app top bar */}
        <header className="sticky top-0 z-20 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur sm:hidden">
          <div className="flex h-14 items-center px-1.5">
            <div className="w-11">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  onPointerDown={ripple}
                  aria-label="Back"
                  className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full text-ink transition-colors active:bg-ink/[0.06]"
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden />
                </button>
              ) : (
                homeHref && (
                  <Link
                    href={homeHref}
                    onPointerDown={ripple}
                    aria-label="Back to home"
                    className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full text-ink transition-colors active:bg-ink/[0.06]"
                  >
                    <ArrowLeft className="h-5 w-5" aria-hidden />
                  </Link>
                )
              )}
            </div>
            <div className="flex flex-1 justify-center">
              <Logo href={homeHref} />
            </div>
            <div className="w-11" aria-hidden />
          </div>
        </header>

        <div className="flex flex-1 flex-col px-5 pt-3 sm:px-8 sm:pb-8 sm:pt-8">
          {progress && <div className="mb-6">{progress}</div>}
          <div key={contentKey} className={`flex flex-1 flex-col ${contentClassName}`}>
            <div className="mb-6">
              <h1 className="text-[1.375rem] font-bold leading-tight tracking-[-0.025em] text-ink">{title}</h1>
              {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-slate">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>

      {/* Larger screens: a way back to the home page, under the card */}
      {homeHref && (
        <Link
          href={homeHref}
          className="mt-5 hidden items-center gap-1.5 rounded-sm text-sm font-medium text-slate transition-colors hover:text-ink focus-visible:outline-none! focus-visible:ring-[3px] focus-visible:ring-primary/20 sm:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>
      )}
    </div>
  );
}

/** The loading state shown while the session is checked. */
export function AuthLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 bg-white px-4 py-10 sm:bg-paper" role="status">
      <AppIcon className="h-12 w-12" />
      <span className="flex items-center gap-2 text-sm font-medium text-slate">
        <Spinner className="h-4 w-4 text-primary" />
        {label}
      </span>
    </div>
  );
}
