"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, LayoutGrid, Link2, SlidersHorizontal, Tag, Zap } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

// Soft tile background + icon colour for a badge's icon.
const TONES = {
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  sky: "bg-sky-50 text-sky-600 ring-sky-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
} as const;

type Badge = {
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONES;
  title: string;
  text: string;
  /** Where it floats over the slide (a corner side plus a height). */
  position: string;
};

// Phone screenshots of real Catalog24 stores, 1080×1350 with a transparent background.
// Each brings two floating badges about what's on its screen; they swap sides from slide to slide.
const BASE = "https://aawsite.s3.ap-south-1.amazonaws.com/catalog24/hero/v1";
const SLIDES: { src: string; alt: string; badges: [Badge, Badge] }[] = [
  {
    src: `${BASE}/1.webp`,
    alt: "A lighting store's Catalog24 catalog on a phone, showing pendant lights and lamps with prices",
    badges: [
      { icon: Zap, tone: "violet", title: "Details filled by AI", text: "Geometric wire cage pendant", position: "left-0 top-[16%]" },
      { icon: WhatsAppIcon, tone: "emerald", title: "New enquiry", text: "Black sputnik chandelier", position: "right-0 bottom-[16%]" },
    ],
  },
  {
    src: `${BASE}/2.webp`,
    alt: "A bath and sanitaryware store's Catalog24 catalog on a phone, showing basin mixers and taps",
    badges: [
      { icon: LayoutGrid, tone: "sky", title: "Sorted by category", text: "Basin taps, bib cocks & more", position: "right-0 top-[20%]" },
      { icon: Tag, tone: "amber", title: "Price on request", text: "Show prices only if you want", position: "left-0 bottom-[20%]" },
    ],
  },
  {
    src: `${BASE}/3.webp`,
    alt: "A furniture store's Catalog24 catalog on a phone, showing armchairs with prices and filters",
    badges: [
      { icon: SlidersHorizontal, tone: "indigo", title: "Easy filters", text: "By category, price & colour", position: "left-0 top-[26%]" },
      { icon: WhatsAppIcon, tone: "emerald", title: "Order on WhatsApp", text: "2 chairs in the cart", position: "right-0 bottom-[14%]" },
    ],
  },
  {
    src: `${BASE}/4.webp`,
    alt: "A flooring store's Catalog24 catalog on a phone, showing doormats by category",
    badges: [
      { icon: Camera, tone: "rose", title: "Added from a photo", text: "Navy blue half-moon doormat", position: "right-0 top-[16%]" },
      { icon: Link2, tone: "sky", title: "Your own link", text: "yourstore.catalog24.in", position: "left-0 bottom-[18%]" },
    ],
  },
  {
    src: `${BASE}/5.webp`,
    alt: "A curtains and blinds store's Catalog24 catalog on a phone, showing roman and roller blinds",
    badges: [
      { icon: Zap, tone: "violet", title: "Details filled by AI", text: "Light grey roman blind", position: "left-0 top-[22%]" },
      { icon: WhatsAppIcon, tone: "emerald", title: "New enquiry", text: "Beige roller blind", position: "right-0 bottom-[18%]" },
    ],
  },
];
const COUNT = SLIDES.length;
const HALF = Math.floor(COUNT / 2);
const INTERVAL_MS = 3500;
const SWIPE_PX = 40;

/**
 * Where slide `i` sits when slide `active` is on show: 0 on show, -1 just left, 1 just right, and so on.
 * Kept within about half the slides either way, so the strip loops round instead of rewinding.
 */
const offsetOf = (i: number, active: number) => ((((i - active) % COUNT) + COUNT + HALF) % COUNT) - HALF;

/**
 * The hero's sliding phone screenshots over a soft disc, each with two floating badges that pop in
 * as it lands. Moves on by itself every few seconds (pausing while hovered or focused, and not at
 * all with reduced motion); swipe or tap a dot to change slide.
 */
