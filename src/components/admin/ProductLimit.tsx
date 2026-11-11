"use client";

import Link from "next/link";
import { Gauge } from "lucide-react";
import { whatsappUrl } from "@/lib/contact";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { buttonClass } from "./ui";

// The store's product limit (stores/{slug}.productLimit; null = unlimited).

export type LimitState = {
  limit: number | null;
  count: number;
  remaining: number;
  /** At or over the limit: no more products can be added. */
  full: boolean;
  /** Two or fewer left. */
  near: boolean;
};

export function limitState(count: number, limit: number | null): LimitState {
  const remaining = limit === null ? Infinity : Math.max(limit - count, 0);
  return { limit, count, remaining, full: limit !== null && count >= limit, near: limit !== null && remaining <= 2 };
}

/** "12 of 20 products" (or "12 products" when unlimited). */
export const usageLabel = ({ count, limit }: LimitState) =>
  limit === null ? `${count} product${count === 1 ? "" : "s"}` : `${count} of ${limit} products`;

const moreProductsHref = (storeName: string, limit: number | null) =>
  whatsappUrl(`Hi Catalog24, I'd like to add more products to ${storeName}${limit !== null ? ` (limit ${limit})` : ""}.`);

/** Notice for a store that is at, or close to, its product limit. */
export function ProductLimitNotice({
  state,
  storeName,
  compact = false,
}: {
  state: LimitState;
  storeName: string;
  /** Hide the "Manage products" button (e.g. on the products page itself). */
  compact?: boolean;
}) {
  if (!state.near && !state.full) return null;
  return (
    <div
      role="status"
      className={`admin-fade-in flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center ${
        state.full ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white ${state.full ? "text-red-600" : "text-amber-600"}`}
        >
          <Gauge className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">
            {state.full
              ? `You've reached your limit of ${state.limit} products`
              : `${state.remaining} product${state.remaining === 1 ? "" : "s"} left of ${state.limit}`}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate">
            {state.full
              ? "Delete a product to add a new one, or contact us to increase your limit."
              : "Contact us if you need room for more products."}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {!compact && state.full && (
          <Link href="/admin/ecatalog" className={buttonClass("secondary", "md", "h-10")}>
            Manage products
          </Link>
        )}
        <a
          href={moreProductsHref(storeName, state.limit)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("secondary", "md", "h-10 text-whatsapp")}
        >
          <WhatsAppIcon className="h-4 w-4" />
          Contact us
        </a>
      </div>
    </div>
  );
}

/** Full-screen notice on the Add product page when the store is full. */
export function ProductLimitScreen({ state, storeName }: { state: LimitState; storeName: string }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-5 bg-white px-6 py-10 text-center sm:bg-paper">
      <span className="admin-pop-check grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-600">
        <Gauge className="h-7 w-7" aria-hidden />
      </span>
      <div className="admin-fade-in max-w-sm">
        <p className="text-lg font-bold text-ink">You&apos;ve reached your {state.limit}-product limit</p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate">
          Delete a product you no longer sell to add a new one, or contact us to increase your limit.
        </p>
      </div>
      <div className="admin-fade-in flex w-full max-w-xs flex-col gap-2.5">
        <Link href="/admin/ecatalog" className={buttonClass("primary", "md", "h-12 w-full text-[15px]")}>
          Back to products
        </Link>
        <a
          href={moreProductsHref(storeName, state.limit)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("secondary", "md", "h-12 w-full text-[15px] text-whatsapp")}
        >
          <WhatsAppIcon className="h-4 w-4" />
          Contact us on WhatsApp
        </a>
      </div>
    </div>
  );
}
