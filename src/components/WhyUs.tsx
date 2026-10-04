import SectionHeading from "./SectionHeading";
import { revealDelay } from "@/lib/reveal";

function DirectIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
      <path
        d="M16 4.5c1.7.4 3 2 3 3.9s-1.3 3.5-3 3.9M20.5 19a5 5 0 0 0-4-4.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CustomIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M14 4l6 6-10 10H4v-6L14 4Z" strokeLinejoin="round" />
      <path d="M12 6l6 6" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" strokeLinecap="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" strokeLinecap="round" />
    </svg>
  );
}

const REASONS: {
  icon: () => React.JSX.Element;
  title: string;
  description: string;
}[] = [
  {
    icon: DirectIcon,
    title: "Direct Communication",
    description: "Talk to the person building your project.",
  },
  {
    icon: CustomIcon,
    title: "Made for You",
    description: "No generic templates. Built for your business.",
  },
  {
    icon: MobileIcon,
    title: "Mobile Friendly",
    description: "Looks great and works fast on every phone.",
  },
  {
    icon: ShareIcon,
    title: "Easy to Share",
    description: "Send your site or catalog straight on WhatsApp.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="scroll-mt-24 bg-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-20 sm:px-6 header:px-8 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-16">
        <SectionHeading
          tone="dark"
          eyebrow="Why AllAboutWeb"
          title={
            <>
              Why Work <span className="text-primary">With Us</span>
            </>
          }
          description={
            <>
              <strong>Simple, personal and built to work</strong> — everything
              a small business needs online.
            </>
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {REASONS.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              data-reveal="up"
              style={revealDelay(i * 100)}
              className="group rounded-card border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-primary/60 hover:bg-white/[0.08] sm:p-5"
            >
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <span className="inline-flex shrink-0 items-center justify-center rounded-btn bg-primary p-2 text-white transition group-hover:scale-110 sm:p-2.5">
                  <Icon />
                </span>
                <h3 className="text-base font-semibold leading-snug text-white sm:text-lg">
                  {title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/70 sm:mt-3 sm:text-[0.9375rem] sm:leading-7">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
