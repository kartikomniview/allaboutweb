const STEPS = [
  {
    title: "Tell Us What You Need",
    description:
      "Send us your requirements, products, images and content.",
  },
  {
    title: "We Design & Build",
    description: "We create your website, e-catalog or product catalog.",
  },
  {
    title: "Review",
    description:
      "You review the work and tell us what needs to be changed.",
  },
  {
    title: "Launch",
    description:
      "We deliver the final website/catalog and help you get started.",
  },
];

export default function Process() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 header:px-8">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-slate">
            A simple, four-step process from first message to launch.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-sm font-semibold text-secondary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
