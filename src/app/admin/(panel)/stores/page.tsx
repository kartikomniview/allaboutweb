"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CircleCheck, RefreshCw, Search, ShieldAlert, TriangleAlert, X } from "lucide-react";
import { useAdminUser } from "@/components/admin/AdminShell";
import ConfirmDialog from "@/components/admin/ecatalog/ConfirmDialog";
import { Badge, Button, Card, Skeleton } from "@/components/admin/ui";
import { AuthError } from "@/lib/adminAuth";
import { listAllStores, updateStoreAccess, type ManagedStore } from "@/lib/adminStores";
import { storeUrlFor } from "@/lib/catalogDomain";

type Filter = "all" | "active" | "inactive";
type Toast = { id: number; text: string; tone: "ok" | "error" };

const message = (err: unknown, fallback: string) => (err instanceof AuthError ? err.message : fallback);

// On/off switch, the same look as the product form's "Show in catalog now".
function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <label className={`flex min-h-11 shrink-0 cursor-pointer items-center gap-2 ${disabled ? "opacity-60" : ""}`}>
      <span className={`text-xs font-semibold ${checked ? "text-emerald-700" : "text-slate"}`}>{checked ? "Active" : "Off"}</span>
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-6 w-10 rounded-full bg-[#cfd4df] transition-colors peer-checked:bg-emerald-500 peer-focus-visible:ring-[3px] peer-focus-visible:ring-primary/25 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4"
      />
    </label>
  );
}

