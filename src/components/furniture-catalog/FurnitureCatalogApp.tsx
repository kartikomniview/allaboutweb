"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { WHATSAPP_NUMBER, whatsappUrl } from '@/lib/contact';
import { ECATALOG_PROMO_PATH } from './EcatalogPromo';
import './furniture-catalog.css';
import {
  ArrowRight,
  Heart,
  Search,
  X,
  Check,
  Star,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  Home,
  LayoutGrid,
  MapPin,
  Clock,
  Trash2,
  Gift,
  Flame
} from 'lucide-react';
import {
  AAW_PROMO,
  CATEGORY_CARDS,
  CATEGORY_TAB_LABELS,
  CUSTOM_ORDER_CARD,
  DEALS_COUNTDOWN_START,
  DIWALI_BANNERS,
  DIWALI_OFFERS,
  DIWALI_PICK_IDS,
  FAQS,
  FESTIVE_GIFT,
  FESTIVE_PRIVILEGE,
  FESTIVE_RIBBON,
  INITIAL_WISHLIST_IDS,
  MAIN_CATEGORIES,
  POPULAR_SEARCHES,
  STORE,
  STORY_HIGHLIGHTS,
  TRUST_POINTS,
  WHATSAPP_MESSAGES,
  formatINR,
  type DiwaliBanner,
  type DiwaliOffer,
  type MainCategory,
} from './data';
import type { CatalogProduct } from '@/lib/adminProducts';

export const getWhatsAppUrl = (product?: CatalogProduct, customMessage?: string) => {
  const text =
    customMessage ?? (product ? WHATSAPP_MESSAGES.product(product) : WHATSAPP_MESSAGES.general());
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
};

// Friendly Vector SVG placeholder with rich wooden colors and subcategory support
const FriendlyFurniturePlaceholder: React.FC<{
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
const DiyaIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
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
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`fill-current shrink-0 ${className}`} viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

// The product's main photo (uploaded in the admin panel), or the drawn
// placeholder when it has none. The parent must be position: relative.
const ProductVisual: React.FC<{ product: CatalogProduct; sizes: string }> = ({ product, sizes }) =>
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

