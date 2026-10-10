"use client";

// Building blocks shared by the catalog app, the Catalog tab and the product pages:
// routes, the catalog context, WhatsApp links, icons, product and category cards.

import React, { createContext, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/contact";
import type { CatalogProduct } from "@/lib/adminProducts";
import {
  CATEGORY_CARDS,
  CATEGORY_TAB_LABELS,
  WHATSAPP_MESSAGES,
  formatINR,
  type MainCategory,
} from "./data";

export const getWhatsAppUrl = (product?: CatalogProduct, customMessage?: string) => {
  const text =
    customMessage ?? (product ? WHATSAPP_MESSAGES.product(product) : WHATSAPP_MESSAGES.general());
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
};

export const CATALOG_PATH = '/app/catalog/furniture';
export const productPath = (id: string) => `${CATALOG_PATH}/product/${encodeURIComponent(id)}`;

// Shared with the product pages, which render on top of the (still mounted) catalog
// so saved items, the open tab and the scroll position survive opening a product.
export type CatalogContextValue = {
  products: CatalogProduct[];
  wishlist: string[];
  toggleWishlist: (id: string, e: React.MouseEvent) => void;
  /** Records that a product page was opened from inside the catalog, so "back" can use history. */
  markInAppNavigation: () => void;
  hasInAppHistory: () => boolean;
};

export const CatalogContext = createContext<CatalogContextValue | null>(null);

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside FurnitureCatalogApp');
  return ctx;
};

