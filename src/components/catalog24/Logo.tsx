/**
 * Catalog24 wordmark with its "by AllAboutWeb" credit. Text for now —
 * swap in an <Image> here once there's a Catalog24 logo file.
 */
export default function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const name = size === "sm" ? "text-xl sm:text-2xl" : "text-2xl sm:text-[1.75rem]";

  return (
    <span className="flex flex-col leading-none">
      <span className={`font-extrabold tracking-tight text-ink ${name}`}>
        Catalog<span className="text-primary">24</span>
      </span>
      <span className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-slate">
        by AllAboutWeb
      </span>
    </span>
  );
}
