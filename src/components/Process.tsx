import { ReactNode } from "react";
import SectionHeading from "./SectionHeading";
import { revealDelay } from "@/lib/reveal";

const STEPS: { title: string; description: ReactNode }[] = [
  {
    title: "Tell Us What You Need",
    description: (
      <>
        Send us your <strong>requirements, products, images and content</strong>.
      </>
    ),
  },
  {
    title: "We Design & Build",
    description: (
      <>
        We create your <strong>website, e-catalog or product catalog</strong>.
      </>
    ),
  },
  {
    title: "Review",
    description: (
      <>
        You review the work and tell us{" "}
        <strong>what needs to be changed</strong>.
      </>
    ),
  },
  {
    title: "Launch",
    description: (
      <>
        We deliver the final website/catalog and{" "}
        <strong>help you get started</strong>.
      </>
    ),
  },
];

export default function Process() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6 header:px-8">
        <SectionHeading
          eyebrow="Process"
          title={
            <>
              How It <span className="highlight">Works</span>
            </>
          }
          description={
            <>
              A simple, <strong>four-step process</strong> from first message
              to launch.
            </>
          }
        />

        <ol className="relative mt-10 grid grid-cols-2 gap-x-3 gap-y-6 sm:mt-12 sm:gap-8 lg:grid-cols-4 lg:gap-6">
          <span
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-6 hidden border-t-2 border-dashed border-primary/30 lg:block"
          />
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              data-reveal="up"
              style={revealDelay(index * 120)}
              className="group relative flex flex-col items-center text-center"
            >
              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg shadow-primary/30 ring-4 ring-white transition group-hover:scale-110 sm:h-12 sm:w-12 sm:text-sm sm:ring-8">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="mt-3 w-full flex-1 rounded-card border border-line bg-paper p-4 transition group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:bg-white group-hover:shadow-lg sm:mt-5 sm:p-6">
                <h3 className="text-base font-semibold leading-snug sm:text-lg">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-slate sm:mt-2 sm:text-[0.9375rem] sm:leading-7">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
