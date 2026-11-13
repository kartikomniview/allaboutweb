"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  CircleCheck,
  Inbox,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  Share2,
  SlidersHorizontal,
  TriangleAlert,
  X,
} from "lucide-react";
import { useAdminUser, useLiveCatalogUrl } from "@/components/admin/AdminShell";
import { ProductLimitNotice, limitState, usageLabel } from "@/components/admin/ProductLimit";
import ConfirmDialog from "@/components/admin/ecatalog/ConfirmDialog";
import { useOverlay } from "@/components/admin/ecatalog/useOverlay";
import ProductFormDrawer from "@/components/admin/ecatalog/ProductFormDrawer";
import ShareCatalogDialog from "@/components/admin/ecatalog/ShareCatalogDialog";
import ProductTable, {
  ProductGrid,
  ProductGridSkeleton,
  ProductTableSkeleton,
} from "@/components/admin/ecatalog/ProductTable";
import { ripple } from "@/components/admin/ripple";
import { Button, Card, buttonClass } from "@/components/admin/ui";
import { categoryLabel, sortCategoryNames } from "@/lib/taxonomy";
import { AuthError } from "@/lib/adminAuth";
import {
  deleteProduct,
  listProducts,
  productToInput,
  sortProducts,
  updateProduct,
  type Product,
  type ProductInput,
} from "@/lib/adminProducts";

const NEW_PRODUCT_ROUTE = "/admin/ecatalog/new";

type StatusFilter = "all" | "published" | "hidden";
type Toast = { id: number; text: string; tone: "ok" | "error" };

// Rows rendered at a time; the next batch appears as the admin scrolls.
const PAGE_SIZE = 20;
// The list opens on "All", the first chip; the other chips are the categories the products use.
const DEFAULT_CATEGORY = "All";

// List or grid (grid by default), remembered in this browser. Storage can be
// unavailable (private mode, blocked site data), so every access is guarded.
type ViewMode = "list" | "grid";
const VIEW_KEY = "aaw_admin_ecatalog_view";

