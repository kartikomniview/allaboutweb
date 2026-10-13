import HScroll from "@/components/landing/ui/HScroll";
import { revealDelay } from "@/lib/reveal";
import type { Feature } from "./content";

/** Swipeable row of short icon + title cards (arrows on desktop). */
export function FeatureRow({ items, label }: { items: Feature[]; label: string }) {
  return (
    <HScroll label={label}>
      {items.map(({ icon: Icon, title }, i) => (
        <div
          key={title}
          data-reveal="up"
          style={revealDelay(i * 50)}
          className="flex w-36 shrink-0 snap-start flex-col rounded-card border border-line bg-white p-4 shadow-card sm:w-44 sm:p-5 lg:w-48"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tint text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-3 text-sm font-bold leading-snug text-ink sm:text-[0.9375rem]">{title}</h3>
        </div>
      ))}
    </HScroll>
  );
}

/** Centered icon + title + short line cards, 2 across on mobile and 4 on desktop. */
export default function FeatureGrid({ items }: { items: Feature[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {items.map(({ icon: Icon, title, description }, i) => (
        <li
          key={title}
          data-reveal="up"
          style={revealDelay(i * 60)}
          className="rounded-card border border-line bg-white p-4 text-center shadow-card sm:p-5"
        >
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-tint text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-3 text-[0.9375rem] font-bold text-ink sm:text-base">{title}</h3>
          {description && <p className="mt-1 text-xs leading-5 text-slate sm:text-sm sm:leading-6">{description}</p>}
        </li>
      ))}
    </ul>
  );
}