export default function HeroSlider() {
  // `from` is the slide shown before, so each slide knows whether it slid or wrapped round.
  const [{ active, from }, setPosition] = useState({ active: 0, from: 0 });
  const [paused, setPaused] = useState(false);
  const swipeStartRef = useRef<number | null>(null);

  const show = (index: number) =>
    setPosition((p) => ({ active: ((index % COUNT) + COUNT) % COUNT, from: p.active }));

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => setPosition((p) => ({ active: (p.active + 1) % COUNT, from: p.active })), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [active, paused]);

  const step = offsetOf(active, from);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Catalog24 stores on a phone"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPaused(false)}
    >
      <div className="relative">
        {/* The disc the phones slide across, with a faint ring around it */}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 aspect-square w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-b from-tint to-[#ffe3d3]"
        />
        {/* Clipped sideways only, so each phone's shadow can fall below the frame */}
        <div
          aria-live={paused ? "polite" : "off"}
          className="relative aspect-[4/5] touch-pan-y select-none overflow-x-clip"
          onPointerDown={(e) => {
            swipeStartRef.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (swipeStartRef.current === null) return;
            const dx = e.clientX - swipeStartRef.current;
            swipeStartRef.current = null;
            if (Math.abs(dx) >= SWIPE_PX) show(active + (dx < 0 ? 1 : -1));
          }}
          onPointerCancel={() => {
            swipeStartRef.current = null;
          }}
        >
          {SLIDES.map(({ src, alt }, i) => {
            const offset = offsetOf(i, active);
            // A slide that wrapped from one end of the strip to the other jumps there unseen.
            const slid = offsetOf(i, from) - offset === step;
            return (
              <div
                key={src}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${COUNT}`}
                aria-hidden={offset !== 0}
                style={{ transform: `translateX(${offset * 100}%)` }}
                className={`absolute inset-0 ${
                  slid ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" : ""
                }`}
              >
                <Image
                  src={src}
                  alt={alt}
                  width={1080}
                  height={1350}
                  sizes="(min-width: 1024px) 416px, (min-width: 640px) 384px, 336px"
                  loading="eager"
                  fetchPriority={i === 0 ? "high" : undefined}
                  draggable={false}
                  className="h-full w-full object-contain drop-shadow-[0_24px_28px_rgba(1,18,60,0.2)]"
                />
              </div>
            );
          })}
        </div>

        {/* Every slide's badges are always here; only the slide on show has its pair visible.
            Decorative, and they ignore taps so swipes reach the slider. */}
        {SLIDES.map(({ src, badges }, i) =>
          badges.map(({ icon: Icon, tone, title, text, position }, b) => (
            <div
              key={`${src}-${b}`}
              aria-hidden
              className={`pointer-events-none absolute flex items-center gap-2 whitespace-nowrap rounded-lg bg-white py-2 pl-2 pr-3 text-left shadow-lift ring-1 ring-line transition motion-reduce:transition-none sm:gap-2.5 sm:py-2.5 sm:pl-2.5 sm:pr-4 ${position} ${
                i === active
                  ? `translate-y-0 scale-100 opacity-100 duration-500 ease-out ${b === 0 ? "delay-300" : "delay-500"}`
                  : "translate-y-2 scale-95 opacity-0 duration-200"
              }`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ring-1 ring-inset ${TONES[tone]}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[11px] font-semibold leading-4 text-ink sm:text-xs">{title}</span>
                <span className="block text-[10px] leading-4 text-slate sm:text-[11px]">{text}</span>
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-1 flex justify-center">
        {SLIDES.map(({ src }, i) => (
          <button
            key={src}
            type="button"
            onClick={() => show(i)}
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === active ? "true" : undefined}
            className="group grid h-8 place-items-center px-1.5"
          >
            <span
              className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                i === active ? "w-6 bg-primary" : "w-1.5 bg-slate/25 group-hover:bg-slate/50"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
