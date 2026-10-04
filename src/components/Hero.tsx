import type { CSSProperties } from "react";
import Image from "next/image";
import CtaLink from "./CtaLink";
import { PRICING_PATH } from "@/lib/contact";
import RotatingWords from "./RotatingWords";

const VISUAL_TAGS = ["Websites", "E-Catalogs", "Product Catalogs"];

const MICRO_TRUST = ["Simple process", "Fixed scope", "Direct communication"];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="ml-2 h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black_30%,transparent_100%)]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:py-16 header:px-8 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink shadow-sm backdrop-blur animate-enter-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Built for small &amp; growing businesses
          </span>

          <h1 className="animate-enter-up mt-6 max-w-xl [--enter-delay:100ms] text-[2rem] font-bold leading-[1.1] sm:text-5xl sm:leading-[1.08] lg:text-[3.5rem]">
            <span className="sr-only">
              Websites, E-Catalogs &amp; Product Catalogs
            </span>
            <RotatingWords words={VISUAL_TAGS} />
            <span className="relative inline-block">
              for Your Business
              <svg
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full text-primary"
                aria-hidden="true"
              >
                <path
                  d="M2 9C60 3 140 2 298 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="animate-enter-up mt-7 max-w-lg text-[0.9375rem] leading-6.5 text-slate [--enter-delay:200ms] sm:mt-8 sm:text-lg sm:leading-8">
            Build a professional online presence with a{" "}
            <strong>modern website</strong>, <strong>shareable e-catalog</strong>,
            or a <strong>product catalog PDF</strong> — designed specifically
            for <em>your</em> business.
          </p>

          <div className="animate-enter-up mt-8 flex flex-col gap-3 [--enter-delay:300ms] sm:flex-row">
            <CtaLink
              href={PRICING_PATH}
              size="lg"
              className="hover:-translate-y-0.5"
            >
              Get a Quote
              <ArrowIcon />
            </CtaLink>
            <CtaLink
              href={PRICING_PATH}
              variant="secondary"
              size="lg"
              className="hover:-translate-y-0.5"
            >
              WhatsApp Us
            </CtaLink>
          </div>

          <ul className="mt-7 hidden flex-wrap items-center gap-x-5 gap-y-3 sm:mt-8 sm:flex text-sm font-medium text-ink">
            {MICRO_TRUST.map((item, i) => (
              <li
                key={item}
                className="animate-enter-up flex items-center gap-2"
                style={{ "--enter-delay": `${400 + i * 80}ms` } as CSSProperties}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-tint text-primary">
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-enter-zoom relative mt-14 [--enter-delay:200ms] sm:mt-16 lg:mt-0">
          <div
            className="absolute -inset-4 rotate-2 rounded-[28px] bg-tint sm:-inset-6"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-panel shadow-[0_30px_80px_-24px_rgba(1,18,60,0.35)]">
            <Image
              src="https://aawsite.s3.ap-south-1.amazonaws.com/website/landing/hero/hero.webp"
              alt="Examples of websites, e-catalogs, and product catalogs built by AllAboutWeb"
              width={1400}
              height={988}
              className="h-auto w-full"
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority
            />
          </div>

          <div className="animate-float absolute -bottom-6 left-2 hidden items-center gap-3 rounded-card border border-line bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur sm:-left-8 sm:flex sm:px-4 sm:py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-btn bg-tint text-primary">
              <PhoneIcon />
            </span>
            <span className="text-sm">
              <span className="block font-semibold text-ink">
                Mobile-friendly
              </span>
              <span className="block text-xs text-slate">
                Looks great on every screen
              </span>
            </span>
          </div>

          <div className="animate-float-delayed absolute -right-2 -top-6 hidden items-center gap-3 rounded-card border border-line bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:flex sm:-right-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-btn bg-tint text-primary">
              <LinkIcon />
            </span>
            <span className="text-sm">
              <span className="block font-semibold text-ink">
                Share in one link
              </span>
              <span className="block text-xs text-slate">
                WhatsApp, Instagram &amp; more
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