// Friendly Vector SVG placeholder with rich wooden colors and subcategory support
export const FriendlyFurniturePlaceholder: React.FC<{
  category: string;
  subCategory?: string;
  colorHex?: string;
  className?: string;
}> = ({ category, subCategory, colorHex = '#8B5A2B', className = 'w-full h-full' }) => {
  const renderVector = () => {
    // Specific detailed designs based on subcategory or category
    const sub = subCategory?.toLowerCase() || '';

    // --- SOFA SUB-DESIGNS ---
    if (category === 'Sofa') {
      if (sub.includes('l-shape')) {
        return (
          <g transform="translate(60, 45)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Main back */}
            <rect x="20" y="10" width="180" height="38" rx="6" fill={colorHex} fillOpacity="0.18" />
            {/* L-extension back */}
            <rect x="20" y="48" width="40" height="90" rx="6" fill={colorHex} fillOpacity="0.22" />
            {/* Main seat cushion */}
            <rect x="60" y="48" width="140" height="50" rx="6" fill={colorHex} fillOpacity="0.35" />
            {/* Chaise cushion */}
            <rect x="20" y="98" width="60" height="60" rx="6" fill={colorHex} fillOpacity="0.4" />
            {/* Armrest right */}
            <rect x="195" y="32" width="22" height="66" rx="5" fill={colorHex} fillOpacity="0.45" />
            {/* Wood Legs */}
            <line x1="26" y1="158" x2="22" y2="175" strokeWidth="4.5" stroke="#6E3D19" />
            <line x1="76" y1="158" x2="76" y2="175" strokeWidth="4.5" stroke="#6E3D19" />
            <line x1="195" y1="98" x2="200" y2="120" strokeWidth="4.5" stroke="#6E3D19" />
            <line x1="130" y1="98" x2="130" y2="120" strokeWidth="3.5" stroke="#6E3D19" strokeOpacity="0.6" />
          </g>
        );
      }
      if (sub.includes('2-seater') || sub.includes('loveseat')) {
        return (
          <g transform="translate(115, 60)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="15" y="8" width="140" height="44" rx="8" fill={colorHex} fillOpacity="0.2" />
            <line x1="85" y1="8" x2="85" y2="52" strokeOpacity="0.4" />
            <rect x="0" y="52" width="170" height="32" rx="6" fill={colorHex} fillOpacity="0.32" />
            <rect x="-12" y="32" width="18" height="52" rx="5" fill={colorHex} fillOpacity="0.4" />
            <rect x="164" y="32" width="18" height="52" rx="5" fill={colorHex} fillOpacity="0.4" />
            <line x1="6" y1="84" x2="2" y2="110" strokeWidth="4.5" stroke="#6E3D19" />
            <line x1="164" y1="84" x2="168" y2="110" strokeWidth="4.5" stroke="#6E3D19" />
          </g>
        );
      }
      if (sub.includes('diwan') || sub.includes('daybed')) {
        return (
          <g transform="translate(85, 65)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Diwan wooden frame */}
            <rect x="15" y="45" width="200" height="30" rx="4" fill={colorHex} fillOpacity="0.3" />
            {/* Mattress top */}
            <rect x="15" y="28" width="200" height="20" rx="4" fill={colorHex} fillOpacity="0.2" />
            {/* Bolster pillows */}
            <rect x="20" y="8" width="26" height="24" rx="10" fill={colorHex} fillOpacity="0.5" />
            <rect x="184" y="8" width="26" height="24" rx="10" fill={colorHex} fillOpacity="0.5" />
            {/* Turned wooden legs */}
            <line x1="28" y1="75" x2="24" y2="108" strokeWidth="5" stroke="#6E3D19" />
            <line x1="202" y1="75" x2="206" y2="108" strokeWidth="5" stroke="#6E3D19" />
            <line x1="115" y1="75" x2="115" y2="108" strokeWidth="4" stroke="#6E3D19" />
          </g>
        );
      }
      // Default 3-Seater Sofa
      return (
        <g transform="translate(100, 60)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="15" y="8" width="170" height="44" rx="8" fill={colorHex} fillOpacity="0.18" />
          <line x1="72" y1="8" x2="72" y2="52" strokeOpacity="0.4" />
          <line x1="128" y1="8" x2="128" y2="52" strokeOpacity="0.4" />
          <rect x="0" y="52" width="200" height="32" rx="6" fill={colorHex} fillOpacity="0.32" />
          <rect x="-12" y="30" width="18" height="52" rx="5" fill={colorHex} fillOpacity="0.4" />
          <rect x="194" y="30" width="18" height="52" rx="5" fill={colorHex} fillOpacity="0.4" />
          <line x1="6" y1="84" x2="2" y2="108" strokeWidth="4.5" stroke="#6E3D19" />
          <line x1="194" y1="84" x2="198" y2="108" strokeWidth="4.5" stroke="#6E3D19" />
          <line x1="100" y1="84" x2="100" y2="108" strokeWidth="3.5" stroke="#6E3D19" strokeOpacity="0.6" />
        </g>
      );
    }

    // --- CHAIR SUB-DESIGNS ---
    if (category === 'Chair') {
      if (sub.includes('study') || sub.includes('office')) {
        return (
          <g transform="translate(135, 45)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Ergonomic back */}
            <rect x="25" y="10" width="80" height="55" rx="10" fill={colorHex} fillOpacity="0.22" />
            <line x1="45" y1="20" x2="85" y2="20" strokeOpacity="0.3" />
            <line x1="45" y1="35" x2="85" y2="35" strokeOpacity="0.3" />
            {/* Seat cushion */}
            <rect x="15" y="65" width="100" height="20" rx="5" fill={colorHex} fillOpacity="0.38" />
            {/* Armrests */}
            <path d="M15,65 L10,45 L25,45" strokeWidth="3.5" />
            <path d="M115,65 L120,45 L105,45" strokeWidth="3.5" />
            {/* Central stem */}
            <line x1="65" y1="85" x2="65" y2="115" strokeWidth="6" stroke="#6E3D19" />
            {/* 5-star base wheels */}
            <line x1="30" y1="125" x2="65" y2="115" strokeWidth="4.5" stroke="#6E3D19" />
            <line x1="100" y1="125" x2="65" y2="115" strokeWidth="4.5" stroke="#6E3D19" />
            <circle cx="30" cy="128" r="3" fill="#6E3D19" />
            <circle cx="100" cy="128" r="3" fill="#6E3D19" />
          </g>
        );
      }
      if (sub.includes('dining')) {
        return (
          <g transform="translate(145, 45)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* High slatted wooden back */}
            <rect x="30" y="8" width="50" height="65" rx="3" fill={colorHex} fillOpacity="0.12" />
            <line x1="42" y1="8" x2="42" y2="73" strokeWidth="2.5" strokeOpacity="0.5" />
            <line x1="55" y1="8" x2="55" y2="73" strokeWidth="2.5" strokeOpacity="0.5" />
            <line x1="68" y1="8" x2="68" y2="73" strokeWidth="2.5" strokeOpacity="0.5" />
            {/* Seat */}
            <rect x="18" y="73" width="74" height="18" rx="4" fill={colorHex} fillOpacity="0.38" />
            {/* Straight tapered legs */}
            <line x1="24" y1="91" x2="18" y2="135" strokeWidth="4" stroke="#6E3D19" />
            <line x1="86" y1="91" x2="92" y2="135" strokeWidth="4" stroke="#6E3D19" />
            <line x1="30" y1="73" x2="30" y2="132" strokeWidth="3.5" stroke="#6E3D19" strokeOpacity="0.6" />
            <line x1="80" y1="73" x2="80" y2="132" strokeWidth="3.5" stroke="#6E3D19" strokeOpacity="0.6" />
          </g>
        );
      }
      // Easy / Lounge Armchair (Default Chair)
      return (
        <g transform="translate(135, 50)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15,10 Q65,-12 115,10 L110,65 Q65,55 20,65 Z" fill={colorHex} fillOpacity="0.2" />
          <line x1="45" y1="5" x2="45" y2="60" strokeOpacity="0.4" />
          <line x1="65" y1="0" x2="65" y2="58" strokeOpacity="0.4" />
          <line x1="85" y1="5" x2="85" y2="60" strokeOpacity="0.4" />
          <rect x="10" y="65" width="110" height="22" rx="5" fill={colorHex} fillOpacity="0.38" />
          <line x1="22" y1="87" x2="12" y2="128" strokeWidth="4.5" stroke="#6E3D19" />
          <line x1="108" y1="87" x2="118" y2="128" strokeWidth="4.5" stroke="#6E3D19" />
          <line x1="40" y1="87" x2="30" y2="122" stroke="#6E3D19" strokeOpacity="0.5" />
          <line x1="90" y1="87" x2="100" y2="122" stroke="#6E3D19" strokeOpacity="0.5" />
        </g>
      );
    }

    // --- DINING SUB-DESIGNS ---
    if (category === 'Dining') {
      if (sub.includes('bench')) {
        return (
          <g transform="translate(90, 75)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Long solid wood bench top */}
            <rect x="10" y="15" width="200" height="22" rx="4" fill={colorHex} fillOpacity="0.38" />
            <rect x="15" y="5" width="190" height="12" rx="3" fill={colorHex} fillOpacity="0.22" />
            {/* A-frame sturdy legs */}
            <line x1="30" y1="37" x2="18" y2="85" strokeWidth="5" stroke="#6E3D19" />
            <line x1="45" y1="37" x2="55" y2="85" strokeWidth="5" stroke="#6E3D19" />
            <line x1="175" y1="37" x2="165" y2="85" strokeWidth="5" stroke="#6E3D19" />
            <line x1="190" y1="37" x2="202" y2="85" strokeWidth="5" stroke="#6E3D19" />
            <line x1="24" y1="62" x2="196" y2="62" strokeWidth="3" stroke="#6E3D19" strokeOpacity="0.5" />
          </g>
        );
      }
      if (sub.includes('bar stool') || sub.includes('stool')) {
        return (
          <g transform="translate(155, 45)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Saddle top */}
            <rect x="15" y="10" width="60" height="16" rx="4" fill={colorHex} fillOpacity="0.4" />
            {/* High tall legs */}
            <line x1="22" y1="26" x2="10" y2="135" strokeWidth="4.5" stroke="#6E3D19" />
            <line x1="68" y1="26" x2="80" y2="135" strokeWidth="4.5" stroke="#6E3D19" />
            {/* Foot rest rings */}
            <ellipse cx="45" cy="95" rx="30" ry="8" strokeWidth="3" stroke="#C68B59" />
            <line x1="18" y1="65" x2="72" y2="65" strokeWidth="2.5" strokeOpacity="0.4" />
          </g>
        );
      }
      if (sub.includes('4-seater') || sub.includes('2-seater')) {
        return (
          <g transform="translate(100, 60)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Left chair */}
            <rect x="0" y="20" width="26" height="38" rx="3" strokeOpacity="0.6" fill={colorHex} fillOpacity="0.12" />
            <line x1="5" y1="58" x2="5" y2="95" strokeWidth="3" stroke="#6E3D19" />
            <line x1="22" y1="58" x2="22" y2="95" strokeWidth="3" stroke="#6E3D19" />
            {/* Compact table */}
            <rect x="32" y="28" width="135" height="20" rx="4" fill={colorHex} fillOpacity="0.35" />
            <line x1="45" y1="48" x2="42" y2="105" strokeWidth="5" stroke="#6E3D19" />
            <line x1="155" y1="48" x2="158" y2="105" strokeWidth="5" stroke="#6E3D19" />
            {/* Right chair */}
            <rect x="174" y="20" width="26" height="38" rx="3" strokeOpacity="0.6" fill={colorHex} fillOpacity="0.12" />
            <line x1="178" y1="58" x2="178" y2="95" strokeWidth="3" stroke="#6E3D19" />
            <line x1="195" y1="58" x2="195" y2="95" strokeWidth="3" stroke="#6E3D19" />
          </g>
        );
      }
      // 6-Seater Family Dining Set (Default Dining)
      return (
        <g transform="translate(90, 60)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="0" y="18" width="30" height="42" rx="3" strokeOpacity="0.6" fill={colorHex} fillOpacity="0.12" />
          <line x1="5" y1="60" x2="5" y2="98" strokeWidth="3.5" stroke="#6E3D19" />
          <line x1="25" y1="60" x2="25" y2="98" strokeWidth="3.5" stroke="#6E3D19" />
          <rect x="35" y="28" width="150" height="22" rx="4" fill={colorHex} fillOpacity="0.35" />
          <line x1="50" y1="50" x2="46" y2="108" strokeWidth="5" stroke="#6E3D19" />
          <line x1="170" y1="50" x2="174" y2="108" strokeWidth="5" stroke="#6E3D19" />
          <line x1="50" y1="84" x2="170" y2="84" strokeWidth="2.5" strokeOpacity="0.3" />
          <rect x="190" y="18" width="30" height="42" rx="3" strokeOpacity="0.6" fill={colorHex} fillOpacity="0.12" />
          <line x1="195" y1="60" x2="195" y2="98" strokeWidth="3.5" stroke="#6E3D19" />
          <line x1="215" y1="60" x2="215" y2="98" strokeWidth="3.5" stroke="#6E3D19" />
        </g>
      );
    }

    // --- BED SUB-DESIGNS ---
    if (category === 'Bed') {
      if (sub.includes('bunk')) {
        return (
          <g transform="translate(100, 20)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Corner posts */}
            <line x1="10" y1="0" x2="10" y2="200" strokeWidth="5" stroke="#6E3D19" />
            <line x1="170" y1="0" x2="170" y2="200" strokeWidth="5" stroke="#6E3D19" />
            {/* Top bunk with safety rail */}
            <line x1="10" y1="22" x2="125" y2="22" strokeWidth="3.5" stroke="#6E3D19" />
            <rect x="16" y="38" width="148" height="12" rx="4" fill={colorHex} fillOpacity="0.2" />
            <rect x="10" y="50" width="160" height="16" rx="3" fill={colorHex} fillOpacity="0.38" />
            {/* Bottom bunk */}
            <rect x="16" y="148" width="148" height="12" rx="4" fill={colorHex} fillOpacity="0.2" />
            <rect x="10" y="160" width="160" height="16" rx="3" fill={colorHex} fillOpacity="0.38" />
            {/* Ladder */}
            <line x1="182" y1="50" x2="182" y2="200" strokeWidth="3" stroke="#6E3D19" />
            <line x1="202" y1="50" x2="202" y2="200" strokeWidth="3" stroke="#6E3D19" />
            {[80, 110, 140, 170].map(y => (
              <line key={y} x1="182" y1={y} x2="202" y2={y} strokeWidth="2.5" stroke="#6E3D19" />
            ))}
          </g>
        );
      }
      // King / Queen / Single / Storage / Four Poster (side view)
      const isStorage = sub.includes('storage') || sub.includes('hydraulic');
      const isPoster = sub.includes('poster');
      const frameBottom = isStorage ? 164 : 150;
      return (
        <g transform="translate(82, 35)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {isPoster && (
            <>
              <line x1="8" y1="0" x2="8" y2="40" strokeWidth="4" stroke="#6E3D19" />
              <line x1="232" y1="0" x2="232" y2="88" strokeWidth="4" stroke="#6E3D19" />
              <line x1="8" y1="0" x2="232" y2="0" strokeWidth="3" stroke="#6E3D19" strokeOpacity="0.6" />
            </>
          )}
          {/* Headboard */}
          <rect x="0" y="40" width="20" height="110" rx="4" fill={colorHex} fillOpacity="0.4" />
          {/* Pillow & mattress */}
          <rect x="26" y="92" width="46" height="18" rx="8" fill={colorHex} fillOpacity="0.45" />
          <rect x="20" y="108" width="206" height="22" rx="5" fill={colorHex} fillOpacity="0.18" />
          {/* Bed frame (deeper box for storage beds) */}
          <rect x="20" y="130" width="212" height={frameBottom - 130} rx="3" fill={colorHex} fillOpacity="0.35" />
          {isStorage && (
            <>
              <line x1="90" y1="134" x2="90" y2="160" strokeOpacity="0.4" />
              <line x1="160" y1="134" x2="160" y2="160" strokeOpacity="0.4" />
              <line x1="45" y1="147" x2="65" y2="147" strokeWidth="2.5" stroke="#C68B59" />
              <line x1="115" y1="147" x2="135" y2="147" strokeWidth="2.5" stroke="#C68B59" />
              <line x1="185" y1="147" x2="205" y2="147" strokeWidth="2.5" stroke="#C68B59" />
            </>
          )}
          {/* Footboard */}
          <rect x="226" y="88" width="12" height="62" rx="3" fill={colorHex} fillOpacity="0.4" />
          {/* Legs */}
          <line x1="10" y1="150" x2="10" y2="176" strokeWidth="5" stroke="#6E3D19" />
          <line x1="232" y1={frameBottom} x2="232" y2="176" strokeWidth="5" stroke="#6E3D19" />
        </g>
      );
    }

    // --- WARDROBE SUB-DESIGNS ---
    if (category === 'Wardrobe') {
      const sliding = sub.includes('sliding');
      const doors = sub.includes('4-door') ? 4 : sub.includes('3-door') ? 3 : 2;
      const doorW = 40;
      const width = sliding ? 130 : doors * doorW;
      return (
        <g transform={`translate(${200 - width / 2}, 28)`} stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Crown & body */}
          <rect x="-6" y="0" width={width + 12} height="10" rx="2" fill={colorHex} fillOpacity="0.45" />
          <rect x="0" y="10" width={width} height="150" rx="2" fill={colorHex} fillOpacity="0.15" />
          {sliding ? (
            <>
              {/* Overlapping sliding panels on a top track */}
              <line x1="2" y1="15" x2={width - 2} y2="15" strokeWidth="2" strokeOpacity="0.5" />
              <rect x="4" y="18" width="68" height="138" rx="2" fill={colorHex} fillOpacity="0.28" />
              <rect x="58" y="18" width="68" height="138" rx="2" fill={colorHex} fillOpacity="0.2" />
              <line x1="64" y1="70" x2="64" y2="100" strokeWidth="3" stroke="#C68B59" />
              <line x1="118" y1="70" x2="118" y2="100" strokeWidth="3" stroke="#C68B59" />
            </>
          ) : (
            Array.from({ length: doors }, (_, i) => (
              <g key={i}>
                <rect x={i * doorW + 3} y="14" width={doorW - 6} height="142" rx="2" fill={colorHex} fillOpacity="0.25" />
                <circle cx={i % 2 === 0 ? i * doorW + doorW - 9 : i * doorW + 9} cy="85" r="2.5" fill="#C68B59" stroke="none" />
              </g>
            ))
          )}
          {/* Plinth & legs */}
          <rect x="-2" y="160" width={width + 4} height="10" rx="2" fill={colorHex} fillOpacity="0.4" />
          <line x1="6" y1="170" x2="6" y2="182" strokeWidth="5" stroke="#6E3D19" />
          <line x1={width - 6} y1="170" x2={width - 6} y2="182" strokeWidth="5" stroke="#6E3D19" />
        </g>
      );
    }

    // --- DRESSER SUB-DESIGNS ---
    if (category === 'Dresser') {
      if (sub.includes('chest')) {
        return (
          <g transform="translate(140, 40)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="0" y="0" width="120" height="10" rx="2" fill={colorHex} fillOpacity="0.45" />
            <rect x="4" y="10" width="112" height="135" rx="2" fill={colorHex} fillOpacity="0.15" />
            {[0, 1, 2, 3, 4].map(i => (
              <g key={i}>
                <rect x="10" y={16 + i * 25} width="100" height="21" rx="2" fill={colorHex} fillOpacity="0.28" />
                <circle cx="60" cy={26.5 + i * 25} r="2.5" fill="#C68B59" stroke="none" />
              </g>
            ))}
            <line x1="12" y1="145" x2="10" y2="162" strokeWidth="5" stroke="#6E3D19" />
            <line x1="108" y1="145" x2="110" y2="162" strokeWidth="5" stroke="#6E3D19" />
          </g>
        );
      }
      if (sub.includes('wall')) {
        return (
          <g transform="translate(130, 30)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Mirror */}
            <rect x="25" y="0" width="90" height="110" rx="6" fill={colorHex} fillOpacity="0.12" />
            <rect x="33" y="8" width="74" height="94" rx="4" fill="#DDEBF0" fillOpacity="0.7" strokeOpacity="0.5" />
            <line x1="47" y1="32" x2="67" y2="16" stroke="#FFFFFF" strokeWidth="3" />
            {/* Floating drawer unit */}
            <rect x="0" y="120" width="140" height="34" rx="3" fill={colorHex} fillOpacity="0.38" />
            <line x1="70" y1="124" x2="70" y2="150" strokeOpacity="0.4" />
            <circle cx="35" cy="137" r="2.5" fill="#C68B59" stroke="none" />
            <circle cx="105" cy="137" r="2.5" fill="#C68B59" stroke="none" />
          </g>
        );
      }
      // Dressing Table with Mirror (adds a stool for vanity sets)
      const withStool = sub.includes('stool') || sub.includes('vanity');
      return (
        <g transform={`translate(${withStool ? 90 : 125}, 12)`} stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Oval mirror */}
          <ellipse cx="75" cy="55" rx="45" ry="55" fill={colorHex} fillOpacity="0.15" />
          <ellipse cx="75" cy="55" rx="36" ry="46" fill="#DDEBF0" fillOpacity="0.7" strokeOpacity="0.5" />
          <line x1="58" y1="40" x2="74" y2="22" stroke="#FFFFFF" strokeWidth="3" />
          {/* Table top & drawers */}
          <rect x="0" y="112" width="150" height="12" rx="2" fill={colorHex} fillOpacity="0.45" />
          <rect x="6" y="124" width="138" height="34" rx="2" fill={colorHex} fillOpacity="0.25" />
          <line x1="52" y1="124" x2="52" y2="158" strokeOpacity="0.4" />
          <line x1="98" y1="124" x2="98" y2="158" strokeOpacity="0.4" />
          {[29, 75, 121].map(cx => (
            <circle key={cx} cx={cx} cy="141" r="2.5" fill="#C68B59" stroke="none" />
          ))}
          <line x1="12" y1="158" x2="10" y2="210" strokeWidth="4.5" stroke="#6E3D19" />
          <line x1="138" y1="158" x2="140" y2="210" strokeWidth="4.5" stroke="#6E3D19" />
          {withStool && (
            <>
              <rect x="170" y="160" width="50" height="14" rx="6" fill={colorHex} fillOpacity="0.45" />
              <line x1="178" y1="174" x2="174" y2="210" strokeWidth="4" stroke="#6E3D19" />
              <line x1="212" y1="174" x2="216" y2="210" strokeWidth="4" stroke="#6E3D19" />
            </>
          )}
        </g>
      );
    }

    // --- CENTER TABLE SUB-DESIGNS (also the fallback for any other category) ---
    if (sub.includes('nesting')) {
      return (
        <g transform="translate(110, 55)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Large table */}
          <ellipse cx="80" cy="20" rx="80" ry="15" fill={colorHex} fillOpacity="0.38" />
          <line x1="15" y1="28" x2="10" y2="115" strokeWidth="4.5" stroke="#6E3D19" />
          <line x1="145" y1="28" x2="150" y2="115" strokeWidth="4.5" stroke="#6E3D19" />
          {/* Smaller table tucked in front */}
          <ellipse cx="120" cy="60" rx="60" ry="12" fill={colorHex} fillOpacity="0.3" />
          <line x1="70" y1="66" x2="66" y2="115" strokeWidth="4" stroke="#6E3D19" />
          <line x1="170" y1="66" x2="174" y2="115" strokeWidth="4" stroke="#6E3D19" />
        </g>
      );
    }
    if (sub.includes('round')) {
      return (
        <g transform="translate(110, 70)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Round top on a pedestal base */}
          <ellipse cx="90" cy="20" rx="90" ry="18" fill={colorHex} fillOpacity="0.38" />
          <line x1="90" y1="38" x2="90" y2="95" strokeWidth="8" stroke="#6E3D19" />
          <ellipse cx="90" cy="100" rx="45" ry="8" fill={colorHex} fillOpacity="0.3" />
        </g>
      );
    }
    // Rectangular / Storage / Lift-Top Center Table (drawers instead of a shelf for storage)
    const hasDrawers = sub.includes('storage');
    return (
      <g transform="translate(100, 70)" stroke={colorHex} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Low table top with inlay line */}
        <rect x="10" y="18" width="180" height="18" rx="3" fill={colorHex} fillOpacity="0.38" />
        <line x1="40" y1="27" x2="160" y2="27" stroke="#C68B59" strokeWidth="2" />
        {hasDrawers ? (
          <>
            <rect x="25" y="36" width="70" height="30" rx="2" fill={colorHex} fillOpacity="0.22" />
            <rect x="105" y="36" width="70" height="30" rx="2" fill={colorHex} fillOpacity="0.22" />
            <circle cx="60" cy="51" r="2.5" fill="#C68B59" stroke="none" />
            <circle cx="140" cy="51" r="2.5" fill="#C68B59" stroke="none" />
          </>
        ) : (
          <rect x="25" y="55" width="150" height="10" rx="2" fill={colorHex} fillOpacity="0.2" />
        )}
        {/* Four legs */}
        <line x1="20" y1="36" x2="16" y2="88" strokeWidth="4.5" stroke="#6E3D19" />
        <line x1="180" y1="36" x2="184" y2="88" strokeWidth="4.5" stroke="#6E3D19" />
        <line x1="45" y1="36" x2="42" y2="85" strokeWidth="3" stroke="#6E3D19" strokeOpacity="0.6" />
        <line x1="155" y1="36" x2="158" y2="85" strokeWidth="3" stroke="#6E3D19" strokeOpacity="0.6" />
      </g>
    );
  };

  // Spaces and "&" in subcategory names would break the url(#id) reference.
  const patternId = `pat-${category}-${subCategory || 'all'}`.replace(/[^A-Za-z0-9-]/g, '-');

  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-[#FDFBF7] to-[#F3EDE3] flex items-center justify-center select-none ${className}`}>
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="28" y2="0" stroke="#8B5A2B" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="0" y2="28" stroke="#8B5A2B" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      <svg viewBox="0 0 400 240" className="w-[85%] h-[85%] z-10 transition-transform duration-500 ease-out group-hover:scale-105">
        {renderVector()}
      </svg>
    </div>
  );
};

