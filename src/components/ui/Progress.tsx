import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorColor?: string;
}

export function Progress({
  value = 0,
  indicatorColor = "bg-[#006A4E] dark:bg-[#10B981]",
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={twMerge(
        clsx(
          "w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden",
          className
        )
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className={twMerge(
          clsx(
            "h-full rounded-full transition-[width] duration-300 ease-out",
            indicatorColor
          )
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
