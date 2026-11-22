import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "live" | "warning" | "neutral" | "primary";
}

export function Badge({
  className,
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    neutral:
      "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    primary:
      "bg-[#EBF7F2] dark:bg-[#064E3B]/40 text-[#006A4E] dark:text-[#34D399] border-[#006A4E]/20",
    success:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    live: "bg-[#FEECEE] dark:bg-[#4C0519]/40 text-[#F42A41] dark:text-[#FB7185] border-[#F42A41]/20 font-semibold animate-pulse",
    warning:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {variant === "live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#F42A41] inline-block" />
      )}
      {children}
    </span>
  );
}
