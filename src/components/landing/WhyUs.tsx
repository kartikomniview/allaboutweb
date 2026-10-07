import { PenTool, Share2, Smartphone, Users, type LucideIcon } from "lucide-react";
import { revealDelay } from "@/lib/reveal";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";

const REASONS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Users,
    title: "Direct communication",
    description: "Talk to the person building your project — no middlemen.",
  },
  {
    icon: PenTool,
    title: "Made for you",
    description: "No generic templates. Designed around your business.",
  },
  {
    icon: Smartphone,
    title: "Mobile first",
    description: "Looks great and loads fast on every phone.",
  },
  {
    icon: Share2,
    title: "Easy to share",
    description: "Send your site or catalog straight on WhatsApp.",
  },
];

export default function WhyUs() {
  return (
    <Section id="why-us">
      <SectionHeading
        align="center"
        eyebrow="Why AllAboutWeb"
        title="Simple, personal and built to work"
      />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-4">
        {REASONS.map(({ icon: Icon, title, description }, i) => (
          <div
            key={title}
            data-reveal="up"
            style={revealDelay(i * 100)}
            className="group rounded-card border border-line bg-paper p-4 transition hover:-translate-y-1 hover:border-primary/40 hover:bg-white hover:shadow-lift sm:p-6"
          >
            <span className="inline-flex items-center justify-center rounded-btn bg-white p-2.5 text-primary shadow-card transition group-hover:bg-primary group-hover:text-white">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-sm font-bold leading-snug text-ink sm:mt-4 sm:text-lg">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate sm:mt-2 sm:text-[0.9375rem] sm:leading-7">
              {description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
