"use client";

import { useEffect, useRef } from "react";
import {
  destructiveButtonClass,
  secondaryButtonClass,
} from "@/lib/ui";

type ConfirmDialogProps = {
  isOpen: boolean;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  isOpen,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  isLoading = false,
  error = null,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    cancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-zinc-900/50"
        onClick={isLoading ? undefined : onClose}
        disabled={isLoading}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-message"
        className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg"
      >
        <p
          id="confirm-dialog-message"
          className="whitespace-pre-line text-sm leading-6 text-zinc-700"
        >
          {message}
        </p>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={secondaryButtonClass}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={destructiveButtonClass}
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
