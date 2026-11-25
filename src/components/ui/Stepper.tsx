import React from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface StepperProps {
  steps: { id: number; title: string }[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  const { locale, formatNum } = useLanguage();

  return (
    <div className="w-full py-4 mb-2">
      {/* Mobile step pill */}
      <div className="flex md:hidden items-center justify-between bg-slate-100 dark:bg-[#121721] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
          {locale === "bn"
            ? `ধাপ ${formatNum(currentStep)} / ${formatNum(steps.length)}`
            : `Step ${formatNum(currentStep)} of ${formatNum(steps.length)}`}
        </span>
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {steps.find((s) => s.id === currentStep)?.title}
        </span>
      </div>

      {/* Desktop step indicators */}
      <div className="hidden md:flex items-center justify-between relative">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div
              key={step.id}
              className="flex items-center gap-2.5 bg-slate-50 dark:bg-[#0B0E14] px-3 py-1 relative z-10"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium tabular-nums transition-colors duration-200 ${
                  isCompleted
                    ? "bg-[#006A4E] text-white"
                    : isCurrent
                    ? "border-2 border-[#006A4E] text-[#006A4E] dark:border-[#10B981] dark:text-[#34D399] bg-emerald-50 dark:bg-emerald-950/40"
                    : "border border-slate-300 dark:border-slate-700 text-slate-400 bg-white dark:bg-[#121721]"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" strokeWidth={1.75} /> : formatNum(step.id)}
              </div>
              <span
                className={`text-sm whitespace-nowrap ${
                  isCurrent
                    ? "text-slate-900 dark:text-white font-semibold"
                    : isCompleted
                    ? "text-slate-700 dark:text-slate-300 font-medium"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
