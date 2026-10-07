import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRICING_PATH } from "@/lib/contact";
import { revealDelay } from "@/lib/reveal";
import { FEATURED_SERVICES, MORE_SERVICES } from "./data";
import HScroll from "./ui/HScroll";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";
import { ServiceCard, ServiceMiniCard } from "./ui/ServiceCard";

export default function Services() {
  return (
    <Section id="services">
      <SectionHeading
        eyebrow="Our services"
        title="Everything your business needs online"
        description={
          <>
            Pick one service or combine them — <strong>clear starting prices</strong>, final
            quote based on what you need.
          </>
        }
        action={
          <Link
            href={PRICING_PATH}
            className="group hidden items-center gap-1.5 text-sm font-semibold text-primary hover:text-ink sm:inline-flex"
          >
            Get a quote
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        }
      />

      <div className="mt-6 sm:mt-10">
        <p className="mb-3 text-sm font-bold text-ink md:hidden">Popular</p>
        <HScroll
          label="Popular services"
          gridClassName="md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0"
        >
          {FEATURED_SERVICES.map((service, i) => (
            <div
              key={service.id}
              data-reveal="up"
              style={revealDelay(i * 100)}
              className="flex w-[80%] max-w-sm shrink-0 snap-start md:w-auto md:max-w-none"
            >
              <ServiceCard service={service} className="w-full" />
            </div>
          ))}
        </HScroll>
      </div>

      <div className="mt-6 sm:mt-10">
        <h3 className="text-sm font-bold text-ink sm:text-lg">More services</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {MORE_SERVICES.map((service, i) => (
            <div
              key={service.id}
              data-reveal="up"
              style={revealDelay(i * 60)}
              // An odd last card spans the full row on the 2-column mobile grid
              className="flex odd:last:col-span-2 sm:odd:last:col-span-1"
            >
              <ServiceMiniCard service={service} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
