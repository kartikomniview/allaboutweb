"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, ChevronRight, Link2, Search, Share2, X } from "lucide-react";
import {
  MAX_PICKS,
  canShareNatively,
  copyText,
  scopeSubPath,
  scopeTitle,
  shareMessage,
  shareNatively,
  whatsAppShareUrl,
  type ShareScope,
} from "@/components/furniture-catalog/shareLinks";
import { WhatsAppIcon } from "@/components/furniture-catalog/shared";
import type { Product } from "@/lib/adminProducts";
import { categoryLabel, sortCategoryNames } from "@/lib/taxonomy";
import { authInputClass, authInputIconClass, authLabelClass, authSecondaryButtonClass } from "../AuthLayout";
import { hapticTick, ripple } from "../ripple";
import { ProductThumb } from "./ProductTable";
import { useOverlay } from "./useOverlay";

type Choice = "all" | "category" | "subcategory" | "products";

const items = (n: number) => `${n} ${n === 1 ? "product" : "products"}`;

const selectClass =
  "h-12 w-full rounded-md border border-line bg-white px-3.5 text-base text-ink transition-[border-color,box-shadow] hover:border-slate/35 focus:border-primary focus:outline-none focus-visible:outline-none! focus:ring-[3px] focus:ring-primary/15";

