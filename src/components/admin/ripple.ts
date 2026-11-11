import type { PointerEvent } from "react";

// Tap feedback for buttons and cards: a Material-style ripple spreading from the
// touch point. Plain DOM (no React state), so it never re-renders the host.
// The host needs `relative overflow-hidden` (see .admin-ripple in admin.css).

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** onPointerDown handler: draws a ripple from where the element was pressed. */
export function ripple(e: PointerEvent<HTMLElement>) {
  const host = e.currentTarget;
  if (reducedMotion() || (host as HTMLButtonElement).disabled) return;
  const rect = host.getBoundingClientRect();
  // Big enough to cover the element from the tap point to its farthest corner.
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const size = 2 * Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));

  const wave = document.createElement("span");
  wave.className = "admin-ripple";
  wave.style.width = wave.style.height = `${size}px`;
  wave.style.left = `${x - size / 2}px`;
  wave.style.top = `${y - size / 2}px`;
  wave.addEventListener("animationend", () => wave.remove(), { once: true });
  host.appendChild(wave);
}

/** A short vibration when something is picked (Android; other platforms ignore it). */
export function hapticTick() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(8);
}

/** Focuses a field that needs attention and gives it a short shake (.admin-shake). */
export function flagField(input: HTMLElement | null) {
  if (!input) return;
  input.focus({ preventScroll: false });
  if (reducedMotion()) return;
  const box = (input.closest("[data-field]") as HTMLElement | null) ?? input;
  box.classList.remove("admin-shake");
  void box.offsetWidth; // restart the animation
  box.classList.add("admin-shake");
  box.addEventListener("animationend", () => box.classList.remove("admin-shake"), { once: true });
}
