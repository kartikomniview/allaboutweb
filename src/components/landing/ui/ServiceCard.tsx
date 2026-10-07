import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import type { Service } from "../data";
import SmartLink from "./SmartLink";

/** Large image card for a featured service. */
export function ServiceCard({ service, className = "" }: { service: Service; className?: string }) {
  const { id, name, description, price, icon: Icon, image, href, badge, features } = service;

  return (
    <SmartLink
      href={href}
      className={`group flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift ${className}`}
    >
      <article id={id} className="flex flex-1 scroll-mt-24 flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-paper">
          {image && (
            <Image
              src={image}
              alt={`${name} by AllAboutWeb`}
              fill
              sizes="(min-width: 768px) 33vw, 80vw"
              className="object-cover object-top transition duration-500 group-hover:scale-105"
            />
          )}
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-white shadow-sm">
              {badge}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-tint text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="text-base font-bold leading-snug text-ink sm:text-lg">{name}</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate">{description}</p>

          {features && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-ink">
                  <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm text-slate">
                From <strong className="text-base font-bold text-ink">₹{price}</strong>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition group-hover:bg-primary">
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </SmartLink>
  );
}

/** Compact icon card for secondary services. */
export function ServiceMiniCard({ service }: { service: Service }) {
  const { id, name, description, price, icon: Icon, href } = service;

  return (
    <SmartLink
      href={href}
      className="group flex w-full flex-col rounded-card border border-line bg-white p-4 shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift"
    >
      <article id={id} className="flex flex-1 scroll-mt-24 flex-col">
        <span className="flex h-11 w-11 items-center justify-center rounded-btn bg-paper text-ink transition group-hover:bg-tint group-hover:text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-3 text-sm font-bold leading-snug text-ink sm:text-base">{name}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate sm:text-sm sm:leading-6">
          {description}
        </p>
        <p className="mt-auto pt-3 text-xs text-slate">
          From <strong className="text-sm font-bold text-ink">₹{price}</strong>
        </p>
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
