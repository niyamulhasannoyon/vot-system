"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Vote,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Copy,
  ShieldCheck,
  Clock,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getTimeRemaining } from "@/lib/date";

function VotingBoothContent() {
  const params = useParams();
  const router = useRouter();
  const { locale, formatNum, t } = useLanguage();
  const electionCode = (params.code as string)?.toUpperCase();

  // Loading & Election State
  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Flow Phases: "VERIFY_CODE" | "BALLOT" | "REVIEW" | "CONFIRMED"
  const [phase, setPhase] = useState<"VERIFY_CODE" | "BALLOT" | "REVIEW" | "CONFIRMED">("VERIFY_CODE");

  // Voter identification
  const [voterCode, setVoterCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  // Selection
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Result Receipt
  const [receiptData, setReceiptData] = useState<{
    receiptCode: string;
    sequenceNumber: number;
    castAt: string;
  } | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Fetch Election
  useEffect(() => {
    async function loadElection() {
      try {
        setLoading(true);
        const res = await fetch(`/api/elections/${electionCode}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Election not found");
        }
        setElection(data.election);

        // If open join code, bypass verification phase
        if (data.election.voterAccessType === "JOIN_CODE") {
          setPhase("BALLOT");
        } else {
          setPhase("VERIFY_CODE");
        }
      } catch (err: any) {
        setFetchError(err.message || t("errorGeneric"));
      } finally {
        setLoading(false);
      }
    }
    if (electionCode) {
      loadElection();
    }
  }, [electionCode]);

  // Handle Verify Code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterCode.trim()) {
      setCodeError(locale === "bn" ? "অনুগ্রহ করে আপনার ভোটার কোড দিন।" : "Please enter your voter code.");
      return;
    }
    setCodeError(null);
    setPhase("BALLOT");
  };

  // Toggle candidate selection
  const handleSelect = (id: string) => {
    if (election.electionType === "SINGLE" || election.electionType === "YES_NO") {
      setSelectedChoices([id]);
    } else {
      if (selectedChoices.includes(id)) {
        setSelectedChoices(selectedChoices.filter((c) => c !== id));
      } else {
        if (selectedChoices.length < (election.maxChoices || 3)) {
          setSelectedChoices([...selectedChoices, id]);
        }
      }
    }
  };

  // Proceed to review
  const handleGoToReview = () => {
    if (selectedChoices.length === 0) {
      alert(locale === "bn" ? "অনুগ্রহ করে যেকোনো একজন প্রার্থী বা বিকল্প নির্বাচন করুন।" : "Please select a candidate or option.");
      return;
    }
    setPhase("REVIEW");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Atomic Vote Submission
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/elections/${election.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterCode: voterCode.trim().toUpperCase(),
          choices: selectedChoices,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit vote");
      }

      setReceiptData({
        receiptCode: data.receiptCode,
        sequenceNumber: data.sequenceNumber,
        castAt: data.castAt,
      });

      setPhase("CONFIRMED");
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Celebratory Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#006A4E", "#F42A41", "#10B981", "#3B82F6"],
        });
      } catch {}
    } catch (err: any) {
      setSubmitError(err.message || t("errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReceipt = () => {
    if (!receiptData) return;
    navigator.clipboard.writeText(receiptData.receiptCode);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">{t("loading")}</p>
      </div>
    );
  }

  if (fetchError || !election) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-[#F42A41] mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {locale === "bn" ? "নির্বাচন পাওয়া যায়নি" : "Election Not Found"}
          </h2>
          <p className="text-xs text-slate-500">{fetchError}</p>
          <Link href="/vote">
            <Button variant="secondary" size="md">
              {locale === "bn" ? "কোড পুনরায় দিন" : "Try Another Code"}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const timeRem = getTimeRemaining(election.endTime, locale, true);

  // PHASE 4: CONFIRMED & SEALED WITH RECEIPT
  if (phase === "CONFIRMED" && receiptData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-16 w-full animate-fade-in">
        <Card className="text-center p-6 sm:p-8 space-y-6 border-2 border-emerald-500/30">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {t("voteSuccessTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t("voteSuccessSubtitle")}
            </p>
          </div>

          {/* Anonymous Digital Receipt Box */}
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              {t("receiptLabel")}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-widest text-[#006A4E] dark:text-[#34D399] font-mono">
              {receiptData.receiptCode}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <span>{locale === "bn" ? "ব্লক ক্রম #" : "Block Sequence #"}:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {formatNum(receiptData.sequenceNumber)}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-left leading-relaxed">
            <span className="font-bold block mb-1 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
              {locale === "bn" ? "গোপনীয়তার নিশ্চয়তা" : "Secret Ballot Guarantee"}
            </span>
            {t("receiptProofNote")}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button onClick={copyReceipt} variant="outline" className="w-full gap-2">
              <Copy className="w-4 h-4" />
              {copiedReceipt ? t("copiedToast") : t("btnCopyReceipt")}
            </Button>

            <Link href={`/verify?code=${receiptData.receiptCode}`} className="w-full inline-flex">
              <Button variant="secondary" className="w-full gap-2">
                <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
                {t("btnVerifyNow")}
              </Button>
            </Link>

            <Link href={`/elections/${election.joinCode}/results`} className="w-full inline-flex">
              <Button size="lg" className="w-full gap-2">
                <Vote className="w-4 h-4" />
                {t("btnGoToResults")}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // PHASE 3: REVIEW SELECTION BEFORE FINAL SUBMIT
  if (phase === "REVIEW") {
    const selectedCandidateObjects = election.options.filter((o: any) =>
      selectedChoices.includes(o.id)
    );
    const isNota = selectedChoices.includes("nota");

    return (
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-14 w-full animate-fade-in">
        <Card className="p-6 sm:p-8 space-y-6 border-slate-200 dark:border-slate-800">
          <div className="text-center space-y-1">
            <Badge variant="primary" className="mb-2">
              {locale === "bn" ? "ধাপ ২: চূড়ান্ত নিশ্চিতকরণ" : "Step 2: Final Confirmation"}
            </Badge>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t("reviewTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {t("reviewSubtitle")}
            </p>
          </div>

          {submitError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-700 dark:text-red-300">
              {submitError}
            </div>
          )}

          {/* Chosen Candidate Preview */}
          <div className="space-y-3">
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
              selectedCandidateObjects.map((cand: any) => (
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
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {locale === "bn" ? cand.bioBn || cand.bio : cand.bio}
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-[#006A4E]" />
                </div>
              ))
            )}
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            {locale === "bn"
              ? "সতর্কতা: ভোট চূড়ান্তভাবে নিশ্চিত করার পর তা আর প্রত্যাহার করা যাবে না। এক ভোটার একবারই ভোট প্রদান করতে পারেন।"
              : "Notice: Your ballot is final and cannot be modified once confirmed."}
          </div>

          {/* Review Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <Button
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              size="lg"
              className="w-full bg-[#006A4E] hover:bg-[#00533C] text-white"
            >
              {isSubmitting ? t("submittingVote") : t("btnConfirmVote")}
            </Button>

            <Button
              onClick={() => setPhase("BALLOT")}
              disabled={isSubmitting}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {t("btnChangeSelection")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // PHASE 1: VOTER CODE VERIFICATION
  if (phase === "VERIFY_CODE") {
    return (
      <div className="max-w-md mx-auto px-4 py-12 sm:py-20 w-full animate-fade-in">
        <Card className="p-6 sm:p-8 space-y-6 border-slate-200 dark:border-slate-800">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#EBF7F2] text-[#006A4E] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {t("voterEnterCodeTitle")}
            </h2>
            <p className="text-xs text-slate-500">
              {election.titleBn || election.title}
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {locale === "bn" ? "আপনার ওয়ান-টাইম ভোটার কোড" : "One-Time Voter Code"}
              </label>
              <input
                type="text"
                autoFocus
                value={voterCode}
                onChange={(e) => {
                  setVoterCode(e.target.value);
                  setCodeError(null);
                }}
                placeholder={t("voterCodePlaceholder")}
                className="w-full px-4 py-3 text-center text-lg font-mono uppercase tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
              />
              {codeError && (
                <p className="text-xs text-red-500 mt-1.5 text-center font-medium">
                  {codeError}
                </p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full gap-2">
              <span>{t("btnVerifyCode")}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Helper for Demo election */}
          {election.joinCode === "CR-2024" && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">
                {locale === "bn" ? "💡 ডেমো টেস্টের জন্য কোড ব্যবহার করুন:" : "💡 Quick Access Demo Voter Codes:"}
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {["CR-V104", "CR-V105", "CR-V106"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setVoterCode(c);
                      setCodeError(null);
                    }}
                    className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-center text-[11px] text-slate-400">
            {locale === "bn"
              ? "কোড হারিয়ে গেলে ক্লাস শিক্ষক বা নির্বাচন আয়োজকের সাথে যোগাযোগ করুন।"
              : "If you lost your code, contact the election organizer."}
          </div>
        </Card>
      </div>
    );
  }

  // PHASE 2: OFFICIAL BALLOT PAPER
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
            <span>{timeRem.label}</span>
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

      {/* Candidate Cards (Large touch-friendly targets!) */}
      <div className="space-y-3.5 mb-8">
        {election.options.map((cand: any) => {
          const isSelected = selectedChoices.includes(cand.id);

          return (
            <div
              key={cand.id}
              onClick={() => handleSelect(cand.id)}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                isSelected
                  ? "border-[#006A4E] bg-[#EBF7F2] dark:bg-[#064E3B]/25 shadow-sm scale-[1.01]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Symbol / Emoji */}
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

              {/* Selection Checkmark / Radio Pill */}
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

        {/* NOTA Option (None of the Above) */}
        {election.allowNota && (
          <div
            onClick={() => handleSelect("nota")}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
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
                  {locale === "bn" ? "কোনো প্রার্থীকে পছন্দ না হলে" : "Dissent vote"}
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
            onClick={handleGoToReview}
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

export default function VotingBoothPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-12 h-12 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading ballot booth...</p>
        </div>
      }
    >
      <VotingBoothContent />
    </Suspense>
  );
}
