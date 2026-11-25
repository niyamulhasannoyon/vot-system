"use client";

import React from "react";
import { CheckCircle2, ArrowLeft, Lock, Ban } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { ElectionOption } from "@/types/election";

interface VoteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ElectionOption[];
  selectedChoices: string[];
  electionType?: string;
  isSubmitting: boolean;
  submitError: string | null;
  onConfirm: () => void;
}

export function VoteReviewModal({
  isOpen,
  onClose,
  options,
  selectedChoices,
  electionType = "SINGLE",
  isSubmitting,
  submitError,
  onConfirm,
}: VoteReviewModalProps) {
  const { locale, formatNum, t } = useLanguage();

  const optionById = new Map(options.map((o) => [o.id, o]));
  const selectedCandidateObjects = selectedChoices
    .map((id) => optionById.get(id))
    .filter((o): o is ElectionOption => Boolean(o));
  const isNota = selectedChoices.includes("nota");
  const isRanked = electionType === "RANKED";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preventClose={isSubmitting}
      title={t("reviewTitle")}
      description={t("reviewSubtitle")}
    >
      <div className="space-y-5 pt-2">
        {submitError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 font-medium"
          >
            {submitError}
          </div>
        )}

        <div className="space-y-2.5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            {t("chosenCandidate")}
          </span>

          {isNota ? (
            <div className="p-4 rounded-xl border border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
                <Ban className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  {locale === "bn" ? "উপরের কাউকে নয় (NOTA)" : "None of the above (NOTA)"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {locale === "bn" ? "কোনো প্রার্থীর প্রতি সমর্থন নেই" : "Dissent vote cast"}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedCandidateObjects.map((cand, index) => (
                <div
                  key={cand.id}
                  className="p-3.5 rounded-xl border border-[#006A4E] dark:border-[#10B981] bg-[#EBF7F2] dark:bg-[#064E3B]/25 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isRanked && (
                      <span className="px-2 py-0.5 rounded-md bg-[#006A4E] text-white text-xs font-mono font-semibold tabular-nums shrink-0">
                        #{formatNum(index + 1)}
                      </span>
                    )}
                    <span className="text-2xl shrink-0">{cand.symbolEmoji || "🗳️"}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                        {locale === "bn" ? cand.nameBn || cand.name : cand.name}
                      </div>
                      {cand.bio && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {locale === "bn" ? cand.bioBn || cand.bio : cand.bio}
                        </div>
                      )}
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-[#006A4E] dark:text-[#34D399] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={1.75} />
          <span>
            {locale === "bn"
              ? "সতর্কতা: ভোট চূড়ান্তভাবে নিশ্চিত করার পর তা আর প্রত্যাহার করা যাবে না। এক ভোটার একবারই ভোট প্রদান করতে পারেন।"
              : "Notice: Your ballot is final and cannot be modified once confirmed."}
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          <Button
            onClick={onConfirm}
            isLoading={isSubmitting}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? t("submittingVote") : t("btnConfirmVote")}
          </Button>

          <Button
            onClick={onClose}
            disabled={isSubmitting}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            <span>{t("btnChangeSelection")}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
