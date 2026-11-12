"use client";

import { LayoutGrid } from 'lucide-react';
import { PRODUCT_GRID, ProductCard, SECTION_PANEL, useCatalog } from './shared';

// Hand-picked products from a shared link (/picks/<id>,<id>,…), on the Catalog tab.
// Products unpublished since the link was sent are left out.
export default function PicksPage({ ids, onBrowse }: { ids: string[]; onBrowse: () => void }) {
  const { products, store } = useCatalog();
  const picked = ids.flatMap((id) => products.find((p) => p.id === id) ?? []);
  const missing = ids.length - picked.length;

  if (picked.length === 0) {
    return (
      <div className="my-6 space-y-3 rounded-lg border border-neutral-200 bg-white px-6 py-10 text-center md:mx-auto md:my-12 md:max-w-md">
        <p className="text-sm font-semibold text-neutral-900">These products are no longer available</p>
        <p className="mx-auto max-w-xs text-xs leading-relaxed text-neutral-500">
          Have a look at the rest of {store.name}&apos;s catalog.
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
    <div className="flex flex-col gap-3 pt-1 md:gap-5">
      <section aria-label="Picked products" className={`space-y-2 md:space-y-0 ${SECTION_PANEL}`}>
        <div className="flex items-center justify-between gap-3 px-1 md:border-b md:border-neutral-100 md:px-5 md:py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Picked for you</p>
            <h2 className="text-sm font-bold text-[#111111] md:text-base">
              {picked.length} product{picked.length === 1 ? '' : 's'}
            </h2>
          </div>
          <button
            onClick={onBrowse}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-white px-3 text-xs font-semibold text-neutral-800 ring-1 ring-inset ring-neutral-200 transition-colors hover:ring-neutral-400 md:h-10 md:text-[13px]"
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
            Full catalog
          </button>
        </div>

        <div className={`${PRODUCT_GRID} md:p-5`}>
          {picked.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {missing > 0 && (
          <p className="px-1 pb-1 text-[11px] text-neutral-500 md:px-5 md:pb-4">
            {missing === 1 ? '1 product from this link is' : `${missing} products from this link are`} no longer available.
          </p>
        )}
      </section>
    </div>
  );
}
