import CtaLink from "@/components/CtaLink";
import { whatsappUrl } from "@/lib/contact";

export const ECATALOG_PROMO_PATH = "/app/catalog/furniture/get-ecatalog";

const POINTS = [
  "Your products, prices and offers in one shareable link",
  "Customer enquiries come straight to your WhatsApp",
  "No hosting or domain needed — we manage everything",
  "Prices stay up to date, change them anytime",
];

export default function EcatalogPromo({
  headingLevel = "h2",
}: {
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;

  return (
    <div className="text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">E-Catalog by AllAboutWeb</p>
      <Heading className="mt-2 text-lg font-bold leading-snug text-ink sm:text-xl">
        Get a catalog like this for your business
      </Heading>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate">
        Showcase your products, grow your sales and turn visitors into customers.
      </p>

      <ul className="mt-5 space-y-2.5 rounded-card bg-paper p-4 text-left">
        {POINTS.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-[13px] leading-snug text-ink">
            <span className="mt-px inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-2.5 w-2.5"
                aria-hidden="true"
              >
                <path d="M3.5 8.5l3 3 6-7" />
              </svg>
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <CtaLink
        href={whatsappUrl(
          "Hi AllAboutWeb! I liked your furniture e-catalog demo. Please share the pricing for an e-catalog for my business."
        )}
        external
        variant="whatsapp"
        className="mt-5 h-11 w-full gap-2 !py-0 shadow-[0_6px_16px_-6px_rgba(31,184,85,0.6)]"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.43 9.43 0 0 1-4.8-1.31l-.35-.21-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.45-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43zm8.03-17.46A11.27 11.27 0 0 0 12.04.72C5.8.72.71 5.8.71 12.04c0 2 .52 3.95 1.52 5.66L.62 23.28l5.7-1.5a11.3 11.3 0 0 0 5.41 1.38h.01c6.24 0 11.33-5.08 11.33-11.32 0-3.02-1.18-5.87-3.32-8.01z" />
        </svg>
        Get pricing on WhatsApp
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </CtaLink>
      <p className="mt-2 text-[11px] text-slate">Opens WhatsApp with a ready message. No sign-up needed.</p>
    </div>
  );
}
