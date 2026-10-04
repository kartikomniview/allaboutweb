import { ReactNode } from "react";
import SectionHeading from "./SectionHeading";
import { revealDelay } from "@/lib/reveal";

const FAQS: { question: string; answer: ReactNode }[] = [
  {
    question: "How long does it take to build a website?",
    answer: (
      <>
        Most business websites are ready within{" "}
        <strong>one to two weeks</strong>, depending on the number of pages
        and how quickly we receive your content. E-catalogs and PDF catalogs
        are <em>usually quicker</em>.
      </>
    ),
  },
  {
    question: "Can I update my products later?",
    answer: (
      <>
        <strong>Yes.</strong> Send us new products, prices, or images anytime
        and we&apos;ll update your e-catalog or catalog PDF for you.
      </>
    ),
  },
  {
    question: "Can you create the catalog from my existing product images?",
    answer: (
      <>
        <strong>Yes.</strong> Send over the photos and details you already
        have and we&apos;ll design the catalog around them —{" "}
        <em>a professional photoshoot isn&apos;t required.</em>
      </>
    ),
  },
  {
    question: "Can I share the e-catalog on WhatsApp?",
    answer: (
      <>
        <strong>Yes.</strong> Every e-catalog comes with a{" "}
        <strong>single shareable link</strong> that opens straight from
        WhatsApp, Instagram, or anywhere else.
      </>
    ),
  },
  {
    question: "Do you provide hosting and domain?",
    answer: (
      <>
        <strong>Yes</strong> — we can set up hosting and a domain for you, or
        work with a domain and hosting you already have,{" "}
        <em>whichever is easier.</em>
      </>
    ),
  },
  {
    question: "How do I get started?",
    answer: (
      <>
        Message us on <strong>WhatsApp</strong> or fill out the{" "}
        <strong>quote form below</strong>, and we&apos;ll get back to you with
        next steps.
      </>
    ),
  },
];

export default function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20 sm:px-6 header:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              Frequently Asked <span className="highlight">Questions</span>
            </>
          }
        />

        <div className="mt-10 divide-y divide-line border-t border-line">
          {FAQS.map((faq, i) => (
            <details
              key={faq.question}
              data-reveal="up"
              style={revealDelay(i * 70)}
              className="group py-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ink marker:content-none hover:text-primary">
                {faq.question}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tint text-lg font-semibold text-primary transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
