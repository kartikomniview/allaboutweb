import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { revealDelay } from "@/lib/reveal";
import { WORK, type WorkItem } from "./data";
import HScroll from "./ui/HScroll";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";
import SmartLink from "./ui/SmartLink";

function WorkCard({ item }: { item: WorkItem }) {
  const { id, category, title, image, link, badge } = item;

  const body = (
    <article id={id} className="flex flex-1 scroll-mt-24 flex-col">
      <div className="relative aspect-[7/5] overflow-hidden bg-paper">
        <Image
          src={image}
          alt={`${title} — ${category} by AllAboutWeb`}
          fill
          sizes="(min-width: 768px) 33vw, 82vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink shadow-sm">
          {category}
        </span>
        {badge && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-white shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
        <div className="min-w-0">
          <h3 className="truncate text-[0.9375rem] font-bold leading-snug text-ink sm:text-lg">{title}</h3>
          {link && <p className="text-xs font-semibold text-primary sm:text-sm">{link.label}</p>}
        </div>
        {link && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition group-hover:bg-primary">
            <ArrowUpRight
              className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        )}
      </div>
    </article>
  );

  const cardClass =
    "group flex w-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift";

  return link ? (
    <SmartLink href={link.href} className={cardClass}>
      {body}
    </SmartLink>
  ) : (
    <div className={cardClass}>{body}</div>
  );
}

export default function Work() {
  return (
    <Section id="work">
      <SectionHeading
        eyebrow="Our work"
        title="Recent projects"
      />

      <HScroll
        label="Projects"
        className="mt-6 sm:mt-10"
        gridClassName="md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0"
      >
        {WORK.map((item, i) => (
          <div
            key={item.id}
            data-reveal="up"
            style={revealDelay(i * 100)}
            className="flex w-[82%] max-w-sm shrink-0 snap-start md:w-auto md:max-w-none"
          >
            <WorkCard item={item} />
          </div>
        ))}
      </HScroll>
    </Section>
  );
}
