import { ReactNode } from "react";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"
      }
    >
      <p
        data-reveal="up"
        className="text-xs font-bold uppercase tracking-[0.16em] text-primary"
      >
        {eyebrow}
      </p>
      <h2
        data-reveal="up"
        className={`mt-3 [--reveal-delay:80ms] text-[1.625rem] font-bold leading-[1.2] sm:text-4xl sm:leading-[1.15] lg:text-[2.75rem] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          data-reveal="up"
          className={`mt-4 text-[0.9375rem] leading-6.5 [--reveal-delay:160ms] sm:text-lg sm:leading-8 ${
            dark ? "text-white/70 [&_strong]:text-white" : "text-slate"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
