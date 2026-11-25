"use client";

import React from "react";
import { Clock, CheckCircle2, ArrowRight, Ban } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ElectionDetail, ElectionOption } from "@/types/election";

interface BallotPaperProps {
  election: ElectionDetail;
  options: ElectionOption[];
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
  const { locale, formatNum, t } = useLanguage();

  const isMultiple = election.electionType === "MULTIPLE";
  const isRanked = election.electionType === "RANKED";
  const isRadio = !isMultiple && !isRanked;

  const instructionText = isMultiple
    ? `${t("voterSelectInstructionMultiple")} (${
        locale === "bn"
          ? `সর্বোচ্চ ${formatNum(election.maxChoices)} জন`
          : `up to ${formatNum(election.maxChoices)}`
      })`
    : isRanked
    ? t("voterSelectInstructionRanked")
    : t("voterSelectInstructionSingle");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 w-full pb-28 md:pb-16 animate-fade-in">
      {/* Election Header Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="live">
            {locale === "bn" ? "চলমান নির্বাচন" : "Live election"}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium tabular-nums">
            <Clock className="w-3.5 h-3.5 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
            <span>{timeRemainingLabel}</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
            {locale === "bn" ? election.titleBn || election.title : election.title}
          </h1>
          {election.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              {locale === "bn"
                ? election.descriptionBn || election.description
                : election.description}
            </p>
          )}
        </div>

        <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#121721] border border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-700 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <span>{instructionText}</span>
          {voterCode && (
            <span className="font-mono font-medium text-[#006A4E] dark:text-[#34D399]">
              {locale === "bn" ? "ভোটার কোড: " : "Voter code: "}
              {voterCode}
            </span>
          )}
        </div>
      </div>

      {/* Candidate Cards */}
      <div
        role={isRadio ? "radiogroup" : "group"}
        aria-label={election.title}
        className="space-y-3 mb-8"
      >
        {options.map((cand) => {
          const rankIndex = selectedChoices.indexOf(cand.id);
          const isSelected = rankIndex !== -1;

          return (
            <div
              key={cand.id}
              role={isRadio ? "radio" : "checkbox"}
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelect(cand.id)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onSelect(cand.id);
                }
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-colors cursor-pointer flex items-center justify-between gap-4 select-none ${
                isSelected
                  ? "border-[#006A4E] dark:border-[#10B981] bg-[#EBF7F2]/80 dark:bg-[#064E3B]/25"
                  : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#121721] hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 ${
                    isSelected
                      ? "bg-white dark:bg-slate-800 border border-[#006A4E]/20"
                      : "bg-slate-100 dark:bg-slate-800/80"
                  }`}
                >
                  {cand.symbolEmoji || "🗳️"}
                </div>

                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                    {locale === "bn" ? cand.nameBn || cand.name : cand.name}
                  </h2>
                  {cand.bio && (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {locale === "bn" ? cand.bioBn || cand.bio : cand.bio}
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`w-7 h-7 ${
                  isRadio ? "rounded-full" : "rounded-lg"
                } flex items-center justify-center shrink-0 transition-colors tabular-nums text-xs font-semibold ${
                  isSelected
                    ? "bg-[#006A4E] dark:bg-[#10B981] text-white"
                    : "border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121721]"
                }`}
              >
                {isSelected &&
                  (isRanked ? (
                    <span>#{formatNum(rankIndex + 1)}</span>
                  ) : (
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  ))}
              </div>
            </div>
          );
        })}

        {/* NOTA Option */}
        {election.allowNota && (
          <div
            role={isRadio ? "radio" : "checkbox"}
            aria-checked={selectedChoices.includes("nota")}
            tabIndex={0}
            onClick={() => onSelect("nota")}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onSelect("nota");
              }
            }}
            className={`p-4 sm:p-5 rounded-2xl border transition-colors cursor-pointer flex items-center justify-between gap-4 select-none ${
              selectedChoices.includes("nota")
                ? "border-slate-700 dark:border-slate-400 bg-slate-100 dark:bg-slate-800/80"
                : "border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-[#121721]/60 hover:border-slate-400"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Ban className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {locale === "bn" ? "উপরের কাউকে নয় (NOTA)" : "None of the above (NOTA)"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {locale === "bn"
                    ? "কোনো প্রার্থীকে পছন্দ না হলে"
                    : "Dissent vote / No preference"}
                </p>
              </div>
            </div>
            <div
              className={`w-7 h-7 ${
                isRadio ? "rounded-full" : "rounded-lg"
              } flex items-center justify-center shrink-0 ${
                selectedChoices.includes("nota")
                  ? "bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-900"
                  : "border-2 border-slate-300 dark:border-slate-700"
              }`}
            >
              {selectedChoices.includes("nota") && (
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar on Mobile for Primary CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-[#0B0E14]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 bottom-bar-shadow z-30 md:static md:bg-transparent md:border-none md:p-0 md:shadow-none">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {selectedChoices.length > 0 ? (
              <span className="text-[#006A4E] dark:text-[#34D399] font-medium">
                {t("btnSelected")} ({formatNum(selectedChoices.length)})
              </span>
            ) : (
              <span>{locale === "bn" ? "প্রার্থী নির্বাচন করুন" : "Select an option"}</span>
            )}
          </div>

          <Button
            onClick={onReview}
            disabled={selectedChoices.length === 0}
            size="lg"
            className="w-full sm:w-auto px-8 ml-auto"
          >
            <span>{t("btnReviewSelection")}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </div>
  );
}
