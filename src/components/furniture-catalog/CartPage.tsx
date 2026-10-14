"use client";

import Link from 'next/link';
import { ArrowRight, ShoppingCart, Trash2 } from 'lucide-react';
import { discountPercent } from '@/lib/adminProducts';
import { WHATSAPP_MESSAGES, formatINR } from './data';
import { ProductVisual, WhatsAppIcon, getWhatsAppUrl, productSubPath, useCatalog } from './shared';

// Flat, bordered panels with barely-rounded corners (matches the product page footer).
const panel = 'rounded-md border border-neutral-200 bg-white';

// The Cart tab (/app/catalog/furniture/cart): the products the shopper added, a price
// breakdown and one WhatsApp button that sends the whole order.
export default function CartPage({ onBrowse }: { onBrowse: () => void }) {
  const { products, href, cart, removeFromCart, clearCart, markInAppNavigation, onWhatsAppLinkClick } = useCatalog();

  // Products can be unpublished while they sit in a cart; those are skipped.
  const items = cart.flatMap((id) => products.find((p) => p.id === id) ?? []);
  const itemCount = items.length;
  const itemsLabel = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
  const mrpTotal = items.reduce((sum, p) => sum + Math.max(p.originalPrice, p.price), 0);
  const total = items.reduce((sum, p) => sum + p.price, 0);
  const savings = mrpTotal - total;

  if (items.length === 0) {
    return (
      <div className={`${panel} my-6 space-y-3 px-6 py-10 text-center`}>
        <ShoppingCart className="mx-auto h-8 w-8 text-neutral-300" strokeWidth={1.5} />
        <h2 className="text-sm font-semibold text-[#111111]">Your cart is empty</h2>
        <p className="mx-auto max-w-xs text-xs leading-relaxed text-neutral-500">
          Open any product and tap Add to cart. Then order everything in one WhatsApp message.
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
    <div className="space-y-3 pt-1">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold text-[#111111]">
          Cart <span className="text-xs font-normal text-neutral-500">· {itemsLabel}</span>
        </h2>
        <button
          onClick={clearCart}
          className="text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-500 transition-colors hover:text-red-600"
        >
          Clear all
        </button>
      </div>

      {/* Items — one panel, rows split by hairlines */}
      <ul className={`${panel} divide-y divide-neutral-100`}>
        {items.map((product) => {
          const off = discountPercent(product.price, product.originalPrice);
          return (
            <li key={product.id} className="flex items-center gap-3 p-3">
              <Link
                href={href(productSubPath(product.id))}
                scroll={false}
                onClick={markInAppNavigation}
                className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[4px] bg-[#F5F1EA]"
                aria-label={product.productName}
              >
                <ProductVisual product={product} sizes="72px" />
              </Link>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-500">
                  {product.subcategoryName || product.categoryName}
                </p>
                <h3 className="mt-0.5 line-clamp-2 text-[13px] font-medium leading-snug text-[#111111]">
                  {product.productName}
                </h3>
                <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
                  <span className="text-sm font-semibold text-[#111111]">{formatINR(product.price)}</span>
                  {off > 0 && (
                    <>
                      <span className="text-[11px] text-neutral-400 line-through">{formatINR(product.originalPrice)}</span>
                      <span className="text-[11px] font-semibold text-emerald-700">{off}% off</span>
                    </>
                  )}
                </p>
              </div>

              <button
                onClick={() => removeFromCart(product.id)}
                aria-label={`Remove ${product.productName}`}
                title="Remove"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>

      {/* Price breakdown */}
      <section aria-label="Price details" className={`${panel} p-3.5`}>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Price details</h3>
        <dl className="mt-3 space-y-2 text-[13px] tabular-nums">
          <div className="flex justify-between text-neutral-600">
            <dt>Price ({itemsLabel})</dt>
            <dd>{formatINR(mrpTotal)}</dd>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-neutral-600">
              <dt>Discount</dt>
              <dd className="text-emerald-700">− {formatINR(savings)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-200 pt-2.5 text-[15px] font-semibold text-[#111111]">
            <dt>Total amount</dt>
            <dd>{formatINR(total)}</dd>
          </div>
        </dl>
        {savings > 0 && (
          <p className="mt-3 rounded-[4px] bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            You save {formatINR(savings)} on this order
          </p>
        )}
      </section>

      {/* Order button — stays visible above the bottom navigation */}
      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10">
        <a
          href={getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.cartOrder(items, total))}
          onClick={onWhatsAppLinkClick}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-between gap-3 rounded-[4px] bg-[#25D366] px-4 text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#1fb855]"
        >
          <span className="leading-tight tabular-nums">
            <span className="block text-[15px] font-bold">{formatINR(total)}</span>
            <span className="block text-[10px] text-white/85">{itemsLabel}</span>
          </span>
          <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em]">
            <WhatsAppIcon className="h-4 w-4" />
            Order on WhatsApp
            <ArrowRight className="h-4 w-4" />
          </span>
        </a>
      </div>
    </div>
  );
}
