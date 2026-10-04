"use client";

import Image from "next/image";
import { useState, type FormEvent, type ReactNode } from "react";
import { type ServiceKey, whatsappUrl } from "@/lib/contact";

const IMAGE_BASE =
  "https://aawsite.s3.ap-south-1.amazonaws.com/website/landing/services";

function CheckIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      className={className}
      aria-hidden="true"
    >
      <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.89.99 6.67 2.77a9.37 9.37 0 0 1 2.76 6.68c0 5.2-4.24 9.43-9.45 9.43m8.04-17.47A11.3 11.3 0 0 0 12.05.7C5.78.7.67 5.8.67 12.08c0 2 .52 3.96 1.52 5.69L.57 23.7l6.08-1.6a11.36 11.36 0 0 0 5.4 1.38h.01c6.27 0 11.38-5.1 11.38-11.38 0-3.04-1.18-5.9-3.33-8.05" />
    </svg>
  );
}

function Step({
  n,
  done,
  error,
  children,
}: {
  n: number;
  done: boolean;
  error?: boolean;
  children: ReactNode;
}) {
  return (
    <span className="flex items-center gap-3 text-base font-bold leading-snug tracking-[-0.01em] text-ink">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold tabular-nums transition-colors ${
          done
            ? "bg-primary text-white"
            : error
              ? "bg-red-100 text-red-600"
              : "bg-tint text-primary"
        }`}
        aria-hidden="true"
      >
        {done ? <CheckIcon /> : n}
      </span>
      {children}
    </span>
  );
}

type Question = {
  id: string;
  label: string;
  summary: string;
  options: string[];
};

const SERVICES: Record<
  ServiceKey,
  { name: string; description: string; slug: string; questions: Question[] }
> = {
  website: {
    name: "Website Development",
    slug: "websites",
    description: "A complete website for your business",
    questions: [
      {
        id: "businessType",
        label: "Are you a",
        summary: "Business type",
        options: ["Furniture Retailer", "Manufacturer", "Wholesaler"],
      },
      {
        id: "budget",
        label: "What is your budget?",
        summary: "Budget",
        options: ["₹10k–25k", "₹25k–50k", "₹50k–1L", "₹1L+"],
      },
      {
        id: "websiteType",
        label: "What kind of website do you want?",
        summary: "Website type",
        options: ["Catalog", "E-Commerce", "Branding / Information"],
      },
    ],
  },
  ecatalog: {
    name: "E-Catalog",
    slug: "e-catalog",
    description: "An online catalog customers browse on their phone",
    questions: [
      {
        id: "products",
        label: "How many products do you want in the catalog?",
        summary: "Number of products",
        options: ["Up to 50", "50–100", "100–250", "250+"],
      },
      {
        id: "domain",
        label: "Do you have your own domain?",
        summary: "Own domain",
        options: ["Yes", "No", "Not sure"],
      },
    ],
  },
  pdf: {
    name: "PDF Catalog",
    slug: "pdf-catalog",
    description: "A printable catalog you can share anywhere",
    questions: [
      {
        id: "business",
        label: "What is your business?",
        summary: "Business",
        options: ["Furniture", "Curtains", "Fabrics"],
      },
      {
        id: "products",
        label: "How many products do you want in the catalog?",
        summary: "Number of products",
        options: ["Up to 20", "20–50", "50–100", "100+"],
      },
    ],
  },
};

const SERVICE_ORDER: ServiceKey[] = ["website", "ecatalog", "pdf"];

type Errors = Record<string, string>;

function cardClass(error?: string) {
  return `min-w-0 scroll-mt-6 rounded-card border bg-white p-4 transition-colors duration-300 sm:p-5 ${
    error
      ? "border-red-400 bg-red-50/40 ring-4 ring-red-500/10"
      : "border-line"
  }`;
}

function buildMessage(
  name: string,
  service: ServiceKey,
  answers: Record<string, string>
) {
  const { name: serviceName, questions } = SERVICES[service];
  return [
    "Hi AllAboutWeb, I'd like to know the pricing.",
    "",
    `Name: ${name}`,
    `Service: ${serviceName}`,
    ...questions.map((q) => `${q.summary}: ${answers[q.id]}`),
  ].join("\n");
}

function ChipGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const checked = value === option;
        return (
          <label
            key={option}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
              checked
                ? "border-primary bg-primary text-white shadow-[0_6px_16px_-6px_rgba(252,108,38,0.6)]"
                : "border-line bg-white text-ink hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={checked}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {checked && <CheckIcon />}
            {option}
          </label>
        );
      })}
    </div>
  );
}

export default function PricingForm({
  initialService,
  headingLevel = "h2",
}: {
  initialService?: ServiceKey;
  headingLevel?: "h1" | "h2" | "h3";
}) {
  const [name, setName] = useState("");
  const [service, setService] = useState<ServiceKey | undefined>(
    initialService
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Errors>({});

  const Heading = headingLevel;
  const questions = service ? SERVICES[service].questions : [];
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  // Before a service is picked, assume a typical 2-question flow for the bar
  const totalSteps = 2 + (service ? questions.length : 2);
  const doneSteps = (name.trim() ? 1 : 0) + (service ? 1 : 0) + answeredCount;
  const progress = Math.round((doneSteps / totalSteps) * 100);

  function selectService(next: ServiceKey) {
    setService(next);
    setAnswers({});
    setErrors((prev) => ({ name: prev.name }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Errors = {};
    if (!name.trim()) nextErrors.name = "Enter your name.";
    if (!service) nextErrors.service = "Choose a service.";
    for (const q of questions) {
      if (!answers[q.id]) nextErrors[q.id] = "Pick an option.";
    }
    setErrors(nextErrors);

    // Jump to the first incomplete field, in the order they appear
    const firstInvalid = ["name", "service", ...questions.map((q) => q.id)].find(
      (id) => nextErrors[id]
    );
    if (firstInvalid) {
      const card = event.currentTarget.querySelector<HTMLElement>(
        `[data-field="${firstInvalid}"]`
      );
      card?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      card?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
      return;
    }
    if (!service) return;

    const url = whatsappUrl(buildMessage(name.trim(), service, answers));
    // "noopener" would make window.open return null, so detach manually.
    const opened = window.open(url, "_blank");
    if (opened) opened.opener = null;
    else window.location.assign(url);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="mb-3 pr-8">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-tint px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Free quote in minutes
        </p>
        <Heading className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-4xl">
          Get the <span className="highlight">pricing</span>
        </Heading>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate sm:text-base">
          Answer a few quick questions and we&apos;ll send you pricing on
          WhatsApp.
        </p>
        <div
          className="mt-5 h-1.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-label="Form progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[#ff9a5c] transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
      </div>

      <div data-field="name" className={cardClass(errors.name)}>
        <label htmlFor="pricing-name" className="mb-3 block">
          <Step n={1} done={Boolean(name.trim())} error={Boolean(errors.name)}>
            Your name
          </Step>
        </label>
        <input
          id="pricing-name"
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="next"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          placeholder="e.g. Rahul Sharma"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "pricing-name-error" : undefined}
          className={`w-full rounded-btn border bg-paper px-4 py-3 text-base text-ink transition placeholder:text-slate/70 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15 sm:py-2.5 sm:text-sm ${
            errors.name ? "border-red-400" : "border-line"
          }`}
        />
        {errors.name && (
          <p id="pricing-name-error" className="mt-2 text-[13px] font-medium text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      <fieldset data-field="service" className={cardClass(errors.service)}>
        <legend className="float-left mb-3 w-full">
          <Step n={2} done={Boolean(service)} error={Boolean(errors.service)}>
            What do you need?
          </Step>
        </legend>
        <div className="clear-both grid gap-2.5 sm:grid-cols-3">
          {SERVICE_ORDER.map((key) => {
            const checked = service === key;
            const { name: serviceName, description, slug } = SERVICES[key];
            return (
              <label
                key={key}
                className={`group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-card border-2 p-2 transition duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary sm:flex-col sm:items-stretch sm:gap-0 sm:p-0 ${
                  checked
                    ? "border-primary bg-tint shadow-[0_12px_28px_-12px_rgba(252,108,38,0.55)]"
                    : "border-line bg-white hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value={key}
                  checked={checked}
                  onChange={() => selectService(key)}
                  className="sr-only"
                />
                <span className="relative aspect-[1400/988] w-24 shrink-0 overflow-hidden rounded-[10px] bg-paper sm:w-full sm:rounded-none">
                  <Image
                    src={`${IMAGE_BASE}/${slug}/1.webp`}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 160px, 96px"
                    className={`object-cover transition duration-500 group-hover:scale-105 ${
                      checked ? "" : "saturate-[0.85]"
                    }`}
                  />
                  <span
                    className="absolute inset-0 hidden bg-gradient-to-t from-ink/25 to-transparent sm:block"
                    aria-hidden="true"
                  />
                </span>
                <span
                  className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                    checked
                      ? "scale-100 border-primary bg-primary text-white"
                      : "scale-90 border-white/90 bg-white/70 text-transparent sm:bg-white/40"
                  }`}
                  aria-hidden="true"
                >
                  <CheckIcon />
                </span>
                <span className="flex min-w-0 flex-col pr-8 sm:p-3 sm:pr-3">
                  <span className="text-[15px] font-bold leading-tight tracking-[-0.01em] text-ink">
                    {serviceName}
                  </span>
                  <span className="mt-1 text-xs leading-snug text-slate">
                    {description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {errors.service && (
          <p className="mt-2 text-[13px] font-medium text-red-600">{errors.service}</p>
        )}
      </fieldset>

      {questions.map((q, i) => (
        <fieldset
          key={`${service}-${q.id}`}
          data-field={q.id}
          className={`animate-enter-up [animation-duration:0.5s] ${cardClass(errors[q.id])}`}
          style={{ ["--enter-delay" as string]: `${i * 70}ms` }}
        >
          <legend className="float-left mb-3 w-full">
            <Step
              n={i + 3}
              done={Boolean(answers[q.id])}
              error={Boolean(errors[q.id])}
            >
              {q.label}
            </Step>
          </legend>
          <div className="clear-both" />
          <ChipGroup
            name={`${service}-${q.id}`}
            options={q.options}
            value={answers[q.id]}
            onChange={(value) => {
              setAnswers((prev) => ({ ...prev, [q.id]: value }));
              setErrors((prev) => ({ ...prev, [q.id]: "" }));
            }}
          />
          {errors[q.id] && (
            <p className="mt-2 text-[13px] font-medium text-red-600">{errors[q.id]}</p>
          )}
        </fieldset>
      ))}

      {/* Sticky action bar on mobile; bleeds over the parent's p-5 padding */}
      <div className="sticky bottom-0 z-10 -mx-5 -mb-5 mt-2 flex flex-col gap-2.5 border-t border-line bg-white/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_24px_-16px_rgba(1,18,60,0.25)] backdrop-blur-md sm:static sm:mx-0 sm:mb-0 sm:gap-3 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
        <button
          type="submit"
          className="group inline-flex min-h-13 items-center justify-center gap-2 rounded-btn bg-primary px-6 py-3 text-base font-bold tracking-[-0.01em] text-white shadow-[0_14px_30px_-12px_rgba(252,108,38,0.7)] transition hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0"
        >
          <WhatsAppIcon />
          Get the pricing
        </button>
        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-medium text-slate">
          {["No spam", "No commitment", "Reply within minutes"].map((item) => (
            <span key={item} className="inline-flex items-center gap-1">
              <span className="text-primary">
                <CheckIcon />
              </span>
              {item}
            </span>
          ))}
        </p>
      </div>
    </form>
  );
}