function readViewMode(): ViewMode {
  try {
    return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

function saveViewMode(view: ViewMode) {
  try {
    localStorage.setItem(VIEW_KEY, view);
  } catch {
    // Not saved; the choice still applies until the page is closed.
  }
}

const VIEW_OPTIONS = [
  { key: "list", label: "List view", icon: List },
  { key: "grid", label: "Grid view", icon: LayoutGrid },
] as const;

// Calls onVisible when it scrolls into view (a little early, so rows are ready
// before the admin reaches the bottom). The button is a fallback for keyboard
// users and browsers without IntersectionObserver.
function LoadMore({ shown, total, onVisible }: { shown: number; total: number; onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onVisibleRef = useRef(onVisible);
  useEffect(() => {
    onVisibleRef.current = onVisible;
  });

  // Re-observed after every batch: if the sentinel is still on screen (tall
  // window), the fresh observer fires again and loads the next batch too.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onVisibleRef.current();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <div ref={ref} className="flex justify-center border-t border-line px-4 py-3">
      <Button size="sm" variant="ghost" onClick={onVisible}>
        Show {Math.min(PAGE_SIZE, total - shown)} more
      </Button>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  children,
  actions,
}: {
  icon: typeof Inbox;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-paper text-slate">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h2 className="mt-4 text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate">{children}</p>
      {actions && <div className="mt-6 flex flex-col gap-2 sm:flex-row">{actions}</div>}
    </div>
  );
}

// Phones: status, category and layout live in this bottom sheet, so the page
// keeps a single row (search, Filters, Share, View live) above the products.
function FilterSheet({
  onClose,
  onRefresh,
  refreshing,
  onClear,
  canClear,
  resultCount,
  children,
}: {
  onClose: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  onClear: () => void;
  canClear: boolean;
  resultCount: number;
  children: ReactNode;
}) {
  const panelRef = useOverlay<HTMLDivElement>(onClose);
  return (
    <div
      className="admin-fade-in fixed inset-0 z-[110] flex items-end bg-ink/40 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        tabIndex={-1}
        className="admin-pop-in flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-lg bg-white shadow-2xl focus:outline-none"
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line pl-5 pr-2">
          <h2 id="filter-sheet-title" className="text-base font-semibold text-ink">
            Filter &amp; view
          </h2>
          <div className="flex items-center">
            <button
              type="button"
              onClick={onRefresh}
              onPointerDown={ripple}
              disabled={refreshing}
              aria-label="Refresh"
              title="Refresh"
              className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full text-slate hover:text-ink disabled:opacity-50"
            >
              <RefreshCw className={`h-[18px] w-[18px] ${refreshing ? "animate-spin" : ""}`} aria-hidden />
            </button>
            <button
              type="button"
              onClick={onClose}
              onPointerDown={ripple}
              aria-label="Close"
              className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full text-slate hover:text-ink"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex gap-2 border-t border-line px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {canClear && (
            <Button onClick={onClear} className="h-12 px-4 text-[15px]">
              Clear
            </Button>
          )}
          <Button variant="primary" onClick={onClose} className="h-12 flex-1 text-[15px]">
            Show {resultCount} {resultCount === 1 ? "product" : "products"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SheetLabel({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 text-[13px] font-semibold text-ink">{children}</h3>;
}

export default function ManageEcatalogPage() {
  const router = useRouter();
  const liveUrl = useLiveCatalogUrl();
  const [products, setProducts] = useState<Product[] | null>(null);
  const { store } = useAdminUser();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [status, setStatus] = useState<StatusFilter>("all");
  // The page only renders in the browser (after the session check), so storage is available here.
  const [view, setView] = useState<ViewMode>(readViewMode);

  function changeView(next: ViewMode) {
    setView(next);
    saveViewMode(next);
  }

  // The product open in the editor (new products are added at NEW_PRODUCT_ROUTE).
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, tone });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // An expired session sends the admin back to the login page.
  const errorMessage = useCallback(
    (err: unknown, fallback: string) => {
      if (err instanceof AuthError && err.status === 401) {
        router.replace("/admin");
        return "Your session has ended. Please sign in again.";
      }
      return err instanceof AuthError ? err.message : fallback;
    },
    [router],
  );

  // Links from the dashboard: ?edit=<id> opens that product.
  const openDeepLink = useCallback((list: Product[]) => {
    const id = new URLSearchParams(window.location.search).get("edit");
    if (!id) return;
    window.history.replaceState(window.history.state, "", window.location.pathname);
    const found = list.find((p) => p.id === id);
    if (found) setEditing(found);
  }, []);

  // First load shows the skeleton; later refreshes keep the table and show a progress bar.
  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      setLoadError(null);
      if (mode === "initial") setProducts(null);
      else setRefreshing(true);
      try {
        const list = await listProducts();
        setProducts(list);
        if (mode === "initial") openDeepLink(list);
      } catch (err) {
        const message = errorMessage(err, "We couldn't load your products.");
        if (mode === "initial") setLoadError(message);
        else showToast(message, "error");
      } finally {
        setRefreshing(false);
      }
    },
    [errorMessage, showToast, openDeepLink],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    load("initial");
  }, [load]);

  const counts = useMemo(() => {
    const list = products ?? [];
    const published = list.filter((p) => p.isActive).length;
    return { all: list.length, published, hidden: list.length - published };
  }, [products]);

  // Products matching the status tab and search, before the category filter.
  // The category chips count from this list.
  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (products ?? []).filter((p) => {
      if (status === "published" && !p.isActive) return false;
      if (status === "hidden" && p.isActive) return false;
      if (!q) return true;
      return (
        p.productName.toLowerCase().includes(q) ||
        p.subcategoryName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.keywords ?? []).some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [products, query, status]);

  const visible = useMemo(
    () => (category === "All" ? matching : matching.filter((p) => p.categoryName === category)),
    [matching, category],
  );

  const categoryCounts = useMemo(() => {
    const byName = new Map<string, number>();
    matching.forEach((p) => byName.set(p.categoryName, (byName.get(p.categoryName) ?? 0) + 1));
    return byName;
  }, [matching]);

  // How many matching rows are rendered. Changing the search or a filter starts
  // again from the first batch.
  const filterKey = `${query}|${category}|${status}`;
  const [page, setPage] = useState({ key: filterKey, count: PAGE_SIZE });
  const shownCount = Math.min(page.key === filterKey ? page.count : PAGE_SIZE, visible.length);
  const showMore = () => setPage({ key: filterKey, count: shownCount + PAGE_SIZE });

  const categoryNames = useMemo(
    () => sortCategoryNames((products ?? []).map((p) => p.categoryName).filter(Boolean)),
    [products],
  );

  const replaceProduct = (saved: Product) =>
    setProducts((list) => sortProducts([...(list ?? []).filter((p) => p.id !== saved.id), saved]));

  async function handleSave(input: ProductInput): Promise<Product> {
    if (!editing) throw new Error("No product open");
    const saved = await updateProduct(editing.id, input);
    replaceProduct(saved);
    setEditing(undefined);
    showToast(`Saved “${saved.productName}”`);
    return saved;
  }


  async function handleToggleActive(product: Product) {
    setTogglingId(product.id);
    try {
      const saved = await updateProduct(product.id, { ...productToInput(product), isActive: !product.isActive });
      replaceProduct(saved);
      showToast(saved.isActive ? `Published “${saved.productName}”` : `Hid “${saved.productName}” from the catalog`);
    } catch (err) {
      showToast(errorMessage(err, "Could not update the product."), "error");
    } finally {
      setTogglingId(null);
    }
  }

  function askDelete(product: Product) {
    setDeleteError(null);
    setDeleting(product);
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await deleteProduct(deleting.id);
      setProducts((list) => (list ?? []).filter((p) => p.id !== deleting.id));
      if (editing?.id === deleting.id) setEditing(undefined);
      setDeleting(null);
      showToast(`Deleted “${deleting.productName}”`);
    } catch (err) {
      setDeleteError(errorMessage(err, "Could not delete the product."));
    } finally {
      setDeleteBusy(false);
    }
  }

  function clearFilters() {
    setQuery("");
    setCategory(DEFAULT_CATEGORY);
    setStatus("all");
  }

  const limit = limitState(counts.all, store.productLimit);
  const hasFilters = query.trim() !== "" || category !== DEFAULT_CATEGORY || status !== "all";
  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "hidden", label: "Hidden" },
  ];
  // Filters set in the phone sheet (the search has its own box), shown as a badge on its button.
  const sheetFilterCount = (category !== DEFAULT_CATEGORY ? 1 : 0) + (status !== "all" ? 1 : 0);

  // Status and category filters: in the sticky bar from sm up, in the filter sheet on phones.
  const statusTabs = (className: string) => (
    <div role="tablist" aria-label="Filter by status" className={className}>
      {tabs.map(({ key, label }) => {
        const selected = status === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => setStatus(key)}
            className={`flex h-9 items-center justify-center gap-1.5 rounded-[4px] px-3 text-[13px] font-semibold transition-colors ${
              selected ? "bg-white text-ink shadow-[0_1px_2px_rgba(1,18,60,0.12)]" : "text-slate hover:text-ink"
            }`}
          >
            {label}
            <span className={`text-[11px] tabular-nums ${selected ? "text-primary" : "text-slate/80"}`}>
              {products ? counts[key] : "–"}
            </span>
          </button>
        );
      })}
    </div>
  );

  // Categories (counts follow the status and search)
  const categoryChips = (className: string) =>
    categoryNames.length > 0 && (
      <div role="group" aria-label="Filter by category" className={className}>
        {[
          { name: "All", label: "All categories", count: matching.length },
          ...categoryNames.map((name) => ({ name, label: categoryLabel(name), count: categoryCounts.get(name) ?? 0 })),
        ].map(({ name, label, count }) => {
          const selected = category === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              onPointerDown={ripple}
              aria-pressed={selected}
              className={`relative inline-flex h-9 shrink-0 items-center gap-1.5 overflow-hidden rounded-md border px-3 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                selected
                  ? "border-ink bg-ink text-white"
                  : count === 0
                    ? "border-line bg-white text-slate/60"
                    : "border-line bg-white text-ink hover:border-slate/35"
              }`}
            >
              {label}
              <span className={`text-[11px] tabular-nums ${selected ? "text-white/70" : "text-slate/80"}`}>
                {products ? count : "–"}
              </span>
            </button>
          );
        })}
      </div>
    );

  let content: ReactNode;
  if (loadError) {
    content = (
      <EmptyState
        icon={TriangleAlert}
        title="Couldn't load products"
        actions={
          <Button onClick={() => load("initial")}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </Button>
        }
      >
        {loadError}
      </EmptyState>
    );
  } else if (products === null) {
    content = view === "grid" ? <ProductGridSkeleton /> : <ProductTableSkeleton />;
  } else if (products.length === 0) {
    content = (
      <EmptyState
        icon={Inbox}
        title="No products yet"
        actions={
          <Link href={NEW_PRODUCT_ROUTE} className={buttonClass("primary")}>
            <Plus className="h-4 w-4" aria-hidden />
            Add product
          </Link>
        }
      >
        Add your first product: upload a photo and its name, category and details are filled in for you.
      </EmptyState>
    );
  } else if (visible.length === 0) {
    content = (
      <EmptyState
        icon={SearchX}
        title="No matching products"
        actions={hasFilters && <Button onClick={clearFilters}>Clear filters</Button>}
      >
        Try a different search term or remove some filters.
      </EmptyState>
    );
  } else {
    const ProductView = view === "grid" ? ProductGrid : ProductTable;
    content = (
      <>
        <ProductView
          products={visible.slice(0, shownCount)}
          onEdit={setEditing}
          onDelete={askDelete}
          onToggleActive={handleToggleActive}
          togglingId={togglingId}
        />
        {shownCount < visible.length && <LoadMore shown={shownCount} total={visible.length} onVisible={showMore} />}
      </>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:gap-4">
      {/* Title and actions: from sm up. Phones have a single row instead (the sticky bar
          below), so the title is kept only for screen readers there. */}
      <header className="admin-fade-in sr-only sm:not-sr-only sm:flex sm:items-end sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h1 className="text-[1.5rem] font-bold leading-tight tracking-[-0.025em] text-ink">Products</h1>
          <p className="mt-0.5 text-sm text-slate">
            {products ? (
              <>
                {usageLabel(limit)} · {counts.published} published
              </>
            ) : (
              "Your catalog's products"
            )}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <Button variant="share" onClick={() => setSharing(true)} disabled={products === null}>
            <Share2 className="h-4 w-4" aria-hidden />
            Share
          </Button>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View live catalog"
            className={buttonClass("secondary")}
          >
            View live
            <ArrowUpRight className="h-4 w-4 text-slate" aria-hidden />
          </a>
          <Link href={NEW_PRODUCT_ROUTE} className={buttonClass("primary")}>
            <Plus className="h-4 w-4" aria-hidden />
            Add product
          </Link>
        </div>
      </header>

      {products && <ProductLimitNotice state={limit} storeName={store.name} compact />}

      {/* Search & filters: stick under the top bar while scrolling. On phones this is the
          page's only row: search, Filters (opens the sheet), Share and View live. Add product
          is the raised button in the bottom tab bar. */}
      <div className="sticky top-14 z-20 -mx-3 flex flex-col gap-2 bg-paper/95 px-2 py-2 backdrop-blur sm:-mx-4 sm:gap-2.5 sm:px-4 lg:top-16 lg:-mx-5 lg:px-5">
        <div className="flex gap-1.5 sm:gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate/60" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              enterKeyHint="search"
              className={`h-11 w-full rounded-md border border-line bg-white pl-11 text-base ${query ? "pr-10" : "pr-3"} text-ink transition-[border-color,box-shadow] placeholder:text-slate/55 focus:border-primary focus:outline-none focus-visible:outline-none! focus:ring-[3px] focus:ring-primary/15 [&::-webkit-search-cancel-button]:hidden`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-0.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-md text-slate hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </label>

          {/* Phones only: the rest of the controls as 44px icon buttons */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            onPointerDown={ripple}
            aria-label={sheetFilterCount ? `Filters, ${sheetFilterCount} on` : "Filters"}
            aria-haspopup="dialog"
            className={`relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md border bg-white transition-colors sm:hidden ${
              sheetFilterCount ? "border-ink text-ink" : "border-line text-ink"
            }`}
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden />
            {sheetFilterCount > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
                {sheetFilterCount}
              </span>
            )}
          </button>
          <Button
            variant="share"
            size="icon"
            onClick={() => setSharing(true)}
            disabled={products === null}
            aria-label="Share catalog"
            className="h-11 w-11 sm:hidden"
          >
            <Share2 className="h-[18px] w-[18px]" aria-hidden />
          </Button>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View live catalog"
            onPointerDown={ripple}
            className={buttonClass("secondary", "icon", "h-11 w-11 sm:hidden")}
          >
            <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden />
          </a>

          <div role="group" aria-label="Layout" className="hidden h-11 shrink-0 items-center gap-0.5 rounded-md border border-line bg-white p-1 sm:flex">
            {VIEW_OPTIONS.map(({ key, label, icon: Icon }) => {
              const selected = view === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => changeView(key)}
                  aria-pressed={selected}
                  aria-label={label}
                  title={label}
                  className={`grid h-8 w-9 place-items-center rounded-[4px] transition-colors ${
                    selected ? "bg-ink text-white" : "text-slate hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </button>
              );
            })}
          </div>
          <Button
            onClick={() => load("refresh")}
            disabled={products === null || refreshing}
            size="icon"
            aria-label="Refresh"
            title="Refresh"
            className="hidden h-11 w-11 sm:inline-flex"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
          </Button>
        </div>

        {statusTabs("hidden grid-cols-3 gap-1 rounded-md bg-ink/[0.05] p-1 sm:inline-grid sm:self-start")}
        {categoryChips(
          "-mx-4 hidden gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:flex lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden",
        )}
      </div>

      {/* Phones: 8px from the screen edge (the shell pads 12px), no shadow, and in grid view no
          panel at all, so the cards sit straight on the page. */}
      <Card
        className={`relative overflow-hidden max-sm:-mx-1 max-sm:shadow-none! ${
          view === "grid" ? "max-sm:rounded-none! max-sm:border-0! max-sm:bg-transparent!" : ""
        }`}
      >
        {refreshing &&<div className="admin-progress absolute inset-x-0 top-0 z-10" role="progressbar" aria-label="Loading" />}
        {content}
        {products && products.length > 0 && visible.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2.5 text-[13px] text-slate sm:px-4 sm:py-3">
            <span>
              Showing <span className="font-semibold text-ink">{shownCount}</span> of{" "}
              <span className="font-semibold text-ink">{visible.length}</span>
              {visible.length === products.length ? "" : ` (${products.length} in total)`}
            </span>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="font-semibold text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>
        )}
      </Card>

      {editing !== undefined && (
        <ProductFormDrawer
          key={editing.id}
          product={editing}
          onClose={() => setEditing(undefined)}
          onSave={handleSave}
          onDelete={askDelete}
          onImagesSaved={replaceProduct}
          products={products ?? []}
        />
      )}

      {filtersOpen && (
        <FilterSheet
          onClose={() => setFiltersOpen(false)}
          onRefresh={() => load("refresh")}
          refreshing={refreshing}
          onClear={() => {
            setCategory(DEFAULT_CATEGORY);
            setStatus("all");
          }}
          canClear={sheetFilterCount > 0}
          resultCount={visible.length}
        >
          <section>
            <SheetLabel>Status</SheetLabel>
            {statusTabs("grid grid-cols-3 gap-1 rounded-md bg-ink/[0.05] p-1")}
          </section>
          {categoryNames.length > 0 && (
            <section>
              <SheetLabel>Category</SheetLabel>
              {categoryChips("flex flex-wrap gap-1.5")}
            </section>
          )}
          <section>
            <SheetLabel>Layout</SheetLabel>
            <div role="group" aria-label="Layout" className="grid grid-cols-2 gap-2">
              {VIEW_OPTIONS.map(({ key, label, icon: Icon }) => {
                const selected = view === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => changeView(key)}
                    onPointerDown={ripple}
                    aria-pressed={selected}
                    className={`relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-md border text-[13px] font-semibold transition-colors ${
                      selected ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        </FilterSheet>
      )}

      {sharing && products && (
        <ShareCatalogDialog
          products={products}
          storeName={store.name}
          liveUrl={liveUrl}
          initialCategory={category === DEFAULT_CATEGORY ? undefined : category}
          onClose={() => setSharing(false)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete product?"
          confirmLabel="Delete product"
          busy={deleteBusy}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        >
          <span className="font-semibold text-ink">{deleting.productName || "This product"}</span> will be permanently
          removed. To take it off the catalog temporarily, hide it instead.
        </ConfirmDialog>
      )}

      {toast && (
        <div
          key={toast.id}
          role="status"
          className="admin-pop-in fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[120] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-lg border border-line lg:bottom-6 bg-white py-3 pl-3.5 pr-4 text-sm font-medium text-ink shadow-[0_12px_32px_-12px_rgba(1,18,60,0.3)] sm:right-6"
        >
          {toast.tone === "ok" ? (
            <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          ) : (
            <TriangleAlert className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
          )}
          {toast.text}
        </div>
      )}
    </div>
  );
}
