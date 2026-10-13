"use client";

import Image from "next/image";
import { ChevronDown, ChevronRight, Clock, Mail, MapPin, Navigation, Phone, Share2, Star } from "lucide-react";
import { FAQS, STORE, TRUST_POINTS } from "./data";
import { WhatsAppIcon, getWhatsAppUrl, useCatalog } from "./shared";

const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE.address)}`;

const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));

// Same panel and section-label styles as the cart page, so the tabs read as one app.
const panel = "rounded-md border border-neutral-200 bg-white";
const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500";

// The "WhatsApp" tab (/app/catalog/furniture/help): a compact store profile —
// cover photo, name & rating, quick actions, contact rows, promises and FAQs.
// All store details come from STORE in data.ts (placeholders in the demo).
export default function StoreInfoPage() {
  const { openWhatsApp } = useCatalog();

  const share = async () => {
    const url = window.location.origin + window.location.pathname.replace(/\/help$/, "");
    try {
      if (navigator.share) await navigator.share({ title: STORE.name, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      // Share sheet dismissed or clipboard blocked; nothing to do.
    }
  };

  const actions = [
    { label: "Call", icon: Phone, href: `tel:${STORE.phone.tel}` },
    { label: "Directions", icon: Navigation, href: directionsUrl, external: true },
    { label: "Share", icon: Share2, onClick: share },
  ];

  const details = [
    { label: "Address", icon: MapPin, value: STORE.address },
    { label: "Hours", icon: Clock, value: STORE.hours },
    { label: "Phone", icon: Phone, value: STORE.phone.display, href: `tel:${STORE.phone.tel}` },
    { label: "Email", icon: Mail, value: STORE.email, href: `mailto:${STORE.email}` },
  ];

  return (
    <div className="space-y-4 pt-1">
      {/* Store card: cover photo, logo, name, rating, actions */}
      <section className={`${panel} overflow-hidden`}>
        <div className="relative aspect-[16/6] bg-gradient-to-br from-[#EFE7DC] via-[#F6F1EA] to-[#E6DACB]">
          {STORE.coverImage && (
            <Image
              src={STORE.coverImage}
              alt={`${STORE.name} store`}
              fill
              sizes="(min-width: 640px) 400px, 100vw"
              className="object-cover"
            />
          )}
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-end justify-between gap-3">
            <span className="-mt-8 relative flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-[#8B5A2B] text-2xl font-bold text-white ring-4 ring-white">
              {STORE.initial}
            </span>
            <span className="mb-0.5 flex items-center gap-1 rounded-[4px] border border-neutral-200 px-2 py-1 text-xs tabular-nums">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-[#111111]">{STORE.rating}</span>
              <span className="text-neutral-500">· {formatCount(STORE.reviewCount)} reviews</span>
            </span>
          </div>

          <h2 className="mt-3 text-lg font-bold leading-tight text-[#111111]">{STORE.name}</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {STORE.category} · Since {STORE.since}
          </p>

          {/* Primary action, then the secondary ones as a row of outlined buttons */}
          <button
            onClick={() => openWhatsApp(getWhatsAppUrl())}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-[#25D366] text-[12px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#1fb855]"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Chat on WhatsApp
          </button>
          <div className="mt-2 grid grid-cols-3 gap-2">
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

      {/* Contact details — labelled rows; tappable ones get a chevron */}
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

      {/* Store promises — one panel split into three columns */}
      <section aria-label="Store promises" className={`${panel} grid grid-cols-3 divide-x divide-neutral-100`}>
        {TRUST_POINTS.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="px-2 py-3 text-center">
            <Icon className="mx-auto h-5 w-5 text-[#8B5A2B]" strokeWidth={1.75} />
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
    </div>
  );
}
