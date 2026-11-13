"use client";

import { useState, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "../ui";
import { useOverlay } from "./useOverlay";

export default function ConfirmDialog({
  title,
  children,
  confirmLabel,
  busy,
  error,
  requireText,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busy: boolean;
  error?: string | null;
  /** For actions that can't be undone: the confirm button stays off until this is typed. */
  requireText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const panelRef = useOverlay<HTMLDivElement>(onCancel, busy);
  const [typed, setTyped] = useState("");
  const typedOk = !requireText || typed.trim().toLowerCase() === requireText.toLowerCase();

  return (
    <div
      className="admin-fade-in fixed inset-0 z-[110] flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        tabIndex={-1}
        className="admin-pop-in w-full overflow-hidden rounded-t-panel bg-white shadow-2xl focus:outline-none sm:max-w-md sm:rounded-card"
      >
        <div className="flex gap-4 p-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
            <TriangleAlert className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-base font-semibold text-ink">
              {title}
            </h2>
            <div className="mt-1.5 text-sm leading-relaxed text-slate">{children}</div>
            {requireText && (
              <form
                className="mt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (typedOk && !busy) onConfirm();
                }}
              >
                <label htmlFor="confirm-text" className="mb-1.5 block text-[13px] font-semibold text-ink">
                  Type <span className="rounded-sm bg-paper px-1 font-mono text-red-700">{requireText}</span> to confirm
                </label>
                <input
                  id="confirm-text"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  disabled={busy}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="done"
                  className="h-11 w-full rounded-md border border-line bg-white px-3 text-base text-ink focus:border-red-500 focus:outline-none focus-visible:outline-none! focus:ring-[3px] focus:ring-red-500/15"
                />
              </form>
            )}
            {error && (
              <p role="alert" className="mt-3 rounded-btn bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-line bg-paper/60 px-6 py-4 sm:flex-row sm:justify-end">
          <Button onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={busy} disabled={!typedOk}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
