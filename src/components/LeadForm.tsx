import CtaLink from "./CtaLink";
import PricingForm from "./PricingForm";
import SectionHeading from "./SectionHeading";
import { revealDelay } from "@/lib/reveal";
import { PRICING_PATH } from "@/lib/contact";

export default function LeadForm() {
  return (
    <section id="contact" className="scroll-mt-24 bg-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:gap-12 sm:py-20 sm:px-6 header:px-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            tone="dark"
            eyebrow="Get in touch"
            title={
              <>
                Have a project <span className="text-primary">in mind?</span>
              </>
            }
            description={
              <>
                Tell us what you&apos;re looking for and we&apos;ll send you{" "}
                <strong>the pricing on WhatsApp</strong>.
              </>
            }
          />
          <div
            data-reveal="up"
            className="mt-8 flex flex-col gap-3 [--reveal-delay:240ms] sm:flex-row"
          >
            <CtaLink href={PRICING_PATH} variant="white">
              Get a Quote
            </CtaLink>
            <CtaLink href={PRICING_PATH} variant="outline-light">
              WhatsApp Us
            </CtaLink>
          </div>
        </div>

        <div
          id="quote-form"
          data-reveal="right"
          style={revealDelay(120)}
          className="scroll-mt-24 rounded-panel bg-white p-5 sm:p-8"
        >
          <PricingForm headingLevel="h3" />
        </div>
      </div>
    </section>
  );
}
