"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import CtaLink from "@/components/CtaLink";
import DemoStart from "@/components/services/DemoStart";

// The open demo gets its own history entry, so the browser's Back button closes it.
const DEMO_HASH = "#live-demo";
const CLOSE_MS = 300;

/**
 * A short phone preview with a "Start demo" button. Starting opens the live page full
 * screen (a phone-sized frame on larger screens) with Close / View full demo buttons.
 */
export default function DemoLauncher({
  src,
  title,
  fullDemoHref,
}: {
  src: string;
  title: string;
  fullDemoHref: string;
}) {
  const [mounted, setMounted] = useState(false); // overlay in the DOM
  const [shown, setShown] = useState(false); // overlay animated in
  const [loaded, setLoaded] = useState(false);
  const pushedRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const startButtonRef = useRef<HTMLDivElement>(null);

  const hide = () => {
    pushedRef.current = false;
    setShown(false);
    closeTimerRef.current = setTimeout(() => setMounted(false), CLOSE_MS);
  };

  const open = () => {
    clearTimeout(closeTimerRef.current);
    setLoaded(false);
    setMounted(true);
    if (!pushedRef.current) {
      window.history.pushState(null, "", DEMO_HASH);
      pushedRef.current = true;
    }
  };

  // Close goes back through the demo's history entry; Back in the browser does the same.
  const close = () => {
    if (pushedRef.current) window.history.back();
    else hide();
  };

  useEffect(() => {
    // A reload while the demo was open leaves the hash behind — drop it.
    if (window.location.hash === DEMO_HASH) {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
    const onPopState = () => {
      if (pushedRef.current && window.location.hash !== DEMO_HASH) hide();
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Animate in on the next frame, lock the page behind, focus Close, and Escape closes.
    const frame = requestAnimationFrame(() => setShown(true));
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeButtonRef.current?.click();
    };
    window.addEventListener("keydown", onKeyDown);
    const startButton = startButtonRef.current;
    return () => {
      cancelAnimationFrame(frame);
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      startButton?.querySelector("button")?.focus({ preventScroll: true });
    };
  }, [mounted]);

  return (
    <>
      <div className="mx-auto w-full max-w-[24rem] rounded-[2.75rem] bg-ink p-3 shadow-lift">
        <div className="relative overflow-hidden rounded-[2.1rem] bg-white pt-8">
          <span
            className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink"
            aria-hidden="true"
          />
          <div ref={startButtonRef} className="relative h-52">
            <DemoStart onStart={open} hint="Opens the live demo full screen" />
          </div>
        </div>
      </div>

      {mounted &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`fixed inset-0 z-[100] flex flex-col bg-ink/90 backdrop-blur-sm transition-opacity duration-300 ${
              shown ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex min-h-0 flex-1 items-center justify-center sm:p-6 sm:pb-0">
              <div
                className={`relative h-full w-full overflow-hidden bg-white transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-[min(100%,52rem)] sm:max-w-[24.375rem] sm:rounded-[2.75rem] sm:border-[10px] sm:border-ink sm:shadow-2xl ${
                  shown ? "translate-y-0 scale-100" : "translate-y-12 scale-95"
                }`}
              >
                <iframe
                  src={src}
                  title={title}
                  onLoad={() => setLoaded(true)}
                  className="absolute inset-0 h-full w-full border-0 bg-white"
                />
                {!loaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-paper" aria-hidden="true">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                  </div>
                )}
              </div>
            </div>

            <div
              className={`flex shrink-0 justify-center gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition delay-100 duration-500 sm:py-5 ${
                shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-btn border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-44 sm:flex-none"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Close
              </button>
              <CtaLink href={fullDemoHref} variant="white" className="flex-1 gap-2 sm:w-44 sm:flex-none">
                View full demo
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </CtaLink>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
