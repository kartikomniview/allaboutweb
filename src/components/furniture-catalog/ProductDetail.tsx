"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Heart, Layers, Ruler, Share2, Star, Trees, Truck } from 'lucide-react';
import type { CatalogProduct } from '@/lib/adminProducts';
import { TRUST_POINTS, WHATSAPP_MESSAGES, formatINR } from './data';
import {
  CATALOG_PATH,
  ProductVisual,
  WhatsAppIcon,
  getWhatsAppUrl,
  useCatalog,
} from './shared';

const MAX_HIGHLIGHTS = 3;

// Full-screen product page. It renders on top of the catalog (which stays mounted
// underneath), so "back" returns to the same tab and scroll position.
export default function ProductDetail({ product }: { product: CatalogProduct }) {
  const router = useRouter();
  const { wishlist, toggleWishlist, hasInAppHistory } = useCatalog();
  const isWishlisted = wishlist.includes(product.id);

  const images = [...new Set([product.mainImageUrl, ...product.images].filter(Boolean))];
  const [activeImage, setActiveImage] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  // Short, scannable details — no paragraphs on a catalog page
  const details = [
    { icon: Trees, label: 'Wood', value: product.woodType },
    { icon: Ruler, label: 'Size', value: product.dimensions },
    { icon: Layers, label: 'Material', value: product.material },
    { icon: Truck, label: 'Delivery', value: product.stockStatus },
  ].filter((detail) => detail.value);
  const highlights = product.highlights.slice(0, MAX_HIGHLIGHTS);

  // Opened from a card → go back in history; opened from a shared link → go to the catalog.
  const goBack = () => {
    if (hasInAppHistory()) router.back();
    else router.push(CATALOG_PATH, { scroll: false });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') goBack();
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

  const iconButton =
    'flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm text-neutral-800 shadow-sm active:scale-90 transition-transform';

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/40">
      <section
        aria-label={product.productName}
        className="fc-page-enter relative flex h-full w-full flex-col bg-[#FAF9F6] sm:max-w-[430px] sm:shadow-2xl"
      >
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Photo gallery — swipe when there is more than one image */}
          <div className="relative aspect-square bg-gradient-to-b from-[#FDFBF7] to-[#F5ECE0]">
            {images.length > 1 ? (
              <div
                ref={galleryRef}
                onScroll={handleGalleryScroll}
                className="flex h-full overflow-x-auto snap-x snap-mandatory overscroll-x-contain no-scrollbar"
              >
                {images.map((src, idx) => (
                  <div key={src} className="relative h-full w-full shrink-0 snap-center">
                    <Image
                      src={src}
                      alt={idx === 0 ? product.productName : ''}
                      fill
                      sizes="(min-width: 640px) 430px, 100vw"
                      preload={idx === 0}
                      draggable={false}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <ProductVisual product={product} sizes="(min-width: 640px) 430px, 100vw" />
            )}

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
              <button onClick={goBack} className={iconButton} aria-label="Back">
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
              <div className="flex items-center gap-2">
                <button onClick={share} className={iconButton} aria-label="Share product">
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => toggleWishlist(product.id, e)}
                  className={iconButton}
                  aria-label={isWishlisted ? 'Remove from saved' : 'Save item'}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {images.map((src, idx) => (
                  <span
                    key={src}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeImage ? 'w-5 bg-white' : 'w-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 px-4 pt-4 pb-6">
            {/* Type, rating, name & price */}
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                <span className="font-semibold text-[#8B5A2B]">{product.subcategoryName || product.categoryName}</span>
                {product.rating > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-neutral-700">{product.rating}</span>
                    {product.reviewCount > 0 && <span>({product.reviewCount})</span>}
                  </>
                )}
              </p>
              <h1 className="mt-1 text-lg font-bold leading-snug text-[#111111]">{product.productName}</h1>
              <p className="mt-1 flex items-baseline gap-2 tabular-nums">
                <span className="text-2xl font-extrabold text-[#111111]">{formatINR(product.price)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-sm text-neutral-400 line-through">{formatINR(product.originalPrice)}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      {discount}% off
                    </span>
                  </>
                )}
              </p>
              {product.colors.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  {product.colors.map((color) => (
                    <span
                      key={color.name}
                      title={color.name}
                      className="h-5 w-5 rounded-full ring-1 ring-black/10 ring-offset-2 ring-offset-[#FAF9F6]"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Key details — one short row each */}
            {details.length > 0 && (
              <dl className="divide-y divide-neutral-100 rounded-2xl bg-white px-3.5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 py-2.5 text-xs">
                    <Icon className="h-4 w-4 shrink-0 text-[#8B5A2B]" />
                    <dt className="w-16 shrink-0 text-neutral-500">{label}</dt>
                    <dd className="min-w-0 flex-1 truncate font-medium text-neutral-800">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* A few highlights, one line each */}
            {highlights.length > 0 && (
              <ul className="space-y-1.5">
                {highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2 text-xs text-neutral-700">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                      <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
                    </span>
                    <span className="truncate">{highlight}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Store promises */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {TRUST_POINTS.map(({ icon: Icon, title }) => (
                <div key={title} className="rounded-xl bg-[#FAF5EE] px-1.5 py-2.5">
                  <Icon className="mx-auto h-4 w-4 text-[#8B5A2B]" />
                  <p className="mt-1 text-[10px] font-semibold leading-tight text-neutral-800">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky enquiry button */}
        <div className="border-t border-neutral-100 bg-white px-4 py-3 pb-safe">
          <a
            href={getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.productFestivePrice(product))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#20bd5a] active:scale-[0.98] transition-all"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Enquire on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
