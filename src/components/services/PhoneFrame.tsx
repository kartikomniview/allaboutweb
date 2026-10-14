"use client";

import { useEffect, useRef, useState } from "react";

/** Pages render at a real phone's viewport width (iPhone 14/15), then scale down to fit the frame */
const PHONE_WIDTH = 390;

/** Phone mockup running a live page in an iframe (e-catalog demo and website mobile preview). */
export default function PhoneFrame({ src, title }: { src: string; title: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const [loaded, setLoaded] = useState(false);

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

  return (
    <div className="mx-auto w-full max-w-[24rem] rounded-[2.75rem] bg-ink p-3 shadow-lift">
      <div className="relative overflow-hidden rounded-[2.1rem] bg-white pt-8">
        <span
          className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink"
          aria-hidden="true"
        />
        <div ref={stageRef} className="relative h-[min(72vh,44rem)] min-h-[30rem] overflow-hidden">
          {scale > 0 && (
            <iframe
              src={src}
              title={title}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className="absolute left-0 top-0 origin-top-left border-0 bg-white"
              style={{ width: PHONE_WIDTH, height: stage.height / scale, transform: `scale(${scale})` }}
            />
          )}
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-paper" aria-hidden="true">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
