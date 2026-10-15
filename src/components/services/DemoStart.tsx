import { Play } from "lucide-react";

/** Placeholder shown over a demo frame until the visitor chooses to load the live page. */
export default function DemoStart({
  onStart,
  label = "Start demo",
  hint = "Loads the live site right here",
}: {
  onStart: () => void;
  label?: string;
  hint?: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-paper via-white to-primary/10 p-6 text-center">
      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-2 rounded-full bg-button px-5 py-3 text-sm font-semibold text-white shadow-lift transition hover:bg-button-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button focus-visible:ring-offset-2"
      >
        <Play className="h-4 w-4 fill-current" aria-hidden="true" />
        {label}
      </button>
      <p className="text-xs text-slate">{hint}</p>
    </div>
  );
}
