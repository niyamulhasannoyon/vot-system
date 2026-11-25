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
          "bg-white dark:bg-[#121721] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 md:p-6 shadow-xs transition-[border-color,box-shadow] duration-150",
          interactive &&
            "hover:border-[#006A4E]/50 dark:hover:border-[#10B981]/50 hover:shadow-sm cursor-pointer active:scale-[0.99]",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
