"use client";

import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  preventClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  preventClose = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Light-dismiss fallback for browsers lacking <dialog closedby="any">
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || preventClose) return;
    if ("closedBy" in HTMLDialogElement.prototype) return;

    const outside = (e: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
    };

    let pressedOutside = false;
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = outside(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && outside(e) && dialog.open) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener("pointerdown", onPointerDown);
    dialog.addEventListener("pointerup", onPointerUp);
    return () => {
      dialog.removeEventListener("pointerdown", onPointerDown);
      dialog.removeEventListener("pointerup", onPointerUp);
    };
  }, [preventClose]);

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    if (preventClose) {
      e.preventDefault();
    }
  };

  const handleClose = () => {
    const dialog = dialogRef.current;
    if (dialog) dialog.returnValue = "";
    if (isOpen) onClose();
  };

  const closedByProps = {
    closedby: preventClose ? "none" : "any",
  } as Record<string, string>;

  return (
    <dialog
      ref={dialogRef}
      {...closedByProps}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      onCancel={handleCancel}
      onClose={handleClose}
      className={twMerge(
        clsx(
          "m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-white/10 p-6 text-slate-900 dark:text-slate-100 shadow-xl open:animate-fade-in",
          className
        )
      )}
    >
      <button
        type="button"
        onClick={() => {
          if (!preventClose) onClose();
        }}
        disabled={preventClose}
        className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors disabled:opacity-40"
        aria-label="Close dialog"
      >
        <X className="w-4 h-4" strokeWidth={1.75} />
      </button>

      {title && (
        <div className="mb-4 pr-8">
          <h1 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p id={descId} className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      <div>{children}</div>
    </dialog>
  );
}
