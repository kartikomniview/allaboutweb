"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { whatsappUrl } from '@/lib/contact';
import { ECATALOG_PROMO_PATH } from './EcatalogPromo';
import './furniture-catalog.css';
import {
  ArrowRight,
  Heart,
  Search,
  X,
  Check,
  MessageCircle,
  Sparkles,
  Home,
  LayoutGrid,
  MapPin,
  Clock,
  Trash2,
  Gift,
  Flame
} from 'lucide-react';
import {
  AAW_PROMO,
  CATEGORY_CARDS,
  CUSTOM_ORDER_CARD,
  DEALS_COUNTDOWN_START,
  DIWALI_BANNERS,
  DIWALI_OFFERS,
  DIWALI_PICK_IDS,
  FESTIVE_GIFT,
  FESTIVE_RIBBON,
  INITIAL_WISHLIST_IDS,
  STORE,
  STORY_HIGHLIGHTS,
  TRUST_POINTS,
  WHATSAPP_MESSAGES,
  type DiwaliBanner,
  type DiwaliOffer,
  type MainCategory,
} from './data';
import type { CatalogProduct } from '@/lib/adminProducts';
import CatalogPage, { DEFAULT_CATALOG_FILTERS, type CatalogFilters } from './CatalogPage';
import DemoWhatsAppDialog from './DemoWhatsAppDialog';
import StoreInfoPage from './StoreInfoPage';
import {
  CATALOG_PATH,
  CatalogContext,
  CategoryBox,
  DiyaIcon,
  ProductCard,
  WhatsAppIcon,
  getWhatsAppUrl,
  type CatalogContextValue,
} from './shared';

type AppTab = 'home' | 'catalog' | 'wishlist' | 'help';

// Each bottom-nav tab has its own route (pages under app/app/catalog/furniture/(app)).
export const TAB_PATHS: Record<AppTab, string> = {
  home: CATALOG_PATH,
  catalog: `${CATALOG_PATH}/catalog`,
  wishlist: `${CATALOG_PATH}/saved`,
  help: `${CATALOG_PATH}/help`,
};

const tabFromPath = (pathname: string): AppTab | null =>
  (Object.keys(TAB_PATHS) as AppTab[]).find(tab => TAB_PATHS[tab] === pathname) ?? null;

