"use client";

import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, X } from "lucide-react";

export type ShowcaseBusiness = {
  label: string;
  /** Its 4:3 photo. */
  image: string;
  /** Registration with this business type already chosen. */
  registerHref: string;
  /** The categories a new store of this type starts with. */
  categories: string[];
};

const MAX_CATEGORIES = 8;

/**
 * "Made for every kind of shop": 4:3 photo cards, 2 across on phones, 3 on tablets, 4 on desktops.
 * Tapping one opens a sheet (bottom sheet on phones, centred dialog on larger screens) about that
 * kind of store, with its ready-made categories and a "Create your store" button.
 */
export default function BusinessShowcase({ businesses }: { businesses: ShowcaseBusiness[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<ShowcaseBusiness | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  // The page behind doesn't scroll while the sheet is open.
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [isOpen]);

  const open = (business: ShowcaseBusiness) => {
    // Render its content before the dialog opens, so it never shows the previous one.
    flushSync(() => {
      setSelected(business);
      setIsOpen(true);
    });
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  // Up to MAX_CATEGORIES chips and "+N more", but never "+1 more" in place of a single chip.
  const categories = selected?.categories ?? [];
  const shown = categories.length > MAX_CATEGORIES + 1 ? categories.slice(0, MAX_CATEGORIES) : categories;
  const extra = categories.length - shown.length;

  return (
    <>
      <ul className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
        {businesses.map((business, i) => (
          <li
            key={business.label}
            data-reveal="up"
            style={{ "--reveal-delay": `${(i % 4) * 60}ms` } as React.CSSProperties}
          >
            <button
              type="button"
              onClick={() => open(business)}
              aria-haspopup="dialog"
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-line/60 text-left"
            >
              <Image
                src={business.image}
                alt=""
                fill
                sizes="(min-width: 1152px) 270px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              {/* Keeps the label readable on any photo */}
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5">
                <span className="text-xs font-semibold leading-tight text-white sm:text-sm lg:text-[15px]">{business.label}</span>
                <span
                  aria-hidden
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-ink sm:h-7 sm:w-7"
                >
                  <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setIsOpen(false)}
        // A tap on the dimmed backdrop (the dialog itself, outside its content) closes it.
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto overscroll-contain rounded-lg bg-white p-0 text-ink shadow-2xl transition duration-300 ease-out transition-discrete backdrop:bg-ink/60 backdrop:transition backdrop:duration-300 backdrop:transition-discrete max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none max-sm:translate-y-8 sm:scale-95 opacity-0 backdrop:opacity-0 open:translate-y-0 open:scale-100 open:opacity-100 open:backdrop:opacity-100 starting:open:opacity-0 starting:open:backdrop:opacity-0 max-sm:starting:open:translate-y-8 sm:starting:open:scale-95 motion-reduce:transition-none"
      >
        {selected && (
          <div>
            <div className="relative aspect-[16/9] bg-line/60">
              <Image src={selected.image} alt="" fill sizes="(min-width: 640px) 448px, 100vw" className="object-cover" />
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 px-5 pb-4 sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">Catalog24 for</p>
                <h2 id={titleId} className="mt-0.5 text-2xl font-bold tracking-[-0.02em] text-white">
                  {selected.label}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
              >
                <X className="h-4.5 w-4.5" aria-hidden />
              </button>
            </div>

            <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-6 sm:pt-5">
              <p className="text-sm leading-6 text-slate">
                Show your {selected.label.toLowerCase()} products in one link. Add each one with a photo, AI fills in the
                details, and customers enquire on WhatsApp.
              </p>

              {shown.length > 0 && (
                <>
                  <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden />
                    </span>
                    Categories ready for you
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {shown.map((category) => (
                      <li key={category} className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-ink ring-1 ring-inset ring-line">
                        {category}
                      </li>
                    ))}
                    {extra > 0 && (
                      <li className="rounded-full px-1.5 py-1 text-xs font-medium text-slate">+{extra} more</li>
                    )}
                  </ul>
                </>
              )}

              <Link
                href={selected.registerHref}
                className="group mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-button px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(20,62,59,0.8)] transition-colors hover:bg-button-hover"
              >
                Create your store
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <p className="mt-2.5 text-center text-xs text-slate">Ready in 2 minutes. No app to install.</p>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
