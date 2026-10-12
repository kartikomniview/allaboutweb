"use client";

import { useEffect, useRef, type ReactNode, type TouchEvent } from "react";
import { useRouter } from "next/navigation";

// How far (px) a downward swipe has to travel before the sheet closes.
const SWIPE_CLOSE_DISTANCE = 90;

export default function Modal({
  title,
  children,
  closeLabel,
  swipeToClose = false,
}: {
  title: string;
  children: ReactNode;
  /** Shows a text button with this label at the bottom instead of the corner ✕. */
  closeLabel?: string;
  /** Swiping the sheet down (when scrolled to its top) closes it. */
  swipeToClose?: boolean;
}) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);
  const closing = useRef(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") router.back();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [router]);

  function moveSheet(dy: number, animate: boolean) {
    const panel = panelRef.current;
    if (!panel) return;
    // The entrance animation holds `transform`, which would override this.
    panel.style.animation = "none";
    panel.style.transition = animate ? "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
    panel.style.transform = dy ? `translateY(${dy}px)` : "";
  }

  const swipeHandlers = swipeToClose
    ? {
        onTouchStart: (e: TouchEvent) => {
          // Only from the top, so swiping still scrolls a long sheet.
          if (closing.current || (panelRef.current?.scrollTop ?? 0) > 0) return;
          drag.current = { startY: e.touches[0].clientY, dy: 0 };
        },
        onTouchMove: (e: TouchEvent) => {
          if (!drag.current) return;
          const dy = e.touches[0].clientY - drag.current.startY;
          if (dy < 0 && drag.current.dy === 0) {
            drag.current = null; // an upward swipe: let the sheet scroll
            return;
          }
          drag.current.dy = Math.max(dy, 0);
          moveSheet(drag.current.dy, false);
        },
        onTouchEnd: () => {
          const dy = drag.current?.dy ?? 0;
          drag.current = null;
          if (dy < SWIPE_CLOSE_DISTANCE) {
            moveSheet(0, true);
            return;
          }
          closing.current = true;
          moveSheet(panelRef.current?.offsetHeight ?? 600, true);
          setTimeout(() => router.back(), 200);
        },
      }
    : {};

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) router.back();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        {...swipeHandlers}
        className="animate-enter-up [animation-duration:0.35s] relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-panel bg-white shadow-2xl focus:outline-none! sm:max-w-xl sm:rounded-panel"
      >
        {/* Bottom-sheet grab handle on mobile */}
        <span
          className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-line sm:hidden"
          aria-hidden="true"
        />
        {!closeLabel && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Close"
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate transition hover:bg-tint hover:text-ink"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        )}
        <div className="p-5 sm:p-8">
          {children}
          {closeLabel && (
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-btn text-[13px] font-medium text-slate transition hover:bg-paper hover:text-ink"
            >
              {closeLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
