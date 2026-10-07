import { ReactNode } from "react";
import { revealDelay } from "@/lib/reveal";
import HScroll from "./ui/HScroll";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";

const STEPS: { title: string; description: ReactNode }[] = [
  {
    title: "Tell us what you need",
    description: (
      <>
        Send your <strong>requirements, products, images and content</strong> on WhatsApp.
      </>
    ),
  },
  {
    title: "We design & build",
    description: (
      <>
        We create your <strong>website, e-catalog or product catalog</strong>.
      </>
    ),
  },
  {
    title: "You review",
    description: (
      <>
        Check the work and tell us <strong>what needs to change</strong>.
      </>
    ),
  },
  {
    title: "Launch",
    description: (
      <>
        We deliver the final version and <strong>help you get started</strong>.
      </>
    ),
  },
];

export default function Process() {
  return (
    <Section id="how-it-works" tone="paper">
      <SectionHeading
        eyebrow="How it works"
        title="From first message to launch in 4 steps"
        description="No meetings, no paperwork — everything happens over WhatsApp and calls."
      />

      <div className="relative mt-6 sm:mt-10">
        <span
          aria-hidden="true"
          className="absolute left-[12.5%] right-[12.5%] top-8 hidden border-t-2 border-dashed border-primary/30 lg:block"
        />
        <HScroll
          label="Process steps"
          gridClassName="md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-4"
        >
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              data-reveal="up"
              style={revealDelay(i * 120)}
              className="relative w-[72%] max-w-xs shrink-0 snap-start rounded-card border border-line bg-white p-5 shadow-card md:w-auto md:max-w-none lg:bg-transparent lg:p-0 lg:text-center lg:shadow-none lg:border-0"
            >
              <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-lg shadow-primary/30 ring-4 ring-white lg:mx-auto lg:h-14 lg:w-14 lg:ring-8 lg:ring-paper">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="lg:mt-5 lg:rounded-card lg:border lg:border-line lg:bg-white lg:p-6 lg:shadow-card">
                <h3 className="mt-4 text-base font-bold text-ink sm:text-lg lg:mt-0">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate sm:text-[0.9375rem] sm:leading-7">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </HScroll>
      </div>
    </Section>
  );
}