// Streamlined Image-Focused Product Card (Card UI with soft shadows instead of rigid borders)
const ProductCard: React.FC<{
  product: CatalogProduct;
  isWishlisted: boolean;
  onSelect: (product: CatalogProduct) => void;
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
}> = ({ product, isWishlisted, onSelect, onToggleWishlist }) => {
  // The first tag is the card badge.
  const badge = product.tags[0];
  const isFestive = Boolean(badge && /diwali|festive|dhamaka/i.test(badge));

  return (
    <article
      onClick={() => onSelect(product)}
      className="bg-white rounded-2xl flex flex-col group shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_14px_32px_rgba(139,90,43,0.13)] hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 cursor-pointer overflow-hidden relative"
    >
      {/* Dominant Image Section with warm soft backdrop */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-[#FDFBF7] to-[#F5ECE0]">
        <ProductVisual product={product} sizes="(min-width: 640px) 200px, 50vw" />

        {badge && (
          <span className={`absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 py-0.5 text-white text-[9px] sm:text-[10px] font-bold tracking-wide shadow-xs rounded-md flex items-center gap-1 ${
            isFestive
              ? 'bg-gradient-to-r from-[#B45309] to-[#9A3412] text-amber-100 ring-1 ring-amber-300/40'
              : 'bg-[#8B5A2B]'
          }`}>
            {isFestive && <DiyaIcon className="w-2.5 h-2.5 shrink-0" />}
            <span>{badge}</span>
          </span>
        )}

        <button
          onClick={(e) => onToggleWishlist(product.id, e)}
          className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 p-1.5 sm:p-2 bg-white/95 rounded-full z-20 hover:scale-110 active:scale-90 transition-all text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          aria-label="Save item"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-700'}`} />
        </button>
      </div>

      {/* Clean, Non-Technical Card Information */}
      <div className="p-3 sm:p-4 flex flex-col justify-between gap-2 sm:gap-2.5 flex-1">
        <h2 className="text-xs sm:text-sm font-semibold text-[#111111] group-hover:text-[#8B5A2B] transition-colors line-clamp-1">
          {product.productName}
        </h2>

        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-1 sm:gap-x-1.5">
            <span className="text-xs sm:text-base font-bold text-[#111111] tabular-nums">
              {formatINR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-[11px] text-neutral-400 line-through tabular-nums">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          <a
            href={getWhatsAppUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Enquire about ${product.productName} on WhatsApp`}
            title="Enquire on WhatsApp"
            className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all shrink-0 shadow-sm hover:shadow-md rounded-full active:scale-95"
          >
            <WhatsAppIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </a>
        </div>
      </div>
    </article>
  );
};

type AppTab = 'home' | 'catalog' | 'wishlist' | 'help';

// `products` are the published products from the admin panel (loaded by the page).
export default function FurnitureCatalogApp({ products }: { products: CatalogProduct[] }) {
  // Mobile App Navigation Tab: 'home' | 'catalog' | 'wishlist' | 'help'
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [activeCategory, setActiveCategory] = useState<MainCategory>('Sofa');

  // Filters within the Catalog Tab
  const [activeSubCategory, setActiveSubCategory] = useState<string>('All');
  const [activeColor, setActiveColor] = useState<string>('All');

  // Unified Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Wishlist & Bottom Sheet Modal States
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Only ids that exist, so the saved-items badge never counts missing products.
  const [wishlist, setWishlist] = useState<string[]>(() =>
    INITIAL_WISHLIST_IDS.filter(id => products.some(p => p.id === id))
  );

  // Active banner index for Diwali banner carousel
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Dynamic Diwali countdown timer
  const [timeLeft, setTimeLeft] = useState(DEALS_COUNTDOWN_START);

  // E-catalog promo pop-up: first after 30s, then 1 min after each close.
  // It opens as an intercepted route, so this component (and its state) stays mounted behind it.
  const router = useRouter();
  const pathname = usePathname();
  const promoShownRef = useRef(false);

  useEffect(() => {
    if (pathname === ECATALOG_PROMO_PATH) return;
    const promoTimer = setTimeout(() => {
      promoShownRef.current = true;
      router.push(ECATALOG_PROMO_PATH, { scroll: false });
    }, promoShownRef.current ? 60_000 : 30_000);
    return () => clearTimeout(promoTimer);
  }, [pathname, router]);

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % DIWALI_BANNERS.length);
    }, 5500);
    return () => clearInterval(bannerTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return { days: 2, hours: 23, mins: 59, secs: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClaimDiwaliOffer = (banner: DiwaliBanner) => {
    showToast(`🪔 Claiming: ${banner.headline}`);
    setTimeout(() => {
      window.open(getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.banner(banner)), '_blank');
    }, 400);
  };

  const handleClaimOffer = (offer: DiwaliOffer) => {
    showToast(`🪔 Claiming ${offer.title} (${offer.benefit})`);
    setTimeout(() => {
      window.open(getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.offer(offer)), '_blank');
    }, 400);
  };

  const handleSelectCategory = (cat: MainCategory, sub?: string) => {
    setActiveCategory(cat);
    setActiveSubCategory(sub || 'All');
    setActiveColor('All');
    setSearchQuery('');
    setActiveTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Removed from saved items');
        return prev.filter(i => i !== id);
      } else {
        showToast('Added to your wishlist');
        return [...prev, id];
      }
    });
  };

  // Scoped products for current category
  const categoryProducts = useMemo(() => {
    return products.filter(p => p.categoryName === activeCategory);
  }, [products, activeCategory]);

  // Available subcategories for active category
  const availableSubCategories = useMemo(() => {
    return ['All', ...Array.from(new Set(categoryProducts.map(p => p.subcategoryName)))];
  }, [categoryProducts]);

  // Available colors
  const availableColors = useMemo(() => {
    const allC = categoryProducts.flatMap(p => p.colors);
    const unique = new Map<string, string>();
    allC.forEach(c => unique.set(c.name, c.hex));
    return Array.from(unique.entries()).map(([name, hex]) => ({ name, hex }));
  }, [categoryProducts]);

  // Global search across category, subcategory, name, tags, wood, material or description
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    return products.filter(item =>
      [
        item.categoryName,
        item.subcategoryName,
        item.productName,
        ...item.tags,
        item.woodType,
        item.material,
        item.description,
      ].some(field => field.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  // Filtered products on the category detail page
  const filteredCategoryProducts = useMemo(() => {
    return categoryProducts.filter(item => {
      if (activeSubCategory !== 'All' && item.subcategoryName !== activeSubCategory) {
        return false;
      }
      if (activeColor !== 'All' && !item.colors.some(c => c.name === activeColor)) {
        return false;
      }
      return true;
    });
  }, [categoryProducts, activeSubCategory, activeColor]);

  // Wishlisted products list
  const wishlistedProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [products, wishlist]);

  // Curated 4 top festive picks for the Diwali Dhamaka section
  const diwaliPicks = useMemo(() => {
    return DIWALI_PICK_IDS
      .map(id => products.find(p => p.id === id))
      .filter((p): p is CatalogProduct => Boolean(p));
  }, [products]);

  // "Trending For You": the 4 best-rated products (more reviews breaks ties)
  const trendingProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
      .slice(0, 4);
  }, [products]);

  // Home category cards with live design counts and "From" prices
  const categoryCards = useMemo(() => {
    return CATEGORY_CARDS.map(card => {
      const prices = products.filter(p => p.categoryName === card.key).map(p => p.price);
      return { ...card, count: prices.length, startingPrice: prices.length ? Math.min(...prices) : 0 };
    }).filter(card => card.count > 0);
  }, [products]);

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased flex flex-col items-center justify-start sm:py-6 sm:px-4">

      {/* MOBILE APP DEVICE SHELL */}
      <div className="w-full bg-[#FAF9F6] flex flex-col relative transition-all duration-300 sm:max-w-[430px] sm:min-h-[880px] sm:rounded-[48px] sm:shadow-[0_25px_80px_rgba(0,0,0,0.4)] sm:ring-8 sm:ring-neutral-800 sm:border-4 sm:border-neutral-700 sm:overflow-hidden">

        {/* ALLABOUTWEB PROMO STRIP */}
        <div className="bg-[#111111] text-white px-3 py-2 flex items-center gap-2.5 text-[11px] font-semibold select-none shrink-0 z-50">
          <Link
            href="/"
            aria-label="Back to AllAboutWeb home"
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full text-[10px] font-bold shrink-0 transition-colors"
          >
            <Home className="w-3 h-3" />
            <span>Home</span>
          </Link>
          <span className="truncate flex-1">{AAW_PROMO.text}</span>
          <a
            href={whatsappUrl(AAW_PROMO.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 transition-colors"
          >
            <WhatsAppIcon className="w-3 h-3" />
            <span>WhatsApp Us</span>
          </a>
        </div>

        {/* TOP MOBILE APP BAR */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-xs">
          
          {/* Top Diwali Festive Announcement Ribbon */}
          <div className="bg-gradient-to-r from-[#7C2D12] via-[#9A3412] to-[#B45309] text-white px-3 py-1.5 flex items-center justify-between text-[10px] font-medium shadow-2xs select-none">
            <div className="flex items-center gap-1.5 truncate">
              <DiyaIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                <strong className="text-amber-200 font-bold">{FESTIVE_RIBBON.label}</strong> {FESTIVE_RIBBON.text}
              </span>
            </div>
            <button
              onClick={() => window.open(getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.festiveRibbon()), '_blank')}
              className="bg-amber-400 hover:bg-amber-300 text-neutral-900 font-bold px-2.5 py-0.5 rounded-full text-[9px] shrink-0 transition-transform active:scale-95 shadow-2xs ml-1.5 flex items-center gap-1"
            >
              <span>Claim</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Brand & Action Row */}
          <div className="px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                onClick={() => { setActiveTab('home'); setSearchQuery(''); }}
                className="cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-7 h-7 rounded-lg bg-[#8B5A2B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {STORE.initial}
                </span>
                <div>
                  <span className="font-bold text-base text-[#111111] tracking-tight leading-none block">
                    {STORE.name}
                  </span>
                  <span className="text-[9px] text-[#8B5A2B] font-semibold tracking-wider uppercase block">
                    {STORE.tagline}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-[#FAF5EE] text-[#8B5A2B]' : 'bg-neutral-100 text-neutral-700'}`}
                aria-label="Toggle Search"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => { setActiveTab('wishlist'); setSearchQuery(''); }}
                className="relative p-2 rounded-full bg-neutral-100 text-neutral-700 hover:text-[#8B5A2B] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#20bd5a] text-white px-2.5 py-1.5 rounded-full text-[11px] font-bold shadow-xs active:scale-95 transition-all"
                title="WhatsApp Support"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Chat</span>
              </a>
            </div>
          </div>

          {/* Quick Pincode Delivery Pill */}
          <div className="px-4 pb-2 flex items-center justify-between text-[11px] text-neutral-600">
            <div className="flex items-center gap-1 bg-neutral-100/80 px-2.5 py-0.5 rounded-full text-[10px] text-neutral-700">
              <MapPin className="w-3 h-3 text-[#8B5A2B]" />
              <span className="font-semibold text-neutral-900">{STORE.deliveryArea}</span>
              <span className="text-neutral-400">·</span>
              <span className="text-emerald-700 font-medium">{STORE.deliveryPerk}</span>
            </div>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <DiyaIcon className="w-3 h-3" />
              <span>{FESTIVE_RIBBON.badge}</span>
            </span>
          </div>

          {/* Collapsible Mobile Search Bar */}
          {(isSearchOpen || searchQuery) && (
            <div className="px-4 pb-2.5 animate-in slide-in-from-top-2 duration-150">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus={isSearchOpen}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sofa, teak chair, dining table..."
                  className="w-full bg-neutral-100 focus:bg-white pl-9 pr-8 py-2 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 shadow-inner rounded-xl transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* SCROLLABLE MAIN APP BODY (with pb-24 so content never clips behind bottom navigation tab bar) */}
        <main className="flex-1 overflow-y-auto pb-24 px-3 sm:px-4 pt-2">

          {/* ACTIVE SEARCH RESULTS SCREEN (When user has typed in search) */}
          {searchResults !== null ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B]">Search Results</span>
                  <h2 className="text-sm font-bold text-[#111111]">
                    &ldquo;{searchQuery}&rdquo; ({searchResults.length} designs)
                  </h2>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-red-600 font-medium hover:underline"
                >
                  Clear
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center space-y-3 shadow-xs my-4">
                  <Search className="w-8 h-8 text-[#8B5A2B] mx-auto opacity-60" />
                  <p className="text-xs font-semibold text-[#111111]">No designs found for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-[11px] text-neutral-500">Need something custom made? Send a photo to our carpenter on WhatsApp.</p>
                  <a
                    href={getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.searchNotFound(searchQuery))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-xs font-semibold rounded-xl shadow-xs"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>Ask on WhatsApp</span>
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {searchResults.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlist.includes(product.id)}
                      onSelect={setSelectedProduct}
                      onToggleWishlist={toggleWishlist}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* TAB 1: HOME */}
              {activeTab === 'home' && (
                <div className="space-y-4 pt-1">
                  
                  {/* STORY HIGHLIGHTS (Native Instagram/App category circles with Diwali Deals) */}
                  <div className="py-1">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                      {STORY_HIGHLIGHTS.map((story) => {
                        const isDiwali = story.action === 'offers';
                        return (
                          <button
                            key={story.title}
                            onClick={() => {
                              if (story.action === 'offers') {
                                document.getElementById('diwali-offers-section')?.scrollIntoView({ behavior: 'smooth' });
                              } else if (story.action === 'whatsapp') {
                                window.open(getWhatsAppUrl(), '_blank');
                              } else {
                                handleSelectCategory(story.category);
                              }
                            }}
                            className="flex flex-col items-center gap-1 shrink-0 group active:scale-95 transition-transform"
                          >
                            <div className={`w-14 h-14 rounded-full p-0.5 transition-transform group-hover:scale-105 ${
                              isDiwali
                                ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 ring-2 ring-amber-400/50 shadow-md animate-pulse'
                                : 'bg-gradient-to-tr from-[#8B5A2B] via-amber-400 to-[#FAF5EE] shadow-xs'
                            }`}>
                              <div className={`w-full h-full rounded-full flex items-center justify-center text-lg overflow-hidden border ${
                                isDiwali ? 'bg-amber-50 border-amber-300' : 'bg-white border-white'
                              }`}>
                                {story.icon}
                              </div>
                            </div>
                            <span className={`text-[10px] font-semibold text-center tracking-tight ${
                              isDiwali ? 'text-amber-800 font-bold' : 'text-neutral-800'
                            }`}>
                              {story.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* INTERACTIVE DIWALI FESTIVE BANNERS CAROUSEL */}
                  <div className="relative">
                    {(() => {
                      const banner = DIWALI_BANNERS[activeBannerIdx] || DIWALI_BANNERS[0];
                      return (
                        <div
                          key={banner.id}
                          className={`bg-gradient-to-br ${banner.gradient} rounded-3xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden transition-all duration-300`}
                        >
                          <div className="relative z-10 space-y-2 max-w-[78%]">
                            
                            {/* Festive Badge */}
                            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-amber-200 text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                              <DiyaIcon className="w-3 h-3" />
                              <span>{banner.badge}</span>
                            </div>

                            {/* Headline & Title */}
                            <div>
                              <h2 className="text-base sm:text-lg font-extrabold leading-tight tracking-tight text-white drop-shadow-xs">
                                {banner.headline}
                              </h2>
                              <p className="text-[11px] text-amber-100/90 leading-snug mt-0.5">
                                {banner.description}
                              </p>
                            </div>

                            {/* Festive Benefit Highlight */}
                            <div className="pt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 bg-black/30 border border-amber-300/40 text-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                                <span>Direct Festive Savings</span>
                              </span>
                              <span className="text-[10px] text-white/80 font-medium">
                                · {banner.highlight}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-1.5 flex items-center gap-2">
                              <button
                                onClick={() => handleClaimDiwaliOffer(banner)}
                                className="bg-white text-[#7C2D12] hover:bg-neutral-100 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                              >
                                <span>{banner.ctaText}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              
                              <button
                                onClick={() => handleSelectCategory(banner.categoryLink)}
                                className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-2.5 py-1.5 rounded-xl text-xs active:scale-95 transition-all"
                              >
                                {banner.categoryName}
                              </button>
                            </div>
                          </div>

                          {/* Decorative Diya & Vector in background */}
                          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                          <div className="absolute right-1 bottom-1 opacity-25 scale-125 pointer-events-none">
                            <FriendlyFurniturePlaceholder category={banner.categoryLink} className="w-28 h-28" />
                          </div>

                          {/* Carousel Navigation Chevrons */}
                          <button
                            onClick={() => setActiveBannerIdx(prev => (prev - 1 + DIWALI_BANNERS.length) % DIWALI_BANNERS.length)}
                            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-2xs transition-all active:scale-90"
                            aria-label="Previous banner"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveBannerIdx(prev => (prev + 1) % DIWALI_BANNERS.length)}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-2xs transition-all active:scale-90"
                            aria-label="Next banner"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })()}

                    {/* Carousel Indicator Dots */}
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      {DIWALI_BANNERS.map((b, idx) => (
                        <button
                          key={b.id}
                          onClick={() => setActiveBannerIdx(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            activeBannerIdx === idx ? 'w-5 bg-[#8B5A2B]' : 'w-1.5 bg-neutral-300'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* DIWALI SHUBH LABH OFFERS STRIP (Direct Festive Discounts) */}
                  <div id="diwali-offers-section" className="space-y-2 pt-1 scroll-mt-24">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <DiyaIcon className="w-4 h-4 text-amber-600" />
                        <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                          Diwali Shubh Labh Offers
                        </h2>
                      </div>
                      <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>Direct Savings</span>
                      </span>
                    </div>

                    {/* Festive Offers Cards */}
                    <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar pb-1">
                      {DIWALI_OFFERS.map((offer) => (
                        <div
                          key={offer.id}
                          onClick={() => handleClaimOffer(offer)}
                          className="min-w-[190px] max-w-[210px] bg-white rounded-2xl p-3 shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer border border-amber-200/60 flex flex-col justify-between shrink-0 relative overflow-hidden group"
                        >
                          {/* Warm corner accent */}
                          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-50 rounded-bl-3xl -z-0" />
                          
                          <div className="relative z-10 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                                {offer.tag}
                              </span>
                              <DiyaIcon className="w-3 h-3 text-amber-500 opacity-80" />
                            </div>

                            <p className="text-base font-extrabold text-[#7C2D12] tracking-tight">
                              {offer.benefit}
                            </p>
                            <p className="text-[11px] font-semibold text-neutral-800 leading-tight">
                              {offer.desc}
                            </p>
                            <p className="text-[10px] text-neutral-400">
                              {offer.minOrder}
                            </p>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between relative z-10 text-[10px] font-bold text-amber-800 group-hover:text-amber-900">
                            <span>Claim on WhatsApp</span>
                            <ArrowRight className="w-3 h-3 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      ))}

                      {/* Assured Festive Gift Card */}
                      <div
                        onClick={() => window.open(getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.festiveGift()), '_blank')}
                        className="min-w-[190px] max-w-[210px] bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer border border-amber-300/70 flex flex-col justify-between shrink-0"
                      >
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-white px-1.5 py-0.5 rounded-md shadow-2xs">
                            <Gift className="w-2.5 h-2.5 text-amber-600" />
                            <span>{FESTIVE_GIFT.tag}</span>
                          </span>
                          <p className="text-xs font-bold text-[#7C2D12] leading-tight pt-1">
                            {FESTIVE_GIFT.title}
                          </p>
                          <p className="text-[10px] text-neutral-600 leading-relaxed">
                            {FESTIVE_GIFT.description}
                          </p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-amber-200/60 flex items-center justify-between text-[10px] font-bold text-amber-800">
                          <span>Claim on WhatsApp</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DIWALI DHAMAKA FLASH DEALS SECTION (With Dynamic Countdown Timer) */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-orange-600" />
                        <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                          Diwali Dhamaka Deals
                        </h2>
                      </div>
                      
                      {/* Live Festive Countdown Timer */}
                      <div className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200/60">
                        <Clock className="w-3 h-3 text-red-600 animate-pulse" />
                        <span>Ends in: {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.mins).padStart(2, '0')}m {String(timeLeft.secs).padStart(2, '0')}s</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {diwaliPicks.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isWishlisted={wishlist.includes(product.id)}
                          onSelect={setSelectedProduct}
                          onToggleWishlist={toggleWishlist}
                        />
                      ))}
                    </div>
                  </div>

                  {/* QUICK SEARCH SUGGESTION PILLS */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
                    <span className="text-[10px] font-semibold text-neutral-400 shrink-0">Popular:</span>
                    {POPULAR_SEARCHES.map(chip => (
                      <button
                        key={chip}
                        onClick={() => { setSearchQuery(chip); setIsSearchOpen(true); }}
                        className="px-2.5 py-1 bg-white hover:bg-neutral-50 text-neutral-700 rounded-full shadow-xs shrink-0 whitespace-nowrap active:scale-95 transition-transform"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* CATEGORIES CARD HUB (4 Major Categories with Soft Shadows) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-3 bg-[#8B5A2B] rounded-full inline-block" />
                        Browse By Room
                      </h2>
                      <button
                        onClick={() => setActiveTab('catalog')}
                        className="text-[11px] text-[#8B5A2B] font-semibold hover:underline"
                      >
                        View All &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {categoryCards.map((cat) => (
                        <div
                          key={cat.key}
                          onClick={() => handleSelectCategory(cat.key)}
                          className="bg-white rounded-2xl p-3 flex flex-col justify-between group shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
                        >
                          <div>
                            <div className="aspect-[4/3] bg-gradient-to-b from-[#FDFBF7] to-[#F5ECE0] rounded-xl overflow-hidden mb-2 relative">
                              <FriendlyFurniturePlaceholder category={cat.key} className="w-full h-full" />
                              <span className="absolute top-1.5 right-1.5 bg-[#8B5A2B] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm shadow-xs">
                                {cat.count} Designs
                              </span>
                            </div>
                            <h3 className="text-xs font-bold text-[#111111] group-hover:text-[#8B5A2B] transition-colors truncate">
                              {cat.title}
                            </h3>
                          </div>

                          <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px]">
                            <span className="text-neutral-400">From</span>
                            <span className="font-bold text-[#8B5A2B] text-[11px]">
                              {formatINR(cat.startingPrice)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TRENDING NOW FEED (2-Column Mobile Feed) */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-3 bg-amber-500 rounded-full inline-block" />
                        Trending For You
                      </h2>
                      <span className="text-[10px] text-neutral-400">Top Rated</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {trendingProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isWishlisted={wishlist.includes(product.id)}
                          onSelect={setSelectedProduct}
                          onToggleWishlist={toggleWishlist}
                        />
                      ))}
                    </div>
                  </div>

                  {/* CARPENTER CUSTOMIZATION CARD */}
                  <div className="bg-[#FAF5EE] rounded-2xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-start gap-3">
                      <span className="p-2 rounded-xl bg-white text-[#8B5A2B] shadow-2xs shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-[#111111]">{CUSTOM_ORDER_CARD.title}</h4>
                        <p className="text-[11px] text-neutral-600 leading-relaxed">
                          {CUSTOM_ORDER_CARD.description}
                        </p>
                      </div>
                    </div>
                    <a
                      href={getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.customDimensions())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>

                  {/* TRUST POINTS (Clean Mobile Badges) */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    {TRUST_POINTS.map(({ icon: Icon, title, subtitle }) => (
                      <div key={title} className="bg-white rounded-xl p-2.5 shadow-2xs space-y-1">
                        <Icon className="w-4 h-4 text-[#8B5A2B] mx-auto" />
                        <p className="font-bold text-[10px] text-neutral-900 leading-tight">{title}</p>
                        <p className="text-[9px] text-neutral-500">{subtitle}</p>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 2: CATALOG (Full Visual Furniture Explorer) */}
              {activeTab === 'catalog' && (
                <div className="space-y-3 pt-1">
                  
                  {/* Category Segmented Switch Bar */}
                  <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
                    {MAIN_CATEGORIES.map((cat) => {
                      const isCatSelected = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            setActiveSubCategory('All');
                            setActiveColor('All');
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap active:scale-95 ${
                            isCatSelected
                              ? 'bg-white text-[#8B5A2B] shadow-xs'
                              : 'text-neutral-600 hover:text-black'
                          }`}
                        >
                          {CATEGORY_TAB_LABELS[cat]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-Category Filter Cards (Image on Top, Text on Bottom) */}
                  <div className="bg-white rounded-2xl p-3 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-3 bg-[#8B5A2B] rounded-full inline-block" />
                        Design Types
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {availableSubCategories.length - 1} options
                      </span>
                    </div>

                    <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar pb-1">
                      {availableSubCategories.map(sub => {
                        const isSelected = activeSubCategory === sub;
                        return (
                          <button
                            key={sub}
                            onClick={() => setActiveSubCategory(sub)}
                            className={`flex flex-col items-center justify-between min-w-[74px] p-1.5 transition-all rounded-xl shrink-0 text-center active:scale-95 ${
                              isSelected
                                ? 'bg-[#8B5A2B] text-white shadow-md'
                                : 'bg-[#FAF6F0] text-neutral-800 hover:bg-[#F3ECE2] shadow-2xs'
                            }`}
                          >
                            <div className={`w-12 h-10 rounded-lg overflow-hidden mb-1 relative flex items-center justify-center ${
                              isSelected ? 'bg-white shadow-xs' : 'bg-white shadow-2xs'
                            }`}>
                              {sub === 'All' ? (
                                <Layers className="w-5 h-5 text-[#8B5A2B]" />
                              ) : (
                                <FriendlyFurniturePlaceholder
                                  category={activeCategory}
                                  subCategory={sub}
                                  colorHex={isSelected ? '#8B5A2B' : '#7C482B'}
                                  className="w-full h-full"
                                />
                              )}
                            </div>
                            <span className={`text-[10px] font-semibold leading-tight line-clamp-1 px-0.5 ${
                              isSelected ? 'text-white' : 'text-neutral-800'
                            }`}>
                              {sub === 'All' ? `All ${CATEGORY_TAB_LABELS[activeCategory]}` : sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Wood Polish Pills */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
                      <span className="text-neutral-500 font-medium shrink-0">Polish:</span>
                      <button
                        onClick={() => setActiveColor('All')}
                        className={`px-2 py-0.5 rounded-full font-medium transition-all ${
                          activeColor === 'All'
                            ? 'bg-[#8B5A2B] text-white font-bold shadow-2xs'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        All
                      </button>
                      {availableColors.map(c => (
                        <button
                          key={c.name}
                          onClick={() => setActiveColor(c.name)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full transition-all shrink-0 ${
                            activeColor === c.name
                              ? 'bg-[#8B5A2B] text-white font-bold shadow-2xs'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Results Count & Product Grid */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
                      <span>Showing {filteredCategoryProducts.length} items</span>
                      {(activeSubCategory !== 'All' || activeColor !== 'All') && (
                        <button
                          onClick={() => { setActiveSubCategory('All'); setActiveColor('All'); }}
                          className="text-[#8B5A2B] font-semibold hover:underline"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>

                    {filteredCategoryProducts.length === 0 ? (
                      <div className="bg-white rounded-2xl p-6 text-center space-y-2 shadow-xs">
                        <p className="text-xs font-semibold text-neutral-800">No products match this combination.</p>
                        <button
                          onClick={() => { setActiveSubCategory('All'); setActiveColor('All'); }}
                          className="px-3 py-1.5 bg-[#8B5A2B] text-white text-xs font-semibold rounded-xl"
                        >
                          Show All {CATEGORY_TAB_LABELS[activeCategory]}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        {filteredCategoryProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isWishlisted={wishlist.includes(product.id)}
                            onSelect={setSelectedProduct}
                            onToggleWishlist={toggleWishlist}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 3: WISHLIST (SAVED DESIGNS) */}
              {activeTab === 'wishlist' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-[#111111] flex items-center gap-1.5">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        <span>Saved Furniture ({wishlist.length})</span>
                      </h2>
                      <p className="text-[11px] text-neutral-500">Your bookmarked pieces for home interior planning</p>
                    </div>

                    {wishlist.length > 0 && (
                      <button
                        onClick={() => { setWishlist([]); showToast('Wishlist cleared'); }}
                        className="text-[11px] text-red-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  {wishlistedProducts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center space-y-3 shadow-xs my-6">
                      <div className="w-14 h-14 bg-red-50 text-red-400 rounded-full mx-auto flex items-center justify-center">
                        <Heart className="w-7 h-7" />
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900">Your Wishlist is Empty</h3>
                      <p className="text-[11px] text-neutral-500 max-w-xs mx-auto leading-relaxed">
                        Tap the heart icon on any sofa, dining table, or chair to save it here for easy WhatsApp price comparisons.
                      </p>
                      <button
                        onClick={() => setActiveTab('catalog')}
                        className="px-4 py-2 bg-[#8B5A2B] hover:bg-[#6E3D19] text-white text-xs font-semibold rounded-xl shadow-xs active:scale-95 transition-all"
                      >
                        Explore Furniture
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Bulk WhatsApp Inquiry Action */}
                      <a
                        href={getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.wishlistPackage(wishlistedProducts))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-3 rounded-2xl flex items-center justify-between font-semibold text-xs shadow-md active:scale-98 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <WhatsAppIcon className="w-4 h-4" />
                          <span>Get Package Deal on WhatsApp</span>
                        </div>
                        <ArrowRight className="w-4 h-4" />
                      </a>

                      <div className="grid grid-cols-2 gap-2.5">
                        {wishlistedProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isWishlisted={true}
                            onSelect={setSelectedProduct}
                            onToggleWishlist={toggleWishlist}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: WHATSAPP CONCIERGE & HELP CENTER */}
              {activeTab === 'help' && (
                <div className="space-y-3.5 pt-1">
                  <div>
                    <h2 className="text-sm font-bold text-[#111111]">Customer Concierge</h2>
                    <p className="text-[11px] text-neutral-500">Fast assistance for Indian homeowners & interior orders</p>
                  </div>

                  {/* Primary WhatsApp Card */}
                  <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-3xl p-4 text-white shadow-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {STORE.whatsappSupport.status}
                      </span>
                      <span className="text-[10px] text-white/80">{STORE.whatsappSupport.replyTime}</span>
                    </div>

                    <h3 className="text-base font-bold">{STORE.whatsappSupport.title}</h3>
                    <p className="text-[11px] text-white/90 leading-snug">
                      {STORE.whatsappSupport.description}
                    </p>

                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full bg-white text-[#128C7E] hover:bg-neutral-100 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Start WhatsApp Chat</span>
                    </a>
                  </div>

                  {/* Toll-Free Call Card */}
                  <div className="bg-white rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-neutral-100 text-neutral-700">
                        <Phone className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-neutral-900">Direct Phone Support</p>
                        <p className="text-[11px] text-neutral-500">{STORE.phone.display} ({STORE.phone.hours})</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${STORE.phone.tel}`}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl"
                    >
                      Call Now
                    </a>
                  </div>

                  {/* Bengaluru Showroom Experience */}
                  <div className="bg-white rounded-2xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="p-2 rounded-xl bg-[#FAF5EE] text-[#8B5A2B] shrink-0">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">{STORE.showroom.title}</h4>
                        <p className="text-[11px] text-neutral-600 mt-0.5">
                          {STORE.showroom.address}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1">{STORE.showroom.hours}</p>
                      </div>
                    </div>
                  </div>

                  {/* Warranty & Wood Certificate */}
                  <div className="bg-white rounded-2xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{STORE.warranty.title}</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      {STORE.warranty.description}
                    </p>
                  </div>

                  {/* FAQ Quick Accordion */}
                  <div className="space-y-1.5 pt-1">
                    <h4 className="text-xs font-bold text-neutral-900">Common Questions</h4>
                    {FAQS.map((item) => (
                      <div key={item.q}className="bg-white rounded-xl p-2.5 shadow-2xs text-[11px] space-y-0.5">
                        <p className="font-semibold text-neutral-900">{item.q}</p>
                        <p className="text-neutral-500 leading-snug">{item.a}</p>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </>
          )}

        </main>

        {/* NATIVE PRODUCT DETAILS BOTTOM SHEET DRAWER */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end">
            {/* Scrim Overlay */}
            <div
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            />

            {/* Bottom Sheet Modal Container */}
            <div className={`relative bg-white w-full max-h-[88vh] flex flex-col rounded-t-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-200 z-10 sm:max-w-[430px] sm:mx-auto`}>
              
              {/* Native Drag Handle Pill */}
              <div className="pt-2.5 pb-1 flex justify-center bg-white cursor-pointer" onClick={() => setSelectedProduct(null)}>
                <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
              </div>

              {/* Sheet Header */}
              <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#8B5A2B] bg-[#FAF5EE] px-2.5 py-0.5 rounded-full">
                    {selectedProduct.categoryName}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium truncate max-w-[200px]">
                    {selectedProduct.subcategoryName}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sheet Scrollable Body */}
              <div className="overflow-y-auto p-4 space-y-3.5 flex-1">
                {/* Visual Showcase */}
                <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-b from-[#FDFBF7] to-[#F5ECE0] overflow-hidden relative shadow-inner">
                  <ProductVisual product={selectedProduct} sizes="(min-width: 640px) 400px, 100vw" />
                  {selectedProduct.tags[0] && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#8B5A2B] text-white text-[9px] font-bold rounded-md shadow-xs">
                      {selectedProduct.tags[0]}
                    </span>
                  )}
                </div>

                {/* Title & Price */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#8B5A2B] font-bold mb-1">
                    <Star className="w-3.5 h-3.5 fill-[#8B5A2B]" />
                    <span>{selectedProduct.rating}</span>
                    <span className="text-neutral-400 font-normal">({selectedProduct.reviewCount} customer reviews)</span>
                  </div>
                  <h3 className="text-base font-bold text-[#111111]">{selectedProduct.productName}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-bold text-[#111111] tabular-nums">
                      {formatINR(selectedProduct.price)}
                    </span>
                    {/* MRP is optional in the admin panel; it equals the price when there's no discount. */}
                    {selectedProduct.originalPrice > selectedProduct.price && (
                      <>
                        <span className="text-xs text-neutral-400 line-through tabular-nums">
                          {formatINR(selectedProduct.originalPrice)}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                          {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% Discount
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {selectedProduct.description}
                </p>

                {/* Diwali Festive Special Offer Card inside Bottom Sheet */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                      <DiyaIcon className="w-4 h-4" />
                      <span>{FESTIVE_PRIVILEGE.title}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-700 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                      {FESTIVE_PRIVILEGE.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-950/80 leading-relaxed">
                    {FESTIVE_PRIVILEGE.intro}{' '}
                    {FESTIVE_PRIVILEGE.perks.map((perk, i) => (
                      <React.Fragment key={perk}>
                        {i > 0 && ' + '}
                        <strong>{perk}</strong>
                      </React.Fragment>
                    ))}
                    .
                  </p>
                </div>

                {/* Highlights Card */}
                <div className="bg-[#FAF6F0] p-3 rounded-2xl space-y-1.5 text-xs text-neutral-700">
                  {selectedProduct.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#8B5A2B] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Specs Table */}
                <div className="bg-neutral-50 rounded-2xl overflow-hidden text-xs divide-y divide-neutral-200/50">
                  <div className="flex p-2 bg-[#FAF5EE]">
                    <span className="w-24 text-neutral-500 font-medium">Wood Type:</span>
                    <span className="font-semibold text-[#8B5A2B]">{selectedProduct.woodType}</span>
                  </div>
                  <div className="flex p-2">
                    <span className="w-24 text-neutral-500 font-medium">Size / Dim:</span>
                    <span className="text-neutral-800">{selectedProduct.dimensions}</span>
                  </div>
                  <div className="flex p-2 bg-[#FAF5EE]">
                    <span className="w-24 text-neutral-500 font-medium">Delivery:</span>
                    <span className="text-emerald-700 font-semibold">{selectedProduct.stockStatus}</span>
                  </div>
                </div>
              </div>

              {/* Sheet Sticky Bottom CTA Bar */}
              <div className="p-3 bg-white border-t border-neutral-100 flex items-center gap-2 shadow-lg">
                <a
                  href={getWhatsAppUrl(undefined, WHATSAPP_MESSAGES.productFestivePrice(selectedProduct))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-4 text-xs font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Chat on WhatsApp for Diwali Price</span>
                </a>
                <button
                  onClick={(e) => toggleWishlist(selectedProduct.id, e)}
                  className="p-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-2xl active:scale-95 transition-all"
                  aria-label="Save"
                >
                  <Heart className={`w-4 h-4 ${wishlist.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : 'text-neutral-700'}`} />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* NATIVE MOBILE BOTTOM NAVIGATION TAB BAR */}
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 sm:sticky sm:bottom-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-2 pb-safe select-none"
        >
          <div className="max-w-md mx-auto h-16 flex items-center justify-around">
            
            {/* Tab 1: Home */}
            <button
              onClick={() => { setActiveTab('home'); setSearchQuery(''); }}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all active:scale-95 ${
                activeTab === 'home' && !searchQuery ? 'text-[#8B5A2B]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Home className={`w-5 h-5 ${activeTab === 'home' && !searchQuery ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className={`text-[10px] mt-1 ${activeTab === 'home' && !searchQuery ? 'font-bold' : 'font-medium'}`}>
                Home
              </span>
            </button>

            {/* Tab 2: Catalog */}
            <button
              onClick={() => { setActiveTab('catalog'); setSearchQuery(''); }}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all active:scale-95 ${
                activeTab === 'catalog' && !searchQuery ? 'text-[#8B5A2B]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className={`w-5 h-5 ${activeTab === 'catalog' && !searchQuery ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className={`text-[10px] mt-1 ${activeTab === 'catalog' && !searchQuery ? 'font-bold' : 'font-medium'}`}>
                Catalog
              </span>
            </button>

            {/* Tab 3: Wishlist (Saved) */}
            <button
              onClick={() => { setActiveTab('wishlist'); setSearchQuery(''); }}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] relative transition-all active:scale-95 ${
                activeTab === 'wishlist' && !searchQuery ? 'text-[#8B5A2B]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <div className="relative">
                <Heart className={`w-5 h-5 ${activeTab === 'wishlist' && !searchQuery ? 'fill-[#8B5A2B] text-[#8B5A2B]' : 'stroke-[1.75]'}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${activeTab === 'wishlist' && !searchQuery ? 'font-bold' : 'font-medium'}`}>
                Saved
              </span>
            </button>

            {/* Tab 4: WhatsApp Support */}
            <button
              onClick={() => { setActiveTab('help'); setSearchQuery(''); }}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all active:scale-95 ${
                activeTab === 'help' && !searchQuery ? 'text-[#8B5A2B]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <div className="relative">
                <MessageCircle className={`w-5 h-5 ${activeTab === 'help' && !searchQuery ? 'stroke-[2.5] text-[#25D366]' : 'stroke-[1.75]'}`} />
                <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#25D366] ring-2 ring-white" />
              </div>
              <span className={`text-[10px] mt-1 ${activeTab === 'help' && !searchQuery ? 'font-bold' : 'font-medium'}`}>
                WhatsApp
              </span>
            </button>

          </div>
        </nav>

        {/* FLOATING TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-20 left-4 right-4 sm:absolute sm:bottom-20 z-50 bg-[#111111] text-white px-4 py-2.5 text-xs font-medium shadow-2xl flex items-center justify-between gap-2 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-neutral-400 p-1" aria-label="Dismiss">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
