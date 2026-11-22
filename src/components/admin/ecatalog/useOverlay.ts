import { useEffect, useRef } from "react";

// Open overlays, newest last, so Escape only closes the one on top
// (e.g. the delete dialog opened from inside the product drawer).
const stack: symbol[] = [];

// The page's scroll lock belongs to the stack as a whole, not to each overlay: the
// first one to open locks it, and the last one to close puts it back. If each one
// saved and restored the overflow, two closing together (the drawer and a dialog
// inside it, e.g. on Back) could restore "hidden" last, and the page would stay
// locked on every tab until a reload.
let pageOverflow = "";

/** True while a drawer or dialog is open, so a popup can wait instead of covering it. */
export const isOverlayOpen = () => stack.length > 0;

// Shared behaviour for the drawer and dialog: lock page scroll, focus the panel,
// and close on Escape (unless `busy`, e.g. while a request is in flight).
export function useOverlay<T extends HTMLElement>(onClose: () => void, busy = false) {
  const panelRef = useRef<T>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);

  useEffect(() => {
    closeRef.current = onClose;
    busyRef.current = busy;
  });

  useEffect(() => {
    const id = Symbol("overlay");
    if (stack.length === 0) {
      pageOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    stack.push(id);
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || stack[stack.length - 1] !== id) return;
      if (!busyRef.current) closeRef.current();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      stack.splice(stack.indexOf(id), 1);
      if (stack.length === 0) document.body.style.overflow = pageOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return panelRef;
}
