"use client";

import Image from "next/image";
import { ChevronDown, ChevronRight, Clock, Mail, MapPin, Navigation, Phone, Share2, Star } from "lucide-react";
import { telHref } from "@/lib/catalogStore";
import { FAQS, TRUST_POINTS } from "./data";
import { StoreMark, WhatsAppIcon, useCatalog } from "./shared";

const directionsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));

// Same panel and section-label styles as the cart page, so the tabs read as one app.
// On desktop they also get the soft shadow of the catalog's section panels.
const panel =
  "rounded-md border border-neutral-200 bg-white md:rounded-lg md:shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.04)]";
const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500";

// The "WhatsApp" tab (/app/catalog/furniture/help): a compact store profile —
// cover photo, name & rating, quick actions, contact rows, promises and FAQs.
// The store's details come from its own settings (Store settings in the admin).
// Anything the owner hasn't filled in is left out.
export default function StoreInfoPage() {
  const { store, whatsAppUrl, openWhatsApp } = useCatalog();

  const share = async () => {
    const url = window.location.origin + window.location.pathname.replace(/\/help$/, "");
    try {
      if (navigator.share) await navigator.share({ title: store.name, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      // Share sheet dismissed or clipboard blocked; nothing to do.
    }
  };

  const actions = [
    store.phone && { label: "Call", icon: Phone, href: telHref(store.phone) },
    store.address && { label: "Directions", icon: Navigation, href: directionsUrl(store.address), external: true },
    { label: "Share", icon: Share2, onClick: share },
  ].filter((a) => !!a);

  const details = [
    store.address && { label: "Address", icon: MapPin, value: store.address },
    store.hours && { label: "Hours", icon: Clock, value: store.hours },
    store.phone && { label: "Phone", icon: Phone, value: store.phone, href: telHref(store.phone) },
    store.email && { label: "Email", icon: Mail, value: store.email, href: `mailto:${store.email}` },
  ].filter((d) => !!d);
  const subtitle = [store.category, store.since && `Since ${store.since}`].filter(Boolean).join(" · ");

  return (
    // Phones: one column. Desktop: the store card on the left (pinned), details and FAQs on the right.
    <div className="space-y-4 pt-1 md:mx-auto md:grid md:max-w-5xl md:grid-cols-2 md:items-start md:gap-6 md:space-y-0 md:pt-2">
      {/* Store card: cover photo, logo, name, rating, actions */}
      <section className={`${panel} overflow-hidden md:sticky md:top-[calc(var(--catalog-header-h,0px)+1.25rem)]`}>
        <div className="relative aspect-[16/6] bg-neutral-100 md:aspect-[16/8]">
          {store.coverImage && (
            <Image
              src={store.coverImage}
              alt={`${store.name} store`}
              fill
              sizes="(min-width: 768px) 500px, 100vw"
              className="object-cover"
            />
          )}
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-end justify-between gap-3">
            <span className="relative -mt-8 shrink-0 rounded-md bg-white ring-4 ring-white">
              <StoreMark store={store} sizes="64px" className="h-16 w-16 rounded-md text-2xl" />
            </span>
            {store.rating !== null && (
              <span className="mb-0.5 flex items-center gap-1 rounded-[4px] border border-neutral-200 px-2 py-1 text-xs tabular-nums">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-[#111111]">{store.rating}</span>
                {store.reviewCount !== null && (
                  <span className="text-neutral-500">· {formatCount(store.reviewCount)} reviews</span>
                )}
              </span>
            )}
          </div>

          <h2 className="mt-3 text-lg font-bold leading-tight text-[#111111]">{store.name}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}

          {/* Primary action, then the secondary ones as a row of outlined buttons */}
          <button
            onClick={() => openWhatsApp(whatsAppUrl())}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-[#25D366] text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#1fb855]"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Chat on WhatsApp
          </button>
          <div
            className={`mt-2 grid gap-2 ${
              actions.length === 3 ? "grid-cols-3" : actions.length === 2 ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {actions.map(({ label, icon: Icon, onClick, href, external }) => {
              const itemClass =
                "flex h-10 items-center justify-center gap-1.5 rounded-[4px] border border-neutral-200 text-[12px] font-medium text-[#111111] transition-colors hover:bg-neutral-50";
              const content = (
                <>
                  <Icon className="h-4 w-4 text-neutral-500" />
                  {label}
                </>
              );
              return href ? (
                <a
                  key={label}
                  href={href}
                  className={itemClass}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {content}
                </a>
              ) : (
                <button key={label} onClick={onClick} className={itemClass}>
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="space-y-4">
      {/* Contact details — labelled rows; tappable ones get a chevron */}
      {details.length > 0 && (
      <section aria-label="Contact details" className={panel}>
        <h3 className={`${sectionLabel} px-3.5 pt-3.5`}>Store details</h3>
        <ul className="mt-1 divide-y divide-neutral-100">
          {details.map(({ label, icon: Icon, value, href }) => {
            const row = (
              <>
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] text-neutral-500">{label}</span>
                  <span className={`block text-[13px] leading-snug text-[#111111] ${href ? "truncate" : ""}`}>{value}</span>
                </span>
                {href && <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-neutral-300" />}
              </>
            );
            return (
              <li key={label}>
                {href ? (
                  <a href={href} className="flex items-start gap-3 px-3.5 py-3 transition-colors hover:bg-neutral-50">
                    {row}
                  </a>
                ) : (
                  <div className="flex items-start gap-3 px-3.5 py-3">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
      )}

      {/* Store promises — one panel split into three columns. The demo's sample
          furniture promises and FAQs; other stores don't have these. */}
      {store.isDemo && (
      <>
      <section aria-label="Store promises" className={`${panel} grid grid-cols-3 divide-x divide-neutral-100`}>
        {TRUST_POINTS.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="px-2 py-3 text-center">
            <Icon className="mx-auto h-5 w-5 text-neutral-600" strokeWidth={1.75} />
            <p className="mt-1.5 text-[11px] font-semibold leading-tight text-[#111111]">{title}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-neutral-500">{subtitle}</p>
          </div>
        ))}
      </section>

      {/* FAQs — questions only; tap to reveal the answer */}
      <section aria-label="Frequently asked questions" className={panel}>
        <h3 className={`${sectionLabel} px-3.5 pt-3.5`}>Frequently asked questions</h3>
        <div className="mt-1 divide-y divide-neutral-100">
          {FAQS.map((item) => (
            <details key={item.q} className="group px-3.5 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-medium text-[#111111] [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="pt-2 text-xs leading-relaxed text-neutral-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      </>
      )}
      </div>
    </div>
  );
}
