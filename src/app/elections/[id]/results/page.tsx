"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Download,
  Printer,
  Share2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Ban,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { getTimeRemaining } from "@/lib/date";
import { downloadCsv } from "@/lib/csv";
import type { ElectionDetail } from "@/types/election";

const ResultsBarChart = dynamic(
  () => import("@/components/results/ResultsBarChart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 sm:h-72 w-full rounded-xl" />,
  }
);

function ElectionResultsContent() {
  const params = useParams();
  const { locale, useBengaliNumerals, isDark, formatNum, formatDate, t } =
    useLanguage();
  const { showToast } = useToast();
  const id = decodeURIComponent((params.id as string) || "").trim();

  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    async function initialLoad() {
      try {
        const res = await fetch(`/api/elections/${encodeURIComponent(id)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = (await res.json()) as {
          election?: ElectionDetail;
          error?: string;
        };
        if (!res.ok || !data.election) {
          throw new Error(data.error || "Failed to load election");
        }
        setElection(data.election);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : t("errorGeneric");
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    initialLoad();
    return () => controller.abort();
  }, [id, t]);

  const isActive = election?.status === "ACTIVE";
  useEffect(() => {
    if (!id || !isActive) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/elections/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as { election?: ElectionDetail };
        if (res.ok && data.election) {
          setElection(data.election);
        }
      } catch {
        // Silent background poll retry
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [id, isActive]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">{t("loading")}</p>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-8 space-y-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            {error || "Election not found"}
          </p>
          <Link href="/" className="inline-block">
            <Button variant="secondary" size="md">
              {t("navHome")}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isClosed = election.status === "CLOSED";
  const isRanked = election.electionType === "RANKED";
  const isCodeList = election.voterAccessType === "CODE_LIST";
  const timeRem = getTimeRemaining(election.endTime, locale, useBengaliNumerals);

  const sortedOptions = [...election.options].sort((a, b) => {
    if (isRanked) {
      return (b.bordaScore ?? 0) - (a.bordaScore ?? 0) || (b.votes ?? 0) - (a.votes ?? 0);
    }
    return (b.votes ?? 0) - (a.votes ?? 0);
  });

  const topOption = sortedOptions[0];
  const secondOption = sortedOptions[1];

  const topMetric = (opt?: typeof topOption) =>
    isRanked ? opt?.bordaScore ?? 0 : opt?.votes ?? 0;

  const isTie =
    !election.resultsHidden &&
    topOption &&
    secondOption &&
    topMetric(topOption) > 0 &&
    topMetric(topOption) === topMetric(secondOption);

  const chartData = !election.resultsHidden
    ? election.options.map((opt) => ({
        name: locale === "bn" ? opt.nameBn || opt.name : opt.name,
        votes: opt.votes ?? 0,
        percentage: opt.percentage ?? 0,
        symbol: opt.symbolEmoji || "🗳️",
      }))
    : [];

  if (!election.resultsHidden && election.allowNota && (election.notaVotes ?? 0) > 0) {
    const notaVotes = election.notaVotes ?? 0;
    chartData.push({
      name: locale === "bn" ? "উপরের কাউকে নয় (NOTA)" : "NOTA",
      votes: notaVotes,
      percentage:
        election.totalBallotsCast > 0
          ? Math.round((notaVotes / election.totalBallotsCast) * 100)
          : 0,
      symbol: "—",
    });
  }

  const handleExportCsv = () => {
    const rows: Array<Array<string | number | null | undefined>> = [
      ["Candidate", "Symbol", "Votes", "Percentage"],
    ];
    for (const opt of election.options) {
      rows.push([
        opt.name,
        opt.symbolEmoji || "",
        opt.votes ?? 0,
        `${opt.percentage ?? 0}%`,
      ]);
    }
    if (election.allowNota) {
      const notaCount = election.notaVotes ?? 0;
      const notaPct =
        election.totalBallotsCast > 0
          ? Math.round((notaCount / election.totalBallotsCast) * 100)
          : 0;
      rows.push(["None of the above (NOTA)", "NOTA", notaCount, `${notaPct}%`]);
    }
    rows.push([]);
    rows.push(["Total Ballots Cast", election.totalBallotsCast]);
    if (isCodeList) {
      rows.push(["Total Eligible Voters", election.totalEligibleVoters]);
      rows.push(["Turnout", `${election.turnoutPercentage ?? 0}%`]);
    }

    downloadCsv(`${election.slug}-results.csv`, rows);
    showToast(
      locale === "bn" ? "ফলাফল CSV ডাউনলোড হয়েছে" : "Results exported to CSV",
      "success"
    );
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(
        locale === "bn"
          ? "ফলাফলের লিংক কপি করা হয়েছে"
          : "Result URL copied to clipboard",
        "success"
      );
    } catch {
      showToast(t("errorGeneric"), "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8 print:p-0 print:space-y-4 animate-fade-in">
      {/* PRINT-ONLY OFFICIAL HEADER */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>VoteBD Cryptographic Certification</span>
          <span>Official Ballot Record</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Official Election Result Certification
        </h1>
        <p className="text-sm font-semibold text-slate-700 mt-1">
          {locale === "bn" ? election.titleBn || election.title : election.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
          Join Code: <strong className="font-mono">{election.joinCode}</strong> •
          Finalised on: {formatDate(election.endTime)}
        </p>
      </div>

      {/* Screen Header */}
      <div className="space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={isClosed ? "neutral" : "live"}>
              {isClosed ? t("resultsClosedBadge") : t("resultsLiveBadge")}
            </Badge>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md font-semibold tabular-nums">
              {election.joinCode}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{locale === "bn" ? "শেয়ার" : "Share"}</span>
            </Button>
            {!election.resultsHidden && (
              <>
                <Button onClick={handleExportCsv} variant="outline" size="sm">
                  <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{t("btnExportCsv")}</span>
                </Button>
                <Button onClick={() => window.print()} variant="secondary" size="sm">
                  <Printer className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{t("btnPrintResults")}</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
          {locale === "bn" ? election.titleBn || election.title : election.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
            <span>
              {isClosed
                ? locale === "bn"
                  ? "ভোট সমাপ্ত হয়েছে"
                  : "Voting ended"
                : timeRem.label}
            </span>
          </span>
          <span>•</span>
          <span>
            {locale === "bn" ? "শেষ সময়: " : "Deadline: "}
            {formatDate(election.endTime, { short: true })}
          </span>
        </div>
      </div>

      {/* STATS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-3">
        <Card className="p-4 sm:p-5 print:border-slate-300">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            {t("totalVotesCast")}
          </span>
          <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tabular-nums">
            {formatNum(election.totalBallotsCast)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {locale === "bn" ? "গোপন ব্যালটে গৃহীত" : "Anonymously tallied"}
          </span>
        </Card>

        <Card className="p-4 sm:p-5 print:border-slate-300">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            {isCodeList
              ? t("totalRegistered")
              : locale === "bn"
              ? "অংশগ্রহণ পদ্ধতি"
              : "Participation mode"}
          </span>
          <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tabular-nums">
            {isCodeList
              ? formatNum(election.totalEligibleVoters)
              : locale === "bn"
              ? "উন্মুক্ত"
              : "Open"}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {isCodeList
              ? locale === "bn"
                ? "মোট নিবন্ধিত ভোটার"
                : "Eligible roster count"
              : locale === "bn"
              ? "প্রতি ডিভাইস একটি ভোট"
              : "One ballot per device"}
          </span>
        </Card>

        <Card className="p-4 sm:p-5 print:border-slate-300">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            {t("turnoutRate")}
          </span>
          {election.turnoutPercentage !== null ? (
            <>
              <div className="text-2xl sm:text-3xl font-semibold text-[#006A4E] dark:text-[#34D399] tabular-nums">
                {formatNum(election.turnoutPercentage)}%
              </div>
              <Progress value={election.turnoutPercentage} className="mt-2 print:hidden" />
            </>
          ) : (
            <>
              <div className="text-2xl sm:text-3xl font-semibold text-[#006A4E] dark:text-[#34D399] tabular-nums">
                {formatNum(election.totalBallotsCast)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {locale === "bn" ? "মোট গৃহীত ভোট" : "Verified ballots"}
              </span>
            </>
          )}
        </Card>
      </div>

      {/* HIDDEN RESULTS NOTICE (AFTER_CLOSE while active) */}
      {election.resultsHidden ? (
        <Card className="p-8 text-center space-y-3 border-emerald-600/20">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {locale === "bn"
              ? "ভোটগ্রহণ শেষ না হওয়া পর্যন্ত ফলাফল সংরক্ষিত রয়েছে"
              : "Results are sealed until voting closes"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {locale === "bn"
              ? "নির্বাচনের গোপনীয়তা ও নিরপেক্ষতা রক্ষায় ভোটগ্রহণের সময়সীমা শেষ হলে স্বয়ংক্রিয়ভাবে প্রার্থীভিত্তিক ফলাফল প্রকাশিত হবে।"
              : "To protect impartiality while voting is underway, candidate vote counts will be revealed automatically once the voting window closes."}
          </p>
        </Card>
      ) : (
        <>
          {/* WINNER OR TIE HIGHLIGHT CARD */}
          {election.totalBallotsCast > 0 && (
            <>
              {isTie ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center gap-4 print:border-amber-400">
                  <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={1.75} />
                  <div>
                    <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200">
                      {t("tieTitle")}
                    </h2>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                      {locale === "bn"
                        ? `${topOption.nameBn || topOption.name} এবং ${secondOption.nameBn || secondOption.name} উভয় প্রার্থী সমান ${formatNum(topOption.votes ?? 0)} ভোট পেয়েছেন। প্রতিষ্ঠানের নিয়মানুযায়ী পরবর্তী সিদ্ধান্ত নিন।`
                        : `Both leading candidates received ${topOption.votes ?? 0} votes. Please consult organizational guidelines for tie resolution.`}
                    </p>
                  </div>
                </div>
              ) : topOption && (topOption.votes ?? 0) > 0 ? (
                <Card className="p-6 sm:p-8 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-600/30 dark:border-emerald-500/30 print:bg-white print:border-slate-300">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-left">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#006A4E] text-white flex items-center justify-center text-3xl sm:text-4xl shrink-0 print:border print:border-slate-800">
                        {topOption.symbolEmoji || "🏆"}
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 text-xs font-medium mb-1.5 print:border print:border-emerald-600">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.75} />
                          <span>{t("winnerHighlight")}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
                          {locale === "bn" ? topOption.nameBn || topOption.name : topOption.name}
                        </h2>
                        {topOption.bio && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {locale === "bn" ? topOption.bioBn || topOption.bio : topOption.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:border-l sm:border-emerald-200 dark:sm:border-emerald-800/60 sm:pl-8 tabular-nums">
                      <div className="text-center">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                          {t("winnerVotes")}
                        </span>
                        <span className="text-3xl font-semibold text-[#006A4E] dark:text-[#34D399]">
                          {formatNum(topOption.votes ?? 0)}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                          {t("winnerVoteShare")}
                        </span>
                        <span className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                          {formatNum(topOption.percentage ?? 0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : null}
            </>
          )}

          {/* CHARTS: BAR BREAKDOWN & DETAILED TALLY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:grid-cols-1 print:gap-4">
            <div className="lg:col-span-7 print:hidden">
              <Card className="p-5 sm:p-6 space-y-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  {t("chartTitle")}
                </h2>

                {election.totalBallotsCast === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    {t("noActivityYet")}
                  </div>
                ) : (
                  <ResultsBarChart
                    data={chartData}
                    locale={locale}
                    isDark={isDark}
                    formatNum={formatNum}
                  />
                )}
              </Card>
            </div>

            <div className="lg:col-span-5 print:col-span-1">
              <Card className="p-5 sm:p-6 space-y-3 print:border-slate-300">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                  {locale === "bn" ? "প্রার্থীভিত্তিক ফলাফল" : "Candidate standings"}
                </h2>

                <div className="space-y-2.5">
                  {sortedOptions.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className="p-3 rounded-xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#161C28]/70 flex items-center justify-between gap-3 print:border-slate-300 print:bg-white"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold font-mono tabular-nums shrink-0">
                          {formatNum(idx + 1)}
                        </span>
                        <span className="text-xl shrink-0">{opt.symbolEmoji || "🗳️"}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {locale === "bn" ? opt.nameBn || opt.name : opt.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            {formatNum(opt.votes ?? 0)}{" "}
                            {locale === "bn" ? "ভোট" : "votes"}
                            {isRanked && opt.bordaScore !== null && opt.bordaScore !== undefined
                              ? ` • ${formatNum(opt.bordaScore)} pts`
                              : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 tabular-nums">
                        <span className="text-sm font-semibold text-[#006A4E] dark:text-[#34D399]">
                          {formatNum(opt.percentage ?? 0)}%
                        </span>
                      </div>
                    </div>
                  ))}

                  {election.allowNota && (
                    <div className="p-3 rounded-xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#161C28]/70 flex items-center justify-between gap-3 print:border-slate-300 print:bg-white">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                          <Ban className="w-3.5 h-3.5" />
                        </span>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {locale === "bn" ? "উপরের কাউকে নয় (NOTA)" : "NOTA"}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                        {formatNum(election.notaVotes ?? 0)}{" "}
                        {locale === "bn" ? "ভোট" : "votes"}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* PRINT-ONLY OFFICIAL SIGNATURE & ATTESTATION SECTION */}
      <div className="hidden print:block pt-12 space-y-8">
        <div className="border-t border-slate-300 pt-3 text-xs text-slate-600">
          <p>
            <strong>Integrity Notice:</strong> All ballots in this election were
            cryptographically recorded in a tamper-evident SHA-256 hash chain without
            linking voter identity to candidate selections.
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
            <p className="text-xs font-bold text-slate-900">
              Independent Scrutineer / Observer
            </p>
            <p className="text-[10px] text-slate-500">Signature & Date</p>
          </div>
        </div>
      </div>

      {/* Public Receipt Verification Callout */}
      <div className="p-5 rounded-2xl bg-slate-100 dark:bg-[#121721] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <ShieldCheck className="w-7 h-7 text-[#006A4E] dark:text-[#34D399] shrink-0" strokeWidth={1.75} />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {locale === "bn"
                ? "আপনার ভোট কি সঠিকভাবে গণনা করা হয়েছে?"
                : "Want to verify your vote was included?"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === "bn"
                ? "ভোট দেওয়ার পর প্রাপ্ত ডিজিটাল রসিদ কোড দিয়ে যে কেউ নিরপেক্ষ অডিট করতে পারেন।"
                : "Check your receipt code in our cryptographic audit log without revealing your choice."}
            </p>
          </div>
        </div>

        <Link href="/verify" className="shrink-0">
          <Button variant="secondary" size="md">
            {t("btnVerifyNow")}
          </Button>
        </Link>
      </div>

      {/* Admin Panel Quick Link */}
      <div className="text-center pt-2 print:hidden">
        <Link
          href={`/elections/${encodeURIComponent(election.joinCode)}/admin`}
          className="text-xs font-medium text-[#006A4E] dark:text-[#34D399] hover:underline"
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
          <div className="w-10 h-10 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading results...</p>
        </div>
      }
    >
      <ElectionResultsContent />
    </Suspense>
  );
}
