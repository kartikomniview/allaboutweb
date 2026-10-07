// Shared building blocks for the admin panel, so every page uses the same
// type scale, spacing and controls.

import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`admin-skeleton ${className}`} aria-hidden />;
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost";
type Size = "sm" | "md" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-[0_1px_2px_rgba(1,18,60,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-[#e85f1c]",
  secondary: "bg-white text-ink ring-1 ring-inset ring-line shadow-[0_1px_2px_rgba(1,18,60,0.06)] hover:bg-paper",
  ghost: "text-slate hover:bg-ink/[0.05] hover:text-ink",
  danger: "bg-red-600 text-white hover:bg-red-700",
  "danger-ghost": "text-red-600 hover:bg-red-50",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-2.5 text-[13px]",
  md: "h-10 gap-2 px-4 text-sm",
  icon: "h-10 w-10 text-sm",
};

export const buttonClass = (variant: Variant = "secondary", size: Size = "md", extra = "") =>
  `inline-flex shrink-0 items-center [&_svg]:shrink-0 justify-center rounded-btn font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }) {
  return (
    <button type={type} disabled={disabled || loading} className={buttonClass(variant, size, className)} {...props}>
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

type Tone = "success" | "neutral" | "brand" | "danger";

const TONES: Record<Tone, { badge: string; dot: string }> = {
  success: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", dot: "bg-emerald-500" },
  neutral: { badge: "bg-ink/[0.04] text-slate ring-ink/10", dot: "bg-slate/60" },
  brand: { badge: "bg-tint text-[#c4501a] ring-primary/20", dot: "bg-primary" },
  danger: { badge: "bg-red-50 text-red-700 ring-red-600/15", dot: "bg-red-500" },
};

export function Badge({ tone = "neutral", dot = false, children }: { tone?: Tone; dot?: boolean; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${TONES[tone].badge}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${TONES[tone].dot}`} aria-hidden />}
      {children}
    </span>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] text-slate">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate/60" aria-hidden />}
            {item.href ? (
              <Link href={item.href} className="font-medium transition-colors hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-ink" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs && (
          <div className="mb-2">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        <h1 className="text-[1.625rem] font-bold leading-tight tracking-[-0.025em] text-ink">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-card border border-line bg-white shadow-[0_1px_2px_rgba(1,18,60,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate">{children}</h2>;
}

export function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 60) return "Just now";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(diff / 86400), "day");
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
