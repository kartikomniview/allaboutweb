"use client";

import { Amphora, Blinds, Check, Lamp, Shirt, Sofa, Tv, type LucideIcon } from "lucide-react";
import FloorTilesIcon from "@/components/icons/FloorTilesIcon";
import FabricRollIcon from "@/components/icons/FabricRollIcon";
import { BUSINESS_TYPES, type BusinessTypeId } from "@/lib/taxonomy";
import { hapticTick, ripple } from "./ripple";

const ICONS: Record<BusinessTypeId, LucideIcon> = {
  furniture: Sofa,
  decor: Amphora,
  lighting: Lamp,
  flooring: FloorTilesIcon,
  curtains: Blinds,
  fabrics: FabricRollIcon,
  clothing: Shirt,
  electronics: Tv,
};

/** "What do you sell?": one or more business types, as selectable cards (icon on top, label below). */
export default function BusinessTypePicker({
  value,
  onChange,
  labelledBy,
  className = "grid-cols-3",
}: {
  value: BusinessTypeId[];
  onChange: (next: BusinessTypeId[]) => void;
  labelledBy?: string;
  /** Grid columns, e.g. "grid-cols-3 sm:grid-cols-4". */
  className?: string;
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
    <div role="group" aria-labelledby={labelledBy} className={`grid gap-2.5 ${className}`}>
      {BUSINESS_TYPES.map(({ id, label }) => {
        const on = value.includes(id);
        const Icon = ICONS[id];
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(id)}
            onPointerDown={ripple}
            className={`relative flex min-h-[96px] select-none flex-col items-center justify-center gap-2 overflow-hidden rounded-md border px-2 py-3 text-center transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] focus-visible:outline-none! focus-visible:ring-4 focus-visible:ring-primary/15 ${
              on
                ? "border-primary bg-tint/60 ring-1 ring-inset ring-primary"
                : "border-line bg-white hover:border-slate/35 hover:bg-paper"
            }`}
          >
            {on && (
              <span className="admin-pop-check absolute right-1.5 top-1.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-primary text-white">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              </span>
            )}
            <span
              className={`grid h-11 w-11 place-items-center rounded-md transition-colors ${
                on ? "bg-white text-primary shadow-sm" : "bg-paper text-ink/70"
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
            <span className={`text-[12.5px] font-semibold leading-tight ${on ? "text-ink" : "text-ink/80"}`}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
