import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({
  className,
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm transition-all duration-200",
          interactive &&
            "hover:border-[#006A4E]/50 hover:shadow-md cursor-pointer active:scale-[0.99]",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
