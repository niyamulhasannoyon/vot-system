"use client";

import React from "react";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Option {
  id: string;
  name: string;
  nameBn?: string | null;
  symbolEmoji?: string | null;
  bio?: string | null;
  bioBn?: string | null;
}

interface BallotPaperProps {
  election: {
    title: string;
    titleBn?: string | null;
    description?: string | null;
    descriptionBn?: string | null;
    allowNota?: boolean;
    endTime: string | Date;
  };
  options: Option[];
  selectedChoices: string[];
  voterCode?: string;
  timeRemainingLabel: string;
  onSelect: (id: string) => void;
  onReview: () => void;
}

export function BallotPaper({
  election,
  options,
  selectedChoices,
  voterCode,
  timeRemainingLabel,
  onSelect,
  onReview,
}: BallotPaperProps) {
  const { locale, t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 w-full pb-28 md:pb-16 animate-fade-in">
      {/* Election Header Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="live">
            {locale === "bn" ? "লাইভ নির্বাচন" : "Live Election"}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#006A4E]" />
            <span>{timeRemainingLabel}</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {locale === "bn" ? election.titleBn || election.title : election.title}
          </h1>
          {election.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {locale === "bn"
                ? election.descriptionBn || election.description
                : election.description}
            </p>
          )}
        </div>

        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
          <span>{t("voterSelectInstructionSingle")}</span>
          {voterCode && (
            <span className="font-mono font-semibold text-[#006A4E]">
              {locale === "bn" ? "ভোটার আইডি: " : "Voter ID: "}{voterCode}
            </span>
          )}
        </div>
      </div>

      {/* Candidate Cards — ARIA Radiogroup */}
      <div
        role="radiogroup"
        aria-label={election.title}
        className="space-y-3.5 mb-8"
      >
        {options.map((cand) => {
          const isSelected = selectedChoices.includes(cand.id);

          return (
            <div
              key={cand.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelect(cand.id)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onSelect(cand.id);
                }
              }}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 select-none focus:outline-none focus:ring-2 focus:ring-[#006A4E] ${
                isSelected
                  ? "border-[#006A4E] bg-[#EBF7F2] dark:bg-[#064E3B]/25 shadow-sm scale-[1.01]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Symbol / Emoji Avatar Tile */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform ${
                    isSelected
                      ? "bg-white dark:bg-slate-800 shadow-sm scale-105"
                      : "bg-slate-100 dark:bg-slate-800"
                  }`}
                >
                  {cand.symbolEmoji || "🗳️"}
                </div>

                {/* Candidate Info */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {locale === "bn" ? cand.nameBn || cand.name : cand.name}
                  </h3>
                  {cand.bio && (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {locale === "bn" ? cand.bioBn || cand.bio : cand.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Selection Indicator */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "bg-[#006A4E] text-white"
                    : "border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                }`}
              >
                {isSelected && <CheckCircle2 className="w-5 h-5 fill-current" />}
              </div>
            </div>
          );
        })}

        {/* NOTA Option */}
        {election.allowNota && (
          <div
            role="radio"
            aria-checked={selectedChoices.includes("nota")}
            tabIndex={0}
            onClick={() => onSelect("nota")}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onSelect("nota");
              }
            }}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 select-none focus:outline-none focus:ring-2 focus:ring-[#006A4E] ${
              selectedChoices.includes("nota")
                ? "border-slate-700 bg-slate-100 dark:bg-slate-800 scale-[1.01]"
                : "border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 bg-slate-200 dark:bg-slate-800">
                🚫
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                  {locale === "bn" ? "উপরের কাউকে নয় (NOTA)" : "None of the above (NOTA)"}
                </h3>
                <p className="text-xs text-slate-500">
                  {locale === "bn" ? "কোনো প্রার্থীকে পছন্দ না হলে" : "Dissent vote / No preference"}
                </p>
              </div>
            </div>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                selectedChoices.includes("nota")
                  ? "bg-slate-700 text-white"
                  : "border-2 border-slate-300 dark:border-slate-700"
              }`}
            >
              {selectedChoices.includes("nota") && (
                <CheckCircle2 className="w-5 h-5 fill-current" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar on Mobile for Primary CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 bottom-bar-shadow z-30 md:static md:bg-transparent md:border-none md:p-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden sm:block text-xs text-slate-500">
            {selectedChoices.length > 0 ? (
              <span className="text-[#006A4E] font-semibold">
                {t("btnSelected")}
              </span>
            ) : (
              <span>{locale === "bn" ? "প্রার্থী নির্বাচন করুন" : "Select candidate"}</span>
            )}
          </div>

          <Button
            onClick={onReview}
            disabled={selectedChoices.length === 0}
            size="lg"
            className="w-full sm:w-auto px-8 gap-2 ml-auto shadow-md"
          >
            <span>{t("btnReviewSelection")}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
