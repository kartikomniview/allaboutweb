"use client";

import type { MouseEvent } from "react";
import {
  Archive,
  Armchair,
  BedDouble,
  ChevronRight,
  Coffee,
  DoorClosed,
  Eye,
  EyeOff,
  Package,
  Pencil,
  Sofa,
  Table2,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { formatINR } from "@/components/furniture-catalog/data";
import { discountPercent, type Product } from "@/lib/adminProducts";
import { Badge, Skeleton, Spinner, formatRelative } from "../ui";

type Props = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
  togglingId: string | null;
};

// "Table" is the old name of CenterTable, kept for products saved before the rename.
const CATEGORY_ICONS = {
  Sofa,
  Wardrobe: DoorClosed,
  Dresser: Archive,
  Bed: BedDouble,
  Dining: UtensilsCrossed,
  CenterTable: Coffee,
  Chair: Armchair,
  Table: Table2,
} as const;

// The main image, or a stand-in: category icon on the product's first colour.
export function ProductThumb({
  product,
  className = "h-10 w-10",
  rounded = "rounded-lg",
}: {
  product: Product;
  className?: string;
  rounded?: string;
}) {
  if (product.mainImageUrl) {
    return (
      <span className={`relative shrink-0 overflow-hidden bg-paper ring-1 ring-inset ring-ink/[0.06] ${rounded} ${className}`}>
        {/* Plain img: an unexpected URL in Firestore must not crash the list the way next/image would. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.mainImageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      </span>
    );
  }
  const Icon = CATEGORY_ICONS[product.categoryName as keyof typeof CATEGORY_ICONS] ?? Package;
  const hex = product.colors[0]?.hex ?? "#8B5A2B";
  return (
    <span
      className={`grid shrink-0 place-items-center ring-1 ring-inset ring-ink/[0.06] ${rounded} ${className}`}
      style={{ backgroundColor: `${hex}1F`, color: hex }}
      aria-hidden
    >
      <Icon className="h-[45%] w-[45%]" strokeWidth={1.75} />
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
      <p className="text-sm font-semibold text-ink">{formatINR(product.price)}</p>
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
  "grid h-8 w-8 place-items-center rounded-btn text-slate transition-colors hover:bg-ink/[0.06] hover:text-ink disabled:opacity-50";

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
                    <p className="font-medium text-ink">{p.categoryName || "—"}</p>
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
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-paper"
            >
              <ProductThumb product={p} className="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{p.productName || "Untitled product"}</p>
                <p className="truncate text-xs text-slate">
                  {p.categoryName}
                  {p.subcategoryName && ` · ${p.subcategoryName}`}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[13px] font-semibold tabular-nums text-ink">{formatINR(p.price)}</span>
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
  "grid h-8 w-8 place-items-center rounded-full bg-white/95 text-slate shadow-[0_1px_3px_rgba(1,18,60,0.18)] transition-colors hover:text-ink disabled:opacity-50";

// Card grid: a large photo per product. Clicking a card opens the editor; the
// hide/publish and delete buttons sit on the photo (always visible on touch
// screens, on hover with a mouse).
export function ProductGrid({ products, onEdit, onDelete, onToggleActive, togglingId }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:p-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => {
        const toggling = togglingId === p.id;
        return (
          <li
            key={p.id}
            className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-white transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(1,18,60,0.25)]"
          >
            <button type="button" onClick={() => onEdit(p)} className="flex flex-1 flex-col text-left">
              <div className="relative w-full">
                <ProductThumb product={p} className="aspect-[4/3] w-full" rounded="rounded-none" />
                <span className="absolute bottom-2 left-2">
                  <StatusBadge active={p.isActive} />
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink group-hover:text-primary">
                  {p.productName || <span className="italic text-slate">Untitled product</span>}
                </p>
                <p className="truncate text-xs text-slate">
                  {p.categoryName}
                  {p.subcategoryName && ` · ${p.subcategoryName}`}
                </p>
                <div className="mt-auto pt-1.5">
                  <Price product={p} align="left" />
                </div>
              </div>
            </button>

            <div className="absolute right-2 top-2 flex gap-1 transition-opacity focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
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
      className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:p-4 lg:grid-cols-4 xl:grid-cols-5"
    >
      {Array.from({ length: cards }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-card border border-line bg-white">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-1 h-3.5 w-1/3" />
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
          <li key={i} className="flex items-center gap-3 px-4 py-3.5 md:px-5">
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
