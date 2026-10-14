"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import DemoStart from "./DemoStart";

/** Pages render at a real phone's viewport width (iPhone 14/15), then scale down to fit the frame */
const PHONE_WIDTH = 390;

/**
 * Phone mockup running a live page in an iframe (e-catalog demo and website mobile preview).
 * The page only loads once the visitor presses "Start demo", and the close button unloads it.
 * Pass `started`/`onStartedChange` to share that state with a parent; otherwise the frame
 * tracks it on its own.
 */
export default function PhoneFrame({
  src,
  title,
  started: startedProp,
  onStartedChange,
}: {
  src: string;
  title: string;
  started?: boolean;
  onStartedChange?: (started: boolean) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const [loaded, setLoaded] = useState(false);
  const [startedHere, setStartedHere] = useState(false);
  const started = startedProp ?? startedHere;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setStage({ width: entry.contentRect.width, height: entry.contentRect.height })
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = stage.width / PHONE_WIDTH;

  const setStarted = (next: boolean) => {
    setLoaded(false);
    setStartedHere(next);
    onStartedChange?.(next);
  };

  return (
    <div className="mx-auto w-full max-w-[24rem] rounded-[2.75rem] bg-ink p-3 shadow-lift">
      <div className="relative overflow-hidden rounded-[2.1rem] bg-white pt-8">
        <span
          className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink"
          aria-hidden="true"
        />
        {started && (
          <button
            type="button"
            onClick={() => setStarted(false)}
            aria-label="Close demo"
            className="absolute right-4 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-paper text-slate transition hover:bg-ink hover:text-white"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
        <div ref={stageRef} className="relative h-[min(72vh,44rem)] min-h-[30rem] overflow-hidden">
          {started && scale > 0 && (
            <iframe
              src={src}
              title={title}
              onLoad={() => setLoaded(true)}
              className="absolute left-0 top-0 origin-top-left border-0 bg-white"
              style={{ width: PHONE_WIDTH, height: stage.height / scale, transform: `scale(${scale})` }}
            />
          )}
          {!started ? (
            <DemoStart onStart={() => setStarted(true)} />
          ) : (
            !loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-paper" aria-hidden="true">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
