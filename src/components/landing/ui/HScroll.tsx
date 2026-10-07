"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * App-style horizontal snap row. Bleeds to the screen edge on mobile.
 * Pass `gridClassName` (full literal Tailwind classes, e.g.
 * "md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0") to turn it
 * into a grid on larger screens;
 * otherwise prev/next arrows appear on desktop when the row overflows.
 * Each child should set its own width and `snap-start`.
 */
export default function HScroll({
  children,
  label,
  gridClassName,
  className = "",
}: {
  children: ReactNode;
  label: string;
  gridClassName?: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || gridClassName) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      resize.disconnect();
    };
  }, [gridClassName, update]);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrowClass =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink shadow-lift transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-0 header:flex";

  return (
    <div className={`relative ${className}`}>
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        className={`no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 pt-1 sm:-mx-6 sm:scroll-px-6 sm:gap-4 sm:px-6 ${
          gridClassName ?? ""
        }`}
      >
        {children}
      </div>

      {!gridClassName && (
        <>
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={edges.start}
            className={`${arrowClass} -left-5`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={edges.end}
            className={`${arrowClass} -right-5`}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
