import { ReactNode } from "react";

const TONES = {
  white: "bg-white",
  paper: "bg-paper",
  dark: "bg-secondary text-white",
};

/** Page section with the landing page's shared spacing and container width. */
export default function Section({
  id,
  tone = "white",
  className = "",
  children,
}: {
  id?: string;
  tone?: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`relative scroll-mt-20 ${TONES[tone]} ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 header:px-8 lg:py-24">
        {children}
      </div>
    </section>
  );
}
