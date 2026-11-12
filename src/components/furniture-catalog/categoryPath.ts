// Category and product-type pages of a store catalog, relative to its base path:
//   /category/sofa             → the Sofa category
//   /category/sofa/l-shape     → its "L-Shape" product type
// Plain functions (no "use client"), so the server route can read them too.

const CATEGORY_PREFIX = '/category/';

/** "L-Shape Sofa" → "l-shape-sofa". Letters in any script are kept. */
export const toSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

/** The page of a category, or of one of its product types. */
export const categorySubPath = (category: string, subCategory = '') =>
  `${CATEGORY_PREFIX}${encodeURIComponent(toSlug(category))}${
    subCategory ? `/${encodeURIComponent(toSlug(subCategory))}` : ''
  }`;

export type CategoryRoute = { category: string; subCategory: string };

/** The slugs in a relative path like '/category/sofa/l-shape', or null for any other page. */
export const parseCategoryPath = (relative: string): CategoryRoute | null => {
  if (!relative.startsWith(CATEGORY_PREFIX)) return null;
  const [category = '', subCategory = '', ...rest] = relative.slice(CATEGORY_PREFIX.length).split('/');
  if (!category || rest.length) return null;
  try {
    return { category: decodeURIComponent(category), subCategory: decodeURIComponent(subCategory) };
  } catch {
    return null; // malformed escape
  }
};

/** The name among `names` with the given slug. */
export const findBySlug = (names: Iterable<string>, slug: string) => {
  for (const name of names) if (toSlug(name) === slug) return name;
  return undefined;
};
