"use client";

import React, { useState, useMemo, useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { catalogSiteOriginFor } from '@/lib/catalogDomain';
import { whatsappUrl } from '@/lib/contact';
import './furniture-catalog.css';
import {
  Search,
  ShoppingCart,
  X,
  Check,
  MessageCircle,
  Heart,
  Home,
  LayoutGrid,
  MapPin,
  Info,
  Store as StoreIcon,
} from 'lucide-react';
import {
  AAW_PROMO,
  INITIAL_CART_IDS,
  WHATSAPP_MESSAGES,
} from './data';
import type { CatalogProduct } from '@/lib/adminProducts';
import type { CatalogStore } from '@/lib/catalogStore';
import { categoryLabel, sortCategoryNames } from '@/lib/taxonomy';
import CartPage from './CartPage';
import CatalogPage, { type CatalogFilters } from './CatalogPage';
import { categorySubPath, findBySlug, parseCategoryPath, type CategoryRoute } from './categoryPath';
import DemoWhatsAppDialog from './DemoWhatsAppDialog';
import { EMPTY_REFINE, type RefineFilters } from './filters';
import PicksPage from './PicksPage';
import SavedPage from './SavedPage';
import { parsePicksPath } from './shareLinks';
import StoreInfoPage from './StoreInfoPage';
import {
  CatalogContext,
  PRODUCT_GRID,
  ProductCard,
  SECTION_PANEL,
  StoreMark,
  WhatsAppIcon,
  catalogBasePath,
  catalogHref,
  catalogRelativePath,
  storeRoutePath,
  whatsAppLink,
  type CatalogContextValue,
} from './shared';

type AppTab = 'catalog' | 'saved' | 'cart' | 'help';

// Each bottom-nav tab has its own route (pages under app/store/[store]/(app)),
// given relative to the catalog's base path. The catalog is the start page; its
// categories and product types have their own pages too (/category/sofa/l-shape), and so
// do hand-picked products from a shared link (/picks/<id>,<id>).
const TAB_PATHS: Record<AppTab, string> = {
  catalog: '',
  saved: '/saved',
  cart: '/cart',
  help: '/help',
};

const tabFromPath = (pathname: string): AppTab | null => {
  const relative = catalogRelativePath(pathname);
  if (parseCategoryPath(relative) || parsePicksPath(relative)) return 'catalog';
  return (Object.keys(TAB_PATHS) as AppTab[]).find(tab => TAB_PATHS[tab] === relative) ?? null;
};

// The base path never changes while the catalog is open, so there's nothing to subscribe to.
const subscribeToNothing = () => () => {};
const NO_CATEGORY: CategoryRoute = { category: '', subCategory: '' };
const browserBasePath = () => catalogBasePath(window.location.pathname);
const isInIframe = () => window.self !== window.top;

// `products` are the published products from the admin panel (loaded by the layout).
// `children` is the current product page, if any; it renders on top of the catalog.

export default function FurnitureCatalogApp({
  store,
  products,
  children,
}: {
  store: CatalogStore;
  products: CatalogProduct[];
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // On catalog24.in the catalog is served at /furniture (see src/proxy.ts). Links render
  // with the internal path on the server and during hydration, then switch to the
  // base path the browser URL actually shows.
  const basePath = useSyncExternalStore(subscribeToNothing, browserBasePath, () => storeRoutePath(store.slug));
  const href = (sub: string) => catalogHref(basePath, sub);
  // The promo strip's "Home": the site the catalog sits in. At the root of its own subdomain
  // (yourstore.catalog24.in — a base path only ever seen in the browser) that's catalog24.in.
  const homeHref = basePath === '' ? catalogSiteOriginFor(window.location) : '/';

  // Running as a live demo inside another page (an iframe): keep the host page's history
  // clean — navigations replace instead of push.
  const embedded = useSyncExternalStore(subscribeToNothing, isInIframe, () => false);
  const navigate = (url: string, options?: { scroll?: boolean }) =>
    embedded ? router.replace(url, options) : router.push(url, options);

  // The open tab comes from the URL. On other routes (a product page, the promo
  // pop-up) there's no tab in the URL, so the last tab stays visible underneath.
  const routeTab = tabFromPath(pathname);
  const [activeTab, setActiveTab] = useState<AppTab>(routeTab ?? 'catalog');
  if (routeTab && routeTab !== activeTab) setActiveTab(routeTab);

  // Each tab opens at the top. Next.js can't do this for us: the tab pages
  // render nothing (the catalog lives in the layout), so it finds no element to
  // scroll to and the previous tab's scroll position carried over — landing at
  // the bottom of a shorter tab. Opening/closing a product keeps the tab, so it
  // doesn't reset the scroll.
  // The header's height (it changes when search opens) as --catalog-header-h,
  // so sticky bars further down, like the Catalog tab's filter chips, sit right under it.
  const shellRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const header = headerRef.current;
    const shell = shellRef.current;
    if (!header || !shell) return;
    const observer = new ResizeObserver(() =>
      shell.style.setProperty('--catalog-header-h', `${header.offsetHeight}px`)
    );
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const scrolledTabRef = useRef(activeTab);
  useEffect(() => {
    if (scrolledTabRef.current === activeTab) return;
    scrolledTabRef.current = activeTab;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // The Catalog tab's category and product type come from the URL (/category/sofa/l-shape),
  // as slugs. They're kept while other pages are open, so going back to the tab (or closing
  // a product) shows the same ones. A tap sets them straight away, before the navigation
  // finishes, so the chips respond instantly; the URL takes over again when it changes.
  const [browse, setBrowse] = useState<CategoryRoute>(
    () => (routeTab === 'catalog' && parseCategoryPath(catalogRelativePath(pathname))) || NO_CATEGORY
  );
  // Hand-picked products (a shared /picks/ link) show on the Catalog tab instead of the
  // categories, and stay underneath while one of them is open.
  const [picks, setPicks] = useState<string[] | null>(
    () => (routeTab === 'catalog' ? parsePicksPath(catalogRelativePath(pathname)) : null)
  );
  const [browsePath, setBrowsePath] = useState(pathname);
  if (pathname !== browsePath) {
    setBrowsePath(pathname);
    if (routeTab === 'catalog') {
      const relative = catalogRelativePath(pathname);
      setBrowse(parseCategoryPath(relative) ?? NO_CATEGORY);
      setPicks(parsePicksPath(relative));
    }
  }

  // The slugs as names. An unknown category (say, its products were unpublished) shows the first one.
  const categoryNames = useMemo(
    () => sortCategoryNames([...new Set(products.map(p => p.categoryName).filter(Boolean))]),
    [products]
  );
  const browseCategory = findBySlug(categoryNames, browse.category) ?? categoryNames[0] ?? '';
  const browseSubCategory = browse.subCategory
    ? (findBySlug(
        new Set(products.filter(p => p.categoryName === browseCategory).map(p => p.subcategoryName).filter(Boolean)),
        browse.subCategory
      ) ?? '')
    : '';

  // The Filters sheet's choices belong to one category; another category starts without them.
  const [refine, setRefine] = useState<{ category: string; filters: RefineFilters }>({
    category: '',
    filters: EMPTY_REFINE,
  });
  const catalogFilters: CatalogFilters = {
    category: browseCategory,
    subCategory: browseSubCategory,
    refine: refine.category === browseCategory ? refine.filters : EMPTY_REFINE,
  };

  // A new category or product type is a navigation (without scrolling); the Filters sheet isn't.
  const changeCatalogFilters = (next: CatalogFilters) => {
    setRefine({ category: next.category, filters: next.refine });
    if (next.category === browseCategory && next.subCategory === browseSubCategory) return;
    const path = categorySubPath(next.category, next.subCategory);
    setBrowse(parseCategoryPath(path) ?? NO_CATEGORY);
    navigate(href(path), { scroll: false });
  };

  // The Catalog tab's links go back to the category last shown.
  const tabPath = (tab: AppTab) =>
    tab === 'catalog' && browse.category ? categorySubPath(browseCategory, browseSubCategory) : TAB_PATHS[tab];

  // Unified Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Cart & toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // The page a product was opened from (set by its card), so its back button can return there
  const inAppNavigationRef = useRef<string | null>(null);
  // Only ids that exist, so the cart badge never counts missing products.
  const [cart, setCart] = useState<string[]>(() =>
    // The demo store opens with a couple of items in the cart to show it off.
    store.isDemo ? INITIAL_CART_IDS.filter(id => products.some(p => p.id === id)) : []
  );
  const cartCount = cart.length;

  // Switching tabs is a navigation; it also leaves search mode.
  const goToTab = (tab: AppTab) => {
    setSearchQuery('');
    navigate(href(tabPath(tab)));
  };

  // WhatsApp goes to the store's own number. The demo store instead shows the
  // enquiry and asks the visitor for their own number (DemoWhatsAppDialog).
  const whatsAppUrl = (text?: string) => whatsAppLink(store.whatsapp, text ?? WHATSAPP_MESSAGES.general(store.name));
  const [demoWhatsAppMessage, setDemoWhatsAppMessage] = useState<string | null>(null);
  const openWhatsApp = (url: string) => {
    if (store.isDemo) setDemoWhatsAppMessage(new URL(url).searchParams.get('text') ?? '');
    else window.open(url, '_blank', 'noopener,noreferrer');
  };
  const onWhatsAppLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!store.isDemo) return; // a normal link to WhatsApp
    e.preventDefault();
    openWhatsApp(e.currentTarget.href);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isInCart = (id: string) => cart.includes(id);

  const addToCart = (id: string) => {
    if (isInCart(id)) return;
    setCart(prev => [...prev, id]);
    showToast('Added to cart');
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i !== id));
    showToast('Removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    showToast('Cart cleared');
  };

  // Saved (wishlist): starts empty and lasts for the visit, like the cart.
  const [saved, setSaved] = useState<string[]>([]);
  const savedCount = saved.length;
  const isSaved = (id: string) => saved.includes(id);

  const toggleSaved = (id: string) => {
    if (isSaved(id)) {
      setSaved(prev => prev.filter(i => i !== id));
      showToast('Removed from saved');
    } else {
      setSaved(prev => [...prev, id]);
      showToast('Saved');
    }
  };

  const clearSaved = () => {
    setSaved([]);
    showToast('Saved list cleared');
  };

  // Global search across category (and its label), subcategory, name, tags, search
  // keywords, colours, specs, material and description. Every word typed must match somewhere, in any
  // order, so "grey 3 seater sofa" finds a sofa whose words are spread over fields.
  const searchResults = useMemo(() => {
    const words = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return null;

    return products.filter(item => {
      const text = [
        item.categoryName,
        categoryLabel(item.categoryName),
        item.subcategoryName,
        item.productName,
        ...item.tags,
        ...(item.keywords ?? []),
        ...item.colors.map(c => c.name),
        ...(item.specs ?? []).flatMap(s => [s.label, s.value]),
        item.woodType,
        item.material,
        item.description,
      ]
        .join(' ')
        .toLowerCase();
      return words.every(word => text.includes(word));
    });
  }, [products, searchQuery]);

  // "Search sofas, beds, chairs…": the store's first three categories.
  const searchPlaceholder = useMemo(() => {
    const labels = sortCategoryNames(products.map(p => p.categoryName).filter(Boolean))
      .slice(0, 3)
      .map(name => categoryLabel(name).toLowerCase());
    return labels.length ? `Search ${labels.join(', ')}…` : 'Search products…';
  }, [products]);

  const catalogContext: CatalogContextValue = {
    store,
    whatsAppUrl,
    products,
    href,
    embedded,
    navigate,
    cart,
    isInCart,
    addToCart,
    removeFromCart,
    clearCart,
    saved,
    isSaved,
    toggleSaved,
    clearSaved,
    markInAppNavigation: () => {
      inAppNavigationRef.current = window.location.pathname;
    },
    // Opened from a card → back in history (or, embedded, back to that page — there's no
    // history entry for it); opened from a shared link → the catalog home.
    closeProduct: () => {
      const openedFrom = inAppNavigationRef.current;
      if (!openedFrom) navigate(href(''), { scroll: false });
      else if (embedded) navigate(openedFrom, { scroll: false });
      else router.back();
    },
    openWhatsApp,
    onWhatsAppLinkClick,
  };

  // The tab a link points at is "current" unless search results are showing.
  const isCurrent = (tab: AppTab) => activeTab === tab && !searchQuery;

  // Desktop top navigation (phones use the bottom tab bar instead).
  const desktopNav: { tab: AppTab; label: string; icon: typeof LayoutGrid; count?: number }[] = [
    { tab: 'catalog', label: 'Catalog', icon: LayoutGrid },
    { tab: 'saved', label: 'Saved', icon: Heart, count: savedCount },
    { tab: 'cart', label: 'Cart', icon: ShoppingCart, count: cartCount },
    { tab: 'help', label: 'Store info', icon: StoreIcon },
  ];

  const searchField = (autoFocus: boolean, size: 'sm' | 'md') => (
    <div className="relative">
      <Search className={`text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 ${size === 'md' ? 'w-[18px] h-[18px]' : 'w-4 h-4'}`} />
      <input
        type="search"
        autoFocus={autoFocus}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label="Search products"
        enterKeyHint="search"
        className={`w-full bg-neutral-100 focus:bg-white pr-8 text-[#111111] focus:outline-none focus:ring-2 focus:ring-neutral-900/10 rounded-md transition-all [&::-webkit-search-cancel-button]:hidden ${
          size === 'md' ? 'h-10 pl-10 text-sm' : 'pl-9 py-2 text-xs shadow-inner'
        }`}
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <CatalogContext.Provider value={catalogContext}>
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased flex flex-col">

      {/* APP SHELL — the full window: a phone app below md, a website from md up */}
      {/* Desktop: a light grey page, so the white section panels stand apart */}
      <div ref={shellRef} className="w-full min-h-screen bg-white md:bg-neutral-50 flex flex-col relative">

        {/* ALLABOUTWEB PROMO STRIP (demo store only) */}
        {store.isDemo && (
        <div className="bg-[#111111] text-white px-3 py-2 flex items-center gap-2.5 text-[11px] font-semibold select-none shrink-0 z-50">
          <Link
            href={homeHref}
            // In a live demo, leave the demo frame rather than loading the site inside it
            target={embedded ? '_top' : undefined}
            aria-label="Back to home"
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
        )}

        {/* TOP BAR — brand and quick actions on phones; brand, search and navigation on desktop */}
        <header ref={headerRef} className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-xs md:border-b md:border-neutral-200 md:shadow-[0_4px_16px_-10px_rgba(0,0,0,0.12)]">

          {/* Brand & Action Row */}
          <div className="mx-auto w-full max-w-7xl px-4 py-2.5 md:px-6 md:py-3 flex items-center justify-between gap-3 md:gap-6">
            <button
              type="button"
              onClick={() => goToTab('catalog')}
              className="flex min-w-0 shrink-0 items-center gap-1.5 md:gap-2.5 text-left"
            >
              <StoreMark store={store} sizes="36px" className="w-7 h-7 md:w-9 md:h-9 rounded-lg text-xs md:text-sm shadow-xs" />
              <span className="min-w-0">
                <span className="font-bold text-base md:text-lg text-[#111111] tracking-tight leading-none block truncate">
                  {store.name}
                </span>
                {store.tagline && (
                  <span className="text-[9px] md:text-[10px] text-primary font-semibold tracking-wider uppercase block md:mt-0.5 truncate">
                    {store.tagline}
                  </span>
                )}
              </span>
            </button>

            {/* Desktop: search always visible */}
            <div className="hidden md:block flex-1 max-w-xl">{searchField(false, 'md')}</div>

            {/* Desktop: navigation and WhatsApp */}
            <nav aria-label="Main" className="hidden md:flex shrink-0 items-center gap-1">
              {desktopNav.map(({ tab, label, icon: Icon, count }) => (
                <Link
                  key={tab}
                  href={href(tabPath(tab))}
                  replace={embedded}
                  onClick={() => setSearchQuery('')}
                  aria-current={isCurrent(tab) ? 'page' : undefined}
                  className={`flex h-10 items-center gap-2 rounded-md px-3 text-[13px] transition-colors ${
                    isCurrent(tab)
                      ? 'bg-neutral-100 font-semibold text-neutral-900'
                      : 'font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={isCurrent(tab) ? 2.25 : 1.75} />
                  <span className="hidden lg:inline">{label}</span>
                  <span className="sr-only lg:hidden">{label}</span>
                  {!!count && (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                      {count}
                    </span>
                  )}
                </Link>
              ))}
              <button
                onClick={() => openWhatsApp(whatsAppUrl())}
                className="ml-2 flex h-10 items-center gap-2 rounded-md bg-[#25D366] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#1fb855]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </button>
            </nav>

            {/* Phones: Quick Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-100 text-neutral-700'}`}
                aria-label="Toggle Search"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => goToTab('cart')}
                className={`relative p-2 rounded-full bg-neutral-100 hover:text-neutral-900 transition-colors ${cartCount > 0 ? 'text-neutral-900' : 'text-neutral-700'}`}
                aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : 'Cart'}
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Pincode Delivery Pill */}
          {store.deliveryArea && (
            <div className="mx-auto w-full max-w-7xl px-4 md:px-6 pb-2 flex items-center justify-between text-[11px] text-neutral-600">
              <div className="flex items-center gap-1 bg-neutral-100/80 px-2.5 py-0.5 rounded-full text-[10px] text-neutral-700">
                <MapPin className="w-3 h-3 text-neutral-500" />
                <span className="font-semibold text-neutral-900">{store.deliveryArea}</span>
                <span className="text-neutral-400">·</span>
              </div>
            </div>
          )}

          {/* Collapsible Mobile Search Bar */}
          {(isSearchOpen || searchQuery) && (
            <div className="px-4 pb-2.5 animate-in slide-in-from-top-2 duration-150 md:hidden">
              {searchField(isSearchOpen, 'sm')}
            </div>
          )}
        </header>

        {/* SCROLLABLE MAIN APP BODY (with pb-24 on phones so content never clips behind the bottom tab bar) */}
        {/* overflow-x-clip, not overflow-auto: the window scrolls, and a scroll
            container here would stop sticky elements inside from sticking. */}
        <main className="flex-1 overflow-x-clip pb-24 md:pb-12 px-3 md:px-6 pt-2 md:pt-5 mx-auto w-full max-w-7xl">

          {/* ACTIVE SEARCH RESULTS SCREEN (When user has typed in search) */}
          {searchResults !== null ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Search Results</span>
                  <h2 className="text-sm font-bold text-[#111111]">
                    &ldquo;{searchQuery}&rdquo; ({searchResults.length} product{searchResults.length === 1 ? '' : 's'})
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
                <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center space-y-3 my-4 md:mx-auto md:max-w-md md:my-10">
                  <Search className="w-8 h-8 text-neutral-400 mx-auto" />
                  <p className="text-xs font-semibold text-[#111111]">No products found for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-[11px] text-neutral-500">Can&apos;t find it? Send us a photo or a message on WhatsApp.</p>
                  <a
                    href={whatsAppUrl(WHATSAPP_MESSAGES.searchNotFound(store.name, searchQuery))}
                    onClick={onWhatsAppLinkClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-xs font-semibold rounded-md shadow-xs"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>Ask on WhatsApp</span>
                  </a>
                </div>
              ) : (
                <div className={`${PRODUCT_GRID} ${SECTION_PANEL} md:p-5`}>
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
              {/* CATALOG (the start page) — its own component (CatalogPage.tsx) */}
              {activeTab === 'catalog' &&
                (picks ? (
                  <PicksPage ids={picks} onBrowse={() => goToTab('catalog')} />
                ) : (
                  <CatalogPage filters={catalogFilters} onFiltersChange={changeCatalogFilters} />
                ))}

              {/* SAVED (wishlist) — its own component (SavedPage.tsx) */}
              {activeTab === 'saved' && <SavedPage onBrowse={() => goToTab('catalog')} />}

              {/* CART — its own component (CartPage.tsx) */}
              {activeTab === 'cart' && <CartPage onBrowse={() => goToTab('catalog')} />}

              {/* STORE INFO & WHATSAPP — its own component (StoreInfoPage.tsx) */}
              {activeTab === 'help' && <StoreInfoPage />}
            </>
          )}

          {/* DEMO DISCLAIMER — the demo store only, at the end of every tab */}
          {store.isDemo && (
            <p className="mt-6 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-neutral-300 bg-white/70 px-3 py-2.5 text-center text-[11px] font-medium text-neutral-500">
              <Info className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
              <span>This is a furniture e-catalog for demo purposes only.</span>
            </p>
          )}

        </main>

        {/* DESKTOP FOOTER — the store's name and address, and a way to reach it */}
        <footer className="hidden md:block border-t border-neutral-200 bg-white">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-6">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900">{store.name}</p>
              {(store.address || store.hours) && (
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  {[store.address, store.hours].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <button
              onClick={() => openWhatsApp(whatsAppUrl())}
              className="flex h-10 shrink-0 items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 text-[13px] font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
              Chat on WhatsApp
            </button>
          </div>
        </footer>

        {/* NATIVE MOBILE BOTTOM NAVIGATION TAB BAR (phones only) */}
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-2 pb-[env(safe-area-inset-bottom)] select-none md:hidden"
        >
          <div className="max-w-md mx-auto h-16 flex items-center justify-around">
            
            {/* Tab 1: Catalog */}
            <Link
              href={href(tabPath('catalog'))}
              replace={embedded}
              onClick={() => setSearchQuery('')}
              aria-current={activeTab === 'catalog' && !searchQuery ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all active:scale-95 ${
                activeTab === 'catalog' && !searchQuery ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className={`w-5 h-5 ${activeTab === 'catalog' && !searchQuery ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className={`text-[10px] mt-1 ${activeTab === 'catalog' && !searchQuery ? 'font-bold' : 'font-medium'}`}>
                Catalog
              </span>
            </Link>

            {/* Tab 2: Saved (wishlist) */}
            <Link
              href={href(TAB_PATHS.saved)}
              replace={embedded}
              onClick={() => setSearchQuery('')}
              aria-current={activeTab === 'saved' && !searchQuery ? 'page' : undefined}
              aria-label={savedCount > 0 ? `Saved, ${savedCount} items` : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] relative transition-all active:scale-95 ${
                activeTab === 'saved' && !searchQuery ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <div className="relative">
                <Heart className={`w-5 h-5 ${activeTab === 'saved' && !searchQuery ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {savedCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                    {savedCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${activeTab === 'saved' && !searchQuery ? 'font-bold' : 'font-medium'}`}>
                Saved
              </span>
            </Link>

            {/* Tab 3: Cart */}
            <Link
              href={href(TAB_PATHS.cart)}
              replace={embedded}
              onClick={() => setSearchQuery('')}
              aria-current={activeTab === 'cart' && !searchQuery ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] relative transition-all active:scale-95 ${
                activeTab === 'cart' && !searchQuery ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <div className="relative">
                <ShoppingCart className={`w-5 h-5 ${activeTab === 'cart' && !searchQuery ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${activeTab === 'cart' && !searchQuery ? 'font-bold' : 'font-medium'}`}>
                Cart
              </span>
            </Link>

            {/* Tab 4: WhatsApp Support */}
            <Link
              href={href(TAB_PATHS.help)}
              replace={embedded}
              onClick={() => setSearchQuery('')}
              aria-current={activeTab === 'help' && !searchQuery ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all active:scale-95 ${
                activeTab === 'help' && !searchQuery ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
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
          <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-[360px] z-[60] bg-[#111111] text-white px-4 py-2.5 text-xs font-medium shadow-2xl flex items-center justify-between gap-2 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
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
