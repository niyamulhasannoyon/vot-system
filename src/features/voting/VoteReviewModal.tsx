"use client";

import React from "react";
import { CheckCircle2, ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

interface Option {
  id: string;
  name: string;
  nameBn?: string | null;
  symbolEmoji?: string | null;
  bio?: string | null;
  bioBn?: string | null;
}

interface VoteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: Option[];
  selectedChoices: string[];
  isSubmitting: boolean;
  submitError: string | null;
  onConfirm: () => void;
}

export function VoteReviewModal({
  isOpen,
  onClose,
  options,
  selectedChoices,
  isSubmitting,
  submitError,
  onConfirm,
}: VoteReviewModalProps) {
  const { locale, t } = useLanguage();

  const selectedCandidateObjects = options.filter((o) =>
    selectedChoices.includes(o.id)
  );
  const isNota = selectedChoices.includes("nota");

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={t("reviewTitle")}
      description={t("reviewSubtitle")}
    >
      <div className="space-y-5 pt-2">
        {submitError && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-700 dark:text-red-300 font-medium">
            {submitError}
          </div>
        )}

        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {t("chosenCandidate")}
          </span>

          {isNota ? (
            <div className="p-4 rounded-xl border-2 border-slate-400 bg-slate-50 dark:bg-slate-800 flex items-center gap-3">
              <span className="text-2xl">🚫</span>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {locale === "bn" ? "উপরের কাউকে নয় (NOTA)" : "None of the above (NOTA)"}
                </div>
                <div className="text-xs text-slate-500">
                  {locale === "bn" ? "কোনো প্রার্থীর প্রতি সমর্থন নেই" : "Dissent vote cast"}
                </div>
              </div>
            </div>
          ) : (
            selectedCandidateObjects.map((cand) => (
              <div
                key={cand.id}
                className="p-4 rounded-xl border-2 border-[#006A4E] bg-[#EBF7F2] dark:bg-[#064E3B]/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cand.symbolEmoji || "🗳️"}</span>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-base">
                      {locale === "bn" ? cand.nameBn || cand.name : cand.name}
                    </div>
                    {cand.bio && (
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {locale === "bn" ? cand.bioBn || cand.bio : cand.bio}
                      </div>
                    )}
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#006A4E]" />
              </div>
            ))
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {locale === "bn"
              ? "সতর্কতা: ভোট চূড়ান্তভাবে নিশ্চিত করার পর তা আর প্রত্যাহার করা যাবে না। এক ভোটার একবারই ভোট প্রদান করতে পারেন।"
              : "Notice: Your ballot is final and cannot be modified once confirmed."}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button
            onClick={onConfirm}
            isLoading={isSubmitting}
            size="lg"
            className="w-full bg-[#006A4E] hover:bg-[#00533C] text-white"
          >
            {isSubmitting ? t("submittingVote") : t("btnConfirmVote")}
          </Button>

          <Button
            onClick={onClose}
            disabled={isSubmitting}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {t("btnChangeSelection")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
