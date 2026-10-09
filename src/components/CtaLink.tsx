import { ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "white" | "outline-light" | "whatsapp";
type Size = "sm" | "md" | "lg";

const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary/90",
  secondary: "border border-line bg-white text-ink hover:bg-tint",
  white: "bg-white text-secondary hover:bg-paper",
  "outline-light": "border border-white/40 text-white hover:bg-white/10",
  whatsapp: "bg-whatsapp text-white hover:bg-whatsapp/90",
};

const SIZE_STYLES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3 text-sm sm:py-4 sm:text-base",
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
  const classes = `inline-flex items-center justify-center rounded-btn font-semibold transition ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`;

  if (external) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  // next/link enables soft navigation, which lets /get-pricing open as a modal.
  return (
    <Link href={href} onClick={onClick} className={classes}>
      {children}
    </Link>
  );
}
