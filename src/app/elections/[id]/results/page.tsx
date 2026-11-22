"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Users,
  Vote,
  Download,
  Printer,
  Share2,
  Clock,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Lock,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { getTimeRemaining } from "@/lib/date";

// Lazy-load Recharts to avoid SSR hydration mismatches and decrease initial bundle size
const ResultsBarChart = dynamic(
  () => import("@/components/results/ResultsBarChart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 sm:h-72 w-full rounded-xl" />,
  }
);

function ElectionResultsContent() {
  const params = useParams();
  const { locale, formatNum, formatDate, t } = useLanguage();
  const { showToast } = useToast();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch(`/api/elections/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load election");
      setElection(data.election);
    } catch (err: any) {
      setError(err.message || t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Live polling every 6 seconds for live turnout updates if still active
    const interval = setInterval(() => {
      if (election?.status === "ACTIVE") {
        loadData();
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [id, election?.status]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">{t("loading")}</p>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-8 space-y-4">
          <p className="text-sm text-red-500">{error || "Election not found"}</p>
          <Link href="/">
            <Button variant="secondary" size="md">
              {t("navHome")}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isClosed = election.status === "CLOSED";
  const timeRem = getTimeRemaining(election.endTime, locale, true);

  // Determine Winner(s)
  const sortedOptions = [...election.options].sort(
    (a: any, b: any) => b.votes - a.votes
  );
  const topOption = sortedOptions[0];
  const secondOption = sortedOptions[1];

  const isTie =
    topOption &&
    secondOption &&
    topOption.votes > 0 &&
    topOption.votes === secondOption.votes;

  // Chart Data preparation
  const chartData = election.options.map((opt: any) => ({
    name: locale === "bn" ? opt.nameBn || opt.name : opt.name,
    votes: opt.votes,
    percentage: opt.percentage,
    symbol: opt.symbolEmoji || "🗳️",
  }));

  if (election.allowNota && election.notaVotes > 0) {
    chartData.push({
      name: locale === "bn" ? "উপরের কাউকে নয় (NOTA)" : "NOTA",
      votes: election.notaVotes,
      percentage:
        election.totalBallotsCast > 0
          ? Math.round((election.notaVotes / election.totalBallotsCast) * 100)
          : 0,
      symbol: "🚫",
    });
  }

  const COLORS = ["#006A4E", "#059669", "#10B981", "#3B82F6", "#8B5CF6", "#64748B"];

  // Export to CSV
  const handleExportCsv = () => {
    let csv = `Candidate,Symbol,Votes,Percentage\n`;
    for (const opt of election.options) {
      csv += `"${opt.name}","${opt.symbolEmoji || ""}",${opt.votes},${opt.percentage}%\n`;
    }
    if (election.allowNota) {
      csv += `"None of the above (NOTA)","🚫",${election.notaVotes},\n`;
    }
    csv += `\nTotal Ballots Cast,${election.totalBallotsCast}\n`;
    csv += `Total Eligible Voters,${election.totalEligibleVoters}\n`;
    csv += `Turnout,${election.turnoutPercentage}%\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${election.slug}-results.csv`;
    a.click();
    showToast(locale === "bn" ? "ফলাফল CSV ডাউনলোড হয়েছে" : "Results downloaded as CSV", "success");
  };

  // Share Results
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast(locale === "bn" ? "ফলাফলের লিংক কপি করা হয়েছে!" : "Result URL copied to clipboard!", "success");
    }
  };

  // Print View
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8 print:p-0 print:space-y-4 animate-fade-in">
      {/* PRINT-ONLY OFFICIAL HEADER */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>VoteBD Cryptographic Certification</span>
          <span>Official Ballot Record</span>
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">
          Official Election Result Certification
        </h1>
        <p className="text-sm font-semibold text-slate-700 mt-1">
          {locale === "bn" ? election.titleBn || election.title : election.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Join Code: <strong className="font-mono">{election.joinCode}</strong> • Finalised on: {formatDate(election.endTime)}
        </p>
      </div>

      {/* Screen Header */}
      <div className="space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={isClosed ? "neutral" : "live"}>
              {isClosed ? t("resultsClosedBadge") : t("resultsLiveBadge")}
            </Badge>
            <span className="text-xs font-mono text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold">
              {election.joinCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleShare} variant="outline" size="sm" className="gap-1.5" title="Copy shareable link">
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{locale === "bn" ? "শেয়ার" : "Share"}</span>
            </Button>
            <Button onClick={handleExportCsv} variant="outline" size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>{t("btnExportCsv")}</span>
            </Button>
            <Button onClick={handlePrint} variant="secondary" size="sm" className="gap-1.5">
              <Printer className="w-3.5 h-3.5" />
              <span>{t("btnPrintResults")}</span>
            </Button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {locale === "bn" ? election.titleBn || election.title : election.title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#006A4E]" />
            {isClosed ? (
              <span>{locale === "bn" ? "ভোট সমাপ্ত হয়েছে" : "Voting ended"}</span>
            ) : (
              <span>{timeRem.label}</span>
            )}
          </span>
          <span>•</span>
          <span>
            {locale === "bn" ? "শেষ সময়: " : "Deadline: "}
            {formatDate(election.endTime, { short: true })}
          </span>
        </div>
      </div>

      {/* WINNER OR TIE HIGHLIGHT CARD */}
      {election.totalBallotsCast > 0 && (
        <>
          {isTie ? (
            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-4 print:border-amber-400">
              <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                  {t("tieTitle")}
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {locale === "bn"
                    ? `${topOption.nameBn || topOption.name} এবং ${secondOption.nameBn || secondOption.name} উভয় প্রার্থী সমান ${formatNum(topOption.votes)} ভোট পেয়েছেন। প্রতিষ্ঠানের নিয়মানুযায়ী পরবর্তী সিদ্ধান্ত নিন।`
                    : `Both candidates received ${topOption.votes} votes. Please consult organizational guidelines for tie-breaking.`}
                </p>
              </div>
            </div>
          ) : topOption && topOption.votes > 0 ? (
            <Card className="p-6 sm:p-8 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-emerald-500/40 relative overflow-hidden shadow-sm print:bg-white print:border-slate-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4 sm:gap-6 text-center sm:text-left">
                  <div className="w-20 h-20 rounded-2xl bg-[#006A4E] text-white flex items-center justify-center text-4xl shadow-md shrink-0 print:border print:border-slate-800">
                    {topOption.symbolEmoji || "🏆"}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 text-xs font-semibold mb-1 print:border print:border-emerald-600">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      {t("winnerHighlight")}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {locale === "bn" ? topOption.nameBn || topOption.name : topOption.name}
                    </h2>
                    {topOption.bio && (
                      <p className="text-xs text-slate-500 mt-0.5">{topOption.bio}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:border-l sm:border-emerald-200/80 sm:dark:border-emerald-900/40 sm:pl-8">
                  <div className="text-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      {t("winnerVotes")}
                    </span>
                    <span className="text-3xl font-extrabold text-[#006A4E] dark:text-[#34D399]">
                      {formatNum(topOption.votes)}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      {t("winnerVoteShare")}
                    </span>
                    <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                      {formatNum(topOption.percentage)}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}
        </>
      )}

      {/* STATS TILES (Turnout & Participation) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-3">
        <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 print:border-slate-300">
          <span className="text-xs text-slate-500 block mb-1">
            {t("totalVotesCast")}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatNum(election.totalBallotsCast)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {locale === "bn" ? "গোপন ব্যালটে গৃহীত" : "Anonymously tallied"}
          </span>
        </Card>

        <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 print:border-slate-300">
          <span className="text-xs text-slate-500 block mb-1">
            {t("totalRegistered")}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatNum(election.totalEligibleVoters)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {locale === "bn" ? "মোট নিবন্ধিত ভোটার" : "Eligible roster count"}
          </span>
        </Card>

        <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 print:border-slate-300">
          <span className="text-xs text-slate-500 block mb-1">
            {t("turnoutRate")}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#006A4E] dark:text-[#34D399]">
            {formatNum(election.turnoutPercentage)}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden print:hidden">
            <div
              className="bg-[#006A4E] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(election.turnoutPercentage, 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* CHARTS: BAR BREAKDOWN & DETAILED TALLY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:grid-cols-1 print:gap-4">
        {/* Bar Chart (7 cols on desktop, hidden in plain print) */}
        <div className="lg:col-span-7 print:hidden">
          <Card className="p-5 sm:p-6 space-y-4 border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("chartTitle")}
            </h3>

            {election.totalBallotsCast === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                {t("noActivityYet")}
              </div>
            ) : (
              <ResultsBarChart
                data={chartData}
                colors={COLORS}
                locale={locale}
                formatNum={formatNum}
              />
            )}
          </Card>
        </div>

        {/* Detailed Candidate Breakdown Table (5 cols on screen, full width in print) */}
        <div className="lg:col-span-5 print:col-span-1">
          <Card className="p-5 sm:p-6 space-y-3 border-slate-200 dark:border-slate-800 print:border-slate-300">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {locale === "bn" ? "প্রার্থীভিত্তিক ফলাফল তালিকা" : "Candidate Standings"}
            </h3>

            <div className="space-y-3">
              {sortedOptions.map((opt: any, idx: number) => (
                <div
                  key={opt.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between print:border-slate-300 print:bg-white"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-xl">{opt.symbolEmoji || "🗳️"}</span>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {locale === "bn" ? opt.nameBn || opt.name : opt.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatNum(opt.votes)} {locale === "bn" ? "ভোট" : "votes"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#006A4E] dark:text-[#34D399]">
                      {formatNum(opt.percentage)}%
                    </span>
                  </div>
                </div>
              ))}

              {election.allowNota && (
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between opacity-80 print:border-slate-300 print:bg-white">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🚫</span>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      NOTA
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                    {formatNum(election.notaVotes)} {locale === "bn" ? "ভোট" : "votes"}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* PRINT-ONLY OFFICIAL SIGNATURE & ATTESTATION SECTION */}
      <div className="hidden print:block pt-12 space-y-8">
        <div className="border-t border-slate-300 pt-3 text-xs text-slate-600">
          <p>
            <strong>Integrity Notice:</strong> All ballots in this election were cryptographically recorded in a tamper-evident SHA-256 hash chain without linking voter identity to candidate selections. Any tampering with stored ballots invalidates the cryptographic verification seal.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 pt-8">
          <div className="text-center">
            <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-900">Chief Returning Officer</p>
            <p className="text-[10px] text-slate-500">Signature & Date</p>
          </div>
          <div className="text-center">
            <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-900">Independent Scrutineer / Observer</p>
            <p className="text-[10px] text-slate-500">Signature & Date</p>
          </div>
        </div>
      </div>

      {/* Public Receipt Verification Callout */}
      <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <ShieldCheck className="w-8 h-8 text-[#006A4E] shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {locale === "bn"
                ? "আপনার ভোট কি সঠিকভাবে গণনা করা হয়েছে?"
                : "Want to verify your vote was included?"}
            </h4>
            <p className="text-xs text-slate-500">
              {locale === "bn"
                ? "ভোট দেওয়ার পর প্রাপ্ত ডিজিটাল রসিদ কোড দিয়ে যে কেউ নিরপেক্ষ অডিট করতে পারেন।"
                : "Check your receipt code in our cryptographic audit log without revealing your choice."}
            </p>
          </div>
        </div>

        <Link href="/verify">
          <Button variant="secondary" size="md" className="shrink-0">
            {t("btnVerifyNow")}
          </Button>
        </Link>
      </div>

      {/* Admin Panel Quick Link */}
      <div className="text-center pt-4 print:hidden">
        <Link
          href={`/elections/${election.joinCode}/admin`}
          className="text-xs font-semibold text-[#006A4E] hover:underline"
        >
          {t("btnAdminDashboard")} →
        </Link>
      </div>
    </div>
  );
}

export default function ElectionResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-12 h-12 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading results...</p>
        </div>
      }
    >
      <ElectionResultsContent />
    </Suspense>
  );
}
