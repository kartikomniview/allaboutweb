"use client";

import { useEffect, useMemo, useRef } from "react";
import { CATEGORY_TAB_LABELS, MAIN_CATEGORIES, type MainCategory } from "./data";
import { CategoryBox, ProductCard, useCatalog } from "./shared";

export type CatalogFilters = {
  category: MainCategory;
  /** A subcategory name, or "All" */
  subCategory: string;
  /** A polish/colour name, or "All" */
  color: string;
};

// Small text-only filter chips
const chipClass =
  "shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors active:scale-95";
const chipActive = "bg-[#8B5A2B] text-white";
const chipIdle = "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-[#8B5A2B]/40";

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = { category: "Sofa", subCategory: "All", color: "All" };

// The Catalog tab (/app/catalog/furniture/catalog): category boxes, design-type and
// polish filters, and the matching products. The filters live in the catalog app so
// they survive switching tabs and can be set from Home (category tiles, stories).
export default function CatalogPage({
  filters,
  onFiltersChange,
}: {
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
}) {
  const { products } = useCatalog();
  const { category, subCategory, color } = filters;

  const setCategory = (next: MainCategory) => onFiltersChange({ category: next, subCategory: "All", color: "All" });
  const setSubCategory = (next: string) => onFiltersChange({ ...filters, subCategory: next });
  const setColor = (next: string) => onFiltersChange({ ...filters, color: next });
  const resetFilters = () => onFiltersChange({ ...filters, subCategory: "All", color: "All" });

  const categoryProducts = useMemo(
    () => products.filter((p) => p.categoryName === category),
    [products, category]
  );

  const availableSubCategories = useMemo(
    () => ["All", ...Array.from(new Set(categoryProducts.map((p) => p.subcategoryName)))],
    [categoryProducts]
  );

  const availableColors = useMemo(() => {
    const unique = new Map<string, string>();
    categoryProducts.flatMap((p) => p.colors).forEach((c) => unique.set(c.name, c.hex));
    return Array.from(unique.entries()).map(([name, hex]) => ({ name, hex }));
  }, [categoryProducts]);

  const filteredCategoryProducts = useMemo(
    () =>
      categoryProducts.filter(
        (item) =>
          (subCategory === "All" || item.subcategoryName === subCategory) &&
          (color === "All" || item.colors.some((c) => c.name === color))
      ),
    [categoryProducts, subCategory, color]
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

      {/* Design type & polish filters — plain text chips */}
      <div className="space-y-2">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto no-scrollbar px-4">
          {availableSubCategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSubCategory(sub)}
              aria-pressed={subCategory === sub}
              className={`${chipClass} ${subCategory === sub ? chipActive : chipIdle}`}
            >
              {sub}
            </button>
          ))}
        </div>

        {availableColors.length > 1 && (
          <div className="-mx-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar px-4">
            <span className="shrink-0 pr-0.5 text-[11px] text-neutral-500">Polish</span>
            {[{ name: 'All' }, ...availableColors].map(({ name }) => (
              <button
                key={name}
                onClick={() => setColor(name)}
                aria-pressed={color === name}
                className={`${chipClass} ${color === name ? chipActive : chipIdle}`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Count & Product Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
          <span>Showing {filteredCategoryProducts.length} items</span>
          {(subCategory !== 'All' || color !== 'All') && (
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
