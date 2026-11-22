"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getTimeRemaining } from "@/lib/date";
import { VoterAuthCard } from "@/features/voting/VoterAuthCard";
import { BallotPaper } from "@/features/voting/BallotPaper";
import { VoteReviewModal } from "@/features/voting/VoteReviewModal";
import { VoteReceiptCard } from "@/features/voting/VoteReceiptCard";

function VotingBoothContent() {
  const params = useParams();
  const { locale, t } = useLanguage();
  const electionCode = (params.code as string)?.toUpperCase();

  // Loading & Election State
  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Flow State
  const [phase, setPhase] = useState<"AUTH" | "BALLOT" | "CONFIRMED">("AUTH");
  const [voterCode, setVoterCode] = useState("");
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Result Receipt
  const [receiptData, setReceiptData] = useState<{
    receiptCode: string;
    sequenceNumber: number;
    castAt: string;
  } | null>(null);

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

        if (data.election.voterAccessType === "JOIN_CODE") {
          setPhase("BALLOT");
        } else {
          setPhase("AUTH");
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
  }, [electionCode, t]);

  const handleVerifyCode = (code: string) => {
    setVoterCode(code);
    setPhase("BALLOT");
  };

  const handleSelectChoice = (id: string) => {
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
      } catch {}
    } catch (err: any) {
      setSubmitError(err.message || t("errorGeneric"));
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

  // PHASE 3: CONFIRMED WITH ANONYMOUS RECEIPT
  if (phase === "CONFIRMED" && receiptData) {
    return (
      <VoteReceiptCard
        receiptCode={receiptData.receiptCode}
        sequenceNumber={receiptData.sequenceNumber}
        joinCode={election.joinCode}
      />
    );
  }

  // PHASE 1: VOTER AUTH CODE
  if (phase === "AUTH") {
    return (
      <VoterAuthCard
        electionTitle={election.titleBn || election.title}
        joinCode={election.joinCode}
        onVerify={handleVerifyCode}
      />
    );
  }

  // PHASE 2: BALLOT PAPER & SELECTION
  return (
    <>
      <BallotPaper
        election={election}
        options={election.options}
        selectedChoices={selectedChoices}
        voterCode={voterCode}
        timeRemainingLabel={timeRem.label}
        onSelect={handleSelectChoice}
        onReview={() => setIsReviewOpen(true)}
      />

      {/* Accessible Review & Confirmation Dialog */}
      <VoteReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        options={election.options}
        selectedChoices={selectedChoices}
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
