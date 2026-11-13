"use client";

import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Package, Plus, Search, type LucideIcon } from "lucide-react";

export type ComboOption = {
  value: string;
  label: string;
  image?: string;
  icon?: LucideIcon;
  /** Heading the option is listed under, e.g. "Lighting" or "Your categories". */
  group?: string;
  note?: string;
  /** Searched but not shown: other words for the option ("jug" for Vases & Planters). */
  keywords?: string[];
  /** A category's subcategories: typing one finds the category and picks both. */
  subs?: string[];
};

// Small square photo for an option; falls back to its icon when there's no image
// (or the file is missing from public/).
function Thumb({ src, icon: Icon = Package, size }: { src?: string; icon?: LucideIcon; size: "sm" | "md" }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const box = size === "md" ? "h-8 w-8" : "h-7 w-7";
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-[5px] bg-white ring-1 ring-line ${box}`}>
      {src && failedSrc !== src ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
        <img src={src} alt="" className="h-full w-full object-contain" onError={() => setFailedSrc(src)} />
      ) : (
        <Icon className="h-3.5 w-3.5 text-slate/70" aria-hidden />
      )}
    </span>
  );
}

const LIST_MAX_HEIGHT = 340;
const GAP = 4;
const norm = (s: string) => s.trim().toLowerCase();

// `sub`: the option was found through one of its subcategories.
type Entry = { kind: "option"; option: ComboOption; sub?: string } | { kind: "create"; text: string };

// Whether every typed word is in the option (label, value, group or keywords), and
// if not, the first subcategory that completes the match ("vase" -> Flower Vases).
function matchOption(o: ComboOption, words: string[]): { sub?: string } | null {
  const text = `${o.label} ${o.value} ${o.group ?? ""} ${(o.keywords ?? []).join(" ")}`.toLowerCase();
  if (words.every((w) => text.includes(w))) return {};
  for (const sub of o.subs ?? []) {
    const name = sub.toLowerCase();
    if (words.some((w) => name.includes(w)) && words.every((w) => name.includes(w) || text.includes(w))) return { sub };
  }
  return null;
}

// A dropdown with a search box. Typing filters the options (every word must
// match the label, its group, its keywords or one of its subcategories) and then
// lists the matching `suggestions` (e.g. other business types' categories); when
// nothing matches exactly, "+ Add “…”" creates a new value. Keyboard: arrows,
// Enter, Escape (without closing the drawer around it). The panel is portaled to
// <body> with fixed positioning so the drawer's scroll area can't clip it, and
// opens upwards when there's more room.
export default function CategoryCombobox({
  value,
  options,
  suggestions = [],
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled = false,
  labelledBy,
  allowCreate = true,
}: {
  value: string;
  options: ComboOption[];
  /** Only listed while searching, after the matching options. */
  suggestions?: ComboOption[];
  /** `sub`: the subcategory the option was found through, if any. */
  onChange: (value: string, sub?: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  labelledBy?: string;
  allowCreate?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? suggestions.find((o) => o.value === value);

  // Matching options, then (while searching) matching suggestions, then the "+ Add" entry.
  const entries = useMemo<Entry[]>(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    const find = (list: ComboOption[]): Entry[] =>
      list.flatMap((option) => {
        const match = matchOption(option, words);
        return match ? [{ kind: "option" as const, option, sub: match.sub }] : [];
      });
    const list = find(options);
    if (words.length) list.push(...find(suggestions));
    const typed = query.trim().replace(/\s+/g, " ");
    const exact = [...options, ...suggestions].some((o) => norm(o.label) === norm(typed) || norm(o.value) === norm(typed));
    if (allowCreate && typed && !exact) list.push({ kind: "create", text: typed.slice(0, 60) });
    return list;
  }, [options, suggestions, query, allowCreate]);

  // Place the panel under (or above) the button, and follow it while anything scrolls.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - GAP * 2;
      const above = rect.top - GAP * 2;
      const up = below < 240 && above > below;
      setPanelStyle({
        position: "fixed",
        left: rect.left,
        width: Math.max(rect.width, 260),
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

  const openPanel = () => {
    if (disabled) return;
    setQuery("");
    setActive(Math.max(options.findIndex((o) => o.value === value), 0));
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const pick = (entry: Entry) => {
    if (entry.kind === "option") onChange(entry.option.value, entry.sub);
    else onChange(entry.text);
    close();
  };

  // Focus the search box when the panel opens.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Close on a click outside.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the highlighted entry in view.
  useEffect(() => {
    if (open) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function onButtonKeyDown(e: KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openPanel();
    }
  }

  function onSearchKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // the drawer also closes on Escape
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, entries.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = entries[active] ?? entries[0];
      if (entry) pick(entry);
    } else if (e.key === "Tab") {
      close(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy}
        disabled={disabled}
        onClick={() => (open ? close() : openPanel())}
        onKeyDown={onButtonKeyDown}
        className={`flex h-12 w-full items-center gap-2 rounded-md border bg-white pl-2 pr-2.5 text-left text-base transition hover:border-slate/35 focus:outline-none focus-visible:outline-none! focus:ring-[3px] focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:pl-1.5 sm:pr-2 sm:text-sm ${
          open ? "border-primary ring-[3px] ring-primary/15" : "border-line focus:border-primary"
        }`}
      >
        <Thumb src={selected?.image} icon={selected?.icon} size="sm" />
        <span className={`min-w-0 flex-1 truncate ${value ? "text-ink" : "text-slate/55"}`}>
          {selected?.label ?? (value || placeholder)}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={panelStyle}
            className="z-[115] flex flex-col overflow-hidden rounded-[8px] border border-line bg-white shadow-[0_12px_32px_-12px_rgba(1,18,60,0.3)]"
          >
            <div className="relative shrink-0 border-b border-line p-1.5">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate/70" aria-hidden />
              <input
                ref={searchRef}
                role="combobox"
                aria-expanded
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={entries[active] ? `${listId}-${active}` : undefined}
                aria-labelledby={labelledBy}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onSearchKeyDown}
                placeholder={searchPlaceholder}
                className="h-8 w-full rounded-[6px] bg-paper pl-7 pr-2 text-base text-ink placeholder:text-slate/60 focus:outline-none sm:text-[13px]"
              />
            </div>
            <ul ref={listRef} id={listId} role="listbox" aria-labelledby={labelledBy} className="min-h-0 overflow-y-auto p-1">
              {entries.length === 0 && (
                <li role="presentation" className="px-2 py-3 text-center text-[12px] text-slate">
                  No matches
                </li>
              )}
              {entries.map((entry, i) => {
                const group = entry.kind === "option" ? entry.option.group : undefined;
                const prev = entries[i - 1];
                const prevGroup = prev?.kind === "option" ? prev.option.group : undefined;
                const header = group && group !== prevGroup && (
                  <li
                    role="presentation"
                    className="px-2 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-slate/80"
                  >
                    {group}
                  </li>
                );

                if (entry.kind === "create") {
                  return (
                    <li
                      key="__create"
                      id={`${listId}-${i}`}
                      data-index={i}
                      role="option"
                      aria-selected={false}
                      onPointerEnter={() => setActive(i)}
                      onClick={() => pick(entry)}
                      className={`mt-1 flex cursor-pointer items-center gap-2.5 rounded-[6px] border-t border-line px-1.5 py-2 text-[13px] font-semibold text-primary ${
                        i === active ? "bg-tint" : ""
                      }`}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[5px] bg-tint ring-1 ring-primary/20">
                        <Plus className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 truncate">Add “{entry.text}”</span>
                    </li>
                  );
                }

                const { option, sub } = entry;
                const isSelected = option.value === value;
                // Found through a subcategory: say which one (picking it sets both).
                const note = sub ? `› ${sub}` : option.note;
                return (
                  <Fragment key={`${option.group ?? ""}|${option.value}`}>
                  {header}
                  <li
                    id={`${listId}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={isSelected}
                    onPointerEnter={() => setActive(i)}
                    onClick={() => pick(entry)}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-[6px] px-1.5 py-1.5 text-[13px] ${
                      i === active ? "bg-paper" : ""
                    } ${isSelected ? "font-semibold text-ink" : "text-ink/85"}`}
                  >
                    <Thumb src={option.image} icon={option.icon} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {note && <span className="block truncate text-[11px] font-normal text-slate">{note}</span>}
                    </span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
                  </li>
                  </Fragment>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
