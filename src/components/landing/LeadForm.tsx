import { Check } from "lucide-react";
import CtaLink from "@/components/CtaLink";
import PricingForm from "@/components/PricingForm";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { whatsappUrl } from "@/lib/contact";
import { revealDelay } from "@/lib/reveal";
import SectionHeading from "./ui/SectionHeading";

const PROMISES = [
  "Free quote — no obligation",
  "Talk directly to your designer",
  "Fixed scope, no hidden costs",
];

export default function LeadForm() {
  return (
    <section id="contact" className="relative isolate scroll-mt-20 overflow-hidden bg-secondary">
      <div
        className="absolute -left-40 top-10 -z-10 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-40 bottom-0 -z-10 h-[24rem] w-[24rem] rounded-full bg-[#0f5a57]/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:gap-12 sm:px-6 sm:py-20 header:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div>
          <SectionHeading
            tone="dark"
            eyebrow="Get started"
            title={
              <>
                Ready to grow your business <span className="text-primary">online?</span>
              </>
            }
            description={
              <>
                Tell us what you need and we&apos;ll send you <strong>the pricing on WhatsApp</strong>.
              </>
            }
          />

          <ul className="mt-6 flex flex-col gap-3 sm:mt-8">
            {PROMISES.map((promise, i) => (
              <li
                key={promise}
                data-reveal="up"
                style={revealDelay(200 + i * 80)}
                className="flex items-center gap-3 text-sm text-white sm:text-base"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {promise}
              </li>
            ))}
          </ul>

          <div data-reveal="up" style={revealDelay(450)} className="mt-8">
            <CtaLink
              href={whatsappUrl("Hi AllAboutWeb, I'd like a quote for my business.")}
              external
              variant="whatsapp"
              size="lg"
              className="w-full gap-2 sm:w-auto"
            >
              <WhatsAppIcon />
              Chat on WhatsApp
            </CtaLink>
          </div>
        </div>

        <div
          id="quote-form"
          data-reveal="right"
          style={revealDelay(120)}
          className="scroll-mt-24 rounded-panel bg-white p-5 shadow-lift sm:p-8"
        >
          <PricingForm headingLevel="h3" />
        </div>
      </div>
    </section>
  );
}
