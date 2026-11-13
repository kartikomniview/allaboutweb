"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  TriangleAlert,
  UsersRound,
  X,
} from "lucide-react";
import { useAdminUser } from "@/components/admin/AdminShell";
import ConfirmDialog from "@/components/admin/ecatalog/ConfirmDialog";
import StoreUsersDialog from "@/components/admin/StoreUsersDialog";
import { Badge, Button, Card, Skeleton, buttonClass, formatRelative } from "@/components/admin/ui";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { AuthError } from "@/lib/adminAuth";
import { formatWhatsapp } from "@/lib/adminStore";
import { DEMO_STORE_SLUG, deleteStore, listAllStores, updateStoreAccess, type ManagedStore } from "@/lib/adminStores";
import { storeUrlFor } from "@/lib/catalogDomain";

type Filter = "all" | "active" | "inactive" | "requests";
type Toast = { id: number; text: string; tone: "ok" | "error" };

const message = (err: unknown, fallback: string) => (err instanceof AuthError ? err.message : fallback);

// Deleting a store with more products than this asks twice: a warning about its size
// first, then the usual "type the link name" confirmation.
const BIG_STORE_PRODUCTS = 50;

/** The store's owner asked for a WhatsApp number that's waiting for approval. */
const hasWhatsappRequest = (s: ManagedStore) => s.whatsappRequest?.status === "pending";

// Digits as the API stores them: a 10-digit Indian number gets 91 in front.
const toWhatsappDigits = (text: string) => {
  const d = text.replace(/\D/g, "").replace(/^0+/, "");
  return /^[6-9]\d{9}$/.test(d) ? `91${d}` : d;
};
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

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
      {/* Fixed width, so the columns line up whether it says Active or Off */}
      <span
        className={`hidden w-10 text-right text-xs font-semibold sm:inline-block ${checked ? "text-emerald-700" : "text-slate"}`}
      >
        {checked ? "Active" : "Off"}
      </span>
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

