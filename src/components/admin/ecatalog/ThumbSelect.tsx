"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Package } from "lucide-react";

export type ThumbOption = { value: string; label: string; image?: string; note?: string };

// Small square photo for an option; falls back to an icon when there's no image
// (or the file is missing from public/).
function Thumb({ src, size }: { src?: string; size: "sm" | "md" }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const box = size === "md" ? "h-8 w-8" : "h-7 w-7";
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-[5px] bg-white ring-1 ring-line ${box}`}>
      {src && failedSrc !== src ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
        <img src={src} alt="" className="h-full w-full object-contain" onError={() => setFailedSrc(src)} />
      ) : (
        <Package className="h-3.5 w-3.5 text-slate/60" aria-hidden />
      )}
    </span>
  );
}

const LIST_MAX_HEIGHT = 288;
const GAP = 4;

// A dropdown like <select>, but each option shows a thumbnail. Keyboard: arrows to
// move, Enter/Space to pick, Escape to close (without closing the drawer around it).
// The list is portaled to <body> with fixed positioning, so a card with
// overflow: hidden or the drawer's scroll area can't clip it; it opens upwards when
// there's more room above.
export default function ThumbSelect({
  value,
  options,
  onChange,
  placeholder = "Select…",
  disabled = false,
  labelledBy,
}: {
  value: string;
  options: ThumbOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  labelledBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [listStyle, setListStyle] = useState<CSSProperties>({});
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  // Place the list under (or above) the button, and follow it while anything scrolls.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - GAP * 2;
      const above = rect.top - GAP * 2;
      const wanted = Math.min(LIST_MAX_HEIGHT, listRef.current?.scrollHeight ?? LIST_MAX_HEIGHT);
      const up = below < wanted && above > below;
      setListStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(LIST_MAX_HEIGHT, up ? above : below),
        ...(up ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }),
      });
    };
    place();
    window.addEventListener("scroll", place, true); // capture: the drawer's own scroll area too
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  const openList = () => {
    if (disabled || !options.length) return;
    setActive(Math.max(options.findIndex((o) => o.value === value), 0));
    setOpen(true);
  };

  const pick = (option: ThumbOption) => {
    onChange(option.value);
    setOpen(false);
  };

  // Close on a click outside.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function onKeyDown(e: KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // the drawer also closes on Escape
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (options[active]) pick(options[active]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelledBy}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`flex h-10 w-full items-center gap-2 rounded-[7px] border bg-white pl-1.5 pr-2 text-left text-base transition hover:border-[#d3d7e2] focus:outline-none focus:ring-[3px] focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[13px] ${
          open ? "border-primary ring-[3px] ring-primary/15" : "border-line focus:border-primary"
        }`}
      >
        <Thumb src={selected?.image} size="sm" />
        <span className={`min-w-0 flex-1 truncate ${selected ? "text-ink" : "text-slate/55"}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={labelledBy}
            style={listStyle}
            className="z-[115] overflow-y-auto rounded-[8px] border border-line bg-white p-1 shadow-[0_12px_32px_-12px_rgba(1,18,60,0.3)]"
          >
            {options.map((option, i) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pick(option)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-[6px] px-1.5 py-1.5 text-[13px] ${
                    i === active ? "bg-paper" : ""
                  } ${isSelected ? "font-semibold text-ink" : "text-ink/85"}`}
                >
                  <Thumb src={option.image} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.note && <span className="block truncate text-[11px] font-normal text-slate">{option.note}</span>}
                  </span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
                </li>
              );
            })}
          </ul>,
        document.body,
      )}
    </div>
  );
}
