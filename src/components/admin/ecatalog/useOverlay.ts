import { useEffect, useRef } from "react";

// Open overlays, newest last, so Escape only closes the one on top
// (e.g. the delete dialog opened from inside the product drawer).
const stack: symbol[] = [];

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
    stack.push(id);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || stack[stack.length - 1] !== id) return;
      if (!busyRef.current) closeRef.current();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      stack.splice(stack.indexOf(id), 1);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return panelRef;
}
