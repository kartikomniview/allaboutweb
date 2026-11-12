"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, CircleCheck, TriangleAlert } from "lucide-react";
import { useLiveCatalogUrl, useSetAdminStore } from "@/components/admin/AdminShell";
import { Button, Card, PageHeader, Skeleton, buttonClass } from "@/components/admin/ui";
import BusinessTypePicker from "@/components/admin/BusinessTypePicker";
import { AuthError } from "@/lib/adminAuth";
import { getOwnStore, updateOwnStore, type StoreDetails, type StoreDetailsInput } from "@/lib/adminStore";

const inputClass =
  "h-10 w-full rounded-[7px] border border-line bg-white px-3 text-base text-ink transition placeholder:text-slate/55 hover:border-[#d3d7e2] focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15 sm:text-sm";

type Form = Omit<StoreDetailsInput, "since"> & { since: string };

const toForm = (s: StoreDetails): Form => ({
  name: s.name,
  whatsapp: s.whatsapp,
  phone: s.phone,
  email: s.email,
  address: s.address,
  hours: s.hours,
  tagline: s.tagline,
  category: s.category,
  since: s.since ? String(s.since) : "",
  coverImage: s.coverImage,
  businessTypes: s.businessTypes,
});

function Field({
  label,
  hint,
  required,
  className = "",
  children,
}: {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1 flex items-center gap-0.5 text-xs font-medium text-ink/80">
        {label}
        {required && <span className="text-primary" aria-hidden>*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-snug text-slate">{hint}</span>}
    </label>
  );
}

// The store's public details: name, WhatsApp number and the Store info tab.
export default function StoreSettingsPage() {
  const liveUrl = useLiveCatalogUrl();
  const setAdminStore = useSetAdminStore();
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    getOwnStore()
      .then((s) => {
        setStore(s);
        setForm(toForm(s));
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Couldn't load your store."));
  }, []);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));
  const dirty = !!store && !!form && JSON.stringify(form) !== JSON.stringify(toForm(store));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form) return;
    if (form.name.trim().length < 3) return setMessage({ kind: "error", text: "Store name must be at least 3 characters." });
    if (!form.businessTypes.length) return setMessage({ kind: "error", text: "Choose at least one thing your store sells." });
    if (form.whatsapp.replace(/\D/g, "").length < 10) return setMessage({ kind: "error", text: "Enter your WhatsApp number." });

    setSaving(true);
    setMessage(null);
    try {
      const saved = await updateOwnStore({ ...form, since: form.since.trim() ? Number(form.since) : null });
      setStore(saved);
      setForm(toForm(saved));
      setAdminStore({ slug: saved.slug, name: saved.name, businessTypes: saved.businessTypes });
      setMessage({ kind: "ok", text: "Saved. Your catalog shows the new details now." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof AuthError ? err.message : "Couldn't save. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Store settings" }]}
        title="Store settings"
        description="Your store's name, WhatsApp number and the details shown on your catalog's store page."
        actions={
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>
            View live
            <ArrowUpRight className="h-4 w-4 text-slate" aria-hidden />
          </a>
        }
      />

      {loadError ? (
        <Card className="flex items-start gap-2.5 p-4 text-sm text-red-700">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {loadError}
        </Card>
      ) : !form || !store ? (
        <Card className="flex flex-col gap-4 p-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </Card>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex max-w-3xl flex-col gap-5">
          <Card className="flex flex-col gap-4 p-5">
            <h2 className="text-sm font-semibold text-ink">Store</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Store name"
                required
                hint={
                  <>
                    Your link stays <span className="font-semibold text-ink">{store.slug}.catalog24.in</span>
                  </>
                }
              >
                <input value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={40} className={inputClass} />
              </Field>
              <Field label="WhatsApp number" required hint="Enquiries from your catalog go here.">
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  maxLength={20}
                  className={inputClass}
                  placeholder="98765 XXXX"
                />
              </Field>
              <Field label="Tagline" hint="A few words under your name, e.g. Lights & Decor.">
                <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={60} className={inputClass} />
              </Field>
              <Field label="Type of store" hint="Shown on your store page, e.g. Home Decor & Lighting Store">
                <input value={form.category} onChange={(e) => set("category", e.target.value)} maxLength={60} className={inputClass} />
              </Field>
              <Field label="Year started">
                <input
                  inputMode="numeric"
                  value={form.since}
                  onChange={(e) => set("since", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className={inputClass}
                  placeholder="2012"
                />
              </Field>
            </div>
            <div>
              <span id="business-types-label" className="mb-1 flex items-center gap-0.5 text-xs font-medium text-ink/80">
                What you sell<span className="text-primary" aria-hidden>*</span>
              </span>
              <BusinessTypePicker
                className="grid-cols-3 sm:grid-cols-4"
                value={form.businessTypes}
                onChange={(next) => set("businessTypes", next)}
                labelledBy="business-types-label"
              />
              <span className="mt-1 block text-[11px] leading-snug text-slate">
                The product form and photo detection suggest categories for these.
              </span>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-5">
            <h2 className="text-sm font-semibold text-ink">Contact & location</h2>
            <p className="-mt-2 text-xs text-slate">Shown on your catalog&apos;s store page. Leave a field empty to hide it.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Phone (for calls)">
                <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={30} className={inputClass} placeholder="+91 98765 43210" />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={120} className={inputClass} placeholder="hello@yourstore.com" />
              </Field>
              <Field label="Opening hours">
                <input value={form.hours} onChange={(e) => set("hours", e.target.value)} maxLength={100} className={inputClass} placeholder="Mon – Sun · 10:30 AM – 8:30 PM" />
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <textarea
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  maxLength={300}
                  rows={2}
                  className={`${inputClass} h-auto resize-y py-2 leading-relaxed`}
                  placeholder="Shop No. 12, Main Market, MG Road, Your City – 560001"
                />
              </Field>
            </div>
          </Card>

          {message && (
            <p
              role={message.kind === "error" ? "alert" : "status"}
              className={`flex items-start gap-2 rounded-btn px-3.5 py-3 text-[13px] font-medium ring-1 ring-inset ${
                message.kind === "ok" ? "bg-emerald-50 text-emerald-800 ring-emerald-600/15" : "bg-red-50 text-red-700 ring-red-600/15"
              }`}
            >
              {message.kind === "ok" ? (
                <CircleCheck className="mt-px h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <TriangleAlert className="mt-px h-4 w-4 shrink-0" aria-hidden />
              )}
              {message.text}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={() => setForm(toForm(store))} disabled={!dirty || saving}>
              Discard changes
            </Button>
            <Button type="submit" variant="primary" loading={saving} disabled={!dirty}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
