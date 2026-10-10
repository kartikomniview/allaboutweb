import type { CSSProperties } from "react";
import { ArrowRight, Grid2x2 } from "lucide-react";
import CtaLink from "@/components/CtaLink";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { PRICING_PATH, whatsappUrl } from "@/lib/contact";
import BannerCarousel from "./BannerCarousel";
import { ALL_SERVICES, BANNERS, STATS } from "./data";
import { ServiceTile } from "./ui/ServiceCard";

const enter = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties;

export default function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-paper">
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_30%_30%,black_20%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -right-32 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6 sm:pb-16 sm:pt-10 header:px-8 lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-14">
        <div>
          <h1
            className="animate-enter-up max-w-xl text-[1.625rem] font-bold leading-[1.15] sm:text-5xl sm:leading-[1.08] lg:text-[3.5rem]"
            style={enter(0)}
          >
            Websites &amp; digital catalogs that{" "}
            <span className="text-primary">win you customers</span>
          </h1>

          <p
            className="animate-enter-up mt-3 max-w-lg text-sm leading-6 text-slate sm:mt-6 sm:text-lg sm:leading-8"
            style={enter(160)}
          >
            We design <strong>websites</strong>, <strong>shareable e-catalogs</strong> and{" "}
            <strong>product catalog PDFs</strong> for small and growing businesses —
            100% online, wherever you are.
          </p>

          <div
            className="animate-enter-up mt-5 grid grid-cols-2 gap-2.5 sm:mt-8 sm:flex sm:gap-3"
            style={enter(240)}
          >
            <CtaLink href={PRICING_PATH} size="lg" className="group gap-2 px-4! shadow-lg shadow-primary/25 sm:px-8!">
              Get Free Quote
              <ArrowRight className="hidden h-4 w-4 transition-transform group-hover:translate-x-0.5 min-[400px]:block" aria-hidden="true" />
            </CtaLink>
            <CtaLink
              href={whatsappUrl("Hi AllAboutWeb, I'd like to know more about your services.")}
              external
              variant="whatsapp"
              size="lg"
              className="gap-2 px-4! sm:px-8!"
            >
              <WhatsAppIcon />
              WhatsApp
            </CtaLink>
          </div>

          {/* Stats — desktop under the CTAs */}
          <dl
            className="animate-enter-up mt-10 hidden grid-cols-3 divide-x divide-line rounded-card border border-line bg-white shadow-card lg:grid"
            style={enter(320)}
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse px-4 py-3.5">
                <dt className="text-xs text-slate">{stat.label}</dt>
                <dd className="text-lg font-semibold text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-enter-zoom mt-7 sm:mt-10 lg:mt-0" style={enter(200)}>
          <BannerCarousel banners={BANNERS} />
        </div>

        {/* Mobile / tablet: app-style quick access to every service */}
        <div className="mt-7 lg:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.9375rem] font-bold text-ink">Our services</h2>
            <a href="#services" className="text-sm font-semibold text-primary">
              View all
            </a>
          </div>
          <nav
            aria-label="Services"
            className="mt-4 grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-8"
          >
            {ALL_SERVICES.slice(0, 7).map((service) => (
              <ServiceTile
                key={service.id}
                href={`#${service.id}`}
                label={service.shortName}
                icon={service.icon}
                image={service.thumb}
              />
            ))}
            <ServiceTile href="#services" label="All services" icon={Grid2x2} highlight />
          </nav>
        </div>
      </div>
    </section>
  );
}
