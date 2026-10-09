import { Quote, Star } from "lucide-react";
import { revealDelay } from "@/lib/reveal";
import { TESTIMONIALS } from "./data";
import HScroll from "./ui/HScroll";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Hidden automatically when there are no testimonials. */
export default function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <Section id="testimonials" tone="paper">
      <SectionHeading
        eyebrow="Testimonials"
        title="What our clients say"
        description="What businesses say about working with us."
      />

      <HScroll
        label="Client testimonials"
        className="mt-6 sm:mt-10"
        gridClassName="md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0"
      >
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={i}
            data-reveal="up"
            style={revealDelay(i * 100)}
            className="flex w-[85%] max-w-sm shrink-0 snap-start flex-col rounded-card border border-line bg-white p-5 shadow-card sm:p-6 md:w-auto md:max-w-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5 text-primary" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, s) => (
                  <Star key={s} className="h-4 w-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <Quote className="h-7 w-7 text-tint" fill="currentColor" aria-hidden="true" />
            </div>
            <blockquote className="mt-4 flex-1 text-sm leading-6.5 text-ink sm:text-[0.9375rem] sm:leading-7">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-white">
                {initials(t.name)}
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{t.name}</span>
                <span className="block text-xs text-slate">
                  {t.business} · {t.city}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </HScroll>
    </Section>
  );
}
