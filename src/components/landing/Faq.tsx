import { ReactNode } from "react";
import { Plus } from "lucide-react";
import CtaLink from "@/components/CtaLink";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { whatsappUrl } from "@/lib/contact";
import { revealDelay } from "@/lib/reveal";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";

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
    <Section id="faq" tone="paper">
      <div className="lg:grid lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Quick answers to what businesses usually ask us."
          />
          <div
            data-reveal="up"
            className="mt-8 hidden rounded-card border border-line bg-white p-6 shadow-card lg:block"
          >
            <p className="font-bold text-ink">Still have a question?</p>
            <p className="mt-1 text-sm text-slate">
              Message us on WhatsApp and we&apos;ll get back to you.
            </p>
            <CtaLink
              href={whatsappUrl("Hi AllAboutWeb, I have a question.")}
              external
              variant="whatsapp"
              className="mt-4 gap-2"
            >
              <WhatsAppIcon />
              Ask on WhatsApp
            </CtaLink>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:mt-10 lg:mt-0">
          {FAQS.map((faq, i) => (
            <details
              key={faq.question}
              data-reveal="up"
              style={revealDelay(i * 70)}
              className="group rounded-card border border-line bg-white shadow-card transition open:border-primary/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-[0.9375rem] font-semibold text-ink marker:content-none hover:text-primary sm:p-5 sm:text-base [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tint text-primary transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  <Plus className="h-4 w-4" />
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-6.5 text-slate sm:px-5 sm:pb-5 sm:text-[0.9375rem] sm:leading-7">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