// "12 of 20" with a thin usage bar (none when unlimited).
function ProductUsage({ store, className = "" }: { store: ManagedStore; className?: string }) {
  const used = store.productLimit ? Math.min(store.productCount / store.productLimit, 1) : 0;
  const full = store.productLimit !== null && store.productCount >= store.productLimit;
  return (
    <div className={className}>
      <p className={`text-[13px] font-semibold tabular-nums ${full ? "text-red-600" : "text-ink"}`}>
        {store.productCount}
        <span className="font-medium text-slate">
          {store.productLimit === null ? " · unlimited" : ` of ${store.productLimit}`}
        </span>
      </p>
      {store.productLimit !== null && (
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${full ? "bg-red-500" : used >= 0.8 ? "bg-amber-500" : "bg-primary"}`}
            style={{ width: `${used * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

// One store in the list. The arrow opens its settings: product limit, users, delete.
function StoreRow({
  store,
  open,
  onToggle,
  deleteBlocked,
  onSaved,
  onToast,
  onAskDeactivate,
  onManageUsers,
  onAskDelete,
}: {
  store: ManagedStore;
  open: boolean;
  onToggle: () => void;
  /** Why this store can't be deleted (the Demo store, your own store), if so. */
  deleteBlocked: string | null;
  onSaved: (store: ManagedStore) => void;
  onToast: (text: string, tone?: Toast["tone"]) => void;
  onAskDeactivate: (store: ManagedStore) => void;
  onManageUsers: (store: ManagedStore) => void;
  onAskDelete: (store: ManagedStore) => void;
}) {
  const [limitText, setLimitText] = useState(store.productLimit === null ? "" : String(store.productLimit));
  const [unlimited, setUnlimited] = useState(store.productLimit === null);
  const [saving, setSaving] = useState<"limit" | "active" | "whatsapp" | "approve" | "reject" | null>(null);
  const [whatsappText, setWhatsappText] = useState(formatWhatsapp(store.whatsapp ?? ""));
  const [rejectReason, setRejectReason] = useState("");
  const link = storeUrlFor(store.slug, window.location);
  const panelId = `store-${store.slug}-settings`;
  const request = store.whatsappRequest ?? null;
  const pendingRequest = request?.status === "pending" ? request : null;
  const liveWhatsapp = formatWhatsapp(store.whatsapp ?? "");
  const whatsappChanged = toWhatsappDigits(whatsappText) !== (store.whatsapp ?? "");

  // A WhatsApp change: set the number directly, or approve / reject the owner's request.
  async function saveWhatsapp(kind: "whatsapp" | "approve" | "reject") {
    setSaving(kind);
    try {
      const saved = await updateStoreAccess(
        store.slug,
        kind === "whatsapp"
          ? { whatsapp: whatsappText }
          : kind === "approve"
            ? { whatsappDecision: "approve" }
            : { whatsappDecision: "reject", rejectReason },
      );
      onSaved(saved);
      const number = formatWhatsapp(saved.whatsapp ?? "");
      onToast(
        kind === "approve"
          ? `${saved.name}: ${number} is live`
          : kind === "reject"
            ? `${saved.name}: request rejected`
            : `${saved.name}: WhatsApp ${number ? `set to ${number}` : "removed"}`,
      );
    } catch (err) {
      onToast(message(err, "Couldn't update the WhatsApp number."), "error");
    } finally {
      setSaving(null);
    }
  }

  const nextLimit = unlimited ? null : limitText.trim() === "" ? NaN : Number(limitText);
  const limitChanged = nextLimit !== store.productLimit;
  const limitValid = nextLimit === null || (Number.isInteger(nextLimit) && nextLimit >= 0 && nextLimit <= 10000);

  async function saveLimit() {
    if (!limitValid) return onToast("Enter a whole number from 0 to 10000, or tick Unlimited.", "error");
    setSaving("limit");
    try {
      const saved = await updateStoreAccess(store.slug, {
        productLimit: nextLimit,
      });
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
    <li className={store.active ? "bg-white" : "bg-paper/70"}>
      <div className="flex items-center gap-3 py-2.5 pl-3 pr-1.5 sm:pl-4 sm:pr-2">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-md text-sm font-bold uppercase ${
            store.active ? "bg-tint text-primary" : "bg-ink/[0.06] text-slate"
          }`}
          aria-hidden
        >
          {store.name.charAt(0) || "S"}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-[15px] font-semibold text-ink">{store.name}</p>
            {!store.active && <Badge tone="danger">Off</Badge>}
            {pendingRequest && <Badge tone="brand">WhatsApp request</Badge>}
          </div>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1 text-[13px] font-medium text-primary hover:underline"
          >
            <span className="truncate">{link.replace(/^https?:\/\//, "")}</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </a>
          {store.email && <p className="truncate text-xs text-slate">{store.email}</p>}
          {/* Phones: the counts under the name (columns on larger screens) */}
          <p className="mt-0.5 text-xs tabular-nums text-slate sm:hidden">
            {store.productCount}
            {store.productLimit === null ? "" : `/${store.productLimit}`} products
            {typeof store.userCount === "number" && ` · ${plural(store.userCount, "user")}`}
          </p>
        </div>

        <ProductUsage store={store} className="hidden w-32 shrink-0 sm:block" />
        <p className="hidden w-14 shrink-0 text-center text-[13px] font-semibold tabular-nums text-ink sm:block">
          {store.userCount ?? "–"}
        </p>

        <Switch
          checked={store.active}
          disabled={saving !== null}
          label={`${store.name} active`}
          onChange={(next) => (next ? activate() : onAskDeactivate(store))}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? "Hide" : "Show"} settings for ${store.name}`}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate transition-colors hover:bg-ink/[0.05] hover:text-ink"
        >
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <div
          id={panelId}
          className="admin-fade-in flex flex-col gap-3 border-t border-line bg-paper/60 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:px-4 sm:pl-[4.25rem]"
        >
          {/* WhatsApp number (owners request it; it goes live once approved here). Older API builds don't send it. */}
          {store.whatsapp !== undefined &&
            (pendingRequest ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 sm:basis-full">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-900">
                  <Clock className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  WhatsApp number requested:{" "}
                  <span className="tabular-nums">{formatWhatsapp(pendingRequest.number)}</span>
                </p>
                <p className="mt-0.5 text-xs text-amber-800/90">
                  Requested {formatRelative(pendingRequest.requestedAt).toLowerCase()}.{" "}
                  {liveWhatsapp ? `It would replace ${liveWhatsapp}.` : "The store has no number yet."} Check it&apos;s
                  the owner&apos;s before approving.
                </p>
                {/* Phones: the reason on its own line, the three buttons in a row under it. Larger screens: one row. */}
                <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    maxLength={200}
                    placeholder="Reason, if rejecting (optional)"
                    aria-label="Reason for rejecting (shown to the owner)"
                    className="h-10 w-full min-w-0 rounded-md border border-line bg-white px-3 text-base text-ink placeholder:text-slate/55 focus:border-primary focus:outline-none focus-visible:outline-none! focus:ring-[3px] focus:ring-primary/15 sm:order-2 sm:flex-1 sm:text-sm"
                  />
                  <div className="flex gap-2 sm:contents">
                    <a
                      href={`https://wa.me/${pendingRequest.number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClass(
                        "secondary",
                        "sm",
                        "h-10 flex-1 px-3.5 text-whatsapp sm:order-1 sm:flex-none",
                      )}
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      Chat to check
                    </a>
                    <Button
                      variant="danger-soft"
                      size="sm"
                      className="h-10 flex-1 px-3.5 sm:order-3 sm:flex-none"
                      disabled={saving !== null}
                      loading={saving === "reject"}
                      onClick={() => saveWhatsapp("reject")}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="h-10 flex-1 px-4 sm:order-4 sm:flex-none"
                      disabled={saving !== null}
                      loading={saving === "approve"}
                      onClick={() => saveWhatsapp("approve")}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5 sm:basis-full">
                <label className="flex items-center gap-2 text-[13px] font-medium text-ink">
                  WhatsApp
                  <input
                    type="tel"
                    inputMode="tel"
                    value={whatsappText}
                    onChange={(e) => setWhatsappText(e.target.value)}
                    maxLength={20}
                    placeholder="Not added"
                    className="h-10 w-44 rounded-md border border-line bg-white px-2.5 text-base tabular-nums text-ink placeholder:text-slate/55 focus:border-primary focus:outline-none focus-visible:outline-none! focus:ring-[3px] focus:ring-primary/15 sm:text-sm"
                  />
                </label>
                <Button
                  size="sm"
                  className="h-10 px-3.5"
                  disabled={!whatsappChanged || saving !== null}
                  loading={saving === "whatsapp"}
                  onClick={() => saveWhatsapp("whatsapp")}
                >
                  {whatsappText.trim() ? "Save number" : "Remove number"}
                </Button>
                {request?.status === "rejected" && (
                  <span className="text-xs text-slate">
                    Rejected request: {formatWhatsapp(request.number)}
                    {request.reason ? ` (${request.reason})` : ""}
                  </span>
                )}
              </div>
            ))}

          {/* Product limit */}
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="flex items-center gap-2 text-[13px] font-medium text-ink">
              Product limit
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
              className="h-10 px-4"
              disabled={!limitChanged || saving !== null}
              loading={saving === "limit"}
              onClick={saveLimit}
            >
              Save
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Button size="sm" className="h-10 px-3.5" onClick={() => onManageUsers(store)}>
              <UsersRound className="h-4 w-4" aria-hidden />
              Manage users
            </Button>
            <Button
              variant="danger-soft"
              size="sm"
              className="h-10 px-3.5"
              disabled={deleteBlocked !== null}
              title={deleteBlocked ?? undefined}
              onClick={() => onAskDelete(store)}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete store
            </Button>
          </div>
          {deleteBlocked && <p className="text-xs text-slate sm:basis-full">{deleteBlocked}</p>}
        </div>
      )}
    </li>
  );
}

// Super admins: every store as a list, with its product limit, on/off switch, users and delete.
export default function AllStoresPage() {
  const user = useAdminUser();
  const [stores, setStores] = useState<ManagedStore[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<ManagedStore | null>(null);
  const [deactivateBusy, setDeactivateBusy] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ManagedStore | null>(null);
  // "warn": the first of two warnings, for a store with more than BIG_STORE_PRODUCTS products.
  const [deleteStep, setDeleteStep] = useState<"warn" | "confirm">("confirm");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [managingUsers, setManagingUsers] = useState<ManagedStore | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback(
    (text: string, tone: Toast["tone"] = "ok") => setToast({ id: Date.now(), text, tone }),
    [],
  );
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

  const replace = (saved: ManagedStore) =>
    setStores((list) => (list ?? []).map((s) => (s.slug === saved.slug ? saved : s)));

  // The Demo store and the admin's own store can't be deleted (the API refuses them too).
  const deleteBlocked = (store: ManagedStore) =>
    store.slug === DEMO_STORE_SLUG
      ? "The Demo store can't be deleted: the Catalog24 home page links to it."
      : store.slug === user.store.slug
        ? "You can't delete your own store."
        : null;

  async function deactivate() {
    if (!deactivating) return;
    setDeactivateBusy(true);
    setDeactivateError(null);
    try {
      const saved = await updateStoreAccess(deactivating.slug, {
        active: false,
      });
      replace(saved);
      setDeactivating(null);
      showToast(`${saved.name} is switched off`);
    } catch (err) {
      setDeactivateError(message(err, "Couldn't switch the store off."));
    } finally {
      setDeactivateBusy(false);
    }
  }

  async function removeStore() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      const done = await deleteStore(deleting.slug);
      setStores((list) => (list ?? []).filter((s) => s.slug !== deleting.slug));
      showToast(`${deleting.name} deleted · ${plural(done.products, "product")}, ${plural(done.users, "login")}`);
      setDeleting(null);
      setOpenSlug(null);
    } catch (err) {
      setDeleteError(message(err, "Couldn't delete the store. Try again: it carries on where it stopped."));
      // A failed delete has already switched the store off; show that.
      load();
    } finally {
      setDeleteBusy(false);
    }
  }

  const counts = useMemo(() => {
    const list = stores ?? [];
    const active = list.filter((s) => s.active).length;
    return {
      all: list.length,
      active,
      inactive: list.length - active,
      requests: list.filter(hasWhatsappRequest).length,
    };
  }, [stores]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (stores ?? []).filter((s) => {
      if (filter === "active" && !s.active) return false;
      if (filter === "inactive" && s.active) return false;
      if (filter === "requests" && !hasWhatsappRequest(s)) return false;
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
            {stores
              ? `${counts.all} stores · ${counts.active} active · ${counts.inactive} off`
              : "Product limits and on/off for every store"}
          </p>
        </div>
        <Button
          size="icon"
          onClick={load}
          disabled={refreshing}
          aria-label="Refresh"
          title="Refresh"
          className="h-11 w-11"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
        </Button>
      </header>

      <div className="sticky top-14 z-20 -mx-3 flex flex-col gap-2.5 bg-paper/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:flex-row sm:px-4 lg:top-16 lg:-mx-5 lg:px-5">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search stores</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate/60"
            aria-hidden
          />
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
        <div
          role="tablist"
          aria-label="Filter stores"
          className="grid shrink-0 grid-cols-4 gap-1 rounded-md bg-ink/[0.05] p-1"
        >
          {(["all", "active", "inactive", "requests"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-[4px] px-2 text-[13px] font-semibold capitalize transition-colors sm:px-3 ${
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

      {/* WhatsApp numbers waiting for approval: one tap to see them */}
      {counts.requests > 0 && filter !== "requests" && (
        <button
          type="button"
          onClick={() => setFilter("requests")}
          className="admin-fade-in flex min-h-11 items-center gap-3 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-left text-[13px] text-amber-900 transition-colors hover:bg-amber-100"
        >
          <WhatsAppIcon className="h-5 w-5 shrink-0 text-whatsapp" />
          <span className="min-w-0 flex-1">
            <span className="font-semibold">
              {counts.requests === 1 ? "1 WhatsApp number is" : `${counts.requests} WhatsApp numbers are`} waiting for
              approval
            </span>
            <span className="hidden text-amber-800/90 sm:inline"> · check each one before it goes live</span>
          </span>
          <span className="flex shrink-0 items-center gap-0.5 font-semibold">
            Review
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        </button>
      )}

      {loadError ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <TriangleAlert className="h-6 w-6 text-red-600" aria-hidden />
          <p className="text-sm text-slate">{loadError}</p>
          <Button onClick={load}>Try again</Button>
        </Card>
      ) : stores === null ? (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-center gap-3 px-3 py-3.5 sm:px-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="hidden h-3.5 w-24 sm:block" />
                <Skeleton className="h-6 w-10 rounded-full" />
              </li>
            ))}
          </ul>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate">
          {filter === "requests" && !query.trim()
            ? "No WhatsApp numbers are waiting for approval."
            : "No stores match."}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Column headings (larger screens) */}
          <div
            aria-hidden
            className="hidden items-center gap-3 border-b border-line bg-paper/60 py-2 pl-4 pr-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate sm:flex"
          >
            <span className="flex-1 pl-[3.25rem]">Store</span>
            <span className="w-32">Products</span>
            <span className="w-14 text-center">Users</span>
            <span className="w-[5.75rem]">Status</span>
            <span className="w-11" />
          </div>
          <ul className="divide-y divide-line">
            {visible.map((store) => (
              <StoreRow
                // A saved limit or WhatsApp number resets the row's inputs to the new values.
                key={`${store.slug}-${store.productLimit}-${store.whatsapp ?? ""}-${store.whatsappRequest?.status ?? ""}`}
                store={store}
                open={openSlug === store.slug}
                onToggle={() => setOpenSlug((slug) => (slug === store.slug ? null : store.slug))}
                deleteBlocked={deleteBlocked(store)}
                onSaved={replace}
                onToast={showToast}
                onAskDeactivate={(s) => {
                  setDeactivateError(null);
                  setDeactivating(s);
                }}
                onManageUsers={setManagingUsers}
                onAskDelete={(s) => {
                  setDeleteError(null);
                  setDeleteStep(s.productCount > BIG_STORE_PRODUCTS ? "warn" : "confirm");
                  setDeleting(s);
                }}
              />
            ))}
          </ul>
        </Card>
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
          Its owner is logged out and can&apos;t log in, and its catalog link shows &ldquo;Store unavailable&rdquo;.
          Nothing is deleted: switch it back on any time.
        </ConfirmDialog>
      )}

      {/* Big stores: a first warning about how much will be lost */}
      {deleting && deleteStep === "warn" && (
        <ConfirmDialog
          key="delete-warn"
          title={`${deleting.name} has ${deleting.productCount} products`}
          confirmLabel="Continue to delete"
          busy={false}
          onConfirm={() => setDeleteStep("confirm")}
          onCancel={() => setDeleting(null)}
        >
          This is a large store. Deleting it removes all {deleting.productCount} products and their photos, and the
          owner would have to add every one again. If the store only needs to stop for now, switch it off instead:
          nothing is deleted and it can be switched back on.
        </ConfirmDialog>
      )}

      {deleting && deleteStep === "confirm" && (
        <ConfirmDialog
          key="delete-confirm"
          title={`Delete ${deleting.name}?`}
          confirmLabel="Delete for good"
          busy={deleteBusy}
          error={deleteError}
          requireText={deleting.slug}
          onConfirm={removeStore}
          onCancel={() => setDeleting(null)}
        >
          This permanently deletes the store, its {plural(deleting.productCount, "product")} and their photos, and{" "}
          {typeof deleting.userCount === "number" ? `its ${plural(deleting.userCount, "login")}` : "every login"},
          including the owner&apos;s account. Its link stops working and the name can be registered again. This
          can&apos;t be undone. To keep the data, switch the store off instead.
        </ConfirmDialog>
      )}

      {managingUsers && (
        <StoreUsersDialog
          store={managingUsers}
          onClose={() => setManagingUsers(null)}
          onToast={showToast}
          onCountChange={(userCount) =>
            setStores((list) => (list ?? []).map((s) => (s.slug === managingUsers.slug ? { ...s, userCount } : s)))
          }
        />
      )}

      {toast && (
        <div
          key={toast.id}
          role="status"
          className="admin-pop-in fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[120] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-lg border border-line bg-white py-3 pl-3.5 pr-4 text-sm font-medium text-ink shadow-[0_12px_32px_-12px_rgba(1,18,60,0.3)] sm:right-6 lg:bottom-6"
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
