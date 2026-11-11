"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import type { CatalogProduct } from "@/lib/adminProducts";
import { formatINR } from "./data";
import {
  EMPTY_REFINE,
  applyRefine,
  toggleKey,
  type FilterOptions,
  type RefineFilters,
  type SortOrder,
} from "./filters";

const SORTS: { value: SortOrder; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const chip = (on: boolean) =>
  `inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs transition-colors ${
    on
      ? "bg-neutral-900 font-semibold text-white"
      : "bg-white font-medium text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-400"
  }`;

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">{title}</h3>
      {children}
    </section>
  );
}

const priceValue = (text: string) => {
  const n = Number(text.replace(/[^\d]/g, ""));
  return text.trim() && Number.isFinite(n) && n > 0 ? n : null;
};

// Bottom sheet with the refine filters. Edits a draft; "Show N products" applies it.
export default function CatalogFilterSheet({
  products,
  options,
  value,
  onApply,
  onClose,
}: {
  /** The products the filters narrow down (the selected category / subcategory). */
  products: CatalogProduct[];
  options: FilterOptions;
  value: RefineFilters;
  onApply: (next: RefineFilters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const [minText, setMinText] = useState(value.minPrice ? String(value.minPrice) : "");
  const [maxText, setMaxText] = useState(value.maxPrice ? String(value.maxPrice) : "");
  const panelRef = useRef<HTMLDivElement>(null);

  const next: RefineFilters = { ...draft, minPrice: priceValue(minText), maxPrice: priceValue(maxText) };
  const resultCount = applyRefine(products, next).length;

  // Escape closes; the page behind doesn't scroll while the sheet is open.
  // Runs once: onClose is read through a ref, so a new callback doesn't re-run it.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, []);

  const clearAll = () => {
    setDraft(EMPTY_REFINE);
    setMinText("");
    setMaxText("");
  };

  return createPortal(
    <div
      className="furniture-catalog fixed inset-0 z-[90] flex items-end justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-filters-title"
        tabIndex={-1}
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-lg bg-white shadow-2xl focus:outline-none"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h2 id="catalog-filters-title" className="text-sm font-bold text-neutral-900">
            Filter &amp; sort
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-200/60"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <Group title="Sort by">
            <div className="flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  aria-pressed={draft.sort === s.value}
                  onClick={() => setDraft((d) => ({ ...d, sort: s.value }))}
                  className={chip(draft.sort === s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Group>

          {options.price && (
            <Group title="Price">
              <div className="flex items-center gap-2">
                <label className="flex-1">
                  <span className="sr-only">Minimum price</span>
                  <input
                    inputMode="numeric"
                    value={minText}
                    onChange={(e) => setMinText(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder={`Min ${formatINR(options.price.min)}`}
                    className="h-11 w-full rounded-md border border-neutral-200 bg-white px-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none sm:text-sm"
                  />
                </label>
                <span className="text-neutral-400" aria-hidden>
                  –
                </span>
                <label className="flex-1">
                  <span className="sr-only">Maximum price</span>
                  <input
                    inputMode="numeric"
                    value={maxText}
                    onChange={(e) => setMaxText(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder={`Max ${formatINR(options.price.max)}`}
                    className="h-11 w-full rounded-md border border-neutral-200 bg-white px-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none sm:text-sm"
                  />
                </label>
              </div>
              <p className="text-[11px] text-neutral-500">Products without a listed price are hidden while a price is set.</p>
            </Group>
          )}

          {options.colors.length > 0 && (
            <Group title="Colour">
              <div className="flex flex-wrap gap-2">
                {options.colors.map((c) => {
                  const on = draft.colors.includes(c.key);
                  return (
                    <button
                      key={c.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setDraft((d) => ({ ...d, colors: toggleKey(d.colors, c.key) }))}
                      className={chip(on)}
                    >
                      <span
                        className="grid h-4 w-4 place-items-center rounded-full ring-1 ring-inset ring-black/15"
                        style={{ backgroundColor: c.hex }}
                        aria-hidden
                      >
                        {on && <Check className="h-2.5 w-2.5 text-white drop-shadow" strokeWidth={3.5} />}
                      </span>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </Group>
          )}

          {options.materials.length > 0 && (
            <Group title="Material">
              <div className="flex flex-wrap gap-2">
                {options.materials.map((m) => {
                  const on = draft.materials.includes(m.key);
                  return (
                    <button
                      key={m.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setDraft((d) => ({ ...d, materials: toggleKey(d.materials, m.key) }))}
                      className={chip(on)}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </Group>
          )}

          {options.specs.map((spec) => (
            <Group key={spec.key} title={spec.label}>
              <div className="flex flex-wrap gap-2">
                {spec.values.map((v) => {
                  const selected = draft.specs[spec.key] ?? [];
                  const on = selected.includes(v.key);
                  return (
                    <button
                      key={v.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setDraft((d) => ({ ...d, specs: { ...d.specs, [spec.key]: toggleKey(selected, v.key) } }))
                      }
                      className={chip(on)}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </Group>
          ))}
        </div>

        <footer className="flex shrink-0 items-center gap-2 border-t border-neutral-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={clearAll}
            className="h-11 rounded-md px-4 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => onApply(next)}
            disabled={resultCount === 0}
            className="h-11 flex-1 rounded-md bg-neutral-900 text-sm font-bold text-white transition-opacity disabled:opacity-50"
          >
            {resultCount === 0 ? "No matching products" : `Show ${resultCount} product${resultCount === 1 ? "" : "s"}`}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
