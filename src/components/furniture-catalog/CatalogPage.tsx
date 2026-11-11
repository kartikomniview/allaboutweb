"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check, SlidersHorizontal } from "lucide-react";
import { categoryLabel, findCategory, sortCategoryNames } from "@/lib/taxonomy";
import CatalogFilterSheet from "./CatalogFilterSheet";
import { EMPTY_REFINE, activeRefineCount, applyRefine, filterOptions, type RefineFilters } from "./filters";
import { CategoryBox, ProductCard, ProductPlaceholder, useCatalog } from "./shared";

export type CatalogFilters = {
  /** A category name, or "" for the store's first category. */
  category: string;
  /** A subcategory name, or "" for every subcategory */
  subCategory: string;
  /** Sort, price, colour, material and spec filters (the Filters sheet). */
  refine: RefineFilters;
};

// Subcategory chip colours. Light fills (never solid black) so the white-backed
// thumbnails can blend in; the selected chip is a shade darker, with a check badge.
const chipActive = "bg-neutral-200 font-semibold text-neutral-900";
const chipIdle = "bg-neutral-100 font-medium text-neutral-700 hover:bg-neutral-200";

function SubcategoryChip({
  category,
  name,
  image,
  photo,
  active,
  onClick,
}: {
  category: string;
  name: string;
  /** A cut-out on white that pops out over the chip (furniture subcategories). */
  image?: string;
  /** Otherwise a product photo, shown as a small square thumbnail. */
  photo?: string;
  active: boolean;
  onClick: () => void;
}) {
  // The cut-out file can be missing: show the placeholder instead.
  const [missing, setMissing] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      title={name}
      className={`relative flex h-11 w-[140px] shrink-0 items-center rounded-md pl-[62px] pr-2 text-left text-[11px] leading-tight transition-colors active:scale-95 ${
        active ? chipActive : chipIdle
      }`}
    >
      {/* The cut-out is taller than the chip and pops out over its top edge.
          multiply turns the photo's white background into the chip/page colour;
          the brightness lift first pushes off-white backgrounds to pure white. */}
      {image && !missing ? (
        <span className="pointer-events-none absolute bottom-0.5 left-0.5 h-[58px] w-[58px]">
          <Image
            src={image}
            alt=""
            fill
            sizes="58px"
            className="object-contain object-bottom brightness-[1.08] contrast-[1.05] mix-blend-multiply"
            onError={() => setMissing(true)}
          />
        </span>
      ) : photo ? (
        <span className="pointer-events-none absolute bottom-1 left-1.5 h-9 w-12 overflow-hidden rounded-md bg-white">
          <Image src={photo} alt="" fill sizes="48px" className="object-cover" />
        </span>
      ) : (
        <span className="absolute bottom-1 left-1.5 h-9 w-12 overflow-hidden rounded-md">
          <ProductPlaceholder category={category} subCategory={name} />
        </span>
      )}
      <span className="line-clamp-2 min-w-0 flex-1">{name}</span>
      {active && (
        <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-neutral-900 text-white shadow-sm ring-2 ring-white">
          <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden />
        </span>
      )}
    </button>
  );
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = { category: "", subCategory: "", refine: EMPTY_REFINE };

