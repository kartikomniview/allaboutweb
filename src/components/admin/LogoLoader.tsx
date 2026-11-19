import { AppIcon } from "@/components/catalog24/Logo";

/**
 * The full-screen loading state of the admin: the Catalog24 app icon inside a thin
 * spinning ring. `label` is for screen readers only.
 * (With "reduce motion" on, the ring stays still.)
 */
export default function LogoLoader({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div role="status" className={`flex flex-1 flex-col items-center justify-center px-4 py-10 ${className}`}>
      <span className="admin-fade-in relative grid h-[4.5rem] w-[4.5rem] place-items-center">
        <span aria-hidden className="absolute inset-0 rounded-full border-2 border-primary/15" />
        <span
          aria-hidden
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary [animation-duration:0.9s]"
        />
        <AppIcon className="h-11 w-11" />
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
