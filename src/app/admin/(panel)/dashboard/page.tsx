"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  MessageCircle,
  Package,
  Plus,
  Share2,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useAdminUser, useLiveCatalogUrl } from "@/components/admin/AdminShell";
import { ProductThumb } from "@/components/admin/ecatalog/ProductTable";
import ShareCatalogDialog from "@/components/admin/ecatalog/ShareCatalogDialog";
import StoreLogoPicker, { StoreLogo } from "@/components/admin/StoreLogoPicker";
import { ripple } from "@/components/admin/ripple";
import { ProductLimitNotice, limitState } from "@/components/admin/ProductLimit";
import { Badge, Card, Skeleton, buttonClass } from "@/components/admin/ui";
import { formatPrice } from "@/components/furniture-catalog/data";
import { discardUploads, listProducts, type Product } from "@/lib/adminProducts";
import { getOwnStore, toStoreInput, updateOwnStore, type StoreDetails } from "@/lib/adminStore";
import { categoryLabel } from "@/lib/taxonomy";

// Remembers (in this browser) that the owner has shared their catalog link.
const sharedKey = (slug: string) => `c24_shared_${slug}`;
function readShared(slug: string) {
  try {
    return localStorage.getItem(sharedKey(slug)) === "1";
  } catch {
    return false;
  }
}
function saveShared(slug: string) {
  try {
    localStorage.setItem(sharedKey(slug), "1");
  } catch {
    // Storage unavailable (private mode): the checklist just shows it again.
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function Stat({
  label,
  value,
  icon: Icon,
  href,
  of,
}: {
  label: string;
  value: number | null;
  icon: LucideIcon;
  href: string;
  /** The limit the value counts towards ("12 / 20"). */
  of?: number | null;
}) {
  const full = of != null && value !== null && value >= of;
  const near = of != null && value !== null && !full && value / of >= 0.8;
  return (
    <>
    {/* Phones: a small chip, "12/20 Products" */}
    <Link
      href={href}
      onPointerDown={ripple}
      className="relative inline-flex h-9 shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border border-line bg-white pl-2.5 pr-3 text-[13px] transition-colors active:scale-[0.97] sm:hidden"
    >
      <Icon className="h-3.5 w-3.5 text-slate" aria-hidden />
      {value === null ? (
        <Skeleton className="h-4 w-6" />
      ) : (
        <span className={`font-bold tabular-nums ${full ? "text-red-600" : near ? "text-amber-700" : "text-ink"}`}>
          {value}
          {of != null && <span className="font-semibold text-slate">/{of}</span>}
        </span>
      )}
      <span className="font-medium text-slate">{label}</span>
    </Link>

    {/* Larger screens: a card */}
    <Link
      href={href}
      onPointerDown={ripple}
      className="relative hidden flex-col gap-2 overflow-hidden rounded-lg border border-line bg-white p-4 transition-colors hover:bg-paper/60 active:scale-[0.98] sm:flex"
    >
      <Icon className="h-4 w-4 text-slate" aria-hidden />
      <span className="text-2xl font-bold tabular-nums tracking-[-0.02em] text-ink">
        {value === null ? (
          <Skeleton className="h-7 w-10" />
        ) : (
          <>
            {value}
            {of != null && <span className="text-sm font-semibold text-slate"> / {of}</span>}
          </>
        )}
      </span>
      {of != null && value !== null && (
        <span className="h-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <span
            className={`block h-full rounded-full ${value >= of ? "bg-red-500" : value / of >= 0.8 ? "bg-amber-500" : "bg-primary"}`}
            style={{ width: `${Math.min(value / Math.max(of, 1), 1) * 100}%` }}
          />
        </span>
      )}
      <span className="text-xs font-medium text-slate">{label}</span>
    </Link>
    </>
  );
}

type Task = {
  id: string;
  title: string;
  text: string;
  /** Phones: the tile's icon and one-word label. */
  icon: LucideIcon;
  short: string;
  done: boolean;
  href?: string;
  action?: () => void;
  cta: string;
};

export default function AdminDashboardPage() {
  const user = useAdminUser();
  const liveUrl = useLiveCatalogUrl();
  const { slug, name: storeName } = user.store;
  const link = liveUrl.replace(/^https?:\/\//, "");

  const [products, setProducts] = useState<Product[] | null>(null);
  const [productsError, setProductsError] = useState(false);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  // The store's saved details, for saving a new logo straight from the dashboard.
  const [details, setDetails] = useState<StoreDetails | null>(null);
  const [shared, setShared] = useState(() => readShared(slug));
  const [copied, setCopied] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  // The share panel (the same one as on the products page). Opens once the products are in.
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .catch(() => setProductsError(true));
    getOwnStore()
      .then((s) => {
        setDetails(s);
        setWhatsapp(s.whatsapp);
      })
      .catch(() => setWhatsapp(""));
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  // A new logo (or none) is saved right away. If saving fails, the uploaded file is deleted again.
  async function saveLogo(url: string) {
    if (!details) return;
    try {
      setDetails(await updateOwnStore({ ...toStoreInput(details), logo: url }));
    } catch (err) {
      if (url) discardUploads([url]).catch(() => {});
      throw err;
    }
  }

  const markShared = () => {
    saveShared(slug);
    setShared(true);
  };

  async function copyLink() {
    if (await copyText(liveUrl)) {
      setCopied(true);
      markShared();
    }
  }

  // The share panel: the whole catalog, a category, a subcategory or chosen products.
  // If the products couldn't be loaded, share the plain catalog link instead.
  async function shareLink() {
    if (!productsError) {
      setSharing(true);
      return;
    }
    const text = `Browse ${storeName}'s catalog and enquire on WhatsApp:`;
    if (navigator.share) {
      try {
        await navigator.share({ title: storeName, text, url: liveUrl });
        markShared();
      } catch {
        // Share sheet closed.
      }
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${liveUrl}`)}`, "_blank", "noopener,noreferrer");
    markShared();
  }

  const total = products?.length ?? null;
  const published = products ? products.filter((p) => p.isActive).length : null;
  const hidden = total !== null && published !== null ? total - published : null;
  const recent = products
    ? [...products].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")).slice(0, 5)
    : null;

  // Getting the store ready. Shown until everything is done.
  const tasks: Task[] = [
    {
      id: "product",
      title: "Add your first product",
      text: "Take a photo and AI fills in the details.",
      icon: Plus,
      short: "Product",
      done: (total ?? 0) > 0,
      href: "/admin/ecatalog/new",
      cta: "Add",
    },
    {
      id: "whatsapp",
      title: "Add your WhatsApp number",
      text: "Customer enquiries from your catalog go there.",
      icon: MessageCircle,
      short: "WhatsApp",
      done: !!whatsapp,
      href: "/admin/settings",
      cta: "Add",
    },
    {
      id: "publish",
      title: "Publish a product",
      text: "Published products show in your catalog.",
      icon: Eye,
      short: "Publish",
      done: (published ?? 0) > 0,
      href: "/admin/ecatalog",
      cta: "Open",
    },
    {
      id: "share",
      title: "Share your catalog link",
      text: "Send it to customers on WhatsApp or post it.",
      icon: Share2,
      short: "Share",
      done: shared,
      action: shareLink,
      cta: "Share",
    },
  ];
  const tasksLoaded = products !== null && whatsapp !== null;
  const doneCount = tasks.filter((t) => t.done).length;
  const showTasks = tasksLoaded && doneCount < tasks.length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:gap-5 pb-2">
      {/* Greeting */}
      <header className="admin-fade-in flex items-end justify-between gap-4">
        <div className="min-w-0">
          {/* Smaller on phones, where the top bar already shows the store name. */}
          <p className="text-xs text-slate sm:text-sm">Welcome back</p>
          <h1 className="truncate text-lg font-bold leading-tight tracking-[-0.02em] text-ink sm:text-[1.5rem] sm:tracking-[-0.025em]">
            {storeName}
          </h1>
        </div>
        <Link href="/admin/ecatalog/new" className={`${buttonClass("primary")} hidden lg:inline-flex`}>
          <Plus className="h-4 w-4" aria-hidden />
          Add product
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Side column on desktop, first on phones: link + stats */}
        <div className="flex flex-col gap-3 sm:gap-5 lg:order-2">
          {/* Catalog link, with copy / share / open */}
          <Card className="admin-pop-in overflow-hidden">
            <div className="flex items-center gap-3 p-3 sm:p-4">
              {details ? (
                <>
                  {/* Phones: the thumbnail is the logo picker (no separate logo card). */}
                  <span className="sm:hidden">
                    <StoreLogoPicker
                      layout="thumb"
                      className="h-9 w-9"
                      logo={details.logo}
                      storeName={details.name}
                      onChange={saveLogo}
                      onError={setLogoError}
                    />
                  </span>
                  <span className="hidden sm:block">
                    <StoreLogo logo={details.logo} name={details.name} className="h-10 w-10 text-base" />
                  </span>
                </>
              ) : (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-tint text-primary sm:h-10 sm:w-10">
                  <Store className="h-5 w-5" aria-hidden />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate sm:text-xs">Catalog link</p>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm font-semibold text-ink hover:text-primary sm:text-[15px]"
                >
                  {link}
                </a>
              </div>
            </div>
            {logoError && (
              <p role="alert" className="admin-fade-in -mt-1 px-3 pb-2.5 text-[13px] font-medium text-red-600 sm:hidden">
                {logoError}
              </p>
            )}
            <div className="grid grid-cols-3 border-t border-line">
              {[
                {
                  label: copied ? "Copied" : "Copy",
                  icon: copied ? Check : Copy,
                  onClick: copyLink,
                  tone: copied ? "text-emerald-700 hover:bg-paper/70" : "text-ink hover:bg-paper/70",
                },
                { label: "Share", icon: Share2, onClick: shareLink, tone: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100" },
                {
                  label: "Open",
                  icon: ArrowUpRight,
                  onClick: () => window.open(liveUrl, "_blank", "noopener,noreferrer"),
                  tone: "text-ink hover:bg-paper/70",
                },
              ].map(({ label, icon: Icon, onClick, tone }, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={onClick}
                  onPointerDown={ripple}
                  className={`relative flex h-11 items-center justify-center gap-1.5 overflow-hidden text-[13px] font-semibold transition-colors sm:h-12 ${tone} ${
                    i > 0 ? "border-l border-line" : ""
                  }`}
                >
                  <Icon className={`h-4 w-4 ${label === "Copied" ? "admin-pop-check" : ""}`} aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </Card>

          {/* Store logo: its own card (a prominent upload row until there's a logo).
              Not on phones, where the link card's thumbnail handles it. */}
          {details && (
            <Card className="admin-pop-in hidden overflow-hidden sm:block">
              <StoreLogoPicker layout="dashboard" logo={details.logo} storeName={details.name} onChange={saveLogo} />
            </Card>
          )}

          {/* Stats */}
          {/* Phones: one row of small chips, scrolling sideways if it doesn't fit. Larger screens: three cards. */}
          <section
            aria-label="Products"
            className="no-scrollbar flex gap-2 overflow-x-auto overscroll-x-contain sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible"
          >
            <Stat label="Products" value={total} icon={Package} href="/admin/ecatalog" of={user.store.productLimit} />
            <Stat label="Published" value={published} icon={Eye} href="/admin/ecatalog" />
            <Stat label="Hidden" value={hidden} icon={EyeOff} href="/admin/ecatalog" />
          </section>
          {productsError && <p className="-mt-2 text-xs text-slate">Product counts are unavailable right now.</p>}
          {total !== null && <ProductLimitNotice state={limitState(total, user.store.productLimit)} storeName={storeName} />}
        </div>

        {/* Main column */}
        <div className="flex flex-col gap-3 sm:gap-5 lg:order-1">
          {/* Getting started. Phones: a sideways-scrolling row of task cards (the next
              one peeks in). Larger screens: a list. */}
          {showTasks && (
            <Card className="admin-fade-in overflow-hidden">
              <div className="p-3.5 pb-3 sm:p-4 sm:pb-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-[15px] font-semibold text-ink">Get your store ready</h2>
                  <span className="text-xs font-medium tabular-nums text-slate">
                    {doneCount} of {tasks.length} done
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                    style={{ width: `${(doneCount / tasks.length) * 100}%` }}
                  />
                </div>
              </div>
              <ul className="grid grid-cols-4 gap-2 px-3.5 pb-3.5 sm:block sm:divide-y sm:divide-line sm:border-t sm:border-line sm:p-0">
                {tasks.map((task) => {
                  const Icon = task.icon;
                  const body = (
                    <>
                    {/* Phones: icon and one-word label */}
                    <span className="flex flex-col items-center gap-1 sm:hidden">
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full ${
                          task.done ? "admin-pop-check bg-emerald-500 text-white" : "bg-tint text-primary"
                        }`}
                        aria-hidden
                      >
                        {task.done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
                      </span>
                      <span className={`text-[11px] font-semibold leading-none ${task.done ? "text-slate" : "text-ink"}`}>
                        {task.short}
                      </span>
                    </span>
                    {/* Larger screens: the full row */}
                    <span className="hidden sm:contents">
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                          task.done ? "admin-pop-check bg-emerald-500 text-white" : "border-2 border-line"
                        }`}
                        aria-hidden
                      >
                        {task.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-semibold ${task.done ? "text-slate line-through" : "text-ink"}`}>
                          {task.title}
                        </span>
                        {!task.done && <span className="block text-xs text-slate">{task.text}</span>}
                      </span>
                      {!task.done && (
                        <span className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-primary">
                          {task.cta}
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        </span>
                      )}
                    </span>
                    </>
                  );
                  // Phones: a small square tile. Larger screens: a list row.
                  const rowClass =
                    "relative flex h-full w-full items-center justify-center overflow-hidden rounded-md border border-line py-2.5 transition-colors sm:min-h-14 sm:justify-start sm:gap-3 sm:rounded-none sm:border-0 sm:px-4 sm:text-left";
                  // The tile shows only a word, so screen readers get the full task.
                  const label = `${task.title}${task.done ? " (done)" : ""}`;
                  return (
                    <li key={task.id}>
                      {task.done ? (
                        <div className={rowClass} title={label}>
                          <span className="sr-only sm:hidden">{label}</span>
                          {body}
                        </div>
                      ) : task.href ? (
                        <Link href={task.href} onPointerDown={ripple} aria-label={label} title={task.title} className={`${rowClass} hover:bg-paper/60`}>
                          {body}
                        </Link>
                      ) : (
                        <button type="button" onClick={task.action} onPointerDown={ripple} aria-label={label} title={task.title} className={`${rowClass} hover:bg-paper/60`}>
                          {body}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {/* Recent products */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-3.5 sm:px-4 py-3">
              <h2 className="text-[15px] font-semibold text-ink">Recent products</h2>
              {!!recent?.length && (
                <Link href="/admin/ecatalog" className="text-[13px] font-semibold text-primary hover:underline">
                  View all
                </Link>
              )}
            </div>
            {recent === null && !productsError ? (
              <ul className="divide-y divide-line border-t border-line">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex items-center gap-3 px-3.5 sm:px-4 py-3">
                    <Skeleton className="h-11 w-11 rounded-md" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : recent && recent.length > 0 ? (
              <ul className="divide-y divide-line border-t border-line">
                {recent.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/ecatalog?edit=${encodeURIComponent(p.id)}`}
                      onPointerDown={ripple}
                      className="relative flex min-h-16 items-center gap-3 overflow-hidden px-3.5 sm:px-4 py-2.5 transition-colors hover:bg-paper/60"
                    >
                      <ProductThumb product={p} className="h-11 w-11" rounded="rounded-md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{p.productName}</span>
                        <span className="block truncate text-xs text-slate">
                          {categoryLabel(p.categoryName)} · {formatPrice(p.price)}
                        </span>
                      </span>
                      {!p.isActive && <Badge>Hidden</Badge>}
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate/60" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-3 border-t border-line px-6 py-10 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-paper text-slate">
                  <Package className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">No products yet</p>
                  <p className="mt-0.5 text-xs text-slate">Add your first product: it takes about a minute.</p>
                </div>
                <Link href="/admin/ecatalog/new" className={`${buttonClass("primary")} hidden lg:inline-flex`}>
                  <Plus className="h-4 w-4" aria-hidden />
                  Add product
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {sharing && products && (
        <ShareCatalogDialog
          products={products}
          storeName={storeName}
          liveUrl={liveUrl}
          onShared={markShared}
          onClose={() => setSharing(false)}
        />
      )}
    </div>
  );
}
