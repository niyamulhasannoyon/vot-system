"use client";

import React, { useId } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, id, ...props }, ref) => {
    const reactId = useId();
    const inputId = id || props.name || reactId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = [
      helperText && !error ? helperId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={describedBy}
            className={twMerge(
              clsx(
                "w-full min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161C28] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-[border-color,box-shadow] focus:border-[#006A4E] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#006A4E]/15 dark:focus:ring-[#10B981]/20 disabled:cursor-not-allowed disabled:opacity-50",
                icon && "pl-10",
                error &&
                  "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/15",
                className
              )
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