// Traditional Indian Earthen Diya Lamp Icon (Festive celebration motif)
export const DiyaIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    {/* Diya Flame */}
    <path
      d="M12 2C12 2 9 6.2 9 9.2C9 10.9 10.3 12.2 12 12.2C13.7 12.2 15 10.9 15 9.2C15 6.2 12 2 12 2Z"
      fill="#F59E0B"
    />
    <path
      d="M12 4.5C12 4.5 10.5 7 10.5 8.8C10.5 9.7 11.2 10.4 12 10.4C12.8 10.4 13.5 9.7 13.5 8.8C13.5 7 12 4.5 12 4.5Z"
      fill="#FEF08A"
    />
    {/* Diya Clay Base */}
    <path
      d="M3 13C3.5 18 7.5 21 12 21C16.5 21 20.5 18 21 13C17 14.5 7 14.5 3 13Z"
      fill="#D97706"
    />
    <path
      d="M2.5 12.5C4.2 14 8 15.2 12 15.2C16 15.2 19.8 14 21.5 12.5C18 11.5 6 11.5 2.5 12.5Z"
      fill="#B45309"
    />
    {/* Base rim */}
    <path
      d="M9.5 20.5H14.5L14 22H10L9.5 20.5Z"
      fill="#78350F"
    />
  </svg>
);

