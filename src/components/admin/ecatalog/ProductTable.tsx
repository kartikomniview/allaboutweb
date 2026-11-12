"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ChevronRight, Eye, EyeOff, EllipsisVertical, Pencil, Table2, Trash2 } from "lucide-react";
import { formatINR, formatPrice } from "@/components/furniture-catalog/data";
import { discountPercent, type Product } from "@/lib/adminProducts";
import { categoryLabel } from "@/lib/taxonomy";
import CategoryIcon from "@/components/CategoryIcon";
import { Badge, Skeleton, Spinner, formatRelative } from "../ui";
import { ripple } from "../ripple";

type Props = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
  togglingId: string | null;
};


// The main image, or a stand-in: category icon on the product's first colour.
export function ProductThumb({
  product,
  className = "h-10 w-10",
  rounded = "rounded-lg",
  fit = "cover",
}: {
  product: Product;
  className?: string;
  rounded?: string;
  /** "contain" shows the whole photo, letterboxed on the gray background. */
  fit?: "cover" | "contain";
}) {
  if (product.mainImageUrl) {
    return (
      <span className={`relative block shrink-0 overflow-hidden ${fit === "contain" ? "bg-[#eef0f4]" : "bg-paper"} ring-1 ring-inset ring-ink/[0.06] ${rounded} ${className}`}>
        {/* Plain img: an unexpected URL in Firestore must not crash the list the way next/image would. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.mainImageUrl} alt="" loading="lazy" className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`} />
      </span>
    );
  }
  const hex = product.colors[0]?.hex ?? "#8B5A2B";
  return (
    <span
      className={`grid shrink-0 place-items-center ring-1 ring-inset ring-ink/[0.06] ${rounded} ${className}`}
      style={{ backgroundColor: `${hex}1F`, color: hex }}
      aria-hidden
    >
      {/* Old "Table" category name (before CenterTable) keeps its table icon. */}
      {product.categoryName === "Table" ? (
        <Table2 className="h-[45%] w-[45%]" strokeWidth={1.75} />
      ) : (
        <CategoryIcon category={product.categoryName} className="h-[45%] w-[45%]" strokeWidth={1.75} />
      )}
    </span>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge tone="success" dot>
      Published
    </Badge>
  ) : (
    <Badge tone="neutral" dot>
      Hidden
    </Badge>
  );
}

function Price({ product, align = "right" }: { product: Product; align?: "left" | "right" }) {
  const off = discountPercent(product.price, product.originalPrice);
  return (
    <div className={`tabular-nums ${align === "right" ? "text-right" : ""}`}>
      <p className="text-sm font-semibold text-ink">{formatPrice(product.price)}</p>
      {off > 0 && (
        <p className="text-xs text-slate">
          <span className="line-through">{formatINR(product.originalPrice)}</span>
          <span className="ml-1 font-medium text-emerald-700">−{off}%</span>
        </p>
      )}
    </div>
  );
}

const iconBtn =
  "grid h-8 w-8 place-items-center rounded-md text-slate transition-colors hover:bg-ink/[0.06] hover:text-ink disabled:opacity-50";

export default function ProductTable({ products, onEdit, onDelete, onToggleActive, togglingId }: Props) {
  const stop = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper/70 text-xs font-semibold text-slate">
              <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Product</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Category</th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold">Price</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Updated</th>
              <th scope="col" className="py-2.5 pl-3 pr-5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const toggling = togglingId === p.id;
              return (
                <tr
                  key={p.id}
                  onClick={() => onEdit(p)}
                  className="group cursor-pointer transition-colors hover:bg-paper/70"
                >
                  <td className="py-3 pl-5 pr-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <ProductThumb product={p} />
                      <div className="min-w-0 max-w-[20rem]">
                        <p className="truncate font-semibold text-ink group-hover:text-primary">
                          {p.productName || <span className="italic text-slate">Untitled product</span>}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate">
                          {p.tags[0] && <Badge tone="brand">{p.tags[0]}</Badge>}
                          {p.tags.length > 1 && <span>+{p.tags.length - 1}</span>}
                          {!p.tags.length && <span className="font-mono text-[11px] text-slate/80">{p.id}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">{p.categoryName ? categoryLabel(p.categoryName) : "—"}</p>
                    <p className="text-xs text-slate">{p.subcategoryName}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <Price product={p} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge active={p.isActive} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-[13px] text-slate" title={p.updatedAt ?? undefined}>
                    {formatRelative(p.updatedAt)}
                  </td>
                  <td className="py-3 pl-3 pr-5">
                    <div className="flex items-center justify-end gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={stop(() => onToggleActive(p))}
                        disabled={toggling}
                        className={iconBtn}
                        title={p.isActive ? "Hide from catalog" : "Publish to catalog"}
                        aria-label={p.isActive ? `Hide ${p.productName}` : `Publish ${p.productName}`}
                      >
                        {toggling ? <Spinner /> : p.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={stop(() => onEdit(p))}
                        className={iconBtn}
                        title="Edit"
                        aria-label={`Edit ${p.productName}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={stop(() => onDelete(p))}
                        className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
                        title="Delete"
                        aria-label={`Delete ${p.productName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: list */}
      <ul className="divide-y divide-line md:hidden">
        {products.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onEdit(p)}
              onPointerDown={ripple}
              className="relative flex min-h-[76px] w-full items-center gap-3 overflow-hidden px-3 py-2.5 text-left transition-colors active:bg-paper sm:px-4 sm:py-3"
            >
              <ProductThumb product={p} className="h-14 w-14" rounded="rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{p.productName || "Untitled product"}</p>
                <p className="truncate text-xs text-slate">
                  {categoryLabel(p.categoryName)}
                  {p.subcategoryName && ` · ${p.subcategoryName}`}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[13px] font-semibold tabular-nums text-ink">{formatPrice(p.price)}</span>
                  <StatusBadge active={p.isActive} />
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate/70" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

const floatingBtn =
  "grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate shadow-[0_1px_3px_rgba(1,18,60,0.18)] transition-colors hover:text-ink disabled:opacity-50";

const menuItem =
  "relative flex h-11 w-full items-center gap-2.5 overflow-hidden rounded-[4px] px-3 text-left text-[13px] font-semibold transition-colors disabled:opacity-50";

// Phones: a ⋮ button on the card's photo with a small menu of labelled actions
// (hide or publish, delete). Closes on a tap outside, Escape, or after a choice.
function CardActionsMenu({
  product,
  toggling,
  onToggleActive,
  onDelete,
}: {
  product: Product;
  toggling: boolean;
  onToggleActive: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (action: (product: Product) => void) => {
    setOpen(false);
    action(product);
  };

  return (
    <div ref={rootRef} className="absolute inset-x-2 top-2 flex flex-col items-end md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${product.productName || "this product"}`}
        className={`${floatingBtn} ${open ? "text-ink" : ""}`}
      >
        {toggling ? <Spinner /> : <EllipsisVertical className="h-[18px] w-[18px]" aria-hidden />}
      </button>
      {open && (
        <div
          role="menu"
          className="admin-pop-in mt-1.5 w-full max-w-[200px] rounded-md border border-line bg-white p-1 shadow-[0_12px_32px_-12px_rgba(1,18,60,0.35)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onToggleActive)}
            onPointerDown={ripple}
            disabled={toggling}
            className={`${menuItem} text-ink hover:bg-paper`}
          >
            {product.isActive ? <EyeOff className="h-4 w-4 text-slate" aria-hidden /> : <Eye className="h-4 w-4 text-slate" aria-hidden />}
            {product.isActive ? "Hide from catalog" : "Publish to catalog"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onDelete)}
            onPointerDown={ripple}
            className={`${menuItem} text-red-600 hover:bg-red-50`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// Card grid: a large photo per product. Clicking a card opens the editor. The
// hide/publish and delete actions: on phones in a ⋮ menu with labels; on larger
// screens as icon buttons on the photo (always visible on touch screens, on hover
// with a mouse).
export function ProductGrid({ products, onEdit, onDelete, onToggleActive, togglingId }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 sm:gap-3 sm:p-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => {
        const toggling = togglingId === p.id;
        return (
          <li
            key={p.id}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(1,18,60,0.25)]"
          >
            <button type="button" onClick={() => onEdit(p)} onPointerDown={ripple} className="relative flex flex-1 flex-col overflow-hidden text-left">
              <div className="relative w-full">
                <ProductThumb product={p} className="aspect-square w-full" rounded="rounded-none" fit="contain" />
                {/* Only flag the exception: published is the normal state. */}
                {!p.isActive && (
                  <span className="absolute bottom-2 left-2">
                    <StatusBadge active={false} />
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-0.5 p-2.5 sm:p-3">
                <p className="truncate text-[13px] font-semibold leading-snug text-ink group-hover:text-primary" title={p.productName}>
                  {p.productName || <span className="italic text-slate">Untitled product</span>}
                </p>
                {/* Category · subcategory: not on phones, where the cards are small. */}
                <p
                  className="hidden truncate text-xs text-slate sm:block"
                  title={[p.categoryName, p.subcategoryName].filter(Boolean).join(" · ")}
                >
                  {categoryLabel(p.categoryName)}
                  {p.subcategoryName && ` · ${p.subcategoryName}`}
                </p>
                <p className="mt-auto pt-1 text-sm font-semibold tabular-nums text-ink">{formatPrice(p.price)}</p>
              </div>
            </button>

            <CardActionsMenu product={p} toggling={toggling} onToggleActive={onToggleActive} onDelete={onDelete} />

            <div className="absolute right-2 top-2 hidden gap-1 transition-opacity focus-within:opacity-100 md:flex [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onToggleActive(p)}
                disabled={toggling}
                className={floatingBtn}
                title={p.isActive ? "Hide from catalog" : "Publish to catalog"}
                aria-label={p.isActive ? `Hide ${p.productName}` : `Publish ${p.productName}`}
              >
                {toggling ? <Spinner /> : p.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => onDelete(p)}
                className={`${floatingBtn} hover:text-red-600`}
                title="Delete"
                aria-label={`Delete ${p.productName}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ProductGridSkeleton({ cards = 10 }: { cards?: number }) {
  return (
    <ul
      aria-busy="true"
      aria-label="Loading products"
      className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 sm:gap-3 sm:p-4 lg:grid-cols-4 xl:grid-cols-5"
    >
      {Array.from({ length: cards }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-lg border border-line bg-white">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3.5 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ProductTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading products">
      <div className="hidden h-10 border-b border-line bg-paper/70 md:block" />
      <ul className="divide-y divide-line">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-3.5 md:px-5">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-2/5 min-w-32" />
              <Skeleton className="h-3 w-1/4 min-w-20" />
            </div>
            <Skeleton className="hidden h-3.5 w-20 md:block" />
            <Skeleton className="hidden h-3.5 w-16 md:block" />
            <Skeleton className="h-5 w-[4.5rem] rounded-md" />
            <Skeleton className="hidden h-3.5 w-14 lg:block" />
          </li>
        ))}
      </ul>
    </div>
  );
}
