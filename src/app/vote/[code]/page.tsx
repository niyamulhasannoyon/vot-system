"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { AlertCircle, Clock, Lock, BarChart3 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getTimeRemaining } from "@/lib/date";
import { VoterAuthCard } from "@/features/voting/VoterAuthCard";
import { BallotPaper } from "@/features/voting/BallotPaper";
import { VoteReviewModal } from "@/features/voting/VoteReviewModal";
import { VoteReceiptCard } from "@/features/voting/VoteReceiptCard";
import type { ElectionDetail } from "@/types/election";

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem("votebd_device_id");
    if (!id) {
      id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("votebd_device_id", id);
    }
    return id;
  } catch {
    return "";
  }
}

function VotingBoothContent() {
  const params = useParams();
  const { locale, useBengaliNumerals, formatDate, t } = useLanguage();
  const electionCode = decodeURIComponent((params.code as string) || "").trim();

  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deviceBlockedMsg, setDeviceBlockedMsg] = useState<string | null>(null);

  const [phase, setPhase] = useState<"AUTH" | "BALLOT" | "CONFIRMED">("AUTH");
  const [voterCode, setVoterCode] = useState("");
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [receiptData, setReceiptData] = useState<{
    receiptCode: string;
    sequenceNumber: number;
    castAt: string;
  } | null>(null);

  useEffect(() => {
    if (!electionCode) return;
    const controller = new AbortController();

    async function loadElection() {
      try {
        setLoading(true);
        setFetchError(null);
        setDeviceBlockedMsg(null);

        const res = await fetch(`/api/elections/${encodeURIComponent(electionCode)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = (await res.json()) as {
          election?: ElectionDetail;
          error?: string;
        };

        if (!res.ok || !data.election) {
          throw new Error(data.error || "Election not found");
        }

        const loaded = data.election;
        setElection(loaded);

        if (loaded.status === "ACTIVE" && loaded.hasStarted) {
          if (
            loaded.voterAccessType === "JOIN_CODE" ||
            loaded.voterAccessType === "OPEN_POLL"
          ) {
            const deviceId = getOrCreateDeviceId();
            const checkRes = await fetch(
              `/api/elections/${encodeURIComponent(loaded.id)}/verify-voter`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deviceId }),
                signal: controller.signal,
              }
            );
            if (!checkRes.ok) {
              const checkData = (await checkRes.json()) as { error?: string };
              if (checkRes.status === 409) {
                setDeviceBlockedMsg(
                  checkData.error ||
                    "This device has already cast a ballot in this election."
                );
              }
            }
            setPhase("BALLOT");
          } else {
            setPhase("AUTH");
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : t("errorGeneric");
        setFetchError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadElection();
    return () => controller.abort();
  }, [electionCode, t]);

  const handleVerifyCode = (code: string) => {
    setVoterCode(code);
    setPhase("BALLOT");
  };

  const handleSelectChoice = (id: string) => {
    if (!election) return;

    if (election.electionType === "SINGLE" || election.electionType === "YES_NO") {
      setSelectedChoices([id]);
      return;
    }

    if (id === "nota") {
      setSelectedChoices((prev) => (prev.includes("nota") ? [] : ["nota"]));
      return;
    }

    const withoutNota = selectedChoices.filter((c) => c !== "nota");

    if (election.electionType === "RANKED") {
      if (withoutNota.includes(id)) {
        setSelectedChoices(withoutNota.filter((c) => c !== id));
      } else {
        setSelectedChoices([...withoutNota, id]);
      }
      return;
    }

    // MULTIPLE choice
    if (withoutNota.includes(id)) {
      setSelectedChoices(withoutNota.filter((c) => c !== id));
    } else if (withoutNota.length < (election.maxChoices || 1)) {
      setSelectedChoices([...withoutNota, id]);
    }
  };

  const handleFinalSubmit = async () => {
    if (!election) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const cleanVoterCode = voterCode.trim()
        ? voterCode.trim().toUpperCase()
        : undefined;
      const deviceId =
        election.voterAccessType === "JOIN_CODE" ||
        election.voterAccessType === "OPEN_POLL"
          ? getOrCreateDeviceId()
          : undefined;

      const res = await fetch(`/api/elections/${encodeURIComponent(election.id)}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterCode: cleanVoterCode,
          choices: selectedChoices,
          deviceId,
        }),
      });

      const data = (await res.json()) as {
        receiptCode?: string;
        sequenceNumber?: number;
        castAt?: string;
        error?: string;
      };

      if (!res.ok || !data.receiptCode || !data.sequenceNumber || !data.castAt) {
        throw new Error(data.error || "Failed to submit vote");
      }

      setReceiptData({
        receiptCode: data.receiptCode,
        sequenceNumber: data.sequenceNumber,
        castAt: data.castAt,
      });

      setIsReviewOpen(false);
      setPhase("CONFIRMED");
      window.scrollTo({ top: 0, behavior: "smooth" });

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#006A4E", "#F42A41", "#10B981", "#3B82F6"],
        });
      } catch {
        // Confetti optional
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("errorGeneric");
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 w-full space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (fetchError || !election) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-[#F42A41] mx-auto" strokeWidth={1.75} />
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            {locale === "bn" ? "নির্বাচন পাওয়া যায়নি" : "Election not found"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{fetchError}</p>
          <Link href="/vote" className="inline-block">
            <Button variant="secondary" size="md">
              {locale === "bn" ? "কোড পুনরায় দিন" : "Try another code"}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Election Closed State
  if (election.status === "CLOSED") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <Card className="p-8 space-y-5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {locale === "bn" ? "ভোটগ্রহণ সমাপ্ত হয়েছে" : "Election has closed"}
            </h1>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {locale === "bn" ? election.titleBn || election.title : election.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === "bn"
                ? `সমাপ্তির সময়: ${formatDate(election.endTime)}`
                : `Closed on ${formatDate(election.endTime)}`}
            </p>
          </div>
          <Link href={`/elections/${encodeURIComponent(election.joinCode)}/results`} className="block">
            <Button size="lg" className="w-full">
              <BarChart3 className="w-4 h-4" strokeWidth={1.75} />
              <span>{t("btnGoToResults")}</span>
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Election Not Started State
  if (!election.hasStarted) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <Card className="p-8 space-y-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {locale === "bn" ? "ভোটগ্রহণ এখনও শুরু হয়নি" : "Voting has not started yet"}
            </h1>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {locale === "bn" ? election.titleBn || election.title : election.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === "bn"
                ? `ভোট শুরু হবে: ${formatDate(election.startTime)}`
                : `Opens at ${formatDate(election.startTime)}`}
            </p>
          </div>
          <Link href={`/elections/${encodeURIComponent(election.joinCode)}/results`} className="block">
            <Button variant="secondary" size="md" className="w-full">
              <span>{t("btnGoToResults")}</span>
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Device already voted in open join-code election
  if (deviceBlockedMsg && phase !== "CONFIRMED") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <Card className="p-8 space-y-5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {locale === "bn" ? "ভোট ইতোমধ্যে গৃহীত হয়েছে" : "Ballot already submitted"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {locale === "bn"
                ? "এই ডিভাইস থেকে ইতোমধ্যে এই নির্বাচনে একটি ভোট প্রদান করা হয়েছে।"
                : deviceBlockedMsg}
            </p>
          </div>
          <div className="space-y-2.5">
            <Link href={`/elections/${encodeURIComponent(election.joinCode)}/results`} className="block">
              <Button size="lg" className="w-full">
                <span>{t("btnGoToResults")}</span>
              </Button>
            </Link>
            <Link href="/verify" className="block">
              <Button variant="outline" size="md" className="w-full">
                <span>{t("btnVerifyNow")}</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const timeRem = getTimeRemaining(election.endTime, locale, useBengaliNumerals);

  if (phase === "CONFIRMED" && receiptData) {
    return (
      <VoteReceiptCard
        receiptCode={receiptData.receiptCode}
        sequenceNumber={receiptData.sequenceNumber}
        joinCode={election.joinCode}
      />
    );
  }

  if (phase === "AUTH") {
    return (
      <VoterAuthCard
        electionId={election.id}
        electionTitle={
          locale === "bn" ? election.titleBn || election.title : election.title
        }
        joinCode={election.joinCode}
        onVerify={handleVerifyCode}
      />
    );
  }

  return (
    <>
      <BallotPaper
        election={election}
        options={election.options}
        selectedChoices={selectedChoices}
        voterCode={voterCode || undefined}
        timeRemainingLabel={timeRem.label}
        onSelect={handleSelectChoice}
        onReview={() => {
          setSubmitError(null);
          setIsReviewOpen(true);
        }}
      />

      <VoteReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        options={election.options}
        selectedChoices={selectedChoices}
        electionType={election.electionType}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onConfirm={handleFinalSubmit}
      />
    </>
  );
}

export default function VotingBoothPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-16 w-full space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      }
    >
      <VotingBoothContent />
    </Suspense>
  );
}
