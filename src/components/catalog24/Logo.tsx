import Image from "next/image";
import logo from "../../../public/catalog24/logo.webp";
import favicon from "../../../public/catalog24/favicon.webp";

// logo.webp is 860×290 with a lot of transparent space around the wordmark, which
// sits in an area 733×144 starting at (64, 95). The image is cropped to that area so
// the height you set is the height of the wordmark. Percentages are of the frame's
// width, which also applies to margin-top.
const INK = { w: 733, h: 144, x: 64, y: 95 };

/** The Catalog24 wordmark. Set its height through `className` (e.g. "h-7"); the width follows. */
export function Wordmark({ className = "h-7", eager = false }: { className?: string; eager?: boolean }) {
  return (
    <span className={`block shrink-0 overflow-hidden ${className}`} style={{ aspectRatio: `${INK.w} / ${INK.h}` }}>
      <Image
        src={logo}
        alt="Catalog24"
        loading={eager ? "eager" : undefined}
        sizes="240px"
        className="block h-auto max-w-none"
        style={{
          width: `${(logo.width / INK.w) * 100}%`,
          marginLeft: `${(-INK.x / INK.w) * 100}%`,
          marginTop: `${(-INK.y / INK.w) * 100}%`,
        }}
      />
    </span>
  );
}

/** The square "C24" app icon (the favicon). Set its size through `className`. */
export function AppIcon({ className = "h-9 w-9" }: { className?: string }) {
  return <Image src={favicon} alt="" aria-hidden className={`shrink-0 ${className}`} />;
}

/** Catalog24 wordmark with its "by AllAboutWeb" credit. `eager` for the one at the top of the page. */
export default function Logo({ size = "md", eager = false }: { size?: "sm" | "md"; eager?: boolean }) {
  const height = size === "sm" ? "h-6 sm:h-7" : "h-7 sm:h-8";

  return (
    <span className="flex flex-col leading-none">
      <Wordmark className={height} eager={eager} />
      <span className="mt-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-slate">
        by AllAboutWeb
      </span>
    </span>
  );
}
