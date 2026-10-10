import { revealDelay } from "@/lib/reveal";
import { ChatIcon, DesignIcon, LaunchIcon, ReviewIcon } from "./ui/ProcessIcons";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";

const STEPS = [
  { title: "Share your needs", description: "Send details on WhatsApp", Icon: ChatIcon },
  { title: "We design", description: "Website, e-catalog or PDF", Icon: DesignIcon },
  { title: "You review", description: "Ask for any changes", Icon: ReviewIcon },
  { title: "Go live", description: "We launch & support you", Icon: LaunchIcon },
];

export default function Process() {
  return (
    <Section id="how-it-works" tone="paper">
      <SectionHeading eyebrow="How it works" title="Launch in 4 simple steps" />

      <div className="relative mt-6 sm:mt-10">
        {/* Desktop connector running through the icon tiles */}
        <span
          aria-hidden="true"
          className="absolute left-[12.5%] right-[12.5%] top-12 hidden border-t-2 border-dashed border-primary/30 lg:block"
        />
        <ol className="relative grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {STEPS.map(({ title, description, Icon }, i) => (
            <li
              key={title}
              data-reveal="up"
              style={revealDelay(i * 120)}
              className="flex flex-col items-center rounded-card border border-line bg-white px-3 py-5 text-center shadow-card sm:p-6 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
            >
              <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-tint lg:h-24 lg:w-24 lg:ring-8 lg:ring-paper">
                <Icon className="h-14 w-14 lg:h-16 lg:w-16" />
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg shadow-primary/30 ring-4 ring-white lg:ring-paper">
                  {i + 1}
                </span>
              </span>
              <div className="lg:mt-5 lg:w-full lg:rounded-card lg:border lg:border-line lg:bg-white lg:p-5 lg:shadow-card">
                <h3 className="mt-4 text-[0.9375rem] font-bold text-ink sm:text-lg lg:mt-0">{title}</h3>
                <p className="mt-1 text-xs text-slate sm:text-sm">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
