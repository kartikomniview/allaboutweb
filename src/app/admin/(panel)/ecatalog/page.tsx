"use client";

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
  TriangleAlert,
  Upload,
} from "lucide-react";
import { LIVE_CATALOG_PATH } from "@/components/admin/AdminShell";
import ConfirmDialog from "@/components/admin/ecatalog/ConfirmDialog";
import ProductFormDrawer from "@/components/admin/ecatalog/ProductFormDrawer";
import ProductTable, {
  ProductGrid,
  ProductGridSkeleton,
  ProductTableSkeleton,
} from "@/components/admin/ecatalog/ProductTable";
import { Button, Card, PageHeader, buttonClass } from "@/components/admin/ui";
import {
  CATALOG_CATEGORIES,
  CATEGORY_TAB_LABELS,
  PRODUCTS,
  type MainCategory,
} from "@/components/furniture-catalog/data";
import { AuthError } from "@/lib/adminAuth";
import {
  createProduct,
  deleteProduct,
  importProducts,
  listProducts,
  productToInput,
  sortProducts,
  updateProduct,
  type Product,
  type ProductInput,
} from "@/lib/adminProducts";

type StatusFilter = "all" | "published" | "hidden";
type Toast = { id: number; text: string; tone: "ok" | "error" };

// Rows rendered at a time; the next batch appears as the admin scrolls.
const PAGE_SIZE = 20;

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
      <span className="grid h-12 w-12 place-items-center rounded-full bg-paper text-slate ring-1 ring-line">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h2 className="mt-4 text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate">{children}</p>
      {actions && <div className="mt-6 flex flex-col gap-2 sm:flex-row">{actions}</div>}
    </div>
  );
}

