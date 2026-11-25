"use client";

import React, { useRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  ariaLabel = "Dashboard sections",
  className,
}: TabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIdx: number | null = null;
    if (e.key === "ArrowRight") {
      nextIdx = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIdx = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = tabs.length - 1;
    }

    if (nextIdx !== null) {
      e.preventDefault();
      const targetTab = tabs[nextIdx];
      if (targetTab) {
        onChange(targetTab.id);
        tabRefs.current[nextIdx]?.focus();
      }
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={twMerge(
        clsx(
          "flex items-center gap-1 border-b border-slate-200 dark:border-white/10 overflow-x-auto",
          className
        )
      )}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              isActive
                ? "text-[#006A4E] dark:text-[#34D399]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium tabular-nums ${
                  isActive
                    ? "bg-[#EBF7F2] text-[#006A4E] dark:bg-[#064E3B]/60 dark:text-[#34D399]"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 bg-[#006A4E] dark:bg-[#10B981]"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
