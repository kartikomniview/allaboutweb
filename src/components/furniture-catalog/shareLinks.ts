// Share links for a store catalog, used by the live catalog's Share sheet and by the
// admin's products page. What can be shared:
//   - the whole catalog        → the store's start page
//   - a category               → /category/sofa
//   - a subcategory            → /category/sofa/l-shape
//   - hand-picked products     → /picks/<id>,<id>,… (a page with just those products)
// Plain functions (no "use client"), so the server route can read the picks path too.

import { categoryLabel } from '@/lib/taxonomy';
import { categorySubPath } from './categoryPath';

/** At most this many products in one picks link (keeps the link short enough to share). */
export const MAX_PICKS = 30;

const PICKS_PREFIX = '/picks/';
const PRODUCT_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export type ShareScope =
  | { kind: 'all' }
  | { kind: 'category'; category: string }
  | { kind: 'subcategory'; category: string; subCategory: string }
  | { kind: 'products'; ids: string[] };

/** The picks page for these product ids. */
export const picksSubPath = (ids: readonly string[]) => `${PICKS_PREFIX}${ids.slice(0, MAX_PICKS).join(',')}`;

/** The product ids in a picks segment ("a,b,c", possibly %-encoded), without bad or repeated ones. */
export const parsePicksIds = (segment: string): string[] => {
  let text = segment;
  try {
    text = decodeURIComponent(segment);
  } catch {
    // malformed escape: use it as it is
  }
  const ids = text.split(',').filter((id) => PRODUCT_ID_RE.test(id));
  return [...new Set(ids)].slice(0, MAX_PICKS);
};

/** The product ids in a relative path like '/picks/a,b', or null for any other page. */
export const parsePicksPath = (relative: string): string[] | null => {
  if (!relative.startsWith(PICKS_PREFIX)) return null;
  const segment = relative.slice(PICKS_PREFIX.length);
  if (!segment || segment.includes('/')) return null;
  return parsePicksIds(segment);
};

/** The page a scope opens, relative to the catalog's base path ('' is the start page). */
export const scopeSubPath = (scope: ShareScope) => {
  switch (scope.kind) {
    case 'all':
      return '';
    case 'category':
      return categorySubPath(scope.category);
    case 'subcategory':
      return categorySubPath(scope.category, scope.subCategory);
    case 'products':
      return picksSubPath(scope.ids);
  }
};

const items = (n: number) => `${n} ${n === 1 ? 'product' : 'products'}`;

/** What a scope is called in a share sheet: "All Sofas", "L-Shape · Sofas", "3 products". */
export const scopeTitle = (scope: ShareScope) => {
  switch (scope.kind) {
    case 'all':
      return 'Whole catalog';
    case 'category':
      return `All ${categoryLabel(scope.category)}`;
    case 'subcategory':
      return `${scope.subCategory} · ${categoryLabel(scope.category)}`;
    case 'products':
      return items(scope.ids.length);
  }
};

/** The message sent with the link (WhatsApp, the phone's share menu). */
export const shareMessage = (storeName: string, scope: ShareScope, count: number, url: string) => {
  switch (scope.kind) {
    case 'all':
      return `Browse ${storeName}'s catalog (${items(count)}):\n${url}`;
    case 'category':
      return `${categoryLabel(scope.category)} at ${storeName} (${items(count)}):\n${url}`;
    case 'subcategory':
      return `${scope.subCategory} · ${categoryLabel(scope.category)} at ${storeName} (${items(count)}):\n${url}`;
    case 'products':
      return count === 1
        ? `A product from ${storeName} for you:\n${url}`
        : `${items(count)} from ${storeName}, picked for you:\n${url}`;
  }
};

/** A WhatsApp link that lets the sender pick who to send the message to. */
export const whatsAppShareUrl = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

/** True where the browser has a share menu (most phones). */
export const canShareNatively = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

/**
 * Opens the phone's share menu with the message (the link is at its end; passing it
 * separately too makes some apps show it twice). False if closed or not available.
 */
export async function shareNatively(title: string, text: string): Promise<boolean> {
  if (!canShareNatively()) return false;
  try {
    await navigator.share({ title, text });
    return true;
  } catch {
    return false; // closed, or blocked
  }
}

/** Copies text; false if the browser blocks it. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / non-secure pages: a hidden textarea.
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