export default function ManageEcatalogPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("all");
  // The page only renders in the browser (after the session check), so storage is available here.
  const [view, setView] = useState<ViewMode>(readViewMode);

  function changeView(next: ViewMode) {
    setView(next);
    saveViewMode(next);
  }

  // undefined = closed, null = new product, Product = editing
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

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

  // First load shows the skeleton; later refreshes keep the table and show a progress bar.
  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      setLoadError(null);
      if (mode === "initial") setProducts(null);
      else setRefreshing(true);
      try {
        setProducts(await listProducts());
      } catch (err) {
        const message = errorMessage(err, "We couldn't load your products.");
        if (mode === "initial") setLoadError(message);
        else showToast(message, "error");
      } finally {
        setRefreshing(false);
      }
    },
    [errorMessage, showToast],
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
        p.tags.some((t) => t.toLowerCase().includes(q))
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

  const categoryNames = useMemo(() => {
    const names = new Set(CATALOG_CATEGORIES.map((c) => c.name as string));
    products?.forEach((p) => p.categoryName && names.add(p.categoryName));
    return [...names];
  }, [products]);

  const replaceProduct = (saved: Product) =>
    setProducts((list) => sortProducts([...(list ?? []).filter((p) => p.id !== saved.id), saved]));

  async function handleSave(input: ProductInput) {
    const target = editing;
    const saved = target ? await updateProduct(target.id, input) : await createProduct(input);
    replaceProduct(saved);
    setEditing(undefined);
    showToast(target ? `Saved “${saved.productName}”` : `Created “${saved.productName}”`);
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

  async function handleImport() {
    setImporting(true);
    try {
      const { created, skipped } = await importProducts(PRODUCTS);
      setProducts(await listProducts());
      showToast(`Imported ${created} product${created === 1 ? "" : "s"}${skipped ? ` · ${skipped} already existed` : ""}`);
    } catch (err) {
      showToast(errorMessage(err, "Could not import products."), "error");
    } finally {
      setImporting(false);
    }
  }

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setStatus("all");
  }

  const hasFilters = query.trim() !== "" || category !== "All" || status !== "all";
  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "hidden", label: "Hidden" },
  ];

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
          <>
            <Button variant="primary" onClick={handleImport} loading={importing}>
              {!importing && <Upload className="h-4 w-4" aria-hidden />}
              {importing ? "Importing…" : `Import ${PRODUCTS.length} starter products`}
            </Button>
            <Button onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4" aria-hidden />
              Add product
            </Button>
          </>
        }
      >
        Start with the {PRODUCTS.length} products currently shown in the e-catalog, or create your first product from
        scratch.
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
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "E-Catalog" }]}
        title="E-Catalog"
        description="Manage the products, prices and details shown in your furniture e-catalog."
        actions={
          <>
            <a href={LIVE_CATALOG_PATH} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>
              View live
              <ArrowUpRight className="h-4 w-4 text-slate" aria-hidden />
            </a>
            <Button variant="primary" onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4" aria-hidden />
              Add product
            </Button>
          </>
        }
      />

      <Card className="relative overflow-hidden">
        {(refreshing || importing) && <div className="admin-progress absolute inset-x-0 top-0 z-10" role="progressbar" aria-label="Loading" />}

        {/* Status tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-line px-3 sm:px-4" role="tablist" aria-label="Filter by status">
          {tabs.map(({ key, label }) => {
            const selected = status === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setStatus(key)}
                className={`relative inline-flex h-12 shrink-0 items-center gap-2 px-3 text-sm font-semibold transition-colors ${
                  selected ? "text-ink" : "text-slate hover:text-ink"
                }`}
              >
                {label}
                <span
                  className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums ${
                    selected ? "bg-ink text-white" : "bg-ink/[0.06] text-slate"
                  }`}
                >
                  {products ? counts[key] : "–"}
                </span>
                {selected && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" aria-hidden />}
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 pb-2 sm:p-4 sm:pb-2.5">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate/70" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, subcategory or tag…"
              className="h-10 w-full rounded-btn border border-line bg-white pl-9 pr-3 text-base text-ink shadow-[0_1px_1px_rgba(1,18,60,0.03)] placeholder:text-slate/60 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 sm:text-sm"
            />
          </label>
          <div className="flex shrink-0 gap-2">
            <div
              role="group"
              aria-label="Layout"
              className="flex h-10 shrink-0 items-center gap-0.5 rounded-btn bg-ink/[0.05] p-1"
            >
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
                    className={`grid h-8 w-8 place-items-center rounded-[6px] transition-colors ${
                      selected
                        ? "bg-white text-ink shadow-[0_1px_2px_rgba(1,18,60,0.12)]"
                        : "text-slate hover:text-ink"
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
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
            </Button>
          </div>
        </div>

        {/* Category chips (counts follow the status tab and search) */}
        <div
          role="group"
          aria-label="Filter by category"
          className="flex gap-1.5 overflow-x-auto border-b border-line px-3 pb-3 [scrollbar-width:none] sm:flex-wrap sm:px-4 sm:pb-4 [&::-webkit-scrollbar]:hidden"
        >
          {[{ name: "All", label: "All", count: matching.length }, ...categoryNames.map((name) => ({
            name,
            label: CATEGORY_TAB_LABELS[name as MainCategory] ?? name,
            count: categoryCounts.get(name) ?? 0,
          }))].map(({ name, label, count }) => {
            const selected = category === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                aria-pressed={selected}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold whitespace-nowrap ring-1 ring-inset transition-colors ${
                  selected
                    ? "bg-ink text-white ring-ink"
                    : count === 0
                      ? "bg-white text-slate/60 ring-line hover:text-slate"
                      : "bg-white text-ink ring-line hover:bg-paper"
                }`}
              >
                {label}
                <span
                  className={`min-w-5 rounded-full px-1.5 text-center text-[11px] tabular-nums ${
                    selected ? "bg-white/20 text-white" : "bg-ink/[0.06] text-slate"
                  }`}
                >
                  {products ? count : "–"}
                </span>
              </button>
            );
          })}
        </div>

        {content}

        {products && products.length > 0 && visible.length > 0 && (
          <div className="flex items-center justify-between border-t border-line bg-paper/50 px-4 py-3 text-[13px] text-slate sm:px-5">
            <span>
              Showing <span className="font-semibold text-ink">{shownCount}</span> of{" "}
              <span className="font-semibold text-ink">{visible.length}</span>
              {visible.length === products.length ? " products" : ` matching products (${products.length} in total)`}
            </span>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="font-semibold text-primary hover:text-[#c4501a]">
                Clear filters
              </button>
            )}
          </div>
        )}
      </Card>

      {editing !== undefined && (
        <ProductFormDrawer
          key={editing?.id ?? "new"}
          product={editing}
          onClose={() => setEditing(undefined)}
          onSave={handleSave}
          onDelete={askDelete}
          onImagesSaved={replaceProduct}
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
          className="admin-pop-in fixed bottom-4 right-4 z-[120] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-card border border-line bg-white py-3 pl-3.5 pr-4 text-sm font-medium text-ink shadow-[0_12px_32px_-12px_rgba(1,18,60,0.3)] sm:bottom-6 sm:right-6"
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