// The Catalog tab, the start page: category boxes, the subcategory chips, the
// Filters sheet, and the matching products. Categories, subcategories and filter
// options all come from the store's own products. The filters live in the
// catalog app so they survive switching tabs.
export default function CatalogPage({
  filters,
  onFiltersChange,
}: {
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
}) {
  const { products } = useCatalog();
  const { subCategory, refine } = filters;
  const [sheetOpen, setSheetOpen] = useState(false);

  // The store's categories: predefined ones in their usual order, then its own A–Z.
  const categories = useMemo(() => sortCategoryNames(products.map((p) => p.categoryName).filter(Boolean)), [products]);
  const category = categories.includes(filters.category) ? filters.category : (categories[0] ?? "");

  // A new category brings its own subcategories and filter options.
  const setCategory = (next: string) => onFiltersChange({ category: next, subCategory: "", refine: EMPTY_REFINE });
  // Chips toggle: tapping the selected one clears the filter and shows everything.
  const toggleSubCategory = (next: string) =>
    onFiltersChange({ ...filters, category, subCategory: subCategory === next ? "" : next });
  const resetFilters = () => onFiltersChange({ ...filters, category, subCategory: "", refine: EMPTY_REFINE });

  // A product photo for each category without its own picture.
  const categoryPhotos = useMemo(() => {
    const photos = new Map<string, string>();
    for (const p of products) if (p.mainImageUrl && !photos.has(p.categoryName)) photos.set(p.categoryName, p.mainImageUrl);
    return photos;
  }, [products]);

  const categoryProducts = useMemo(() => products.filter((p) => p.categoryName === category), [products, category]);

  // Subcategories in order of first appearance, each with a product photo.
  const subCategories = useMemo(() => {
    const byName = new Map<string, string>();
    for (const p of categoryProducts) {
      if (!p.subcategoryName) continue;
      if (!byName.has(p.subcategoryName) || (!byName.get(p.subcategoryName) && p.mainImageUrl)) {
        byName.set(p.subcategoryName, p.mainImageUrl);
      }
    }
    return [...byName.entries()].map(([name, photo]) => ({ name, photo }));
  }, [categoryProducts]);
  const known = findCategory(category);
  const cutoutFor = (sub: string) => known?.subcategories.find((s) => s.name === sub)?.image;

  const subProducts = useMemo(
    () => categoryProducts.filter((item) => !subCategory || item.subcategoryName === subCategory),
    [categoryProducts, subCategory],
  );
  // Options from the whole category, so picking a subcategory doesn't drop them.
  const options = useMemo(() => filterOptions(categoryProducts), [categoryProducts]);
  const shown = useMemo(() => applyRefine(subProducts, refine), [subProducts, refine]);
  const refineCount = activeRefineCount(refine);
  const hasFilterOptions = !!options.price || options.colors.length + options.materials.length + options.specs.length > 0;

  // Keep the selected category box in view (it can sit off-screen in the row).
  // Scrolls the row only, never the page.
  const categoryRowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = categoryRowRef.current;
    const selected = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !selected) return;
    const rowRect = row.getBoundingClientRect();
    const boxRect = selected.getBoundingClientRect();
    const offset = boxRect.left + boxRect.width / 2 - (rowRect.left + rowRect.width / 2);
    row.scrollBy({ left: offset, behavior: "smooth" });
  }, [category]);

  // A new category brings its own subcategory chips: show them from the first one.
  const subCategoryRowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    subCategoryRowRef.current?.scrollTo({ left: 0 });
  }, [category]);

  if (!categories.length) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
        <p className="text-xs font-semibold text-neutral-800">No products yet.</p>
        <p className="mt-1 text-[11px] text-neutral-500">Check back soon, or message us on WhatsApp.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-1">
      {/* Category boxes — swipeable row (hidden for a store with a single category) */}
      {categories.length > 1 && (
        <div ref={categoryRowRef} className="-mx-2 flex gap-4 overflow-x-auto no-scrollbar px-2 pb-1">
          {categories.map((cat) => (
            <div key={cat} className="w-[17%] min-w-[64px] shrink-0">
              <CategoryBox
                category={cat}
                photo={categoryPhotos.get(cat)}
                active={category === cat}
                onClick={() => setCategory(cat)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Subcategory chips — swipeable row, sticky under the app header. The top
          padding (photos rise 16px above the chips, plus a 2px gap below the header
          when stuck) leaves room for the photos that rise above the chips (the
          scroll container would clip them otherwise). */}
      {subCategories.length > 0 && (
        <div
          ref={subCategoryRowRef}
          className="sticky top-[var(--catalog-header-h,0px)] z-20 -mx-4 flex gap-2 overflow-x-auto no-scrollbar bg-white px-4 pb-2 pt-[18px]"
        >
          {subCategories.map((sub) => (
            <SubcategoryChip
              key={sub.name}
              category={category}
              name={sub.name}
              image={cutoutFor(sub.name)}
              photo={sub.photo || undefined}
              active={subCategory === sub.name}
              onClick={() => toggleSubCategory(sub.name)}
            />
          ))}
        </div>
      )}

      {/* Results count, filters & product grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-neutral-500">
          <span>
            {categories.length === 1 && <span className="font-semibold text-neutral-700">{categoryLabel(category)} · </span>}
            Showing {shown.length} item{shown.length === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-3">
            {(subCategory || refineCount > 0) && (
              <button onClick={resetFilters} className="font-semibold text-neutral-900 hover:underline">
                Reset
              </button>
            )}
            {hasFilterOptions && (
              <button
                onClick={() => setSheetOpen(true)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 font-semibold ring-1 ring-inset transition-colors ${
                  refineCount > 0
                    ? "bg-neutral-900 text-white ring-neutral-900"
                    : "bg-white text-neutral-700 ring-neutral-200 hover:ring-neutral-400"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                Filters{refineCount > 0 ? ` (${refineCount})` : ""}
              </button>
            )}
          </span>
        </div>

        {shown.length === 0 ? (
          <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-6 text-center">
            <p className="text-xs font-semibold text-neutral-800">No products match this combination.</p>
            <button onClick={resetFilters} className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white">
              Show all {categoryLabel(category)}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-4">
            {shown.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {sheetOpen && (
        <CatalogFilterSheet
          products={subProducts}
          options={options}
          value={refine}
          onApply={(next) => {
            onFiltersChange({ ...filters, category, refine: next });
            setSheetOpen(false);
          }}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}