function StoreCard({
  store,
  onSaved,
  onToast,
  onAskDeactivate,
}: {
  store: ManagedStore;
  onSaved: (store: ManagedStore) => void;
  onToast: (text: string, tone?: Toast["tone"]) => void;
  onAskDeactivate: (store: ManagedStore) => void;
}) {
  const [limitText, setLimitText] = useState(store.productLimit === null ? "" : String(store.productLimit));
  const [unlimited, setUnlimited] = useState(store.productLimit === null);
  const [saving, setSaving] = useState<"limit" | "active" | null>(null);
  const link = storeUrlFor(store.slug, window.location);

  const nextLimit = unlimited ? null : limitText.trim() === "" ? NaN : Number(limitText);
  const limitChanged = nextLimit !== store.productLimit;
  const limitValid = nextLimit === null || (Number.isInteger(nextLimit) && nextLimit >= 0 && nextLimit <= 10000);

  const used = store.productLimit ? Math.min(store.productCount / store.productLimit, 1) : 0;
  const full = store.productLimit !== null && store.productCount >= store.productLimit;

  async function saveLimit() {
    if (!limitValid) return onToast("Enter a whole number from 0 to 10000, or tick Unlimited.", "error");
    setSaving("limit");
    try {
      const saved = await updateStoreAccess(store.slug, { productLimit: nextLimit });
      onSaved(saved);
      onToast(`${saved.name}: limit ${saved.productLimit === null ? "removed" : `set to ${saved.productLimit}`}`);
    } catch (err) {
      onToast(message(err, "Couldn't save the limit."), "error");
    } finally {
      setSaving(null);
    }
  }

  async function activate() {
    setSaving("active");
    try {
      const saved = await updateStoreAccess(store.slug, { active: true });
      onSaved(saved);
      onToast(`${saved.name} is active again`);
    } catch (err) {
      onToast(message(err, "Couldn't update the store."), "error");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Card className={`overflow-hidden ${store.active ? "" : "bg-paper/60"}`}>
      <div className="flex items-start gap-3 p-4 pb-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-md text-sm font-bold uppercase ${
            store.active ? "bg-tint text-primary" : "bg-ink/[0.06] text-slate"
          }`}
          aria-hidden
        >
          {store.name.charAt(0) || "S"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-semibold text-ink">{store.name}</p>
            {!store.active && <Badge tone="danger">Inactive</Badge>}
          </div>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1 truncate text-[13px] font-medium text-primary hover:underline"
          >
            <span className="truncate">{link.replace(/^https?:\/\//, "")}</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </a>
          {store.email && <p className="truncate text-xs text-slate">{store.email}</p>}
        </div>
        <Switch
          checked={store.active}
          disabled={saving !== null}
          label={`${store.name} active`}
          onChange={(next) => (next ? activate() : onAskDeactivate(store))}
        />
      </div>

      {/* Products used */}
      <div className="px-4 pb-3">
        <div className="flex items-baseline justify-between gap-3 text-xs">
          <span className="font-medium text-slate">Products</span>
          <span className={`font-semibold tabular-nums ${full ? "text-red-600" : "text-ink"}`}>
            {store.productCount}
            {store.productLimit === null ? " · unlimited" : ` of ${store.productLimit}`}
          </span>
        </div>
        {store.productLimit !== null && (
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${full ? "bg-red-500" : used >= 0.8 ? "bg-amber-500" : "bg-primary"}`}
              style={{ width: `${used * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Limit editor */}
      <div className="flex flex-wrap items-center gap-2.5 border-t border-line px-4 py-3">
        <label className="flex items-center gap-2 text-[13px] font-medium text-ink">
          Limit
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={10000}
            value={unlimited ? "" : limitText}
            disabled={unlimited}
            onChange={(e) => setLimitText(e.target.value)}
            placeholder={unlimited ? "∞" : "20"}
            aria-invalid={!limitValid}
            className="h-10 w-20 rounded-md border border-line bg-white px-2.5 text-base tabular-nums text-ink focus:border-primary focus:outline-none focus-visible:outline-none! focus:ring-[3px] focus:ring-primary/15 disabled:bg-paper aria-[invalid=true]:border-red-500 sm:text-sm"
          />
        </label>
        <label className="flex min-h-10 cursor-pointer select-none items-center gap-2 text-[13px] text-ink/80">
          <input
            type="checkbox"
            checked={unlimited}
            onChange={(e) => setUnlimited(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded-sm accent-primary"
          />
          Unlimited
        </label>
        <Button
          variant="primary"
          size="sm"
          className="ml-auto h-10 px-4"
          disabled={!limitChanged || saving !== null}
          loading={saving === "limit"}
          onClick={saveLimit}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}

// Super admins: every store, its product limit and an on/off switch.
export default function AllStoresPage() {
  const user = useAdminUser();
  const [stores, setStores] = useState<ManagedStore[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [deactivating, setDeactivating] = useState<ManagedStore | null>(null);
  const [deactivateBusy, setDeactivateBusy] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((text: string, tone: Toast["tone"] = "ok") => setToast({ id: Date.now(), text, tone }), []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const load = useCallback(async () => {
    setLoadError(null);
    setRefreshing(true);
    try {
      setStores(await listAllStores());
    } catch (err) {
      setLoadError(message(err, "Couldn't load the stores."));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!user.isSuperAdmin) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    load();
  }, [load, user.isSuperAdmin]);

  const replace = (saved: ManagedStore) => setStores((list) => (list ?? []).map((s) => (s.slug === saved.slug ? saved : s)));

  async function deactivate() {
    if (!deactivating) return;
    setDeactivateBusy(true);
    setDeactivateError(null);
    try {
      const saved = await updateStoreAccess(deactivating.slug, { active: false });
      replace(saved);
      setDeactivating(null);
      showToast(`${saved.name} is switched off`);
    } catch (err) {
      setDeactivateError(message(err, "Couldn't switch the store off."));
    } finally {
      setDeactivateBusy(false);
    }
  }

  const counts = useMemo(() => {
    const list = stores ?? [];
    const active = list.filter((s) => s.active).length;
    return { all: list.length, active, inactive: list.length - active };
  }, [stores]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (stores ?? []).filter((s) => {
      if (filter === "active" && !s.active) return false;
      if (filter === "inactive" && s.active) return false;
      return !q || `${s.name} ${s.slug} ${s.email}`.toLowerCase().includes(q);
    });
  }, [stores, query, filter]);

  if (!user.isSuperAdmin) {
    return (
      <Card className="mx-auto mt-6 flex max-w-sm flex-col items-center gap-3 p-6 text-center">
        <ShieldAlert className="h-6 w-6 text-slate" aria-hidden />
        <p className="text-sm font-semibold text-ink">Not available</p>
        <p className="text-xs text-slate">This page is only for Catalog24 admins.</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <header className="admin-fade-in flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[1.5rem] font-bold leading-tight tracking-[-0.025em] text-ink">All stores</h1>
          <p className="mt-0.5 text-sm text-slate">
            {stores ? `${counts.all} stores · ${counts.active} active · ${counts.inactive} off` : "Product limits and on/off for every store"}
          </p>
        </div>
        <Button size="icon" onClick={load} disabled={refreshing} aria-label="Refresh" title="Refresh" className="h-11 w-11">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
        </Button>
      </header>

      <div className="sticky top-14 z-20 -mx-3 flex flex-col gap-2.5 bg-paper/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:flex-row sm:px-4 lg:top-16 lg:-mx-5 lg:px-5">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search stores</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate/60" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, link or email"
            enterKeyHint="search"
            className="h-11 w-full rounded-md border border-line bg-white pl-11 pr-10 text-base text-ink placeholder:text-slate/55 focus:border-primary focus:outline-none focus-visible:outline-none! focus:ring-[3px] focus:ring-primary/15 [&::-webkit-search-cancel-button]:hidden"
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
        <div role="tablist" aria-label="Filter stores" className="grid shrink-0 grid-cols-3 gap-1 rounded-md bg-ink/[0.05] p-1">
          {(["all", "active", "inactive"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-[4px] px-3 text-[13px] font-semibold capitalize transition-colors ${
                filter === key ? "bg-white text-ink shadow-[0_1px_2px_rgba(1,18,60,0.12)]" : "text-slate hover:text-ink"
              }`}
            >
              {key === "inactive" ? "Off" : key}
              <span className={`text-[11px] tabular-nums ${filter === key ? "text-primary" : "text-slate/80"}`}>
                {stores ? counts[key] : "–"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loadError ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <TriangleAlert className="h-6 w-6 text-red-600" aria-hidden />
          <p className="text-sm text-slate">{loadError}</p>
          <Button onClick={load}>Try again</Button>
        </Card>
      ) : stores === null ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <Skeleton className="h-1.5 w-full" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate">No stores match.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {visible.map((store) => (
            <StoreCard
              key={`${store.slug}-${store.productLimit}`}
              store={store}
              onSaved={replace}
              onToast={showToast}
              onAskDeactivate={(s) => {
                setDeactivateError(null);
                setDeactivating(s);
              }}
            />
          ))}
        </div>
      )}

      {deactivating && (
        <ConfirmDialog
          title={`Switch off ${deactivating.name}?`}
          confirmLabel="Switch off"
          busy={deactivateBusy}
          error={deactivateError}
          onConfirm={deactivate}
          onCancel={() => setDeactivating(null)}
        >
          Its owner is logged out and can&apos;t log in, and its catalog link shows &ldquo;Store unavailable&rdquo;. Nothing is
          deleted: switch it back on any time.
        </ConfirmDialog>
      )}

      {toast && (
        <div
          key={toast.id}
          role="status"
          className="admin-pop-in fixed bottom-4 right-4 z-[120] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-lg border border-line bg-white py-3 pl-3.5 pr-4 text-sm font-medium text-ink shadow-[0_12px_32px_-12px_rgba(1,18,60,0.3)] sm:bottom-6 sm:right-6"
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
