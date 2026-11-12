// The catalog's refine filters (sort, price, specs). The options
// are built from the products themselves, so every store gets filters that fit
// what it sells: a furniture store sees Wood, a lighting store sees Bulb, etc.
// Pure functions, no React: easy to test.

import type { CatalogProduct, ProductSpec } from '@/lib/adminProducts';

export type SortOrder = 'featured' | 'price-asc' | 'price-desc';

export type RefineFilters = {
  sort: SortOrder;
  minPrice: number | null;
  maxPrice: number | null;
  /** Lower-cased spec label -> lower-cased values (any of them matches). */
  specs: Record<string, string[]>;
};

export const EMPTY_REFINE: RefineFilters = {
  sort: 'featured',
  minPrice: null,
  maxPrice: null,
  specs: {},
};

export type FilterOption = { key: string; label: string; count: number };
export type SpecFilter = { key: string; label: string; values: FilterOption[] };

export type FilterOptions = {
  /** Lowest and highest price among priced products; null when fewer than 2 prices differ. */
  price: { min: number; max: number } | null;
  specs: SpecFilter[];
};

const MAX_SPEC_LABELS = 5;
const MAX_SPEC_VALUES = 8;

const key = (s: string) => s.trim().toLowerCase();
const specsOf = (p: CatalogProduct): ProductSpec[] => p.specs ?? [];

/** Counts values by key, keeping the first spelling seen as the label. Most common first. */
function tally<T extends { key: string; label: string }>(items: T[]): (T & { count: number })[] {
  const byKey = new Map<string, T & { count: number }>();
  for (const item of items) {
    if (!item.key) continue;
    const seen = byKey.get(item.key);
    if (seen) seen.count += 1;
    else byKey.set(item.key, { ...item, count: 1 });
  }
  return [...byKey.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** The filters worth offering for these products (only those that can tell products apart). */
export function filterOptions(products: CatalogProduct[]): FilterOptions {
  const prices = products.map((p) => p.price).filter((n) => n > 0);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;

  // Spec labels on at least 2 products (each product counts once per value), most common first.
  const byLabel = new Map<string, { label: string; products: number; values: { key: string; label: string }[] }>();
  for (const p of products) {
    const seen = new Set<string>();
    for (const spec of specsOf(p)) {
      const labelKey = key(spec.label);
      if (!labelKey || !spec.value.trim() || seen.has(labelKey)) continue;
      seen.add(labelKey);
      const entry = byLabel.get(labelKey) ?? { label: spec.label.trim(), products: 0, values: [] };
      entry.products += 1;
      entry.values.push({ key: key(spec.value), label: spec.value.trim() });
      byLabel.set(labelKey, entry);
    }
  }
  const specs = [...byLabel.entries()]
    .filter(([, e]) => e.products >= 2)
    .map(([labelKey, e]) => ({ key: labelKey, label: e.label, products: e.products, values: tally(e.values) }))
    // A filter only helps if it narrows the list: several values, or not on every product.
    .filter((s) => s.values.length > 1 || s.products < products.length)
    .sort((a, b) => b.products - a.products || a.label.localeCompare(b.label))
    .slice(0, MAX_SPEC_LABELS)
    .map(({ key: k, label, values }) => ({ key: k, label, values: values.slice(0, MAX_SPEC_VALUES) }));

  return {
    price: prices.length >= 2 && min < max ? { min, max } : null,
    specs,
  };
}

/** How many refine filters are on (the sort counts too when it isn't the default). */
export function activeRefineCount(f: RefineFilters): number {
  return (
    (f.sort !== 'featured' ? 1 : 0) +
    (f.minPrice !== null || f.maxPrice !== null ? 1 : 0) +
    Object.values(f.specs).reduce((n, values) => n + values.length, 0)
  );
}

/** The products matching the filters, in the chosen order. */
export function applyRefine(products: CatalogProduct[], f: RefineFilters): CatalogProduct[] {
  const priced = f.minPrice !== null || f.maxPrice !== null;
  const specFilters = Object.entries(f.specs).filter(([, values]) => values.length);

  const matching = products.filter((p) => {
    // A price range hides "price on request" products.
    if (priced && (p.price <= 0 || (f.minPrice !== null && p.price < f.minPrice) || (f.maxPrice !== null && p.price > f.maxPrice))) {
      return false;
    }
    for (const [label, values] of specFilters) {
      const spec = specsOf(p).find((s) => key(s.label) === label);
      if (!spec || !values.includes(key(spec.value))) return false;
    }
    return true;
  });

  if (f.sort === 'featured') return matching;
  // "Price on request" products go last either way.
  const dir = f.sort === 'price-asc' ? 1 : -1;
  return [...matching].sort((a, b) => {
    if (a.price <= 0 || b.price <= 0) return (a.price <= 0 ? 1 : 0) - (b.price <= 0 ? 1 : 0);
    return (a.price - b.price) * dir;
  });
}

/** Turns a value on or off in a list of selected keys. */
export const toggleKey = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
