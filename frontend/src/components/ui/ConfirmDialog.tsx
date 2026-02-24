"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-60 flex items-center justify-center bg-bg-overlay p-4"
      onClick={onCancel}
    >
      <div
        className="animate-scale-in w-full max-w-sm rounded-xl border border-border bg-bg-secondary p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              variant === "danger" ? "bg-error/10" : "bg-warning/10"
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${variant === "danger" ? "text-error" : "text-warning"}`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            <p className="mt-1 text-xs text-text-secondary">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-tertiary hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-secondary hover:bg-bg-tertiary"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-3 py-2 text-xs font-medium text-white ${
              variant === "danger"
                ? "bg-error hover:bg-error/90"
                : "bg-warning hover:bg-warning/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