// Share the live catalog from the products page: the whole catalog, a category, a
// subcategory, or products the owner picks. Only published products are on the live
// catalog, so only they count and can be picked. Sent on WhatsApp, as a copied link,
// or through the phone's share menu.
export default function ShareCatalogDialog({
  products,
  storeName,
  liveUrl,
  initialCategory,
  onShared,
  onClose,
}: {
  products: Product[];
  storeName: string;
  /** The store's live catalog, e.g. https://demostore.catalog24.in */
  liveUrl: string;
  /** The category filtered on the products page, preselected when it has published products. */
  initialCategory?: string;
  /** Called once something was sent or copied (the dashboard ticks off "Share your catalog link"). */
  onShared?: () => void;
  onClose: () => void;
}) {
  const panelRef = useOverlay<HTMLDivElement>(onClose);
  const published = useMemo(() => products.filter((p) => p.isActive), [products]);
  const categories = useMemo(
    () => sortCategoryNames(published.map((p) => p.categoryName).filter(Boolean)),
    [published],
  );
  const startCategory = initialCategory && categories.includes(initialCategory) ? initialCategory : (categories[0] ?? "");

  const [choice, setChoice] = useState<Choice>(initialCategory && categories.includes(initialCategory) ? "category" : "all");
  const [step, setStep] = useState<"scope" | "pick">("scope");
  const [category, setCategory] = useState(startCategory);
  const subCategories = useMemo(
    () => [...new Set(published.filter((p) => p.categoryName === category).map((p) => p.subcategoryName).filter(Boolean))],
    [published, category],
  );
  const [subPick, setSubPick] = useState("");
  const subCategory = subCategories.includes(subPick) ? subPick : (subCategories[0] ?? "");
  const [picked, setPicked] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const nativeShare = canShareNatively();

  const inCategory = published.filter((p) => p.categoryName === category).length;
  const inSubCategory = published.filter((p) => p.categoryName === category && p.subcategoryName === subCategory).length;

  const scope: ShareScope =
    choice === "category"
      ? { kind: "category", category }
      : choice === "subcategory"
        ? { kind: "subcategory", category, subCategory }
        : choice === "products"
          ? { kind: "products", ids: picked }
          : { kind: "all" };
  const count =
    choice === "category" ? inCategory : choice === "subcategory" ? inSubCategory : choice === "products" ? picked.length : published.length;
  const ready = count > 0;
  const url = new URL(scopeSubPath(scope) || "/", liveUrl).toString();
  const message = shareMessage(storeName, scope, count, url);

  const choose = (next: Choice) => {
    hapticTick();
    setChoice(next);
    if (next === "products") setStep("pick");
  };

  const copy = async () => {
    if (await copyText(url)) {
      setCopied(true);
      onShared?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // The product list (published only), searchable by name, category or subcategory.
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const listed = words.length
    ? published.filter((p) => {
        const text = [p.productName, p.categoryName, categoryLabel(p.categoryName), p.subcategoryName].join(" ").toLowerCase();
        return words.every((w) => text.includes(w));
      })
    : published;
  const full = picked.length >= MAX_PICKS;
  const togglePick = (id: string) => {
    hapticTick();
    setPicked((list) => (list.includes(id) ? list.filter((i) => i !== id) : list.length < MAX_PICKS ? [...list, id] : list));
  };
  const hiddenCount = products.length - published.length;

  return (
    <div
      className="admin-fade-in fixed inset-0 z-[110] flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-catalog-title"
        tabIndex={-1}
        className="admin-pop-in flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-lg bg-white shadow-2xl focus:outline-none sm:max-w-[440px] sm:rounded-lg"
      >
        {/* Top bar */}
        <header className="flex shrink-0 items-center gap-1 border-b border-line px-1.5 py-1.5">
          {step === "pick" ? (
            <button
              type="button"
              onClick={() => setStep("scope")}
              onPointerDown={ripple}
              aria-label="Back"
              className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full text-ink transition-colors hover:bg-ink/[0.05]"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </button>
          ) : (
            <span className="w-3.5" aria-hidden />
          )}
          <h2 id="share-catalog-title" className="min-w-0 flex-1 truncate text-base font-semibold text-ink">
            {step === "pick" ? "Choose products" : "Share your catalog"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            onPointerDown={ripple}
            aria-label="Close"
            className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full text-slate transition-colors hover:bg-ink/[0.05] hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        {published.length === 0 ? (
          <div className="px-5 py-8 text-center sm:px-8">
            <p className="text-[15px] font-semibold text-ink">Nothing to share yet</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate">
              Only published products are on your live catalog. Publish a product, then share it from here.
            </p>
          </div>
        ) : step === "scope" ? (
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div role="radiogroup" aria-label="What to share" className="flex flex-col gap-2.5">
              <ScopeCard title="Whole catalog" detail={items(published.length)} selected={choice === "all"} onClick={() => choose("all")} />
              <ScopeCard
                title="A category"
                detail={choice === "category" ? items(inCategory) : "All products in one category"}
                selected={choice === "category"}
                onClick={() => choose("category")}
              />
              <ScopeCard
                title="A subcategory"
                detail={choice === "subcategory" ? items(inSubCategory) : "One type, e.g. L-Shape sofas"}
                selected={choice === "subcategory"}
                onClick={() => choose("subcategory")}
              />
              <ScopeCard
                title="Choose products"
                detail={picked.length ? `${items(picked.length)} selected` : `Pick up to ${MAX_PICKS}`}
                selected={choice === "products"}
                chevron
                onClick={() => choose("products")}
              />
            </div>

            {(choice === "category" || choice === "subcategory") && (
              <div className="admin-fade-in mt-5 flex flex-col gap-4">
                <div>
                  <label htmlFor="share-category" className={authLabelClass}>
                    Category
                  </label>
                  <select id="share-category" value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                    {categories.map((name) => (
                      <option key={name} value={name}>
                        {categoryLabel(name)}
                      </option>
                    ))}
                  </select>
                </div>
                {choice === "subcategory" && (
                  <div>
                    <label htmlFor="share-subcategory" className={authLabelClass}>
                      Subcategory
                    </label>
                    {subCategories.length ? (
                      <select
                        id="share-subcategory"
                        value={subCategory}
                        onChange={(e) => setSubPick(e.target.value)}
                        className={selectClass}
                      >
                        {subCategories.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-[13px] text-slate">This category&apos;s products have no subcategory.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 px-5 pb-2 pt-4 sm:px-6">
              <label className="relative block">
                <span className="sr-only">Search products</span>
                <Search className={authInputIconClass} aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products"
                  enterKeyHint="search"
                  className={authInputClass}
                />
              </label>
              <p className="mt-2 text-xs text-slate" aria-live="polite">
                {full
                  ? `You can share up to ${MAX_PICKS} products in one link.`
                  : `${picked.length} selected${hiddenCount ? " · hidden products aren't on your live catalog" : ""}`}
              </p>
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5 pb-2 sm:px-6">
              {listed.map((p) => {
                const on = picked.includes(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      disabled={!on && full}
                      onClick={() => togglePick(p.id)}
                      className="flex min-h-14 w-full items-center gap-3 py-2 text-left disabled:opacity-40"
                    >
                      <ProductThumb product={p} className="h-11 w-11" rounded="rounded-md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {p.productName || "Untitled product"}
                        </span>
                        <span className="block truncate text-xs text-slate">
                          {[categoryLabel(p.categoryName), p.subcategoryName].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-sm border transition-colors ${
                          on ? "border-primary bg-primary text-white" : "border-line bg-white"
                        }`}
                        aria-hidden
                      >
                        {on && <Check className="admin-pop-check h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                    </button>
                  </li>
                );
              })}
              {listed.length === 0 && <li className="py-10 text-center text-sm text-slate">No products match.</li>}
            </ul>
          </div>
        )}

        {/* How to send it */}
        {published.length > 0 && (
          <footer className="shrink-0 border-t border-line bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5">
            <div className="mb-2.5 flex items-center justify-between gap-3 text-[13px]">
              <p className="min-w-0 truncate text-slate">
                {ready ? (
                  <>
                    <span className="font-semibold text-ink">{scopeTitle(scope)}</span> · {items(count)}
                  </>
                ) : choice === "products" ? (
                  "Select at least one product."
                ) : (
                  "No published products here."
                )}
              </p>
              {ready && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary hover:underline"
                >
                  Preview
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              )}
            </div>
            <a
              href={ready ? whatsAppShareUrl(message) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!ready}
              onPointerDown={ripple}
              onClick={(e) => (ready ? onShared?.() : e.preventDefault())}
              className={`relative flex h-12 w-full select-none items-center justify-center gap-2 overflow-hidden rounded-md bg-[#25D366] text-[15px] font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-[#1fb855] active:scale-[0.98] ${
                ready ? "" : "pointer-events-none opacity-50"
              }`}
            >
              <WhatsAppIcon className="h-[18px] w-[18px]" />
              Share on WhatsApp
            </a>
            <div className={`mt-2 grid gap-2 ${nativeShare ? "grid-cols-2" : "grid-cols-1"}`}>
              <button type="button" onClick={copy} onPointerDown={ripple} disabled={!ready} className={`${authSecondaryButtonClass} w-full`}>
                {copied ? <Check className="h-[18px] w-[18px] text-emerald-600" aria-hidden /> : <Link2 className="h-[18px] w-[18px]" aria-hidden />}
                <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
              </button>
              {nativeShare && (
                <button
                  type="button"
                  onClick={async () => (await shareNatively(`${storeName} · ${scopeTitle(scope)}`, message)) && onShared?.()}
                  onPointerDown={ripple}
                  disabled={!ready}
                  className={`${authSecondaryButtonClass} w-full`}
                >
                  <Share2 className="h-[18px] w-[18px]" aria-hidden />
                  More
                </button>
              )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

// An option card (BusinessTypePicker style): a radio dot, a title and a short detail.
function ScopeCard({
  title,
  detail,
  selected,
  chevron = false,
  onClick,
}: {
  title: string;
  detail: string;
  selected: boolean;
  chevron?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      onPointerDown={ripple}
      className={`relative flex min-h-14 w-full items-center gap-3 overflow-hidden rounded-md border px-4 py-3 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] ${
        selected ? "border-primary bg-tint/60 ring-1 ring-inset ring-primary" : "border-line bg-white hover:border-slate/35"
      }`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
          selected ? "border-primary" : "border-line"
        }`}
        aria-hidden
      >
        {selected && <span className="admin-pop-check h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink">{title}</span>
        <span className="block text-[13px] text-slate">{detail}</span>
      </span>
      {chevron && <ChevronRight className="h-[18px] w-[18px] shrink-0 text-slate" aria-hidden />}
    </button>
  );
}
