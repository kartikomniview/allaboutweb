"use client";

import { useState, type FormEvent } from "react";
import CtaLink from "./CtaLink";

type ServiceOption =
  | "Website Development"
  | "E-Catalog"
  | "Product Catalog PDF"
  | "Not sure yet";

type LeadPayload = {
  name: string;
  phone: string;
  service: ServiceOption;
  message: string;
};

async function submitLead(payload: LeadPayload) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return payload;
}

export default function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const service = String(
      data.get("service") ?? "Not sure yet"
    ) as ServiceOption;
    const message = String(data.get("message") ?? "").trim();

    const nextErrors: { name?: string; phone?: string } = {};
    if (!name) nextErrors.name = "Enter your name.";
    if (!phone) nextErrors.phone = "Enter a phone number.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    await submitLead({ name, phone, service, message });
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <section id="contact" className="scroll-mt-24 bg-ink">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 header:px-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Have a project in mind?
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Tell us what you&apos;re looking for and we&apos;ll get back to
            you with the next steps.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaLink href="#quote-form" variant="white">
              Get a Quote
            </CtaLink>
            <CtaLink
              href="https://wa.me/918269329125"
              variant="outline-light"
              external
            >
              WhatsApp Us
            </CtaLink>
          </div>
        </div>

        <div
          id="quote-form"
          className="scroll-mt-24 rounded-panel border border-white/10 bg-white/[0.03] p-6 sm:p-8"
        >
          {submitted ? (
            <div className="flex flex-col items-start gap-3 py-6">
              <h3 className="text-xl font-semibold text-white">
                Thanks — got it.
              </h3>
              <p className="text-white/70">
                We&apos;ll get back to you within a day. Prefer to talk
                now?
              </p>
              <CtaLink
                href="https://wa.me/918269329125"
                external
                className="mt-2"
              >
                Chat on WhatsApp
              </CtaLink>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-white/80"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className="w-full rounded-btn border border-white/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate focus:outline-none"
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-sm text-red-300">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-white/80"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="Your phone number"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className="w-full rounded-btn border border-white/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate focus:outline-none"
                />
                {errors.phone && (
                  <p id="phone-error" className="mt-1.5 text-sm text-red-300">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="service"
                  className="mb-1.5 block text-sm font-medium text-white/80"
                >
                  Service interested in
                </label>
                <select
                  id="service"
                  name="service"
                  defaultValue="Not sure yet"
                  className="w-full rounded-btn border border-white/15 bg-white px-4 py-2.5 text-sm text-ink focus:outline-none"
                >
                  <option>Website Development</option>
                  <option>E-Catalog</option>
                  <option>Product Catalog PDF</option>
                  <option>Not sure yet</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-white/80"
                >
                  Message <span className="text-white/40">(optional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Anything else that would help us understand your project"
                  className="w-full resize-none rounded-btn border border-white/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex items-center justify-center rounded-btn bg-gradient-to-r from-secondary to-tertiary px-6 py-3 text-sm font-semibold text-primary transition hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