// `products` are the published products from the admin panel (loaded by the layout).
// `children` is the current product page, if any; it renders on top of the catalog.
export default function FurnitureCatalogApp({
  products,
  children,
}: {
  products: CatalogProduct[];
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // The open tab comes from the URL. On other routes (a product page, the promo
  // pop-up) there's no tab in the URL, so the last tab stays visible underneath.
  const routeTab = tabFromPath(pathname);
  const [activeTab, setActiveTab] = useState<AppTab>(routeTab ?? 'home');
  if (routeTab && routeTab !== activeTab) setActiveTab(routeTab);

  // Catalog tab filters — kept here so they survive tab switches and can be set from Home
  const [catalogFilters, setCatalogFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);

  // Unified Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Wishlist & toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Set once a product page is opened from a card, so its back button can use history
  const inAppNavigationRef = useRef(false);
  // Only ids that exist, so the saved-items badge never counts missing products.
  const [wishlist, setWishlist] = useState<string[]>(() =>
    INITIAL_WISHLIST_IDS.filter(id => products.some(p => p.id === id))
  );

  // Active banner index for Diwali banner carousel
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Dynamic Diwali countdown timer
  const [timeLeft, setTimeLeft] = useState(DEALS_COUNTDOWN_START);

  // Switching tabs is a navigation; it also leaves search mode.
  const goToTab = (tab: AppTab) => {
    setSearchQuery('');
    router.push(TAB_PATHS[tab]);
  };

  // E-catalog promo pop-up: first after 30s, then 1 min after each close.
  // It opens as an intercepted route, so this component (and its state) stays mounted behind it.
  // Keyed on "is it open" rather than the pathname, so moving between tabs doesn't restart the timer.
  const promoShownRef = useRef(false);
  const isPromoOpen = pathname === ECATALOG_PROMO_PATH;

  useEffect(() => {
    if (isPromoOpen) return;
    const promoTimer = setTimeout(() => {
      promoShownRef.current = true;
      router.push(ECATALOG_PROMO_PATH, { scroll: false });
    }, promoShownRef.current ? 60_000 : 30_000);
    return () => clearTimeout(promoTimer);
  }, [isPromoOpen, router]);

  // Banner carousel is a native scroll-snap track: swipe/trackpad scroll it directly,
  // dots and autoplay scroll it programmatically, and the scroll position drives the dots.
  const bannerTrackRef = useRef<HTMLDivElement>(null);
  const bannerInteractedAtRef = useRef(0);

  const markBannerInteraction = () => {
    bannerInteractedAtRef.current = Date.now();
  };

  const scrollToBanner = (idx: number) => {
    const track = bannerTrackRef.current;
    if (track) track.scrollTo({ left: idx * track.clientWidth, behavior: 'smooth' });
  };

  const handleBannerScroll = () => {
    const track = bannerTrackRef.current;
    if (!track || !track.clientWidth) return;
    setActiveBannerIdx(Math.round(track.scrollLeft / track.clientWidth));
  };

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      const track = bannerTrackRef.current;
      // Hold the slide for a full cycle after the shopper touches the carousel
      if (!track || !track.clientWidth || Date.now() - bannerInteractedAtRef.current < 5500) return;
      const next = (Math.round(track.scrollLeft / track.clientWidth) + 1) % DIWALI_BANNERS.length;
      track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
    }, 5500);
    return () => clearInterval(bannerTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return { days: 2, hours: 23, mins: 59, secs: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Demo WhatsApp: the enquiry text waiting for the visitor to enter their own number
  const [demoWhatsAppMessage, setDemoWhatsAppMessage] = useState<string | null>(null);
  const openWhatsApp = (url: string) => {
    setDemoWhatsAppMessage(new URL(url).searchParams.get('text') ?? '');
  };
  const onWhatsAppLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openWhatsApp(e.currentTarget.href);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClaimDiwaliOffer = (banner: DiwaliBanner) => {
    openWhatsApp(getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.banner(banner)));
  };

  const handleClaimOffer = (offer: DiwaliOffer) => {
    openWhatsApp(getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.offer(offer)));
  };

  const handleSelectCategory = (cat: MainCategory, sub?: string) => {
    setCatalogFilters({ category: cat, subCategory: sub || 'All', color: 'All' });
    setSearchQuery('');
    router.push(TAB_PATHS.catalog);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Removed from saved items');
        return prev.filter(i => i !== id);
      } else {
        showToast('Added to your wishlist');
        return [...prev, id];
      }
    });
  };

  // Global search across category, subcategory, name, tags, wood, material or description
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    return products.filter(item =>
      [
        item.categoryName,
        item.subcategoryName,
        item.productName,
        ...item.tags,
        item.woodType,
        item.material,
        item.description,
      ].some(field => field.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  // Wishlisted products list
  const wishlistedProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [products, wishlist]);

  // Curated 4 top festive picks for the Diwali Dhamaka section
  const diwaliPicks = useMemo(() => {
    return DIWALI_PICK_IDS
      .map(id => products.find(p => p.id === id))
      .filter((p): p is CatalogProduct => Boolean(p));
  }, [products]);

  // Home "Browse by Category" tiles — only categories that have products
  const categoryCards = useMemo(() => {
    return CATEGORY_CARDS.filter(card => products.some(p => p.categoryName === card.key));
  }, [products]);

  const catalogContext: CatalogContextValue = {
    products,
    wishlist,
    toggleWishlist,
    markInAppNavigation: () => {
      inAppNavigationRef.current = true;
    },
    hasInAppHistory: () => inAppNavigationRef.current,
    openWhatsApp,
    onWhatsAppLinkClick,
  };

  return (
    <CatalogContext.Provider value={catalogContext}>
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased flex flex-col items-center justify-start sm:py-6 sm:px-4">

      {/* MOBILE APP DEVICE SHELL */}
      <div className="w-full bg-[#FAF9F6] flex flex-col relative transition-all duration-300 sm:max-w-[430px] sm:min-h-[880px] sm:rounded-[48px] sm:shadow-[0_25px_80px_rgba(0,0,0,0.4)] sm:ring-8 sm:ring-neutral-800 sm:border-4 sm:border-neutral-700 sm:overflow-hidden">

        {/* ALLABOUTWEB PROMO STRIP */}
        <div className="bg-[#111111] text-white px-3 py-2 flex items-center gap-2.5 text-[11px] font-semibold select-none shrink-0 z-50">
          <Link
            href="/"
            aria-label="Back to AllAboutWeb home"
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full text-[10px] font-bold shrink-0 transition-colors"
          >
            <Home className="w-3 h-3" />
            <span>Home</span>
          </Link>
          <span className="truncate flex-1">{AAW_PROMO.text}</span>
          <a
            href={whatsappUrl(AAW_PROMO.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 transition-colors"
          >
            <WhatsAppIcon className="w-3 h-3" />
            <span>WhatsApp Us</span>
          </a>
        </div>

        {/* TOP MOBILE APP BAR */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-xs">
          
          {/* Top Diwali Festive Announcement Ribbon */}
          <div className="bg-gradient-to-r from-[#7C2D12] via-[#9A3412] to-[#B45309] text-white px-3 py-1.5 flex items-center justify-between text-[10px] font-medium shadow-2xs select-none">
            <div className="flex items-center gap-1.5 truncate">
              <DiyaIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                <strong className="text-amber-200 font-bold">{FESTIVE_RIBBON.label}</strong> {FESTIVE_RIBBON.text}
              </span>
            </div>
            <button
              onClick={() => openWhatsApp(getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.festiveRibbon()))}
              className="bg-amber-400 hover:bg-amber-300 text-neutral-900 font-bold px-2.5 py-0.5 rounded-full text-[9px] shrink-0 transition-transform active:scale-95 shadow-2xs ml-1.5 flex items-center gap-1"
            >
              <span>Claim</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Brand & Action Row */}
          <div className="px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                onClick={() => goToTab('home')}
                className="cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-7 h-7 rounded-lg bg-[#8B5A2B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {STORE.initial}
                </span>
                <div>
                  <span className="font-bold text-base text-[#111111] tracking-tight leading-none block">
                    {STORE.name}
                  </span>
                  <span className="text-[9px] text-[#8B5A2B] font-semibold tracking-wider uppercase block">
                    {STORE.tagline}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-[#FAF5EE] text-[#8B5A2B]' : 'bg-neutral-100 text-neutral-700'}`}
                aria-label="Toggle Search"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => goToTab('wishlist')}
                className="relative p-2 rounded-full bg-neutral-100 text-neutral-700 hover:text-[#8B5A2B] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Pincode Delivery Pill */}
          <div className="px-4 pb-2 flex items-center justify-between text-[11px] text-neutral-600">
            <div className="flex items-center gap-1 bg-neutral-100/80 px-2.5 py-0.5 rounded-full text-[10px] text-neutral-700">
              <MapPin className="w-3 h-3 text-[#8B5A2B]" />
              <span className="font-semibold text-neutral-900">{STORE.deliveryArea}</span>
              <span className="text-neutral-400">·</span>
            </div>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <DiyaIcon className="w-3 h-3" />
              <span>{FESTIVE_RIBBON.badge}</span>
            </span>
          </div>

          {/* Collapsible Mobile Search Bar */}
          {(isSearchOpen || searchQuery) && (
            <div className="px-4 pb-2.5 animate-in slide-in-from-top-2 duration-150">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus={isSearchOpen}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sofa, teak chair, dining table..."
                  className="w-full bg-neutral-100 focus:bg-white pl-9 pr-8 py-2 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 shadow-inner rounded-xl transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* SCROLLABLE MAIN APP BODY (with pb-24 so content never clips behind bottom navigation tab bar) */}
        <main className="flex-1 overflow-y-auto pb-24 px-3 sm:px-4 pt-2">

          {/* ACTIVE SEARCH RESULTS SCREEN (When user has typed in search) */}
          {searchResults !== null ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B]">Search Results</span>
                  <h2 className="text-sm font-bold text-[#111111]">
                    &ldquo;{searchQuery}&rdquo; ({searchResults.length} designs)
                  </h2>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-red-600 font-medium hover:underline"
                >
                  Clear
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center space-y-3 shadow-xs my-4">
                  <Search className="w-8 h-8 text-[#8B5A2B] mx-auto opacity-60" />
                  <p className="text-xs font-semibold text-[#111111]">No designs found for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-[11px] text-neutral-500">Need something custom made? Send a photo to our carpenter on WhatsApp.</p>
                  <a
                    href={getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.searchNotFound(searchQuery))}
                    onClick={onWhatsAppLinkClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-xs font-semibold rounded-xl shadow-xs"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>Ask on WhatsApp</span>
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-2.5 gap-y-4">
                  {searchResults.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* TAB 1: HOME */}
              {activeTab === 'home' && (
                <div className="space-y-4 pt-1">
                  
                  {/* STORY HIGHLIGHTS (Native Instagram/App category circles with Diwali Deals) */}
                  <div className="py-1">
                    <div className="flex items-end gap-4 overflow-x-auto no-scrollbar pt-1 pb-1">
                      {STORY_HIGHLIGHTS.map((story) => {
                        const isDiwali = story.action === 'offers';
                        return (
                          <button
                            key={story.title}
                            onClick={() => {
                              if (story.action === 'offers') {
                                document.getElementById('diwali-offers-section')?.scrollIntoView({ behavior: 'smooth' });
                              } else if (story.action === 'whatsapp') {
                                openWhatsApp(getWhatsAppUrl());
                              } else {
                                handleSelectCategory(story.category);
                              }
                            }}
                            className="flex flex-col items-center gap-1 shrink-0 group"
                          >
                            {/* Product photo is larger than the circle so it pops out over the rim.
                                The photos are on white, so multiply blends that white into the
                                circle and page behind. Keep transforms off ancestors (they would
                                isolate the blend and bring the white box back). */}
                            <div className="relative w-16 h-[4.5rem]">
                              <div className={`absolute bottom-0 left-1 w-14 h-14 rounded-full p-0.5 ${
                                isDiwali
                                  ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 ring-2 ring-amber-400/50 shadow-md'
                                  : 'bg-gradient-to-tr from-[#8B5A2B] via-amber-400 to-[#FAF5EE] shadow-xs'
                              }`}>
                                <div className={`w-full h-full rounded-full ${isDiwali ? 'bg-amber-50' : 'bg-[#FAF5EE]'}`} />
                              </div>
                              <Image
                                src={story.image}
                                alt=""
                                width={72}
                                height={72}
                                sizes="72px"
                                className="absolute bottom-0 left-1/2 w-[4.5rem] h-[4.5rem] -translate-x-1/2 object-contain mix-blend-multiply transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-105 group-active:scale-95"
                              />
                            </div>
                            <span className={`text-[10px] font-semibold text-center tracking-tight ${
                              isDiwali ? 'text-amber-800 font-bold' : 'text-neutral-800'
                            }`}>
                              {story.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* DIWALI FESTIVE BANNERS — swipeable snap carousel (touch, trackpad, dots, autoplay) */}
                  <div className="relative">
                    <div
                      ref={bannerTrackRef}
                      onScroll={handleBannerScroll}
                      onPointerDown={markBannerInteraction}
                      onTouchStart={markBannerInteraction}
                      className="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain no-scrollbar rounded-3xl shadow-xl"
                    >
                      {DIWALI_BANNERS.map((banner, idx) => (
                        <div
                          key={banner.id}
                          className={`relative w-full shrink-0 snap-center aspect-[2/1] overflow-hidden bg-gradient-to-br ${banner.gradient} text-white`}
                        >
                          <Image
                            src={banner.image}
                            alt=""
                            fill
                            sizes="(min-width: 640px) 430px, 100vw"
                            preload={idx === 0}
                            draggable={false}
                            className="object-cover object-right"
                          />
                          {/* Darkens the empty left side of the photo so the text stays readable */}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/0 pointer-events-none" />

                          <div className="relative z-10 flex h-full max-w-[66%] flex-col items-start justify-between p-4 sm:p-5">
                            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-amber-200 text-[9px] font-bold px-2.5 py-0.5 rounded-full">
                              <DiyaIcon className="w-3 h-3" />
                              {banner.badge}
                            </span>
                            <h2 className="text-lg sm:text-xl font-extrabold leading-tight tracking-tight text-white drop-shadow-xs">
                              {banner.headline}
                            </h2>
                            <button
                              onClick={() => handleClaimDiwaliOffer(banner)}
                              className="bg-white text-[#7C2D12] hover:bg-neutral-100 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                            >
                              {banner.ctaText}
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Carousel Indicator Dots */}
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      {DIWALI_BANNERS.map((b, idx) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            markBannerInteraction();
                            scrollToBanner(idx);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            activeBannerIdx === idx ? 'w-5 bg-[#8B5A2B]' : 'w-1.5 bg-neutral-300'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* DIWALI OFFERS STRIP — compact coupon chips, each opens WhatsApp */}
                  <div id="diwali-offers-section" className="space-y-2 pt-1 scroll-mt-24">
                    <div className="flex items-center gap-1.5">
                      <DiyaIcon className="w-4 h-4 text-amber-600" />
                      <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Diwali Offers</h2>
                    </div>

                    <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar pb-1">
                      {[
                        ...DIWALI_OFFERS.map((offer) => ({
                          id: offer.id,
                          icon: offer.icon,
                          title: offer.benefit,
                          sub: offer.tag,
                          onClick: () => handleClaimOffer(offer),
                        })),
                        {
                          id: 'festive-gift',
                          icon: Gift,
                          title: FESTIVE_GIFT.title,
                          sub: 'Free gift',
                          onClick: () => openWhatsApp(getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.festiveGift())),
                        },
                      ].map(({ id, icon: Icon, title, sub, onClick }) => (
                        <button
                          key={id}
                          onClick={onClick}
                          className="flex items-center gap-2 shrink-0 bg-white rounded-xl border border-amber-200/70 pl-2 pr-2.5 py-2 text-left shadow-xs hover:shadow-md active:scale-[0.98] transition-all group"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block whitespace-nowrap text-xs font-extrabold text-[#7C2D12] tracking-tight">{title}</span>
                            <span className="block whitespace-nowrap text-[10px] font-medium text-neutral-500">{sub}</span>
                          </span>
                          <ArrowRight className="w-3 h-3 shrink-0 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BROWSE BY CATEGORY — app-style 4-column photo grid */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <h2 className="text-[15px] font-bold text-neutral-900">Shop by category</h2>
                      <button
                        onClick={() => goToTab('catalog')}
                        className="text-xs font-medium text-neutral-500 hover:text-[#8B5A2B]"
                      >
                        See all
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-x-5 gap-y-4 px-1">
                      {categoryCards.map((cat) => (
                        <CategoryBox key={cat.key} category={cat.key} onClick={() => handleSelectCategory(cat.key)} />
                      ))}
                    </div>
                  </div>

                  {/* DIWALI DHAMAKA FLASH DEALS SECTION (With Dynamic Countdown Timer) */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-orange-600" />
                        <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                          Diwali Dhamaka Deals
                        </h2>
                      </div>
                      
                      {/* Live Festive Countdown Timer */}
                      <div className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200/60">
                        <Clock className="w-3 h-3 text-red-600 animate-pulse" />
                        <span>Ends in: {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.mins).padStart(2, '0')}m {String(timeLeft.secs).padStart(2, '0')}s</span>
                      </div>
                    </div>

                    {/* One swipeable row; ~2.4 cards visible so the next one peeks in */}
                    <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory overscroll-x-contain no-scrollbar pb-1">
                      {diwaliPicks.map((product) => (
                        <div key={product.id} className="w-[40%] shrink-0 snap-start">
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CARPENTER CUSTOMIZATION CARD */}
                  <div className="bg-[#FAF5EE] rounded-2xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-start gap-3">
                      <span className="p-2 rounded-xl bg-white text-[#8B5A2B] shadow-2xs shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-[#111111]">{CUSTOM_ORDER_CARD.title}</h4>
                        <p className="text-[11px] text-neutral-600 leading-relaxed">
                          {CUSTOM_ORDER_CARD.description}
                        </p>
                      </div>
                    </div>
                    <a
                      href={getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.customDimensions())}
                      onClick={onWhatsAppLinkClick}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>

                  {/* TRUST POINTS (Clean Mobile Badges) */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    {TRUST_POINTS.map(({ icon: Icon, title, subtitle }) => (
                      <div key={title} className="bg-white rounded-xl p-2.5 shadow-2xs space-y-1">
                        <Icon className="w-4 h-4 text-[#8B5A2B] mx-auto" />
                        <p className="font-bold text-[10px] text-neutral-900 leading-tight">{title}</p>
                        <p className="text-[9px] text-neutral-500">{subtitle}</p>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 2: CATALOG — its own component (CatalogPage.tsx) */}
              {activeTab === 'catalog' && (
                <CatalogPage filters={catalogFilters} onFiltersChange={setCatalogFilters} />
              )}

              {/* TAB 3: WISHLIST (SAVED DESIGNS) */}
              {activeTab === 'wishlist' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-[#111111] flex items-center gap-1.5">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        <span>Saved Furniture ({wishlist.length})</span>
                      </h2>
                      <p className="text-[11px] text-neutral-500">Your bookmarked pieces for home interior planning</p>
                    </div>

                    {wishlist.length > 0 && (
                      <button
                        onClick={() => { setWishlist([]); showToast('Wishlist cleared'); }}
                        className="text-[11px] text-red-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  {wishlistedProducts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center space-y-3 shadow-xs my-6">
                      <div className="w-14 h-14 bg-red-50 text-red-400 rounded-full mx-auto flex items-center justify-center">
                        <Heart className="w-7 h-7" />
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900">Your Wishlist is Empty</h3>
                      <p className="text-[11px] text-neutral-500 max-w-xs mx-auto leading-relaxed">
                        Tap the heart icon on any sofa, dining table, or chair to save it here for easy WhatsApp price comparisons.
                      </p>
                      <button
                        onClick={() => goToTab('catalog')}
                        className="px-4 py-2 bg-[#8B5A2B] hover:bg-[#6E3D19] text-white text-xs font-semibold rounded-xl shadow-xs active:scale-95 transition-all"
                      >
                        Explore Furniture
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Bulk WhatsApp Inquiry Action */}
                      <a
                        href={getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.wishlistPackage(wishlistedProducts))}
                        onClick={onWhatsAppLinkClick}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-3 rounded-2xl flex items-center justify-between font-semibold text-xs shadow-md active:scale-98 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <WhatsAppIcon className="w-4 h-4" />
                          <span>Get Package Deal on WhatsApp</span>
                        </div>
                        <ArrowRight className="w-4 h-4" />
                      </a>

                      <div className="grid grid-cols-2 gap-x-2.5 gap-y-4">
                        {wishlistedProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: STORE INFO & WHATSAPP — its own component (StoreInfoPage.tsx) */}
              {activeTab === 'help' && <StoreInfoPage />}
            </>
          )}

        </main>

        {/* NATIVE MOBILE BOTTOM NAVIGATION TAB BAR */}
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 sm:sticky sm:bottom-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-2 pb-safe select-none"
        >
          <div className="max-w-md mx-auto h-16 flex items-center justify-around">
            
            {/* Tab 1: Home */}
            <Link
              href={TAB_PATHS.home}
              onClick={() => setSearchQuery('')}
              aria-current={activeTab === 'home' && !searchQuery ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all active:scale-95 ${
                activeTab === 'home' && !searchQuery ? 'text-[#8B5A2B]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Home className={`w-5 h-5 ${activeTab === 'home' && !searchQuery ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className={`text-[10px] mt-1 ${activeTab === 'home' && !searchQuery ? 'font-bold' : 'font-medium'}`}>
                Home
              </span>
            </Link>

            {/* Tab 2: Catalog */}
            <Link
              href={TAB_PATHS.catalog}
              onClick={() => setSearchQuery('')}
              aria-current={activeTab === 'catalog' && !searchQuery ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all active:scale-95 ${
                activeTab === 'catalog' && !searchQuery ? 'text-[#8B5A2B]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className={`w-5 h-5 ${activeTab === 'catalog' && !searchQuery ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className={`text-[10px] mt-1 ${activeTab === 'catalog' && !searchQuery ? 'font-bold' : 'font-medium'}`}>
                Catalog
              </span>
            </Link>

            {/* Tab 3: Wishlist (Saved) */}
            <Link
              href={TAB_PATHS.wishlist}
              onClick={() => setSearchQuery('')}
              aria-current={activeTab === 'wishlist' && !searchQuery ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] relative transition-all active:scale-95 ${
                activeTab === 'wishlist' && !searchQuery ? 'text-[#8B5A2B]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <div className="relative">
                <Heart className={`w-5 h-5 ${activeTab === 'wishlist' && !searchQuery ? 'fill-[#8B5A2B] text-[#8B5A2B]' : 'stroke-[1.75]'}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${activeTab === 'wishlist' && !searchQuery ? 'font-bold' : 'font-medium'}`}>
                Saved
              </span>
            </Link>

            {/* Tab 4: WhatsApp Support */}
            <Link
              href={TAB_PATHS.help}
              onClick={() => setSearchQuery('')}
              aria-current={activeTab === 'help' && !searchQuery ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all active:scale-95 ${
                activeTab === 'help' && !searchQuery ? 'text-[#8B5A2B]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <div className="relative">
                <MessageCircle className={`w-5 h-5 ${activeTab === 'help' && !searchQuery ? 'stroke-[2.5] text-[#25D366]' : 'stroke-[1.75]'}`} />
                <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#25D366] ring-2 ring-white" />
              </div>
              <span className={`text-[10px] mt-1 ${activeTab === 'help' && !searchQuery ? 'font-bold' : 'font-medium'}`}>
                WhatsApp
              </span>
            </Link>

          </div>
        </nav>

        {/* PRODUCT PAGE (when a product route is open) */}
        {children}

        {/* DEMO WHATSAPP — asks for the visitor's number, above everything */}
        {demoWhatsAppMessage !== null && (
          <DemoWhatsAppDialog message={demoWhatsAppMessage} onClose={() => setDemoWhatsAppMessage(null)} />
        )}

        {/* FLOATING TOAST NOTIFICATION — above product pages too */}
        {toastMessage && (
          <div className="fixed bottom-20 left-4 right-4 sm:left-1/2 sm:right-auto sm:w-[398px] sm:-translate-x-1/2 z-[60] bg-[#111111] text-white px-4 py-2.5 text-xs font-medium shadow-2xl flex items-center justify-between gap-2 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-neutral-400 p-1" aria-label="Dismiss">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
    </CatalogContext.Provider>
  );
}
