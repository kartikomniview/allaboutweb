"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ExternalLink, Monitor, Smartphone, X } from "lucide-react";
import DemoStart from "./DemoStart";
import PhoneFrame from "./PhoneFrame";

/** Desktop view renders the site at this size, then scales it down to fit */
const DESKTOP_WIDTH = 1280;
const DESKTOP_HEIGHT = 800;

const SMALL_SCREEN = "(max-width: 639px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(SMALL_SCREEN);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True on phones, where a scaled-down desktop view would be unreadable */
function useSmallScreen() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(SMALL_SCREEN).matches,
    () => false
  );
}

type View = "desktop" | "mobile";

/**
 * Live, scrollable preview of a website inside a browser-style frame.
 * The top bar shows `label` — never the address — so a template's URL stays private.
 */
export default function SitePreview({
  src,
  label,
  title,
  liveHref,
}: {
  src: string;
  /** Shown in the frame's address bar instead of the URL */
  label: string;
  /** Accessible name for the iframe */
  title: string;
  /** Adds a "Visit live site" button when set */
  liveHref?: string;
}) {
  const smallScreen = useSmallScreen();
  const [chosen, setChosen] = useState<View | null>(null);
  const view: View = chosen ?? (smallScreen ? "mobile" : "desktop");

  /** Nothing loads until the visitor presses "Start demo"; the choice carries across views */
  const [started, setStarted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / DESKTOP_WIDTH));
    observer.observe(el);
    return () => observer.disconnect();
  }, [view]);

  const choose = (next: View) => {
    if (next === view) return;
    setLoaded(false);
    setChosen(next);
  };

  const toggleDemo = (next: boolean) => {
    setLoaded(false);
    setStarted(next);
  };

  const spinner = !loaded && (
    <div className="absolute inset-0 flex items-center justify-center bg-paper" aria-hidden="true">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
    </div>
  );

  return (
    <div>
      <div className="overflow-hidden rounded-panel border border-line bg-white shadow-lift">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-line bg-paper px-3 py-2.5 sm:px-4">
          <div className="hidden shrink-0 gap-1.5 sm:flex" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="min-w-0 flex-1 truncate rounded-full border border-line bg-white px-3 py-1.5 text-center text-xs font-medium text-slate">
            {label}
          </div>
          <div className="flex shrink-0 rounded-full border border-line bg-white p-0.5" role="group" aria-label="Preview size">
            {(
              [
                { id: "desktop", icon: Monitor, text: "Desktop" },
                { id: "mobile", icon: Smartphone, text: "Mobile" },
              ] as const
            ).map(({ id, icon: Icon, text }) => (
              <button
                key={id}
                type="button"
                onClick={() => choose(id)}
                aria-pressed={view === id}
                aria-label={`${text} view`}
                className={`flex h-7 w-8 items-center justify-center rounded-full transition ${
                  view === id ? "bg-ink text-white" : "text-slate hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </button>
            ))}
          </div>
          {/* The phone frame has its own close button, so this one is for desktop view only */}
          {started && view === "desktop" && (
            <button
              type="button"
              onClick={() => toggleDemo(false)}
              aria-label="Close demo"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white text-slate transition hover:border-ink hover:bg-ink hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {view === "desktop" ? (
          <div
            ref={stageRef}
            className="relative overflow-hidden bg-paper"
            style={{ height: scale ? DESKTOP_HEIGHT * scale : undefined, aspectRatio: scale ? undefined : "16 / 10" }}
          >
            {started && scale > 0 && (
              <iframe
                key="desktop"
                src={src}
                title={title}
                onLoad={() => setLoaded(true)}
                className="absolute left-0 top-0 origin-top-left border-0 bg-white"
                style={{ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT, transform: `scale(${scale})` }}
              />
            )}
            {started ? spinner : <DemoStart onStart={() => toggleDemo(true)} />}
          </div>
        ) : (
          <div className="bg-paper px-3 py-6 sm:px-4 sm:py-8">
            <PhoneFrame key="mobile" src={src} title={title} started={started} onStartedChange={toggleDemo} />
          </div>
        )}
      </div>

      {liveHref && (
        <a
          href={liveHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-ink"
        >
          Visit live site
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
