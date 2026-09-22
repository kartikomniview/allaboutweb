const FAQS = [
  {
    question: "How long does it take to build a website?",
    answer:
      "Most business websites are ready within one to two weeks, depending on the number of pages and how quickly we receive your content. E-catalogs and PDF catalogs are usually quicker.",
  },
  {
    question: "Can I update my products later?",
    answer:
      "Yes. Send us new products, prices, or images anytime and we'll update your e-catalog or catalog PDF for you.",
  },
  {
    question: "Can you create the catalog from my existing product images?",
    answer:
      "Yes. Send over the photos and details you already have and we'll design the catalog around them — a professional photoshoot isn't required.",
  },
  {
    question: "Can I share the e-catalog on WhatsApp?",
    answer:
      "Yes. Every e-catalog comes with a single shareable link that opens straight from WhatsApp, Instagram, or anywhere else.",
  },
  {
    question: "Do you provide hosting and domain?",
    answer:
      "Yes — we can set up hosting and a domain for you, or work with a domain and hosting you already have, whichever is easier.",
  },
  {
    question: "How do I get started?",
    answer:
      "Message us on WhatsApp or fill out the quote form below, and we'll get back to you with next steps.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 header:px-8">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Frequently Asked Questions
        </h2>

        <div className="mt-8 divide-y divide-line border-t border-line">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink marker:content-none">
                {faq.question}
                <span
                  className="shrink-0 text-xl text-slate transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 leading-6 text-slate">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
