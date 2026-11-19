"use client";

import { useEffect, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CircleCheck,
  Clock,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  Store,
  Tag,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useLiveCatalogUrl, useSetAdminStore } from "@/components/admin/AdminShell";
import {
  Breadcrumbs,
  Button,
  Card,
  Skeleton,
  buttonClass,
  panelFieldErrorClass,
  panelHintClass,
  panelIconBaseClass,
  panelInputClass,
  panelInputIconClass,
  panelLabelClass,
  panelTextareaClass,
} from "@/components/admin/ui";
import BusinessTypePicker from "@/components/admin/BusinessTypePicker";
import StoreLogoPicker from "@/components/admin/StoreLogoPicker";
import WhatsappNumberPanel, { WhatsappStatusBadge } from "@/components/admin/WhatsappNumberPanel";
import { flagField } from "@/components/admin/ripple";
import { discardUploads } from "@/lib/adminProducts";
import { AuthError } from "@/lib/adminAuth";
import { getOwnStore, updateOwnStore, type StoreDetails, type StoreDetailsInput } from "@/lib/adminStore";
import { storeTypeLabel } from "@/lib/taxonomy";

type Form = Omit<StoreDetailsInput, "since"> & { since: string };
type FieldErrors = Partial<Record<"name" | "businessTypes", string>>;

const toForm = (s: StoreDetails): Form => ({
  name: s.name,
  phone: s.phone,
  email: s.email,
  address: s.address,
  hours: s.hours,
  tagline: s.tagline,
  category: s.category,
  since: s.since ? String(s.since) : "",
  coverImage: s.coverImage,
  logo: s.logo,
  businessTypes: s.businessTypes,
});

/** A settings section: a white card with a small icon header. */
function Section({ icon: Icon, title, aside, children }: { icon: LucideIcon; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <Card className="admin-fade-in overflow-hidden">
      <div className="flex min-h-11 items-center gap-2 border-b border-line px-3 py-2 sm:min-h-10 sm:px-4">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-tint text-primary" aria-hidden>
          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
        <h2 className="min-w-0 flex-1 text-sm font-semibold text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </Card>
  );
}

