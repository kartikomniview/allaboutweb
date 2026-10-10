import type { SVGProps } from "react";

/**
 * Duotone step illustrations for the "How it works" section.
 * Drawn on a 64×64 grid; colours come from theme tokens via Tailwind classes.
 */
type IconProps = { className?: string };

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 64 64",
  fill: "none",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

/** Two chat bubbles — share your requirements on WhatsApp. */
export function ChatIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path
        d="M14 8h22a8 8 0 0 1 8 8v10a8 8 0 0 1-8 8H22l-8 7v-7a8 8 0 0 1-8-8V16a8 8 0 0 1 8-8z"
        className="fill-primary"
      />
      <path d="M15 18h20M15 25h12" className="stroke-white" />
      <path
        d="M30 30h20a8 8 0 0 1 8 8v8a8 8 0 0 1-8 8v6l-7-6H30a8 8 0 0 1-8-8v-8a8 8 0 0 1 8-8z"
        className="fill-white stroke-ink"
      />
      <circle cx="33" cy="42" r="2" className="fill-ink" />
      <circle cx="40" cy="42" r="2" className="fill-ink" />
      <circle cx="47" cy="42" r="2" className="fill-primary" />
    </svg>
  );
}

/** Browser window with a pencil — we design & build. */
export function DesignIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="6" y="10" width="44" height="36" rx="6" className="fill-white stroke-ink" />
      <path d="M6 19h44" className="stroke-ink" />
      <circle cx="12" cy="14.5" r="1.5" className="fill-primary" />
      <circle cx="17" cy="14.5" r="1.5" className="fill-primary" />
      <rect x="12" y="25" width="14" height="14" rx="2.5" className="fill-primary/25" />
      <path d="M31 27h13M31 33h9" className="stroke-slate" />
      <path d="M38.1 48.2l15.1-15 5.6 5.6-15 15.1z" className="fill-primary stroke-ink" />
      <path d="M38.1 48.2l5.7 5.7L36 56z" className="fill-white stroke-ink" />
      <path d="M50.3 36l5.7 5.7" className="stroke-ink" />
    </svg>
  );
}

/** Page under a magnifier with a tick — you review. */
export function ReviewIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path
        d="M12 6h24l10 10v38a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z"
        className="fill-white stroke-ink"
      />
      <path d="M36 6v10h10" className="stroke-ink" />
      <path d="M16 24h18M16 31h12M16 38h8" className="stroke-slate" />
      <path d="M48 48l8 8" strokeWidth={5} className="stroke-ink" />
      <circle cx="40" cy="40" r="11" strokeWidth={3} className="fill-tint stroke-primary" />
      <path d="M35 40l3.5 3.5L45 37" strokeWidth={3} className="stroke-primary" />
    </svg>
  );
}

/** Rocket taking off — launch. */
export function LaunchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M52 9v6M49 12h6M12 18v4M10 20h4" className="stroke-primary" />
      <path d="M27 51c0 4 2.5 7 5 9 2.5-2 5-5 5-9z" className="fill-primary" />
      <path d="M20 34l-8 8v8l8-4zM44 34l8 8v8l-8-4z" className="fill-primary stroke-ink" />
      <path d="M32 6c8 6 12 15 12 26v12H20V32c0-11 4-20 12-26z" className="fill-white stroke-ink" />
      <path d="M26 44v4h12v-4" className="stroke-ink" />
      <circle cx="32" cy="26" r="5" className="fill-tint stroke-ink" />
    </svg>
  );
}
