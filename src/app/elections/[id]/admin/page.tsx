"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Clock,
  Users,
  Download,
  AlertTriangle,
  StopCircle,
  PlusCircle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getTimeRemaining } from "@/lib/date";

function AdminDashboardContent() {
  const params = useParams();
  const router = useRouter();
  const { locale, formatNum, formatDate, t } = useLanguage();
  const id = params.id as string;

  // Authentication State
  const [adminPin, setAdminPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Election Data
  const [election, setElection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Voter Codes & Audit Logs
  const [voterCodes, setVoterCodes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"turnout" | "voters" | "audit">("turnout");

  const loadElection = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/elections/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load election");
      setElection(data.election);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElection();
  }, [id]);

  // Login with PIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin) return;

    setActionLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`/api/elections/${election.id}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid PIN");
      }
      setIsAuthenticated(true);
      fetchAdminData();
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch Voter Codes & Audit Logs
  const fetchAdminData = async () => {
    try {
      // Fetch voter codes
      const codesRes = await fetch(`/api/elections/${election.id}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPin, action: "GET_CODES" }),
      });
      const codesData = await codesRes.json();
      if (codesData.voters) setVoterCodes(codesData.voters);

      // Fetch audit logs
      const auditRes = await fetch(`/api/elections/${election.id}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPin, action: "GET_AUDIT" }),
      });
      const auditData = await auditRes.json();
      if (auditData.logs) setAuditLogs(auditData.logs);
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Actions
  const handleAction = async (action: string) => {
    const confirmText =
      action === "CLOSE"
        ? locale === "bn"
          ? "আপনি কি নিশ্চিত এখনই নির্বাচন সমাপ্ত করতে চান?"
          : "Are you sure you want to end this election immediately?"
        : locale === "bn"
        ? "আপনি কি নির্বাচনের সময়সীমা বাড়াতে চান?"
        : "Do you want to extend the voting deadline?";

    if (!confirm(confirmText)) return;

    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/elections/${election.id}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPin, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionMessage(
        locale === "bn"
          ? "সফলভাবে সম্পন্ন হয়েছে!"
          : "Action completed successfully!"
      );
      loadElection();
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to execute action");
    } finally {
      setActionLoading(false);
    }
  };

  // Download Voter Codes CSV
  const downloadVoterCodesCsv = () => {
    if (voterCodes.length === 0) return;
    let csv = "Voter Code,Identifier,Status,Voted At (BST)\n";
    for (const v of voterCodes) {
      csv += `"${v.voterCode}","${v.identifier || ""}","${v.hasVoted ? "VOTED" : "PENDING"}","${v.votedAt ? formatDate(v.votedAt) : ""}"\n`;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${election.slug}-voter-codes.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">{t("loading")}</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-8">
          <p className="text-sm text-red-500">Election not found</p>
        </Card>
      </div>
    );
  }

  // IF NOT AUTHENTICATED: Show PIN Gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 w-full animate-fade-in">
        <Card className="p-6 sm:p-8 space-y-6 border-slate-200 dark:border-slate-800">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#EBF7F2] text-[#006A4E] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {t("adminTitle")}
            </h1>
            <p className="text-xs text-slate-500">
              {locale === "bn" ? election.titleBn || election.title : election.title}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t("adminPinPrompt")}
              </label>
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={adminPin}
                onChange={(e) => {
                  setAdminPin(e.target.value);
                  setAuthError(null);
                }}
                placeholder={t("adminPinPlaceholder")}
                className="w-full px-4 py-3 text-center text-xl font-mono uppercase tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
              />
              {authError && (
                <p className="text-xs text-red-500 mt-1.5 text-center font-medium">
                  {authError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              isLoading={actionLoading}
              size="lg"
              className="w-full"
            >
              {t("btnLoginAdmin")}
            </Button>
          </form>

          {/* Helper for demo PIN */}
          {election.joinCode === "CR-2024" && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-center text-slate-500">
              {locale === "bn"
                ? "💡 ডেমো নির্বাচনের অ্যাডমিন পিন: 1234"
                : "💡 Demo Election Admin PIN: 1234"}
            </div>
          )}
        </Card>
      </div>
    );
  }

  const isClosed = election.status === "CLOSED";
  const timeRem = getTimeRemaining(election.endTime, locale, true);

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={isClosed ? "neutral" : "live"}>
              {isClosed ? t("resultsClosedBadge") : t("resultsLiveBadge")}
            </Badge>
            <span className="text-xs font-mono font-bold text-slate-500">
              কোড: {election.joinCode}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {locale === "bn" ? election.titleBn || election.title : election.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/vote/${election.joinCode}`} target="_blank">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <span>{t("btnGoToVote")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href={`/elections/${election.joinCode}/results`}>
            <Button variant="primary" size="sm" className="gap-1.5">
              <span>{t("btnGoToResults")}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* QUICK STATS & CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs text-slate-500 block mb-1">
            {t("totalVotesCast")}
          </span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatNum(election.totalBallotsCast)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {formatNum(election.totalEligibleVoters)} জনের মধ্যে
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-500 block mb-1">
            {t("turnoutRate")}
          </span>
          <div className="text-3xl font-extrabold text-[#006A4E] dark:text-[#34D399]">
            {formatNum(election.turnoutPercentage)}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#006A4E] h-full rounded-full"
              style={{ width: `${Math.min(election.turnoutPercentage, 100)}%` }}
            />
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-500 block mb-1">
            {t("timeRemainingLabel")}
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
            <Clock className="w-4 h-4 text-[#006A4E]" />
            <span>{isClosed ? "সমাপ্ত" : timeRem.label}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            শেষ সময়: {formatDate(election.endTime, { short: true })}
          </span>
        </Card>
      </div>

      {/* ADMIN CONTROL ACTIONS */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {locale === "bn" ? "জরুরী নিয়ন্ত্রণ প্যানেল" : "Emergency Controls"}
        </h3>

        <div className="flex flex-wrap gap-3">
          {!isClosed && (
            <Button
              onClick={() => handleAction("CLOSE")}
              disabled={actionLoading}
              variant="danger"
              size="sm"
              className="gap-1.5"
            >
              <StopCircle className="w-4 h-4" />
              <span>{t("btnEndNow")}</span>
            </Button>
          )}

          <Button
            onClick={() => handleAction("EXTEND_HOUR")}
            disabled={actionLoading}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Clock className="w-4 h-4 text-[#006A4E]" />
            <span>{t("btnExtend1Hour")}</span>
          </Button>

          <Button
            onClick={() => handleAction("EXTEND_DAY")}
            disabled={actionLoading}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Clock className="w-4 h-4 text-[#006A4E]" />
            <span>{t("btnExtend1Day")}</span>
          </Button>

          <Button
            onClick={downloadVoterCodesCsv}
            variant="secondary"
            size="sm"
            className="gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{t("btnDownloadCodes")}</span>
          </Button>
        </div>
      </Card>

      {/* TABS: VOTER CODES & AUDIT TRAIL */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("turnout")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "turnout"
                ? "border-[#006A4E] text-[#006A4E]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {locale === "bn" ? "সাম্প্রতিক কার্যকলাপ" : "Live Activity"}
          </button>

          <button
            onClick={() => setActiveTab("voters")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "voters"
                ? "border-[#006A4E] text-[#006A4E]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {locale === "bn" ? "ভোটার তালিকা ও কোড" : "Voter Roster & Codes"}
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "audit"
                ? "border-[#006A4E] text-[#006A4E]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t("auditLogHeading")}
          </button>
        </div>

        {/* TAB 1: RECENT LIVE ACTIVITY */}
        {activeTab === "turnout" && (
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("liveActivityHeading")}
              </h4>
              <span className="text-xs text-slate-400">
                {locale === "bn" ? "প্রার্থীর নাম সর্বদা অপ্রকাশিত" : "Candidate choice hidden"}
              </span>
            </div>

            {election.recentBallotActivity.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                {t("noActivityYet")}
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {election.recentBallotActivity.map((b: any) => (
                  <div
                    key={b.sequenceNumber}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#006A4E] flex items-center justify-center font-bold text-[10px]">
                        #{formatNum(b.sequenceNumber)}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {locale === "bn" ? "গোপন ব্যালট কাস্ট হয়েছে" : "Anonymous Ballot Cast"}
                        </span>
                        <span className="text-slate-400 ml-2 font-mono">
                          {b.receiptCode}
                        </span>
                      </div>
                    </div>
                    <span className="text-slate-500">
                      {formatDate(b.castAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* TAB 2: VOTER CODES */}
        {activeTab === "voters" && (
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {locale === "bn" ? "নিবন্ধিত ভোটার ও কোড" : "Registered Voters"}
                </h4>
                <p className="text-xs text-slate-500">
                  {locale === "bn"
                    ? "কারা ভোট দিয়েছেন তা দেখা যাবে, কিন্তু কে কাকে ভোট দিয়েছেন তা সম্পূর্ণ গোপন।"
                    : "Track participation without compromising ballot secrecy."}
                </p>
              </div>
              <Button onClick={downloadVoterCodesCsv} size="sm" variant="outline">
                <Download className="w-3.5 h-3.5 mr-1" />
                CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                    <th className="py-2.5 font-semibold">ভোটার কোড</th>
                    <th className="py-2.5 font-semibold">পরিচয় / রোল</th>
                    <th className="py-2.5 font-semibold">ভোট স্ট্যাটাস</th>
                    <th className="py-2.5 font-semibold">সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {voterCodes.map((v) => (
                    <tr key={v.voterCode}>
                      <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                        {v.voterCode}
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">
                        {v.identifier || "—"}
                      </td>
                      <td className="py-2.5">
                        {v.hasVoted ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ভোট সম্পন্ন ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            অপেক্ষমান
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {v.votedAt ? formatDate(v.votedAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 3: AUDIT LOGS */}
        {activeTab === "audit" && (
          <Card className="p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t("auditLogHeading")}
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
                >
                  <div>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 mr-2">
                      {log.eventType}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {log.details}
                    </span>
                  </div>
                  <span className="text-slate-400 shrink-0">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-12 h-12 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading admin dashboard...</p>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
