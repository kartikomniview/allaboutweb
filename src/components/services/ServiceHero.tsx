import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import CtaLink from "@/components/CtaLink";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { pricingHref, whatsappUrl } from "@/lib/contact";
import type { ServicePage } from "./content";

const enter = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties;

/**
 * Top of a service page: a short title row with the starting price and CTAs,
 * then the showcase (`children` — live demos, recent work) straight away.
 */
export default function ServiceHero({ page, children }: { page: ServicePage; children: ReactNode }) {
  const { key, price, priceSuffix, hero, whatsappMessage } = page;

  return (
    <section id="top" className="relative isolate overflow-hidden bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-8 header:px-8 lg:pb-20">
        <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="animate-enter-up" style={enter(0)}>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-primary sm:text-xs">
              {hero.eyebrow}
            </p>
            <h1 className="mt-1.5 text-[1.5rem] font-bold leading-[1.2] sm:mt-2 sm:text-4xl">
              {hero.title} <span className="text-primary">{hero.highlight}</span>
            </h1>
            <p className="mt-2 text-sm text-slate sm:text-base">
              Starts from{" "}
              <strong className="text-lg font-extrabold text-ink sm:text-xl">₹{price}</strong>
              {priceSuffix ?? "/-"}
            </p>
          </div>

          <div className="animate-enter-up grid shrink-0 grid-cols-2 gap-2.5 sm:flex sm:gap-3" style={enter(120)}>
            <CtaLink href={pricingHref(key)} className="group gap-2 shadow-lg shadow-button/25">
              Get Free Quote
              <ArrowRight
                className="hidden h-4 w-4 transition-transform group-hover:translate-x-0.5 min-[400px]:block"
                aria-hidden="true"
              />
            </CtaLink>
            <CtaLink href={whatsappUrl(whatsappMessage)} external variant="whatsapp" className="gap-2">
              <WhatsAppIcon />
              WhatsApp
            </CtaLink>
          </div>
        </div>

        <div className="animate-enter-zoom mt-6 sm:mt-8" style={enter(200)}>
          {children}
        </div>
      </div>
    </section>
  );
}

/** Small label above a showcase item, e.g. "Live template" / "Furniture store website". */
export function ShowcaseCaption({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-3">
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h2 className="mt-0.5 text-base font-bold text-ink sm:text-lg">{title}</h2>
    </div>
  );
}
