"use client";

import Link from 'next/link';
import { Check, Heart, ShoppingCart } from 'lucide-react';
import { discountPercent } from '@/lib/adminProducts';
import { WHATSAPP_MESSAGES, formatINR, formatPrice } from './data';
import { ProductVisual, WhatsAppIcon, productSubPath, useCatalog } from './shared';

// Flat, bordered panels with barely-rounded corners (matches the cart).
// On desktop they also get the soft shadow of the catalog's section panels.
const panel = 'rounded-md border border-neutral-200 bg-white md:rounded-lg md:shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.04)]';

// The Saved tab (/app/catalog/furniture/saved): the shopper's wishlist. Each item can go to
// the cart, and the whole list can be shared on WhatsApp (to family, or to the store).
export default function SavedPage({ onBrowse }: { onBrowse: () => void }) {
  const {
    store,
    whatsAppUrl,
    products,
    href,
    embedded,
    saved,
    toggleSaved,
    clearSaved,
    isInCart,
    addToCart,
    navigate,
    markInAppNavigation,
    onWhatsAppLinkClick,
  } = useCatalog();

  // Products can be unpublished while they sit in the list; those are skipped.
  const items = saved.flatMap((id) => products.find((p) => p.id === id) ?? []);
  const itemsLabel = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;

  if (items.length === 0) {
    return (
      <div className={`${panel} my-6 space-y-3 px-6 py-10 text-center md:mx-auto md:my-12 md:max-w-md`}>
        <Heart className="mx-auto h-8 w-8 text-neutral-300" strokeWidth={1.5} />
        <h2 className="text-sm font-semibold text-[#111111]">No saved items yet</h2>
        <p className="mx-auto max-w-xs text-xs leading-relaxed text-neutral-500">
          Open any product and tap the heart to save it here. Then share your list on WhatsApp.
        </p>
        <button
          onClick={onBrowse}
          className="mt-1 h-10 rounded-[4px] bg-[#111111] px-5 text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#2b2b2b]"
        >
          Browse catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-1 md:space-y-5 md:pt-2">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[15px] font-semibold text-[#111111] md:text-2xl md:font-bold">
          Saved <span className="text-xs font-normal text-neutral-500 md:text-sm">· {itemsLabel}</span>
        </h2>
        <button
          onClick={clearSaved}
          className="text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-500 transition-colors hover:text-red-600"
        >
          Clear all
        </button>
      </div>

      {/* Items — one panel with hairlines on phones; separate cards in two or three columns on desktop */}
      <ul className={`${panel} divide-y divide-neutral-100 md:grid md:grid-cols-2 md:gap-3 md:divide-y-0 md:border-0 md:bg-transparent md:shadow-none xl:grid-cols-3`}>
        {items.map((product) => {
          const off = discountPercent(product.price, product.originalPrice);
          const inCart = isInCart(product.id);
          return (
            <li key={product.id} className="flex items-center gap-3 p-3 md:gap-4 md:rounded-lg md:border md:border-neutral-200 md:bg-white md:p-4 md:shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.04)]">
              <Link
                href={href(productSubPath(product.id))}
                scroll={false}
                replace={embedded}
                onClick={markInAppNavigation}
                className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[4px] bg-neutral-100 md:h-24 md:w-24"
                aria-label={product.productName}
              >
                <ProductVisual product={product} sizes="96px" />
              </Link>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-500">
                  {product.subcategoryName || product.categoryName}
                </p>
                <h3 className="mt-0.5 line-clamp-2 text-[13px] font-medium leading-snug text-[#111111]">
                  {product.productName}
                </h3>
                <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
                  <span className="text-sm font-semibold text-[#111111]">{formatPrice(product.price)}</span>
                  {off > 0 && (
                    <>
                      <span className="text-[11px] text-neutral-400 line-through">{formatINR(product.originalPrice)}</span>
                      <span className="text-[11px] font-semibold text-emerald-700">{off}% off</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <button
                  onClick={() => toggleSaved(product.id)}
                  aria-label={`Remove ${product.productName} from saved`}
                  title="Remove from saved"
                  className="flex h-8 w-8 items-center justify-center rounded-[4px] text-red-500 transition-colors hover:bg-red-50"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
                <button
                  onClick={() => (inCart ? navigate(href('/cart')) : addToCart(product.id))}
                  aria-label={inCart ? 'Go to cart' : `Add ${product.productName} to cart`}
                  title={inCart ? 'Go to cart' : 'Add to cart'}
                  className={`flex h-8 w-8 items-center justify-center rounded-[4px] transition-colors ${
                    inCart
                      ? 'border border-[#111111] text-[#111111] hover:bg-neutral-50'
                      : 'bg-[#111111] text-white hover:bg-[#2b2b2b]'
                  }`}
                >
                  {inCart ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <ShoppingCart className="h-4 w-4" />}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Share button — stays visible above the bottom navigation (phones) */}
      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 md:static md:flex md:justify-end">
        <a
          href={whatsAppUrl(WHATSAPP_MESSAGES.savedList(store.name, items))}
          onClick={onWhatsAppLinkClick}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-[4px] bg-[#25D366] px-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#1fb855] md:px-6 md:shadow-none"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Share my list on WhatsApp
        </a>
      </div>
    </div>
  );
}
