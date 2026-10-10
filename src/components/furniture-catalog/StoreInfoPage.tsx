"use client";

import Image from "next/image";
import { ChevronDown, Clock, Mail, MapPin, Navigation, Phone, Share2, Star } from "lucide-react";
import { FAQS, STORE, TRUST_POINTS } from "./data";
import { WhatsAppIcon, getWhatsAppUrl, useCatalog } from "./shared";

const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE.address)}`;

const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));

// Flat illustrated shop front used as the cover until the client's store photo is added.
// Drawn on a 640×280 grid (the cover's 16:7 shape); the shop sits right of centre so the
// logo, which overlaps the bottom-left corner, has a calm background.
const AWNING_STRIPES = 12;
const StoreCoverIllustration = () => (
  <svg viewBox="0 0 640 280" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
    <rect width="640" height="280" fill="#F3E7D7" />
    {/* Sun and a soft hill behind the street */}
    <circle cx="120" cy="84" r="44" fill="#EBD9C0" />
    <path d="M0 214 Q 120 170 250 206 L 250 232 L 0 232 Z" fill="#E9D7BE" />
    {/* Pavement */}
    <rect y="232" width="640" height="48" fill="#E2CBAC" />
    <rect y="232" width="640" height="4" fill="#D6BC98" />

    {/* Building */}
    <rect x="210" y="70" width="360" height="162" fill="#FFFBF4" />
    <rect x="200" y="58" width="380" height="16" rx="4" fill="#6E3D19" />
    {/* Blank shop sign */}
    <rect x="335" y="30" width="110" height="28" rx="6" fill="#8B5A2B" />
    <rect x="355" y="41" width="70" height="6" rx="3" fill="#F1DFC6" />

    {/* Striped awning with scalloped edge */}
    {Array.from({ length: AWNING_STRIPES }, (_, i) => (
      <g key={i} fill={i % 2 === 0 ? "#8B5A2B" : "#F1DFC6"}>
        <rect x={210 + i * 30} y="74" width="30" height="31" />
        <path d={`M${210 + i * 30} 104 a15 15 0 0 0 30 0 Z`} />
      </g>
    ))}

    {/* Display window: sofa, floor lamp, plant */}
    <rect x="232" y="132" width="180" height="92" rx="6" fill="#F6EBDD" stroke="#6E3D19" strokeWidth="4" />
    <rect x="262" y="168" width="100" height="22" rx="7" fill="#D9A06A" />
    <rect x="256" y="184" width="112" height="22" rx="6" fill="#C98B54" />
    <rect x="248" y="176" width="16" height="30" rx="6" fill="#B87842" />
    <rect x="360" y="176" width="16" height="30" rx="6" fill="#B87842" />
    <rect x="262" y="206" width="5" height="10" fill="#6E3D19" />
    <rect x="357" y="206" width="5" height="10" fill="#6E3D19" />
    <rect x="292" y="172" width="22" height="14" rx="4" fill="#E9C9A0" />
    <line x1="392" y1="152" x2="392" y2="216" stroke="#6E3D19" strokeWidth="3" />
    <path d="M380 152 L404 152 L398 138 L386 138 Z" fill="#E8B04A" />
    <rect x="384" y="214" width="16" height="4" rx="2" fill="#6E3D19" />
    {/* Glass glints */}
    <path d="M244 140 L262 140 L244 160 Z" fill="#FFFFFF" opacity="0.6" />

    {/* Door */}
    <rect x="436" y="128" width="64" height="104" rx="4" fill="#8B5A2B" />
    <rect x="446" y="140" width="44" height="42" rx="3" fill="#F6EBDD" />
    <circle cx="489" cy="196" r="3.5" fill="#E8B04A" />
    <rect x="428" y="228" width="80" height="6" rx="2" fill="#D6BC98" />

    {/* Side window with shelves */}
    <rect x="518" y="132" width="38" height="58" rx="4" fill="#F6EBDD" stroke="#6E3D19" strokeWidth="4" />
    <rect x="524" y="152" width="26" height="3" fill="#C98B54" />
    <rect x="524" y="170" width="26" height="3" fill="#C98B54" />
    <rect x="528" y="142" width="8" height="10" rx="1" fill="#D9A06A" />
    <rect x="540" y="160" width="7" height="10" rx="1" fill="#6B8F4E" />

    {/* Potted plants by the door */}
    <path d="M414 232 L418 212 L432 212 L436 232 Z" fill="#B5651D" />
    <ellipse cx="420" cy="202" rx="6" ry="13" fill="#6B8F4E" />
    <ellipse cx="430" cy="200" rx="6" ry="15" fill="#7FA05E" />
    <path d="M512 232 L516 212 L530 212 L534 232 Z" fill="#B5651D" />
    <ellipse cx="518" cy="202" rx="6" ry="13" fill="#7FA05E" />
    <ellipse cx="528" cy="200" rx="6" ry="15" fill="#6B8F4E" />
  </svg>
);

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
    {
      label: "WhatsApp",
      icon: WhatsAppIcon,
      onClick: () => openWhatsApp(getWhatsAppUrl()),
      className: "bg-[#25D366] text-white",
    },
    { label: "Call", icon: Phone, href: `tel:${STORE.phone.tel}` },
    { label: "Directions", icon: Navigation, href: directionsUrl, external: true },
    { label: "Share", icon: Share2, onClick: share },
  ];

  const details = [
    { icon: MapPin, value: STORE.address },
    { icon: Clock, value: STORE.hours },
    { icon: Phone, value: STORE.phone.display, href: `tel:${STORE.phone.tel}` },
    { icon: Mail, value: STORE.email, href: `mailto:${STORE.email}` },
  ];

  return (
    <div className="space-y-4 pt-1">
      {/* Store card: cover photo, logo, name, rating */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <div className="relative aspect-[16/7] bg-[#F3E7D7]">
          {STORE.coverImage ? (
            <Image
              src={STORE.coverImage}
              alt={`${STORE.name} store`}
              fill
              sizes="(min-width: 640px) 400px, 100vw"
              className="object-cover"
            />
          ) : (
            <StoreCoverIllustration />
          )}
        </div>
        <div className="px-4 pb-4">
          <span className="-mt-7 relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B5A2B] text-xl font-bold text-white ring-4 ring-white">
            {STORE.initial}
          </span>
          <h2 className="mt-2 text-lg font-bold leading-tight text-[#111111]">{STORE.name}</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {STORE.category} · Since {STORE.since}
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-neutral-800">{STORE.rating}</span>
            <span className="text-neutral-400">({formatCount(STORE.reviewCount)} reviews)</span>
          </p>

          {/* Quick actions */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {actions.map(({ label, icon: Icon, onClick, href, external, className }) => {
              const content = (
                <>
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      className ?? "bg-[#FAF5EE] text-[#8B5A2B]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-medium text-neutral-700">{label}</span>
                </>
              );
              const itemClass = "flex flex-col items-center gap-1.5 active:scale-95 transition-transform";
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
      </div>

      {/* Contact details — one short row each */}
      <ul className="divide-y divide-neutral-100 rounded-2xl bg-white px-3.5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        {details.map(({ icon: Icon, value, href }) => (
          <li key={value}>
            {href ? (
              <a href={href} className="flex items-center gap-3 py-3 text-xs text-neutral-800">
                <Icon className="h-4 w-4 shrink-0 text-[#8B5A2B]" />
                <span className="min-w-0 flex-1 truncate">{value}</span>
              </a>
            ) : (
              <div className="flex items-start gap-3 py-3 text-xs text-neutral-800">
                <Icon className="mt-px h-4 w-4 shrink-0 text-[#8B5A2B]" />
                <span className="min-w-0 flex-1 leading-relaxed">{value}</span>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Store promises */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {TRUST_POINTS.map(({ icon: Icon, title }) => (
          <div key={title} className="rounded-xl bg-[#FAF5EE] px-1.5 py-2.5">
            <Icon className="mx-auto h-4 w-4 text-[#8B5A2B]" />
            <p className="mt-1 text-[10px] font-semibold leading-tight text-neutral-800">{title}</p>
          </div>
        ))}
      </div>

      {/* FAQs — questions only; tap to reveal the answer */}
      <div className="space-y-2">
        <h3 className="text-[15px] font-bold text-neutral-900">Questions</h3>
        <div className="divide-y divide-neutral-100 rounded-2xl bg-white px-3.5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold text-neutral-800 [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="pt-2 text-[11px] leading-relaxed text-neutral-500">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
