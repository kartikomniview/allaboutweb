"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Banner } from "./data";
import SmartLink from "./ui/SmartLink";

/** Swipeable promo banner. Autoplays only while on screen and not being touched. */
export default function BannerCarousel({
  banners,
  interval = 5000,
}: {
  banners: Banner[];
  interval?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }, []);

  // Keep the dots in sync with manual swipes
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.5,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => goTo((index + 1) % banners.length), interval);
    return () => clearInterval(id);
  }, [paused, visible, index, banners.length, interval, goTo]);

  return (
    <div
      className="relative"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-panel shadow-lift"
      >
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${banners.length}`}
            className="relative aspect-[16/11] w-full shrink-0 snap-center overflow-hidden bg-secondary sm:aspect-[16/9] lg:aspect-[5/4.4]"
          >
            <Image
              src={banner.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[center_25%]"
              priority={i === 0}
            />
            <div
              className="absolute inset-0 bg-linear-to-t from-secondary from-15% via-secondary/60 via-50% to-transparent"
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 pb-8 sm:p-7 sm:pb-11 lg:p-8 lg:pb-12">
              <span className="inline-block rounded-full bg-primary px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-white">
                {banner.eyebrow}
              </span>
              <p className="mt-2.5 max-w-md text-xl font-bold leading-tight text-white sm:mt-3 sm:text-3xl">
                {banner.title}
              </p>
              <p className="mt-1.5 hidden max-w-md text-sm text-white/80 min-[400px]:block sm:mt-2 sm:text-base">
                {banner.description}
              </p>
              <SmartLink
                href={banner.cta.href}
                className="group mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-tint sm:mt-5"
              >
                {banner.cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </SmartLink>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 right-4 flex items-center gap-0.5 sm:bottom-5 sm:right-6">
        {banners.map((banner, i) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => goTo(i)}
            className="flex h-6 min-w-5 items-center justify-center"
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === index}
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
