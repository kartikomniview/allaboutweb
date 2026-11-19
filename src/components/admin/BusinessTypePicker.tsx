"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { businessTypeImage } from "@/lib/businessImages";
import { BUSINESS_TYPES, type BusinessTypeId } from "@/lib/taxonomy";
import { hapticTick, ripple } from "./ripple";

/** "What do you sell?": one or more business types, as selectable photo cards (4:3 photo on top, label below). */
export default function BusinessTypePicker({
  value,
  onChange,
  labelledBy,
  className = "grid-cols-3",
  compact = false,
}: {
  value: BusinessTypeId[];
  onChange: (next: BusinessTypeId[]) => void;
  labelledBy?: string;
  /** Grid columns, e.g. "grid-cols-3 sm:grid-cols-4". */
  className?: string;
  /** Smaller cards and labels, for a settings page with more columns. */
  compact?: boolean;
}) {
  const toggle = (id: BusinessTypeId) => {
    if (!value.includes(id)) hapticTick();
    onChange(
      value.includes(id)
        ? value.filter((v) => v !== id)
        : BUSINESS_TYPES.map((t) => t.id).filter((t) => t === id || value.includes(t)),
    );
  };

  return (
    <div role="group" aria-labelledby={labelledBy} className={`grid ${compact ? "gap-2" : "gap-2.5"} ${className}`}>
      {BUSINESS_TYPES.map(({ id, label }) => {
        const on = value.includes(id);
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(id)}
            onPointerDown={ripple}
            className={`relative flex select-none flex-col overflow-hidden rounded-md border text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] focus-visible:outline-none! focus-visible:ring-4 focus-visible:ring-primary/15 ${
              on
                ? "border-primary bg-tint/60 ring-1 ring-inset ring-primary"
                : "border-line bg-white hover:border-slate/35 hover:bg-paper"
            }`}
          >
            <span className="relative block aspect-[4/3] w-full bg-paper">
              <Image src={businessTypeImage(id)} alt="" fill sizes={compact ? "(min-width: 640px) 120px, 33vw" : "(min-width: 640px) 140px, 33vw"} className="object-cover" />
            </span>
            {on && (
              <span
                className={`admin-pop-check absolute grid place-items-center rounded-full bg-primary text-white shadow-sm ring-2 ring-white ${
                  compact ? "right-1 top-1 h-4 w-4" : "right-1.5 top-1.5 h-5 w-5"
                }`}
              >
                <Check className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} strokeWidth={3} aria-hidden />
              </span>
            )}
            <span
              className={`flex items-center font-semibold leading-tight ${
                compact ? "min-h-9 px-1.5 py-1 text-[11px]" : "min-h-[2.75rem] px-2 py-1.5 text-[12.5px]"
              } ${
                on ? "text-ink" : "text-ink/80"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
