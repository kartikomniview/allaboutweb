"use client";

import { useEffect, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CircleCheck,
  Clock,
  Mail,
  MapPin,
  Phone,
  Quote,
  Store,
  Tag,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useLiveCatalogUrl, useSetAdminStore } from "@/components/admin/AdminShell";
import { Breadcrumbs, Button, Card, Skeleton, buttonClass } from "@/components/admin/ui";
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

// The fields and the Save button join this form through their `form` attribute, so the
// form doesn't wrap the page: the WhatsApp section has a form of its own, and nested in
// this one its "Request number" would have submitted (saved) the page as well.
const FORM_ID = "store-settings";

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

/** A settings group, like a phone's Settings app: a small caps title, then a card of rows. */
function Group({ id, title, aside, children }: { id: string; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="admin-fade-in">
      <div className="flex min-h-6 items-end justify-between gap-2 px-1 pb-1.5">
        <h2 id={id} className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
          {title}
        </h2>
        {aside}
      </div>
      <Card className="divide-y divide-line overflow-hidden">{children}</Card>
    </section>
  );
}

/**
 * One row of a group: an icon, a small label and a borderless input; tapping anywhere
 * on the row focuses the input. Phones: the label above the input, which keeps 16px
 * text so iOS doesn't zoom in on focus. From sm up: the label on the left.
 */
function Field({
  id,
  label,
  icon: Icon,
  required,
  hint,
  error,
  multiline,
  ...input
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  multiline?: boolean;
} & Omit<ComponentProps<"input">, "id" | "className" | "form"> &
  Pick<ComponentProps<"textarea">, "rows">) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const shared = { id, form: FORM_ID, "aria-invalid": !!error, "aria-describedby": describedBy };
  // Above the label's tap area (its ::after covers the row), so a tap in the text still
  // places the caret there.
  const control =
    "relative z-[1] block w-full min-w-0 bg-transparent p-0 text-base text-ink placeholder:text-slate/50 focus:outline-none focus-visible:outline-none! sm:text-sm";
  return (
    <div
      data-field
      className={`group relative flex gap-3 px-3 py-2 transition-colors focus-within:bg-tint/25 sm:px-4 sm:py-1.5 ${
        error ? "bg-red-50/60" : ""
      }`}
    >
      {/* Focus: an accent bar down the left edge. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-0.5 transition-opacity ${
          error ? "bg-red-500 opacity-100" : "bg-primary opacity-0 group-focus-within:opacity-100"
        }`}
      />
      <Icon
        className={`mt-3 h-4 w-4 shrink-0 sm:mt-2 ${error ? "text-red-500" : "text-slate/60 group-focus-within:text-primary"}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-start sm:gap-3">
        <label
          htmlFor={id}
          className={`block text-[11px] font-medium leading-4 after:absolute after:inset-0 sm:py-1.5 sm:text-[13px] sm:leading-5 ${
            error ? "text-red-600" : "text-slate sm:text-ink/80"
          }`}
        >
          {label}
          {required && (
            <span className="ml-0.5 text-primary" aria-hidden>
              *
            </span>
          )}
        </label>
        <div className="min-w-0">
          {multiline ? (
            <textarea
              {...shared}
              {...(input as ComponentProps<"textarea">)}
              // Grows with the text where supported (Chrome, Android); scrolls elsewhere.
              className={`${control} max-h-40 min-h-11 resize-none leading-snug [field-sizing:content] sm:min-h-0 sm:py-1.5 sm:leading-5`}
            />
          ) : (
            <input {...shared} {...input} className={`${control} h-6 sm:h-8`} />
          )}
          {error ? (
            <p id={`${id}-error`} className="admin-fade-in mt-0.5 text-[11px] font-medium leading-snug text-red-600 sm:mb-1 sm:text-xs">
              {error}
            </p>
          ) : (
            hint && (
              <p id={`${id}-hint`} className="mt-0.5 text-[11px] leading-snug text-slate sm:mb-1">
                {hint}
              </p>
            )
          )}
        </div>
      </div>
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
    if (!form || !dirty) return;

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
  // something to save or say. Desktop: it sits at the end of the page.
  const showBar = dirty || saving || !!message;

  return (
    <div className={`mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5 ${showBar ? "pb-24 lg:pb-0" : ""}`}>
      <header className="admin-fade-in flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 hidden sm:block">
            <Breadcrumbs items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Store settings" }]} />
          </div>
          <h1 className="truncate text-[17px] font-bold leading-tight tracking-[-0.02em] text-ink sm:text-xl">Store settings</h1>
          <p className="mt-0.5 text-xs text-slate sm:text-[13px]">What customers see on your store.</p>
        </div>
        <a href={liveUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "touch", "px-3!")}>
          View store
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
          {[3, 1, 4].map((rows, i) => (
            <div key={i} aria-hidden>
              <Skeleton className="mb-2 ml-1 h-3 w-20" />
              <Card className="divide-y divide-line overflow-hidden">
                {Array.from({ length: rows }, (_, r) => (
                  <div key={r} className="flex gap-3 px-3 py-2.5 sm:px-4">
                    <Skeleton className="mt-1 h-4 w-4" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </>
      ) : (
        <>
          {/* Holds no fields itself; see FORM_ID. */}
          <form id={FORM_ID} onSubmit={handleSubmit} noValidate hidden />

          <Group id="group-store" title="Store">
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
            <Field
              id="store-name"
              label="Store name"
              icon={Store}
              required
              error={errors.name}
              hint={
                <>
                  Your link stays <span className="font-medium text-ink">{store.slug}.catalog24.in</span>
                </>
              }
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              maxLength={40}
              placeholder="Your store's name"
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
              hint={form.category.trim() ? "Shown on your store page and in link previews." : "Leave empty to use what you sell."}
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
          </Group>

          {/* Requested and approved on its own, not saved with the form */}
          <Group id="group-whatsapp" title="WhatsApp number" aside={<WhatsappStatusBadge store={store} />}>
            <WhatsappNumberPanel
              store={store}
              onUpdated={(saved) =>
                // Keep the form's unsaved edits; only the WhatsApp fields change.
                setStore((s) => (s ? { ...s, whatsapp: saved.whatsapp, whatsappRequest: saved.whatsappRequest } : saved))
              }
            />
          </Group>

          <Group id="group-sell" title="What you sell">
            <div id="business-types" data-field className="p-3 sm:p-4">
              <BusinessTypePicker
                compact
                className="grid-cols-3 sm:grid-cols-5 md:grid-cols-6"
                value={form.businessTypes}
                onChange={(next) => set("businessTypes", next)}
                labelledBy="group-sell"
              />
              {errors.businessTypes && (
                <p className="admin-fade-in mt-2 text-xs font-medium text-red-600">{errors.businessTypes}</p>
              )}
            </div>
          </Group>

          <Group id="group-contact" title="Contact" aside={<span className="text-[11px] font-medium text-slate">Optional</span>}>
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
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              maxLength={300}
              placeholder="Shop 12, Main Market, MG Road, City – 560001"
              autoComplete="street-address"
            />
          </Group>

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
                <Button size="touch" type="submit" form={FORM_ID} variant="primary" loading={saving} className="flex-[2] lg:flex-none">
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
