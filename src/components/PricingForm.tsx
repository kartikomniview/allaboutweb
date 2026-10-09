"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { type ServiceKey, whatsappUrl } from "@/lib/contact";

/** Square service photos kept in `public/icon/services/compressed/` */
const THUMB_BASE = "/icon/services/compressed";

/** Pause after a tap so the selection registers before the next step slides in */
const AUTO_ADVANCE_MS = 250;

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

type Question = {
  id: string;
  label: string;
  summary: string;
  options: string[];
};

const SERVICES: Record<
  ServiceKey,
  { name: string; description: string; thumb: string; questions: Question[] }
> = {
  website: {
    name: "Website Development",
    thumb: "website-development",
    description: "Full website for your business",
    questions: [
      {
        id: "businessType",
        label: "You are a",
        summary: "Business type",
        options: ["Furniture Retailer", "Manufacturer", "Wholesaler"],
      },
      {
        id: "budget",
        label: "Your budget?",
        summary: "Budget",
        options: ["₹10k–25k", "₹25k–50k", "₹50k–1L", "₹1L+"],
      },
      {
        id: "websiteType",
        label: "Type of website?",
        summary: "Website type",
        options: ["Catalog", "E-Commerce", "Branding / Information"],
      },
    ],
  },
  ecatalog: {
    name: "E-Catalog",
    thumb: "e-catalog",
    description: "Online catalog for phones",
    questions: [
      {
        id: "products",
        label: "How many products?",
        summary: "Number of products",
        options: ["Up to 50", "50–100", "100–250", "250+"],
      },
      {
        id: "domain",
        label: "Have your own domain?",
        summary: "Own domain",
        options: ["Yes", "No", "Not sure"],
      },
    ],
  },
  pdf: {
    name: "PDF Catalog",
    thumb: "product-catalog-pdf",
    description: "Printable, shareable catalog",
    questions: [
      {
        id: "business",
        label: "Your business?",
        summary: "Business",
        options: ["Furniture", "Curtains", "Fabrics"],
      },
      {
        id: "products",
        label: "How many products?",
        summary: "Number of products",
        options: ["Up to 20", "20–50", "50–100", "100+"],
      },
    ],
  },
};

const SERVICE_ORDER: ServiceKey[] = ["website", "ecatalog", "pdf"];

const SUB_HEADING = { h1: "h2", h2: "h3", h3: "h4" } as const;

const STEP_TITLE_ID = "pricing-step-title";

function buildMessage(
  name: string,
  service: ServiceKey,
  answers: Record<string, string>
) {
  const { name: serviceName, questions } = SERVICES[service];
  return [
    "Hi AllAboutWeb, I'd like to know the pricing.",
    "",
    ...(name ? [`Name: ${name}`] : []),
    `Service: ${serviceName}`,
    ...questions.map((q) => `${q.summary}: ${answers[q.id]}`),
  ].join("\n");
}

