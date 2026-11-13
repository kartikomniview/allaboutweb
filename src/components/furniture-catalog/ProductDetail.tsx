"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Share2,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Trees,
  Truck,
  X,
} from 'lucide-react';
import { specsOf, type CatalogProduct } from '@/lib/adminProducts';
import { PRICE_ON_REQUEST, TRUST_POINTS, WHATSAPP_MESSAGES, formatINR, hasPrice } from './data';
import ImageViewer, { rememberImageSize } from './ImageViewer';
import {
  ProductVisual,
  SaveButton,
  WhatsAppIcon,
  useCatalog,
} from './shared';

const MAX_HIGHLIGHTS = 3;

// Full-screen product page. It renders on top of the catalog (which stays mounted
// underneath), so "back" returns to the same tab and scroll position.
export default function ProductDetail({ product }: { product: CatalogProduct }) {
  const { store, whatsAppUrl, href, navigate, isInCart, addToCart, closeProduct: goBack, onWhatsAppLinkClick } =
    useCatalog();
  const inCart = isInCart(product.id);

  const images = [...new Set([product.mainImageUrl, ...product.images].filter(Boolean))];
  const [activeImage, setActiveImage] = useState(0);
  // Index of the photo open in the full-screen viewer, or null when it's closed.
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const discount =
    hasPrice(product) && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  // Short, scannable details — no paragraphs on a catalog page. Specs come in
  // between: Wood, Bulb, Width... whatever fits the product.
  const details = [
    { icon: Ruler, label: 'Size', value: product.dimensions },
    ...specsOf(product).map((spec) => ({
      icon: spec.label.toLowerCase() === 'wood' ? Trees : SlidersHorizontal,
      label: spec.label,
      value: spec.value,
    })),
    { icon: Truck, label: 'Delivery', value: product.stockStatus },
  ].filter((detail) => detail.value);
  const highlights = product.highlights.slice(0, MAX_HIGHLIGHTS);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // While the photo viewer is open, Escape closes the viewer (it listens itself).
      if (e.key === 'Escape' && viewerIndex === null) goBack();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.productName, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      // Share sheet dismissed or clipboard blocked; nothing to do.
    }
  };

  const handleGalleryScroll = () => {
    const track = galleryRef.current;
    if (track?.clientWidth) setActiveImage(Math.round(track.scrollLeft / track.clientWidth));
  };

  // Keep the gallery on the viewer's photo, so closing shrinks back onto the right one.
  const syncGallery = (idx: number) => {
    const track = galleryRef.current;
    track?.scrollTo({ left: idx * track.clientWidth, behavior: 'instant' });
    setActiveImage(idx);
  };

  // Desktop arrows (phones swipe). Wraps around at either end.
  const stepImage = (delta: number) => {
    const track = galleryRef.current;
    if (!track) return;
    const next = (activeImage + delta + images.length) % images.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
  };

  const iconButton =
    'flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm text-neutral-800 shadow-sm active:scale-90 transition-transform hover:bg-white';
  const arrowButton =
    'absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md transition hover:bg-white active:scale-95 md:flex';

  return (
    // Phones: a full-screen page. Desktop: a two-column dialog over the catalog;
    // clicking outside it closes it.
    <div
      className="fixed inset-0 z-50 flex justify-center bg-black/40 md:items-center md:p-6"
      onClick={(e) => e.target === e.currentTarget && goBack()}
    >
      <section
        aria-label={product.productName}
        className="fc-page-enter relative flex h-full w-full flex-col bg-white md:grid md:h-[min(88vh,780px)] md:max-w-5xl md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)_auto] md:overflow-hidden md:rounded-lg md:shadow-2xl"
      >
        {/* One scrolling column on phones; on desktop `contents` lets the photos fill
            the left column while the details scroll on the right. */}
        <div className="flex-1 overflow-y-auto overscroll-contain md:contents">
          {/* Photo gallery — swipe when there is more than one image; tap to open full screen.
              Capped at ~55% of the screen height so the name and price show without scrolling.
              Photos are contained (never cropped) on the light grey background. */}
          <div ref={heroRef} className="relative aspect-square max-h-[55svh] w-full bg-neutral-100 md:row-span-2 md:aspect-auto md:h-full md:max-h-none">
            {images.length > 0 ? (
              <div
                ref={galleryRef}
                onScroll={handleGalleryScroll}
                className="flex h-full overflow-x-auto snap-x snap-mandatory overscroll-x-contain no-scrollbar"
              >
                {images.map((src, idx) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setViewerIndex(idx)}
                    aria-label={`View photo ${idx + 1} of ${images.length} full screen`}
                    className="relative h-full w-full shrink-0 snap-center cursor-zoom-in"
                  >
                    <Image
                      src={src}
                      alt={idx === 0 ? product.productName : ''}
                      fill
                      sizes="(min-width: 768px) 560px, 100vw"
                      preload={idx === 0}
                      draggable={false}
                      onLoad={(e) => rememberImageSize(src, e.currentTarget)}
                      className="object-contain"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <ProductVisual product={product} sizes="(min-width: 768px) 560px, 100vw" />
            )}

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5 md:p-4">
              <button onClick={goBack} className={iconButton} aria-label="Back">
                <ArrowLeft className="h-4 w-4 md:hidden" />
                <X className="hidden h-[18px] w-[18px] md:block" />
              </button>
              <div className="flex items-center gap-2">
                <SaveButton
                  product={product}
                  className="h-8 w-8 md:h-10 md:w-10 text-neutral-800"
                  iconClassName="h-3.5 w-3.5 md:h-4 md:w-4"
                />
                <button onClick={share} className={iconButton} aria-label="Share product">
                  <Share2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </button>
              </div>
            </div>

            {images.length > 1 && (
              <>
                <button type="button" onClick={() => stepImage(-1)} className={`${arrowButton} left-4`} aria-label="Previous photo">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => stepImage(1)} className={`${arrowButton} right-4`} aria-label="Next photo">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-2.5 flex justify-center gap-1">
                {images.map((src, idx) => (
                  <span
                    key={src}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === activeImage ? 'w-4 bg-white' : 'w-1 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3.5 px-4 pt-3.5 pb-5 md:space-y-5 md:overflow-y-auto md:overscroll-contain md:px-8 md:pt-8 md:pb-6">
            {/* Type, rating, name & price */}
            <div>
              <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-neutral-500 md:text-[11px]">
                <span className="truncate font-semibold uppercase tracking-[0.06em] text-primary">
                  {product.subcategoryName || product.categoryName}
                </span>
                {product.rating > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <Star className="h-2.5 w-2.5 shrink-0 fill-amber-400 text-amber-400 md:h-3 md:w-3" />
                    <span className="font-semibold text-neutral-700">{product.rating}</span>
                    {product.reviewCount > 0 && <span>({product.reviewCount})</span>}
                  </>
                )}
              </p>
              <h1 className="mt-1 text-[15px] font-semibold leading-snug break-words text-[#111111] md:mt-2 md:text-2xl md:font-bold md:leading-tight">
                {product.productName}
              </h1>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums md:mt-3">
                {hasPrice(product) ? (
                  <span className="text-lg font-bold text-[#111111] md:text-[28px]">{formatINR(product.price)}</span>
                ) : (
                  <span className="text-sm font-semibold text-[#111111] md:text-lg">{PRICE_ON_REQUEST}</span>
                )}
                {discount > 0 && (
                  <>
                    <span className="text-xs text-neutral-400 line-through md:text-sm">{formatINR(product.originalPrice)}</span>
                    <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 md:px-2 md:text-xs">
                      {discount}% off
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Desktop has room for the description (phones keep to the short rows below) */}
            {product.description && (
              <p className="hidden whitespace-pre-line text-sm leading-relaxed text-neutral-600 md:block">
                {product.description}
              </p>
            )}

            {/* Key details — one short row each. Long values (sizes, fabric blends) wrap
                instead of being cut off on narrow phones. */}
            {details.length > 0 && (
              <dl className="divide-y divide-neutral-100 rounded-md border border-neutral-200 bg-white px-3 md:px-4">
                {details.map(({ icon: Icon, label, value }, i) => (
                  <div key={`${label}-${i}`} className="flex items-start gap-2.5 py-2 text-[11px] leading-snug md:gap-3 md:py-2.5 md:text-[13px]">
                    <Icon className="mt-px h-3.5 w-3.5 shrink-0 text-neutral-500 md:h-4 md:w-4" />
                    <dt className="w-[72px] shrink-0 truncate text-neutral-500 md:w-24">{label}</dt>
                    <dd className="min-w-0 flex-1 break-words font-medium text-neutral-800">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* A few highlights, up to two lines each */}
            {highlights.length > 0 && (
              <ul className="space-y-1.5">
                {highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-[11px] leading-snug text-neutral-700 md:text-[13px]">
                    <span className="mt-px flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                      <Check className="h-2 w-2 text-emerald-600" strokeWidth={3} />
                    </span>
                    <span className="line-clamp-2 min-w-0">{highlight}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Store promises (the demo's sample furniture promises) */}
            {store.isDemo && (
              <div className="grid grid-cols-3 gap-2 text-center">
                {TRUST_POINTS.map(({ icon: Icon, title }) => (
                  <div key={title} className="rounded-md bg-neutral-100 px-1.5 py-2.5">
                    <Icon className="mx-auto h-4 w-4 text-neutral-600" />
                    <p className="mt-1 text-[10px] font-semibold leading-tight text-neutral-800">{title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky footer: name & price on the left, cart + WhatsApp on the right.
            Flat buttons of one height with barely-rounded (4px) corners. On desktop it
            sits under the details, and the two buttons share the width. */}
        <div className="flex items-center gap-2 border-t border-neutral-200 bg-white px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:gap-3 md:px-8 md:py-4">
          <div className="min-w-0 flex-1 pr-1 md:hidden">
            <p className="truncate text-[10px] text-neutral-500">{product.productName}</p>
            <p className="flex min-w-0 items-baseline gap-1.5 tabular-nums">
              {hasPrice(product) ? (
                <span className="shrink-0 text-[15px] font-bold leading-tight text-[#111111]">{formatINR(product.price)}</span>
              ) : (
                <span className="text-xs font-semibold leading-tight text-[#111111]">{PRICE_ON_REQUEST}</span>
              )}
              {discount > 0 && (
                <>
                  <span className="truncate text-[10px] text-neutral-400 line-through">{formatINR(product.originalPrice)}</span>
                  <span className="shrink-0 text-[10px] font-semibold text-emerald-700">{discount}% off</span>
                </>
              )}
            </p>
          </div>
          {/* Kept 44px tall: the main tap targets on the page. */}
          <button
            onClick={() => (inCart ? navigate(href('/cart')) : addToCart(product.id))}
            className={`flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-[4px] px-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors md:h-12 md:flex-1 md:gap-2 md:text-[12px] ${
              inCart
                ? 'border border-[#111111] bg-white text-[#111111] hover:bg-neutral-50'
                : 'bg-[#111111] text-white hover:bg-[#2b2b2b]'
            }`}
          >
            {inCart ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <ShoppingCart className="h-3.5 w-3.5" />}
            {inCart ? 'Go to cart' : 'Add to cart'}
          </button>
          <a
            href={whatsAppUrl(WHATSAPP_MESSAGES.product(store.name, product))}
            onClick={onWhatsAppLinkClick}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Enquire on WhatsApp"
            title="Enquire on WhatsApp"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] bg-[#25D366] text-white transition-colors hover:bg-[#1fb855] md:h-12 md:w-auto md:flex-1 md:gap-2 md:px-4"
          >
            <WhatsAppIcon className="h-5 w-5 md:h-4 md:w-4" />
            <span className="hidden text-[12px] font-semibold uppercase tracking-[0.06em] md:inline">Enquire</span>
          </a>
        </div>
      </section>

      {viewerIndex !== null && (
        <ImageViewer
          images={images}
          alt={product.productName}
          startIndex={viewerIndex}
          getOriginRect={() => heroRef.current?.getBoundingClientRect() ?? null}
          onIndexChange={syncGallery}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </div>
  );
}