// WhatsApp Brand Icon
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`fill-current shrink-0 ${className}`} viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

// The product's main photo (uploaded in the admin panel), or the drawn
// placeholder when it has none. The parent must be position: relative.
export const ProductVisual: React.FC<{ product: CatalogProduct; sizes: string }> = ({ product, sizes }) =>
  product.mainImageUrl ? (
    <Image
      src={product.mainImageUrl}
      alt={product.productName}
      fill
      sizes={sizes}
      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
    />
  ) : (
    <FriendlyFurniturePlaceholder
      category={product.categoryName}
      subCategory={product.subcategoryName}
      colorHex={product.colors[0]?.hex || '#8B5A2B'}
      className="w-full h-full"
    />
  );

// Image-first product card: a square photo with a small badge, then just name + price.
// The card links to the product's own page (where it can be saved).
export const ProductCard: React.FC<{ product: CatalogProduct }> = ({ product }) => {
  const { markInAppNavigation } = useCatalog();
  // The first tag is the card badge.
  const badge = product.tags[0];
  const hasDiscount = product.originalPrice > product.price;

  return (
    <article className="relative group">
      <Link
        href={productPath(product.id)}
        scroll={false}
        onClick={markInAppNavigation}
        className="flex flex-col active:scale-[0.99] transition-transform duration-300"
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-[#FDFBF7] to-[#F5ECE0] shadow-[0_2px_12px_rgba(0,0,0,0.05)] group-hover:shadow-[0_14px_32px_rgba(139,90,43,0.13)] transition-shadow duration-300">
          <ProductVisual product={product} sizes="(min-width: 640px) 200px, 50vw" />

          {badge && (
            <span className="absolute top-2 left-2 max-w-[70%] truncate rounded-full bg-black/45 backdrop-blur-sm px-2 py-0.5 text-[9px] font-semibold text-white">
              {badge}
            </span>
          )}
        </div>

        <div className="px-1 pt-2">
          <h2 className="text-[11px] sm:text-xs font-medium text-neutral-600 line-clamp-1">
            {product.productName}
          </h2>
          <p className="mt-0.5 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-sm font-bold text-[#111111]">{formatINR(product.price)}</span>
            {hasDiscount && (
              <span className="text-[10px] text-neutral-400 line-through">{formatINR(product.originalPrice)}</span>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
};

const CATEGORY_IMAGES: Partial<Record<MainCategory, string>> = Object.fromEntries(
  CATEGORY_CARDS.map(card => [card.key, card.image])
);

// Category tile: a soft box with the furniture cut-out popping out over its rim (same
// trick as the story highlights). The photo is larger than the box and anchored to its
// bottom; multiply blends the photo's white background into the box and the page, so
// keep transforms off this button (they'd isolate the blend and bring the white back).
export const CategoryBox: React.FC<{ category: MainCategory; active?: boolean; onClick: () => void }> = ({
  category,
  active,
  onClick,
}) => {
  const image = CATEGORY_IMAGES[category];

  return (
    <button onClick={onClick} aria-pressed={active} className="flex w-full flex-col items-center gap-1.5 group">
      <span className="relative block w-full pt-3">
        {/* Selected: a warmer fill and stronger shadow — no outline, which would cross the photo */}
        <span
          className={`block w-full aspect-square rounded-2xl transition-[background,box-shadow] duration-200 ${
            active
              ? 'bg-gradient-to-b from-[#F5E4CC] to-[#E9CDA6] shadow-[0_6px_16px_rgba(139,90,43,0.28)]'
              : 'bg-gradient-to-b from-[#FAF5EE] to-[#F1E3D1] shadow-[0_2px_10px_rgba(139,90,43,0.10)]'
          }`}
        />
        {image ? (
          <Image
            src={image}
            alt=""
            width={240}
            height={240}
            sizes="(min-width: 640px) 120px, 30vw"
            className="absolute bottom-0 left-1/2 w-[120%] max-w-none h-auto -translate-x-1/2 mix-blend-multiply transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-active:scale-95"
          />
        ) : (
          <span className="absolute inset-x-0 bottom-0 top-3 p-2">
            <FriendlyFurniturePlaceholder category={category} className="w-full h-full" />
          </span>
        )}
      </span>
      <span className="flex flex-col items-center gap-1">
        <span
          className={`text-[11px] leading-tight text-center line-clamp-2 ${
            active ? 'font-bold text-[#8B5A2B]' : active === false ? 'font-semibold text-neutral-500' : 'font-semibold text-neutral-800'
          }`}
        >
          {CATEGORY_TAB_LABELS[category]}
        </span>
        {/* Selected marker under the label (reserved space keeps rows aligned) */}
        {active !== undefined && (
          <span
            className={`h-1 rounded-full transition-all duration-200 ${active ? 'w-5 bg-[#8B5A2B]' : 'w-0 bg-transparent'}`}
          />
        )}
      </span>
    </button>
  );
};
