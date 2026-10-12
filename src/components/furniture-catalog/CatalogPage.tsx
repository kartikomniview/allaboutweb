"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { CATEGORY_TAB_LABELS, MAIN_CATEGORIES, subcategoryImage, type MainCategory } from "./data";
import { CategoryBox, FriendlyFurniturePlaceholder, ProductCard, useCatalog } from "./shared";

export type CatalogFilters = {
  category: MainCategory;
  /** A subcategory name, or "" for every subcategory */
  subCategory: string;
};

// Design-type filter chip colours. Light fills (not solid brown) so the
// white-backed thumbnails can blend in, and no outlines: the photos rise over
// the chip's top edge and a border would show through them.
const chipActive = "bg-[#EFE2D1] font-semibold text-[#6E4422] shadow-[0_1px_3px_rgba(139,90,43,0.25)]";
const chipIdle = "bg-white font-medium text-neutral-700 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:bg-[#FAF5EE]";

function SubcategoryChip({
  category,
  name,
  active,
  onClick,
}: {
  category: MainCategory;
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  // No image yet for this subcategory: show the drawn placeholder instead.
  const [missing, setMissing] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      title={name}
      className={`relative flex h-11 w-[140px] shrink-0 items-center rounded-lg pl-[62px] pr-2 text-left text-[11px] leading-tight transition-colors active:scale-95 ${
        active ? chipActive : chipIdle
      }`}
    >
      {/* The photo is taller than the chip and pops out over its top edge.
          multiply turns the photo's white background into the chip/page colour;
          the brightness lift first pushes off-white backgrounds to pure white. */}
      {missing ? (
        <span className="absolute bottom-1 left-1.5 h-9 w-12 overflow-hidden rounded-md">
          <FriendlyFurniturePlaceholder category={category} subCategory={name} />
        </span>
      ) : (
        <span className="pointer-events-none absolute bottom-0.5 left-0.5 h-[58px] w-[58px]">
          <Image
            src={subcategoryImage(name)}
            alt=""
            fill
            sizes="58px"
            className="object-contain object-bottom brightness-[1.08] contrast-[1.05] mix-blend-multiply"
            onError={() => setMissing(true)}
          />
        </span>
      )}
      <span className="line-clamp-2 min-w-0 flex-1">{name}</span>
      {active && (
        <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[#8B5A2B] text-white shadow-sm ring-2 ring-[#FAF9F6]">
          <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden />
        </span>
      )}
    </button>
  );
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = { category: "Sofa", subCategory: "" };

// The Catalog tab (/app/catalog/furniture/catalog): category boxes, the design-type
// filter, and the matching products. The filters live in the catalog app so
// they survive switching tabs and can be set from Home (category tiles, stories).
export default function CatalogPage({
  filters,
  onFiltersChange,
}: {
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
}) {
  const { products } = useCatalog();
  const { category, subCategory } = filters;

  const setCategory = (next: MainCategory) => onFiltersChange({ category: next, subCategory: "" });
  // Chips toggle: tapping the selected one clears the filter and shows everything.
  const toggleSubCategory = (next: string) =>
    onFiltersChange({ ...filters, subCategory: subCategory === next ? "" : next });
  const resetFilters = () => onFiltersChange({ ...filters, subCategory: "" });

  const categoryProducts = useMemo(
    () => products.filter((p) => p.categoryName === category),
    [products, category]
  );

  const availableSubCategories = useMemo(
    () => Array.from(new Set(categoryProducts.map((p) => p.subcategoryName).filter(Boolean))),
    [categoryProducts]
  );

  const filteredCategoryProducts = useMemo(
    () =>
      categoryProducts.filter((item) => !subCategory || item.subcategoryName === subCategory),
    [categoryProducts, subCategory]
  );

  // Keep the selected category box in view (e.g. "Chairs" picked on Home sits
  // off-screen in the row). Scrolls the row only, never the page.
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

  // A new category brings its own design-type chips: show them from the first one.
  const subCategoryRowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    subCategoryRowRef.current?.scrollTo({ left: 0 });
  }, [category]);

  return (
    <div className="space-y-3 pt-1">

      {/* Category boxes — swipeable row */}
      <div
        ref={categoryRowRef}
        className="-mx-2 flex gap-4 overflow-x-auto no-scrollbar px-2 pb-1"
      >
        {MAIN_CATEGORIES.map((cat) => (
          <div key={cat} className="w-[17%] shrink-0">
            <CategoryBox
              category={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
            />
          </div>
        ))}
      </div>

      {/* Design type filter — thumbnail chips, swipeable row, sticky under the
          app header. The top padding (photos rise 16px above the chips, plus a
          2px gap below the header when stuck) leaves room for the photos that rise above
          the chips (the scroll container would clip them otherwise). */}
      <div ref={subCategoryRowRef} className="sticky top-[var(--catalog-header-h,0px)] z-20 -mx-4 flex gap-2 overflow-x-auto no-scrollbar bg-[#FAF9F6] px-4 pb-2 pt-[18px]">
        {availableSubCategories.map((sub) => (
          <SubcategoryChip
            key={sub}
            category={category}
            name={sub}
            active={subCategory === sub}
            onClick={() => toggleSubCategory(sub)}
          />
        ))}
      </div>

      {/* Results Count & Product Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
          <span>Showing {filteredCategoryProducts.length} items</span>
          {subCategory && (
            <button
              onClick={resetFilters}
              className="text-[#8B5A2B] font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredCategoryProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center space-y-2 shadow-xs">
            <p className="text-xs font-semibold text-neutral-800">No products match this combination.</p>
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 bg-[#8B5A2B] text-white text-xs font-semibold rounded-xl"
            >
              Show All {CATEGORY_TAB_LABELS[category]}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-4">
            {filteredCategoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
