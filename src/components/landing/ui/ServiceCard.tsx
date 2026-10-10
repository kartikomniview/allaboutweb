import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Service } from "../data";
import SmartLink from "./SmartLink";

/** Image-first app-style card for a featured service. */
export function ServiceCard({ service, className = "" }: { service: Service; className?: string }) {
  const { id, name, price, image, href, badge } = service;

  return (
    <SmartLink
      href={href}
      className={`group flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift ${className}`}
    >
      <article id={id} className="flex flex-1 scroll-mt-24 flex-col">
        <div className="relative aspect-[7/5] overflow-hidden bg-paper">
          {image && (
            <Image
              src={image}
              alt={`${name} by AllAboutWeb`}
              fill
              sizes="(min-width: 768px) 33vw, 80vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          )}
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-white shadow-sm">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h3 className="truncate text-[0.9375rem] font-bold leading-snug text-ink sm:text-lg">{name}</h3>
            <p className="text-xs text-slate sm:text-sm">
              From <strong className="font-bold text-ink">₹{price}</strong>
            </p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition group-hover:bg-primary">
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </article>
    </SmartLink>
  );
}

/** Compact image-first card for secondary services. */
export function ServiceMiniCard({ service, wide = false }: { service: Service; wide?: boolean }) {
  const { id, name, price, icon: Icon, image, href } = service;

  return (
    <SmartLink
      href={href}
      className="group flex w-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift"
    >
      <article id={id} className="flex flex-1 scroll-mt-24 flex-col">
        {/* A full-row card on the 2-column mobile grid gets a letterbox crop */}
        <div
          className={`relative overflow-hidden bg-tint ${wide ? "aspect-[16/7] sm:aspect-[4/3]" : "aspect-[4/3]"}`}
        >
          {image ? (
            <Image
              src={image}
              alt={`${name} by AllAboutWeb`}
              fill
              sizes={wide ? "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 100vw" : "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-primary/70">
              <Icon className="h-9 w-9" strokeWidth={1.5} aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-3 py-2.5 sm:px-4 sm:py-3">
          <h3 className="line-clamp-1 text-sm font-bold leading-snug text-ink sm:text-base">{name}</h3>
          <p className="mt-0.5 text-xs text-slate">
            From <strong className="font-bold text-ink">₹{price}</strong>
          </p>
        </div>
      </article>
    </SmartLink>
  );
}

/** App-home-screen style icon tile (mobile quick access). */
export function ServiceTile({
  href,
  label,
  icon: Icon,
  highlight = false,
  image,
}: {
  href: string;
  label: string;
  icon: Service["icon"];
  highlight?: boolean;
  /** Square photo thumbnail; falls back to the icon when absent */
  image?: string;
}) {
  // Up to 72px, shrinking to fit narrower grid cells (e.g. 8 across on tablets)
  const tileClass =
    "relative flex aspect-square w-full max-w-[4.5rem] items-center justify-center overflow-hidden rounded-2xl shadow-card transition group-active:scale-95";

  return (
    <SmartLink href={href} className="group flex flex-col items-center gap-1.5 text-center">
      {image ? (
        <span className={`${tileClass} border border-line bg-paper`}>
          <Image src={image} alt="" fill sizes="72px" className="object-cover" />
          <span
            className="absolute inset-0 bg-linear-to-t from-ink/15 to-transparent to-50%"
            aria-hidden="true"
          />
        </span>
      ) : (
        <span
          className={`${tileClass} ${
            highlight ? "bg-primary text-white" : "border border-line bg-white text-primary"
          }`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <span className="line-clamp-2 text-[0.6875rem] font-semibold leading-tight text-ink">
        {label}
      </span>
    </SmartLink>
  );
}
