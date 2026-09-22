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

const REASONS = [
  {
    icon: DirectIcon,
    title: "Direct Communication",
    description: "Talk directly to the person working on your project.",
  },
  {
    icon: CustomIcon,
    title: "Made for Your Business",
    description: "No generic templates copied from somewhere else.",
  },
  {
    icon: MobileIcon,
    title: "Mobile Friendly",
    description:
      "Your customers can browse your website or catalog easily from their phone.",
  },
  {
    icon: ShareIcon,
    title: "Easy to Share",
    description: "Share your catalog or website directly through WhatsApp.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="scroll-mt-24 bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 header:px-8">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Why Work With Us
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-card border border-line bg-white p-6"
            >
              <div className="inline-flex items-center justify-center rounded-btn bg-tint p-2.5 text-secondary">
                <Icon />
              </div>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
