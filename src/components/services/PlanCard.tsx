import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PRICING_PATH, pricingHref } from "@/lib/contact";
import type { ServicePage } from "./content";

/** The service's starting plan, styled like the "most popular" pricing card. */
export default function PlanCard({ page }: { page: ServicePage }) {
  const { key, name, price, priceSuffix, included } = page;

  return (
    <div data-reveal="up" className="mx-auto max-w-xl">
      <div className="rounded-panel bg-ink p-6 text-white shadow-xl shadow-ink/20 sm:p-8">
        <p className="text-sm font-bold text-white/70">{name}</p>
        <p className="mt-1 text-4xl font-extrabold leading-tight sm:text-5xl">
          <span className="mr-1.5 text-sm font-medium text-white/60">Starts from</span>₹{price}
          <span className="text-base font-semibold text-white/70">{priceSuffix ?? "/-"}</span>
        </p>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">What&apos;s included</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-white/90 sm:text-[0.9375rem]">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href={pricingHref(key)}
          className="group mt-7 flex items-center justify-center gap-2 rounded-btn bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary/90 sm:text-base"
        >
          Get started
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>

      <p className="mt-5 text-center text-sm text-slate">
        Need more pages, products or features?{" "}
        <Link href={PRICING_PATH} className="font-semibold text-primary hover:text-ink">
          Get a custom quote →
        </Link>
      </p>
    </div>
  );
}
