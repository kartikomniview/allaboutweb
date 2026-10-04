"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d={direction === "left" ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ImageSlider({
  images,
  alt,
  interval = 4000,
  fit = "cover",
}: {
  images: string[];
  alt: string;
  interval?: number;
  fit?: "cover" | "contain";
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Only autoplay while the slider is on screen (saves battery on mobile)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !visible) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [paused, visible, images.length, interval]);

  const go = (i: number) => setIndex((i + images.length) % images.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    setPaused(false);
    if (start === null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
  };

  return (
    <div
      ref={rootRef}
      className="group relative touch-pan-y select-none aspect-[1400/988] overflow-hidden rounded-panel border border-line bg-white shadow-[0_24px_60px_-20px_rgba(1,18,60,0.25)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`${alt} — example ${i + 1} of ${images.length}`}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          draggable={false}
          className={`${
            fit === "contain" ? "object-contain" : "object-cover"
          } transition-all duration-700 ease-out ${
            i === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
          }`}
          aria-hidden={i !== index}
        />
      ))}

      <button
        type="button"
        onClick={() => go(index - 1)}
        className="absolute left-2 top-1/2 sm:left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white"
        aria-label="Previous image"
      >
        <ChevronIcon direction="left" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        className="absolute right-2 top-1/2 sm:right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white"
        aria-label="Next image"
      >
        <ChevronIcon direction="right" />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center rounded-full bg-secondary/70 px-1 backdrop-blur-sm">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => go(i)}
            className="group/dot flex h-6 min-w-6 items-center justify-center px-1"
            aria-label={`Show image ${i + 1}`}
            aria-current={i === index}
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-5 bg-white"
                  : "w-1.5 bg-white/60 group-hover/dot:bg-white"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