/** A labelled input (44px on phones, 36px from sm up) with an icon on the left, and its error or hint underneath. */
function Field({
  id,
  label,
  icon: Icon,
  required,
  hint,
  error,
  className = "",
  multiline,
  ...input
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  className?: string;
  multiline?: boolean;
} & Omit<ComponentProps<"input">, "id" | "className"> &
  Pick<ComponentProps<"textarea">, "rows">) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const shared = { id, "aria-invalid": !!error, "aria-describedby": describedBy };
  return (
    <div data-field className={`min-w-0 ${className}`}>
      <label htmlFor={id} className={panelLabelClass}>
        {label}
        {required && (
          <span className="ml-0.5 text-primary" aria-hidden>
            *
          </span>
        )}
      </label>
      <div className="relative">
        {/* A textarea's icon lines up with its first line. */}
        <Icon className={multiline ? `${panelIconBaseClass} top-[13px] sm:top-[9px]` : panelInputIconClass} aria-hidden />
        {multiline ? (
          <textarea {...shared} {...(input as ComponentProps<"textarea">)} className={panelTextareaClass} />
        ) : (
          <input {...shared} {...input} className={panelInputClass} />
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className={panelFieldErrorClass}>
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={panelHintClass}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

// The store's public details: logo, name, WhatsApp number, what it sells and contact details.
export default function StoreSettingsPage() {
  const liveUrl = useLiveCatalogUrl();
  const setAdminStore = useSetAdminStore();
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    getOwnStore()
      .then((s) => {
        setStore(s);
        setForm(toForm(s));
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Couldn't load your store."));
  }, []);

  // The "Saved" note goes away by itself.
  useEffect(() => {
    if (message?.kind !== "ok") return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
    if (message?.kind === "error") setMessage(null);
  };
  const dirty = !!store && !!form && JSON.stringify(form) !== JSON.stringify(toForm(store));

  // A logo uploaded but not saved is deleted again.
  function discardChanges() {
    if (!store || !form) return;
    if (form.logo && form.logo !== store.logo) discardUploads([form.logo]).catch(() => {});
    setForm(toForm(store));
    setErrors({});
    setMessage(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form) return;

    const next: FieldErrors = {};
    if (form.name.trim().length < 3) next.name = "Use at least 3 characters.";
    if (!form.businessTypes.length) next.businessTypes = "Choose at least one.";
    setErrors(next);
    if (next.name) return flagField(document.getElementById("store-name"));
    if (next.businessTypes) return flagField(document.querySelector<HTMLElement>("#business-types button"));

    setSaving(true);
    setMessage(null);
    try {
      const saved = await updateOwnStore({ ...form, since: form.since.trim() ? Number(form.since) : null });
      setStore(saved);
      setForm(toForm(saved));
      setAdminStore({ slug: saved.slug, name: saved.name, businessTypes: saved.businessTypes });
      setMessage({ kind: "ok", text: "Saved. Your catalog is updated." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof AuthError ? err.message : "Couldn't save. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  // Phones and tablets: the bar is pinned above the bottom tabs, and only shows while there's
  // something to save or say. Desktop: it sits at the end of the form.
  const showBar = dirty || saving || !!message;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2.5 sm:gap-3">
      <header className="admin-fade-in flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 hidden sm:block">
            <Breadcrumbs items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Store settings" }]} />
          </div>
          <h1 className="truncate text-lg font-bold leading-tight tracking-[-0.02em] text-ink sm:text-xl">Store settings</h1>
        </div>
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View live catalog"
          className={buttonClass("secondary", "touch")}
        >
          View live
          <ArrowUpRight className="h-4 w-4 text-slate" aria-hidden />
        </a>
      </header>

      {loadError ? (
        <Card className="flex items-start gap-2 p-3 text-[13px] text-red-700">
          <TriangleAlert className="mt-px h-4 w-4 shrink-0" aria-hidden />
          {loadError}
        </Card>
      ) : !form || !store ? (
        <>
          {[0, 1, 2].map((i) => (
            <Card key={i} className="flex flex-col gap-3 p-3 sm:p-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-11 w-full sm:h-9" />
              <Skeleton className="h-11 w-full sm:h-9" />
            </Card>
          ))}
        </>
      ) : (
        <form onSubmit={handleSubmit} noValidate className={`flex flex-col gap-2.5 sm:gap-3 ${showBar ? "pb-24 lg:pb-0" : ""}`}>
          <Section icon={Store} title="Store">
            {/* The logo row, then the store's details */}
            <div className="border-b border-line">
              <StoreLogoPicker
                layout="dashboard"
                logo={form.logo}
                storeName={form.name || store.name}
                onChange={(url) => {
                  // An earlier upload that was never saved isn't needed any more.
                  if (form.logo && form.logo !== store.logo) discardUploads([form.logo]).catch(() => {});
                  set("logo", url);
                }}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-x-4 sm:p-4">
              <Field
                id="store-name"
                label="Store name"
                icon={Store}
                required
                error={errors.name}
                hint={
                  <>
                    Link stays <span className="font-medium text-ink">{store.slug}.catalog24.in</span>
                  </>
                }
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                maxLength={40}
                autoComplete="organization"
                autoCapitalize="words"
                enterKeyHint="next"
              />
              <Field
                id="store-tagline"
                label="Tagline"
                icon={Quote}
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                maxLength={60}
                placeholder="Lights & Decor"
                autoCapitalize="words"
                enterKeyHint="next"
              />
              <Field
                id="store-category"
                label="Type of store"
                icon={Tag}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                maxLength={60}
                // Empty: customers see one made from "What you sell" (shown here as it updates).
                placeholder={storeTypeLabel("", form.businessTypes) || "Home Decor Store"}
                hint={
                  form.category.trim()
                    ? "Shown on your store page and in link previews."
                    : "Optional. Leave it empty to use what you sell, as shown."
                }
                autoCapitalize="words"
                enterKeyHint="next"
              />
              <Field
                id="store-since"
                label="Year started"
                icon={CalendarDays}
                inputMode="numeric"
                value={form.since}
                onChange={(e) => set("since", e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="2012"
                enterKeyHint="next"
              />
            </div>
          </Section>

          {/* Requested and approved on its own, not saved with the form */}
          <Section icon={MessageCircle} title="WhatsApp number" aside={<WhatsappStatusBadge store={store} />}>
            <WhatsappNumberPanel
              store={store}
              onUpdated={(saved) =>
                // Keep the form's unsaved edits; only the WhatsApp fields change.
                setStore((s) => (s ? { ...s, whatsapp: saved.whatsapp, whatsappRequest: saved.whatsappRequest } : saved))
              }
            />
          </Section>

          <Section icon={LayoutGrid} title="What you sell">
            <div id="business-types" data-field className="p-3 sm:p-4">
              <span id="business-types-label" className="sr-only">
                What you sell
              </span>
              <BusinessTypePicker
                compact
                className="grid-cols-3 sm:grid-cols-5 md:grid-cols-6"
                value={form.businessTypes}
                onChange={(next) => set("businessTypes", next)}
                labelledBy="business-types-label"
              />
              {errors.businessTypes && <p className={panelFieldErrorClass}>{errors.businessTypes}</p>}
            </div>
          </Section>

          <Section icon={Phone} title="Contact" aside={<span className="text-[11px] font-medium text-slate">Optional</span>}>
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-x-4 sm:p-4">
              <Field
                id="store-phone"
                label="Phone"
                icon={Phone}
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                maxLength={30}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                enterKeyHint="next"
              />
              <Field
                id="store-email"
                label="Email"
                icon={Mail}
                type="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                maxLength={120}
                placeholder="hello@yourstore.com"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="next"
              />
              <Field
                id="store-hours"
                label="Opening hours"
                icon={Clock}
                className="sm:col-span-2"
                value={form.hours}
                onChange={(e) => set("hours", e.target.value)}
                maxLength={100}
                placeholder="Mon – Sun · 10:30 AM – 8:30 PM"
                enterKeyHint="next"
              />
              <Field
                id="store-address"
                label="Address"
                icon={MapPin}
                multiline
                rows={2}
                className="sm:col-span-2"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                maxLength={300}
                placeholder="Shop 12, Main Market, MG Road, City – 560001"
                autoComplete="street-address"
              />
            </div>
          </Section>

          {/* Save bar */}
          <div
            className={`${showBar ? "admin-pop-in flex" : "hidden lg:flex"} fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex-col gap-2 border-t border-line bg-white/95 px-3 py-2 backdrop-blur sm:px-4 lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none`}
          >
            {message && (
              <p
                role={message.kind === "error" ? "alert" : "status"}
                className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs font-medium ring-1 ring-inset ${
                  message.kind === "ok" ? "bg-emerald-50 text-emerald-800 ring-emerald-600/15" : "bg-red-50 text-red-700 ring-red-600/15"
                }`}
              >
                {message.kind === "ok" ? (
                  <CircleCheck className="admin-pop-check h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
                )}
                {message.text}
              </p>
            )}
            {(dirty || saving) && (
              <div className="flex gap-2 lg:justify-end">
                <Button size="touch" onClick={discardChanges} disabled={saving} className="flex-1 lg:flex-none">
                  Discard
                </Button>
                <Button size="touch" type="submit" variant="primary" loading={saving} className="flex-[2] lg:flex-none">
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
