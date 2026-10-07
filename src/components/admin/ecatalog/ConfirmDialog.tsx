"use client";

import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "../ui";
import { useOverlay } from "./useOverlay";

export default function ConfirmDialog({
  title,
  children,
  confirmLabel,
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busy: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const panelRef = useOverlay<HTMLDivElement>(onCancel, busy);

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
          <Button variant="danger" onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