/** Full-width, app-style radio tile. */
function OptionTile({
  name,
  value,
  checked,
  onSelect,
  onTap,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  /** Pointer taps only — keyboard users move through options without auto-advancing */
  onTap: () => void;
  children: ReactNode;
}) {
  return (
    <label
      onClick={(event) => {
        if (event.detail > 0) onTap();
      }}
      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-card border-2 p-3 transition active:scale-[0.98] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
        checked
          ? "border-primary bg-tint shadow-[0_10px_24px_-14px_rgba(252,108,38,0.6)]"
          : "border-line bg-white hover:border-primary/50"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      {children}
      <span
        className={`ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          checked ? "border-primary bg-primary text-white" : "border-line text-transparent"
        }`}
        aria-hidden="true"
      >
        <CheckIcon />
      </span>
    </label>
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
  const [service, setService] = useState<ServiceKey | undefined>(initialService);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Coming from a service's card, that choice is already made
  const [step, setStep] = useState(initialService ? 1 : 0);
  const [direction, setDirection] = useState<"next" | "back">("next");

  const advanceTimer = useRef<number | undefined>(undefined);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(step);

  const Heading = headingLevel;
  const StepHeading = SUB_HEADING[headingLevel];
  const questions = service ? SERVICES[service].questions : [];
  // Service → its questions → name. Before a service is picked, assume a typical 2-question flow.
  const totalSteps = 2 + (service ? questions.length : 2);
  const isLast = Boolean(service) && step === totalSteps - 1;
  const question = step > 0 && !isLast ? questions[step - 1] : undefined;
  const canContinue = step === 0 ? Boolean(service) : question ? Boolean(answers[question.id]) : true;

  // Move focus to the new step's title so screen readers announce it
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    titleRef.current?.focus({ preventScroll: true });
    titleRef.current?.scrollIntoView({ block: "nearest" });
  }, [step]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  function goTo(next: number) {
    window.clearTimeout(advanceTimer.current);
    setDirection(next >= step ? "next" : "back");
    setStep(next);
  }

  function advanceSoon() {
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      setDirection("next");
      setStep((current) => current + 1);
    }, AUTO_ADVANCE_MS);
  }

  function selectService(next: ServiceKey) {
    if (next === service) return;
    setService(next);
    setAnswers({});
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLast) {
      if (canContinue) goTo(step + 1);
      return;
    }
    if (!service) return;

    const url = whatsappUrl(buildMessage(name.trim(), service, answers));
    // "noopener" would make window.open return null, so detach manually.
    const opened = window.open(url, "_blank");
    if (opened) opened.opener = null;
    else window.location.assign(url);
  }

  let title: string;
  let hint: string | undefined;
  let body: ReactNode;

  if (step === 0) {
    title = "What do you need?";
    hint = "Pick a service to get started.";
    body = (
      <div role="radiogroup" aria-labelledby={STEP_TITLE_ID} className="grid gap-2.5">
        {SERVICE_ORDER.map((key) => {
          const { name: serviceName, description, thumb } = SERVICES[key];
          return (
            <OptionTile
              key={key}
              name="service"
              value={key}
              checked={service === key}
              onSelect={() => selectService(key)}
              onTap={advanceSoon}
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-btn bg-paper">
                <Image src={`${THUMB_BASE}/${thumb}.jpg`} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.9375rem] font-semibold leading-tight text-ink">
                  {serviceName}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-slate">{description}</span>
              </span>
            </OptionTile>
          );
        })}
      </div>
    );
  } else if (question) {
    title = question.label;
    hint = "Choose the option that fits best.";
    body = (
      <div role="radiogroup" aria-labelledby={STEP_TITLE_ID} className="grid gap-2.5 sm:grid-cols-2">
        {question.options.map((option) => (
          <OptionTile
            key={option}
            name={`${service}-${question.id}`}
            value={option}
            checked={answers[question.id] === option}
            onSelect={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}
            onTap={advanceSoon}
          >
            <span className="text-[0.9375rem] font-medium text-ink">{option}</span>
          </OptionTile>
        ))}
      </div>
    );
  } else {
    title = "Almost done!";
    hint = "Check your answers and we'll send the pricing on WhatsApp.";
    const rows = service
      ? [
          { label: "Service", value: SERVICES[service].name, step: 0 },
          ...questions.map((q, i) => ({ label: q.summary, value: answers[q.id], step: i + 1 })),
        ]
      : [];
    body = (
      <>
        <label htmlFor="pricing-name" className="block text-sm font-semibold text-ink">
          Your name <span className="font-normal text-slate">(optional)</span>
        </label>
        <input
          id="pricing-name"
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="send"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Rahul Sharma"
          className="mt-2 w-full rounded-btn border border-line bg-paper px-3.5 py-3 text-base text-ink transition placeholder:text-slate/70 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15 sm:text-sm"
        />

        <div className="mt-5 rounded-card bg-paper px-4 py-1">
          <dl className="divide-y divide-line">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-3 py-2.5">
                <dt className="text-sm text-slate">{row.label}</dt>
                <dd className="ml-auto flex items-center gap-3 text-right text-sm font-semibold text-ink">
                  {row.value}
                  <button
                    type="button"
                    onClick={() => goTo(row.step)}
                    className="text-xs font-semibold text-primary hover:text-ink"
                    aria-label={`Change ${row.label.toLowerCase()}`}
                  >
                    Change
                  </button>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </>
    );
  }

  const buttonClass =
    "group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-btn bg-primary px-6 py-3 text-[0.9375rem] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(252,108,38,0.7)] transition hover:bg-primary/90 active:scale-[0.98] disabled:bg-line disabled:text-slate disabled:shadow-none sm:text-base";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex min-h-[min(32rem,calc(92dvh-2.5rem))] flex-col"
    >
      {/* App bar — right padding leaves room for the modal's close button */}
      <div className="-mt-2 flex items-center gap-1 pr-10 sm:-mt-5">
        <button
          type="button"
          onClick={() => goTo(Math.max(step - 1, 0))}
          disabled={step === 0}
          aria-label="Previous step"
          className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-tint disabled:invisible"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <Heading className="text-base font-semibold leading-tight tracking-[-0.01em] text-ink">
            Get the pricing
          </Heading>
          <p className="text-xs text-slate" aria-live="polite">
            Step {step + 1} of {totalSteps}
          </p>
        </div>
      </div>

      <div
        className="mt-3 flex gap-1.5"
        role="progressbar"
        aria-label="Form progress"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={step + 1}
      >
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= step ? "bg-primary" : "bg-line"
            }`}
          />
        ))}
      </div>

      {/* Clips the sideways slide so it never adds a horizontal scrollbar */}
      <div className="-mx-2 mt-6 overflow-x-clip px-2 pb-1">
        <div key={step} className={direction === "next" ? "animate-step-next" : "animate-step-back"}>
          <StepHeading
            ref={titleRef}
            id={STEP_TITLE_ID}
            tabIndex={-1}
            className="text-xl font-semibold leading-snug text-ink focus:outline-none sm:text-2xl"
          >
            {title}
          </StepHeading>
          {hint && <p className="mt-1 text-sm text-slate">{hint}</p>}
          <div className="mt-5">{body}</div>
        </div>
      </div>

      <div className="mt-auto pt-6">
        {isLast ? (
          <button key="submit" type="submit" className={buttonClass}>
            <WhatsAppIcon />
            Get the pricing on WhatsApp
          </button>
        ) : (
          <button
            key="next"
            type="button"
            onClick={() => goTo(step + 1)}
            disabled={!canContinue}
            className={buttonClass}
          >
            Continue
          </button>
        )}
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate sm:gap-x-4 sm:text-xs">
          {["No spam", "No commitment", "Quick reply"].map((item) => (
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
