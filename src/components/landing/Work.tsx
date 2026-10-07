import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { revealDelay } from "@/lib/reveal";
import { WORK, type WorkItem } from "./data";
import HScroll from "./ui/HScroll";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";
import SmartLink from "./ui/SmartLink";

function WorkCard({ item }: { item: WorkItem }) {
  const { id, category, title, description, image, link, badge } = item;

  const body = (
    <article id={id} className="flex flex-1 scroll-mt-24 flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper">
        <Image
          src={image}
          alt={`${title} — ${category} by AllAboutWeb`}
          fill
          sizes="(min-width: 768px) 33vw, 82vw"
          className="object-cover object-top transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-ink shadow-sm">
          {category}
        </span>
        {badge && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-white shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-base font-bold text-ink sm:text-lg">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-slate">{description}</p>
        {link && (
          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary">
            {link.label}
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
        description={
          <>
            Websites and catalogs built for <strong>real businesses</strong> — open them and
            see for yourself.
          </>
        }
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
