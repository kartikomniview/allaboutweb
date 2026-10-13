"use client";

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 280;
const TAP_SLOP_PX = 10;
const SWIPE_CLOSE_PX = 110;
const ANIM_MS = 320;
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
// Marks the history entry pushed while the viewer is open.
const HISTORY_KEY = 'fcPhotoViewer';

type Point = { x: number; y: number };
type Size = { w: number; h: number };
// Zoom of the current photo: scale, then a pan offset from the screen centre.
type View = { s: number; x: number; y: number };
const IDENTITY: View = { s: 1, x: 0, y: 0 };
const NO_DRAG: Point = { x: 0, y: 0 };
const OPEN_FRAME: CSSProperties = { transform: 'translate(0px, 0px) scale(1)', clipPath: 'inset(0px 0px 0px 0px)', opacity: 1 };

// Natural photo sizes, filled as images load (here and in the product gallery), so the
// viewer knows where a contain-fitted photo's edges are for pan limits and the open animation.
const naturalSizes = new Map<string, Size>();
export const rememberImageSize = (src: string, img: HTMLImageElement) => {
  if (img.naturalWidth) naturalSizes.set(src, { w: img.naturalWidth, h: img.naturalHeight });
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const screen = () => ({ W: window.innerWidth, H: window.innerHeight });
// Pointer position relative to the screen centre (the viewer covers the whole screen).
const fromCentre = (e: { clientX: number; clientY: number }): Point => {
  const { W, H } = screen();
  return { x: e.clientX - W / 2, y: e.clientY - H / 2 };
};

// On-screen size of a photo fitted (object-contain) to the screen.
const fittedSize = (src: string): Size => {
  const { W, H } = screen();
  const natural = naturalSizes.get(src);
  if (!natural) return { w: W, h: H };
  const fit = Math.min(W / natural.w, H / natural.h);
  return { w: natural.w * fit, h: natural.h * fit };
};

// Keep a zoomed photo's edges from being dragged inside the screen.
const withinBounds = (v: View, src: string): View => {
  const { W, H } = screen();
  const { w, h } = fittedSize(src);
  const maxX = Math.max(0, (w * v.s - W) / 2);
  const maxY = Math.max(0, (h * v.s - H) / 2);
  return { s: v.s, x: clamp(v.x, -maxX, maxX), y: clamp(v.y, -maxY, maxY) };
};

// Zoom to scale s while keeping the photo point under p (relative to centre) where it is.
const zoomAround = (from: View, s: number, p: Point): View => {
  const cx = (p.x - from.x) / from.s;
  const cy = (p.y - from.y) / from.s;
  return { s, x: p.x - s * cx, y: p.y - s * cy };
};

// Transform + clip that make the full-screen photo sit exactly over the gallery photo
// (object-cover in `rect`) — the start of the open animation and the end of the close one.
// Falls back to a fade when the gallery is off-screen or motion is reduced.
const frameOver = (rect: DOMRect | null, src: string): CSSProperties => {
  const fade: CSSProperties = { transform: 'translate(0px, 0px) scale(0.92)', clipPath: OPEN_FRAME.clipPath, opacity: 0 };
  const { W, H } = screen();
  if (!rect || rect.width === 0 || rect.bottom <= 0 || rect.top >= H) return fade;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return fade;

  const { w, h } = fittedSize(src);
  const s = Math.max(rect.width / w, rect.height / h);
  const tx = rect.left + rect.width / 2 - W / 2;
  const ty = rect.top + rect.height / 2 - H / 2;
  // The gallery rect in the stage's own (unscaled) coordinates, for the clip.
  const localX = (x: number) => (x - W / 2 - tx) / s + W / 2;
  const localY = (y: number) => (y - H / 2 - ty) / s + H / 2;
  return {
    transform: `translate(${tx}px, ${ty}px) scale(${s})`,
    clipPath: `inset(${localY(rect.top)}px ${W - localX(rect.right)}px ${H - localY(rect.bottom)}px ${localX(rect.left)}px)`,
    opacity: 1,
  };
};

type Gesture =
  | { mode: 'none' }
  | { mode: 'pending' | 'pan' | 'swipe-x' | 'swipe-y'; start: Point; startTime: number; startView: View }
  | { mode: 'pinch'; startDist: number; startMid: Point; startView: View };

// Full-screen photo viewer for the product page. Opens out of the gallery photo,
// then: double-tap (or double-click) to zoom, pinch / wheel to zoom, drag to pan,
// swipe sideways between photos, swipe down to close, tap to hide the controls,
// and ← → / + − / Esc on a keyboard.
export default function ImageViewer({
  images,
  alt,
  startIndex,
  getOriginRect,
  onIndexChange,
  onClose,
}: {
  images: string[];
  alt: string;
  startIndex: number;
  // The gallery's on-screen box; the gallery is kept on the viewer's photo (via onIndexChange).
  getOriginRect: () => DOMRect | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [phase, setPhase] = useState<'enter' | 'open' | 'exit'>('enter');
  const [frame, setFrame] = useState<CSSProperties>(() => frameOver(getOriginRect(), images[startIndex]));
  const [view, setViewState] = useState<View>(IDENTITY);
  const [drag, setDrag] = useState<Point>(NO_DRAG);
  // Off while a finger is down so the photo tracks it; on for snaps and taps.
  const [smooth, setSmooth] = useState(true);
  const [chrome, setChrome] = useState(true);

  const viewRef = useRef(view);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture>({ mode: 'none' });
  const lastTap = useRef<{ time: number; p: Point } | null>(null);
  const tapTimer = useRef<number | undefined>(undefined);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const last = images.length - 1;
  const src = images[index];

  const setView = (v: View) => {
    viewRef.current = v;
    setViewState(v);
  };

  // Enter: paint once over the gallery photo, then animate to full screen.
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPhase('open'));
    });
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      window.clearTimeout(tapTimer.current);
    };
  }, []);

  // Shrinks back onto the gallery photo, then unmounts.
  const startExit = () => {
    if (phase === 'exit') return;
    window.clearTimeout(tapTimer.current);
    setSmooth(true);
    setView(IDENTITY);
    setDrag(NO_DRAG);
    setFrame(frameOver(getOriginRect(), src));
    setPhase('exit');
    window.setTimeout(onClose, ANIM_MS);
  };

  // The viewer owns a same-URL history entry, so the phone's back button closes it
  // instead of leaving the product page. Every close goes through history.back();
  // the popstate that follows runs the closing animation.
  const ownsHistoryEntry = useRef(false);
  useEffect(() => {
    // Already on our entry (React's dev double-mount, or reopened after "forward"): reuse it.
    if (!window.history.state?.[HISTORY_KEY]) window.history.pushState({ [HISTORY_KEY]: true }, '');
    ownsHistoryEntry.current = true;
  }, []);

  const onPopState = useEffectEvent(() => {
    ownsHistoryEntry.current = false;
    startExit();
  });
  useEffect(() => {
    const listener = () => onPopState();
    window.addEventListener('popstate', listener);
    return () => window.removeEventListener('popstate', listener);
  }, []);

  const close = () => {
    // Clear first: a second tap before the popstate arrives must not go back twice.
    if (ownsHistoryEntry.current) {
      ownsHistoryEntry.current = false;
      window.history.back();
    } else {
      startExit();
    }
  };

  const goTo = (next: number) => {
    const target = clamp(next, 0, last);
    setSmooth(true);
    setDrag(NO_DRAG);
    if (target === index) return;
    setView(IDENTITY);
    setIndex(target);
    onIndexChange(target);
  };

  const zoomTo = (s: number, p: Point = NO_DRAG) => {
    setSmooth(true);
    setView(s <= 1 ? IDENTITY : withinBounds(zoomAround(viewRef.current, s, p), src));
  };

  const handleTap = (p: Point, time: number) => {
    const prev = lastTap.current;
    if (prev && time - prev.time < DOUBLE_TAP_MS && distance(p, prev.p) < 40) {
      window.clearTimeout(tapTimer.current);
      lastTap.current = null;
      zoomTo(viewRef.current.s > 1 ? 1 : DOUBLE_TAP_SCALE, p);
      return;
    }
    lastTap.current = { time, p };
    tapTimer.current = window.setTimeout(() => setChrome((c) => !c), DOUBLE_TAP_MS);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== 'open') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, fromCentre(e));
    setSmooth(false);
    const [a, b] = [...pointers.current.values()];
    if (b) {
      setDrag(NO_DRAG);
      gesture.current = { mode: 'pinch', startDist: distance(a, b), startMid: midpoint(a, b), startView: viewRef.current };
    } else {
      gesture.current = { mode: 'pending', start: a, startTime: e.timeStamp, startView: viewRef.current };
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = fromCentre(e);
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;

    if (g.mode === 'pinch') {
      const [a, b] = [...pointers.current.values()];
      if (!b) return;
      const s = clamp((g.startView.s * distance(a, b)) / g.startDist, 1, MAX_SCALE);
      // Pin the photo point that started under the fingers to their current midpoint.
      const m = midpoint(a, b);
      const cx = (g.startMid.x - g.startView.x) / g.startView.s;
      const cy = (g.startMid.y - g.startView.y) / g.startView.s;
      setView(withinBounds({ s, x: m.x - s * cx, y: m.y - s * cy }, src));
      return;
    }
    if (g.mode === 'none') return;

    const dx = p.x - g.start.x;
    const dy = p.y - g.start.y;
    if (g.mode === 'pending') {
      if (Math.hypot(dx, dy) < TAP_SLOP_PX) return;
      g.mode = g.startView.s > 1 ? 'pan' : Math.abs(dx) > Math.abs(dy) ? 'swipe-x' : 'swipe-y';
    }
    if (g.mode === 'pan') {
      setView(withinBounds({ ...g.startView, x: g.startView.x + dx, y: g.startView.y + dy }, src));
    } else if (g.mode === 'swipe-x') {
      // Resist past the first and last photo.
      const atEdge = (index === 0 && dx > 0) || (index === last && dx < 0);
      setDrag({ x: atEdge ? dx / 3 : dx, y: 0 });
    } else if (g.mode === 'swipe-y') {
      setDrag({ x: 0, y: dy });
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(e.pointerId)) return;
    const g = gesture.current;

    // Lifting one finger of a pinch carries on as a pan with the other.
    const [rest] = [...pointers.current.values()];
    if (rest) {
      if (g.mode === 'pinch') {
        gesture.current = { mode: 'pan', start: rest, startTime: e.timeStamp, startView: viewRef.current };
      }
      return;
    }

    gesture.current = { mode: 'none' };
    setSmooth(true);
    if (g.mode === 'none' || g.mode === 'pinch' || g.mode === 'pan') return;
    if (e.type === 'pointercancel') {
      setDrag(NO_DRAG);
      return;
    }

    const p = fromCentre(e);
    const dx = p.x - g.start.x;
    const dy = p.y - g.start.y;
    const ms = Math.max(1, e.timeStamp - g.startTime);

    if (g.mode === 'pending') {
      handleTap(p, e.timeStamp);
    } else if (g.mode === 'swipe-x') {
      const { W } = screen();
      const fling = dx / ms;
      goTo(index + (dx < -W * 0.2 || fling < -0.5 ? 1 : dx > W * 0.2 || fling > 0.5 ? -1 : 0));
    } else if (Math.abs(dy) > SWIPE_CLOSE_PX || Math.abs(dy / ms) > 0.6) {
      close();
    } else {
      setDrag(NO_DRAG);
    }
  };

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') goTo(index + 1);
    else if (e.key === 'ArrowLeft') goTo(index - 1);
    else if (e.key === '+' || e.key === '=') zoomTo(Math.min(viewRef.current.s * 1.5, MAX_SCALE));
    else if (e.key === '-') zoomTo(viewRef.current.s / 1.5);
    else if (e.key === '0') zoomTo(1);
  });
  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeyDown(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  // Mouse wheel / trackpad pinch zooms around the cursor. Attached natively so it
  // can cancel the scroll (React's wheel listener is passive).
  const onWheel = useEffectEvent((e: WheelEvent) => {
    e.preventDefault();
    if (phase !== 'open') return;
    const s = clamp(viewRef.current.s * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025)), 1, MAX_SCALE);
    setSmooth(false);
    setView(s <= 1 ? IDENTITY : withinBounds(zoomAround(viewRef.current, s, fromCentre(e)), src));
  });
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const listener = (e: WheelEvent) => onWheel(e);
    stage.addEventListener('wheel', listener, { passive: false });
    return () => stage.removeEventListener('wheel', listener);
  }, []);

  const transition = (props: string) =>
    smooth ? props.split(',').map((p) => `${p.trim()} ${ANIM_MS}ms ${EASE}`).join(', ') : 'none';
  const dragFade = Math.min(Math.abs(drag.y) / 400, 0.7);
  const showChrome = chrome && phase === 'open' && drag.y === 0;
  const zoomed = view.s > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — photo ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-[70] select-none overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: phase === 'open' ? 1 - dragFade : 0,
          transition: phase === 'open' && !smooth ? 'none' : `opacity ${ANIM_MS}ms ${EASE}`,
        }}
      />

      {/* Stage: the whole photo strip, moved over the gallery photo while opening/closing */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="absolute inset-0 touch-none"
        style={{
          ...(phase === 'open' ? OPEN_FRAME : frame),
          transformOrigin: 'center',
          transition: phase === 'enter' ? 'none' : `transform ${ANIM_MS}ms ${EASE}, clip-path ${ANIM_MS}ms ${EASE}, opacity ${ANIM_MS}ms ${EASE}`,
          cursor: zoomed ? 'grab' : 'zoom-in',
        }}
      >
        <div
          className="flex h-full w-full"
          style={{ transform: `translate3d(calc(${-index * 100}% + ${drag.x}px), 0, 0)`, transition: transition('transform') }}
        >
          {images.map((image, i) => {
            const active = i === index;
            const pull = active ? 1 - Math.min(Math.abs(drag.y) / 1000, 0.25) : 1;
            return (
              <div key={image} className="relative h-full w-full shrink-0 overflow-hidden">
                <div
                  className="relative h-full w-full will-change-transform"
                  style={{
                    transform: active
                      ? `translate3d(${view.x}px, ${view.y + drag.y}px, 0) scale(${view.s * pull})`
                      : undefined,
                    transition: transition('transform'),
                  }}
                >
                  {Math.abs(i - index) <= 1 && (
                    <Image
                      src={image}
                      alt={i === 0 ? alt : ''}
                      fill
                      sizes="100vw"
                      draggable={false}
                      onLoad={(e) => rememberImageSize(image, e.currentTarget)}
                      className="pointer-events-none object-contain"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls — fade out on a single tap, while swiping down and while closing */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${showChrome ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[12px] font-medium tabular-nums text-white">
            {index + 1} / {images.length}
          </span>
          <button
            ref={closeButtonRef}
            onClick={close}
            aria-label="Close photo"
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 ${showChrome ? 'pointer-events-auto' : ''}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {images.length > 1 && (
          <>
            {index > 0 && (
              <button
                onClick={() => goTo(index - 1)}
                aria-label="Previous photo"
                className={`absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 sm:flex ${showChrome ? 'pointer-events-auto' : ''}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {index < last && (
              <button
                onClick={() => goTo(index + 1)}
                aria-label="Next photo"
                className={`absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 sm:flex ${showChrome ? 'pointer-events-auto' : ''}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/50 to-transparent px-3 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {images.length > 1 && (
            <div className={`flex max-w-full gap-2 overflow-x-auto no-scrollbar ${showChrome ? 'pointer-events-auto' : ''}`}>
              {images.map((image, i) => (
                <button
                  key={image}
                  onClick={() => goTo(i)}
                  aria-label={`Photo ${i + 1}`}
                  aria-current={i === index}
                  className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-[4px] transition-opacity ${
                    i === index ? 'opacity-100 ring-2 ring-white' : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <Image src={image} alt="" fill sizes="48px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          <p className="text-[11px] text-white/70">{zoomed ? 'Double-tap to reset' : 'Double-tap to zoom · swipe down to close'}</p>
        </div>
      </div>
    </div>
  );
}
