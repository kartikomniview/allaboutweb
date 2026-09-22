import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "white" | "outline-light";
type Size = "sm" | "md";

const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-secondary to-tertiary text-primary hover:opacity-90",
  secondary: "border border-line bg-white text-ink hover:bg-tint",
  white: "bg-white text-primary hover:bg-paper",
  "outline-light": "border border-white/40 text-white hover:bg-white/10",
};

const SIZE_STYLES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
};

export default function CtaLink({
  href,
  variant = "primary",
  size = "md",
  external = false,
  className = "",
  onClick,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  external?: boolean;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-btn font-semibold transition ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
