import { ReactNode } from "react";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  tone = "light",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /** App-style row action shown at the right, e.g. a "View all" link */
  action?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const centered = align === "center" && !action;

  return (
    <div
      className={
        action
          ? "flex items-end justify-between gap-4"
          : centered
            ? "mx-auto max-w-2xl text-center"
            : "max-w-2xl"
      }
    >
      <div className={action ? "max-w-2xl" : undefined}>
        <p
          data-reveal="up"
          className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-primary sm:text-xs"
        >
          {eyebrow}
        </p>
        <h2
          data-reveal="up"
          className={`mt-2 text-[1.3125rem] font-bold leading-[1.25] [--reveal-delay:80ms] sm:mt-3 sm:text-4xl sm:leading-[1.15] lg:text-[2.625rem] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p
            data-reveal="up"
            className={`mt-2 text-sm leading-6 [--reveal-delay:160ms] sm:mt-4 sm:text-lg sm:leading-8 ${
              dark ? "text-white/70 [&_strong]:text-white" : "text-slate"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <div data-reveal="up" className="shrink-0 [--reveal-delay:160ms]">
          {action}
        </div>
      )}
    </div>
  );
}
