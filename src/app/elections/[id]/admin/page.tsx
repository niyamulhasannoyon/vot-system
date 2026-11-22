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
  Copy,
  LogOut,
  Activity,
  Calendar,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { getTimeRemaining } from "@/lib/date";

interface ConfirmActionState {
  isOpen: boolean;
  action: "CLOSE" | "EXTEND_HOUR" | "EXTEND_DAY" | "DUPLICATE" | null;
  title: string;
  description: string;
  confirmLabel: string;
  isDanger?: boolean;
}

function AdminDashboardContent() {
  const params = useParams();
  const router = useRouter();
  const { locale, formatNum, formatDate, t } = useLanguage();
  const { showToast } = useToast();
  const id = params.id as string;

  // Authentication State
  const [adminPin, setAdminPin] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Election Data
  const [election, setElection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Voter Codes & Audit Logs
  const [voterCodes, setVoterCodes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("turnout");

  // Modal Confirmation State
  const [confirmModal, setConfirmModal] = useState<ConfirmActionState>({
    isOpen: false,
    action: null,
    title: "",
    description: "",
    confirmLabel: "",
  });

  const getStorageKey = (electionId: string) => `votebd_admin_token_${electionId}`;

  const loadElection = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/elections/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load election");
      setElection(data.election);
      return data.election;
    } catch (err: any) {
      setAuthError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initial mount: load election and try resuming cached session
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const elec = await loadElection();
      if (!elec || !isMounted) return;

      const cachedToken = sessionStorage.getItem(getStorageKey(elec.id));
      if (cachedToken) {
        setSessionToken(cachedToken);
        // Verify cached session
        try {
          const verifyRes = await fetch(`/api/elections/${elec.id}/admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionToken: cachedToken, action: "GET_CODES" }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            setIsAuthenticated(true);
            if (verifyData.voters) setVoterCodes(verifyData.voters);
            // Fetch audit logs as well
            fetchAuditLogs(elec.id, cachedToken);
          } else {
            sessionStorage.removeItem(getStorageKey(elec.id));
          }
        } catch {
          sessionStorage.removeItem(getStorageKey(elec.id));
        }
      }
    }

    init();
    return () => {
      isMounted = false;
    };
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
      if (data.sessionToken) {
        setSessionToken(data.sessionToken);
        sessionStorage.setItem(getStorageKey(election.id), data.sessionToken);
      }
      showToast(locale === "bn" ? "অ্যাডমিন প্যানেলে সফলভাবে প্রবেশ করেছেন" : "Authenticated successfully", "success");
      fetchAdminData(data.sessionToken);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    if (election?.id) {
      sessionStorage.removeItem(getStorageKey(election.id));
    }
    setSessionToken(null);
    setIsAuthenticated(false);
    setAdminPin("");
    showToast(locale === "bn" ? "সেশন লক করা হয়েছে" : "Session locked", "info");
  };

  const fetchAuditLogs = async (electionId: string, token: string | null) => {
    try {
      const auditRes = await fetch(`/api/elections/${electionId}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPin: adminPin || undefined,
          sessionToken: token || undefined,
          action: "GET_AUDIT",
        }),
      });
      const auditData = await auditRes.json();
      if (auditData.logs) setAuditLogs(auditData.logs);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Voter Codes & Audit Logs
  const fetchAdminData = async (token?: string | null) => {
    const activeToken = token ?? sessionToken;
    try {
      // Fetch voter codes
      const codesRes = await fetch(`/api/elections/${election.id}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPin: adminPin || undefined,
          sessionToken: activeToken || undefined,
          action: "GET_CODES",
        }),
      });
      const codesData = await codesRes.json();
      if (codesData.voters) setVoterCodes(codesData.voters);

      // Fetch audit logs
      await fetchAuditLogs(election.id, activeToken);
    } catch (err) {
      console.error(err);
    }
  };

  // Open confirmation modal for destructive or major actions
  const promptAction = (action: "CLOSE" | "EXTEND_HOUR" | "EXTEND_DAY" | "DUPLICATE") => {
    if (action === "CLOSE") {
      setConfirmModal({
        isOpen: true,
        action: "CLOSE",
        title: t("confirmCloseTitle"),
        description: t("confirmCloseDesc"),
        confirmLabel: t("btnEndNow"),
        isDanger: true,
      });
    } else if (action === "EXTEND_HOUR") {
      setConfirmModal({
        isOpen: true,
        action: "EXTEND_HOUR",
        title: `${t("confirmExtendTitle")} (+1 hour)`,
        description:
          locale === "bn"
            ? "নির্বাচনের শেষ সময় ১ ঘণ্টা বৃদ্ধি করা হবে এবং স্ট্যাটাস সক্রিয় থাকবে।"
            : "The election closing time will be extended by 1 hour and status kept active.",
        confirmLabel: t("btnExtend1Hour"),
        isDanger: false,
      });
    } else if (action === "EXTEND_DAY") {
      setConfirmModal({
        isOpen: true,
        action: "EXTEND_DAY",
        title: `${t("confirmExtendTitle")} (+24 hours)`,
        description:
          locale === "bn"
            ? "নির্বাচনের শেষ সময় ২৪ ঘণ্টা বৃদ্ধি করা হবে।"
            : "The election closing time will be extended by 24 hours.",
        confirmLabel: t("btnExtend1Day"),
        isDanger: false,
      });
    } else if (action === "DUPLICATE") {
      setConfirmModal({
        isOpen: true,
        action: "DUPLICATE",
        title: t("confirmDuplicateTitle"),
        description: t("confirmDuplicateDesc"),
        confirmLabel: t("btnDuplicate"),
        isDanger: false,
      });
    }
  };

  // Execute confirmed action
  const executeConfirmedAction = async () => {
    const action = confirmModal.action;
    if (!action) return;

    setActionLoading(true);

    try {
      const res = await fetch(`/api/elections/${election.id}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPin: adminPin || undefined,
          sessionToken: sessionToken || undefined,
          action,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setConfirmModal({ isOpen: false, action: null, title: "", description: "", confirmLabel: "" });

      if (action === "DUPLICATE") {
        showToast(t("duplicateSuccess"), "success");
        if (data.duplicatedJoinCode) {
          router.push(`/elections/${data.duplicatedJoinCode}/admin`);
        }
      } else {
        showToast(
          locale === "bn" ? "অ্যাকশন সফলভাবে কার্যকর করা হয়েছে!" : "Action executed successfully!",
          "success"
        );
        loadElection();
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to execute action", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Download Voter Codes CSV
  const downloadVoterCodesCsv = () => {
    if (voterCodes.length === 0) {
      showToast(locale === "bn" ? "কোনো ভোটার পাওয়া যায়নি" : "No voters found to export", "warning");
      return;
    }
    let csv = "Voter Code,Identifier,Status,Voted At (BST)\n";
    for (const v of voterCodes) {
      csv += `"${v.voterCode}","${v.identifier || ""}","${v.hasVoted ? "VOTED" : "PENDING"}","${
        v.votedAt ? formatDate(v.votedAt) : ""
      }"\n`;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${election.slug}-voter-codes.csv`;
    a.click();
    showToast(locale === "bn" ? "ভোটার তালিকা ডাউনলোড সম্পন্ন" : "Voter codes exported to CSV", "success");
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
        <EmptyState
          icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
          title="Election Not Found"
          description="We could not find the election you requested. Check the code or URL."
          actionLabel={t("navHome")}
          onAction={() => router.push("/")}
        />
      </div>
    );
  }

  // IF NOT AUTHENTICATED: Show PIN Gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 w-full animate-fade-in">
        <Card className="p-6 sm:p-8 space-y-6 border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#EBF7F2] text-[#006A4E] flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
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
                className="w-full px-4 py-3 text-center text-xl font-mono uppercase tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none transition-all"
              />
              {authError && (
                <p className="text-xs text-red-500 mt-2 text-center font-medium animate-fade-in">
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
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-center text-slate-500 border border-slate-200 dark:border-slate-700">
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
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={isClosed ? "neutral" : "live"}>
              {isClosed ? t("resultsClosedBadge") : t("resultsLiveBadge")}
            </Badge>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {election.joinCode}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {locale === "bn" ? election.titleBn || election.title : election.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-1.5 text-slate-500 hover:text-red-600"
            title="Lock admin session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("btnLockAdmin")}</span>
          </Button>
        </div>
      </div>

      {/* QUICK STATS & CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">
            {t("totalVotesCast")}
          </span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatNum(election.totalBallotsCast)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {locale === "bn"
              ? `${formatNum(election.totalEligibleVoters)} জনের মধ্যে`
              : `out of ${election.totalEligibleVoters} eligible voters`}
          </span>
        </Card>

        <Card className="p-5 border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">
            {t("turnoutRate")}
          </span>
          <div className="text-3xl font-extrabold text-[#006A4E] dark:text-[#34D399] tracking-tight">
            {formatNum(election.turnoutPercentage)}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#006A4E] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(election.turnoutPercentage, 100)}%` }}
            />
          </div>
        </Card>

        <Card className="p-5 border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block mb-1">
            {t("timeRemainingLabel")}
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
            <Clock className="w-4 h-4 text-[#006A4E]" />
            <span>{isClosed ? (locale === "bn" ? "সমাপ্ত" : "Closed") : timeRem.label}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-mono">
            {formatDate(election.endTime, { short: true })}
          </span>
        </Card>
      </div>

      {/* ADMIN CONTROL ACTIONS */}
      <Card className="p-5 space-y-4 border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {locale === "bn" ? "জরুরী নিয়ন্ত্রণ প্যানেল" : "Administrative Controls"}
        </h3>

        <div className="flex flex-wrap gap-2.5">
          {!isClosed && (
            <Button
              onClick={() => promptAction("CLOSE")}
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
            onClick={() => promptAction("EXTEND_HOUR")}
            disabled={actionLoading}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Clock className="w-4 h-4 text-[#006A4E]" />
            <span>{t("btnExtend1Hour")}</span>
          </Button>

          <Button
            onClick={() => promptAction("EXTEND_DAY")}
            disabled={actionLoading}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Clock className="w-4 h-4 text-[#006A4E]" />
            <span>{t("btnExtend1Day")}</span>
          </Button>

          <Button
            onClick={() => promptAction("DUPLICATE")}
            disabled={actionLoading}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Copy className="w-4 h-4 text-slate-500" />
            <span>{t("btnDuplicate")}</span>
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
        <Tabs
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
          tabs={[
            {
              id: "turnout",
              label: locale === "bn" ? "সাম্প্রতিক কার্যকলাপ" : "Live Activity",
              icon: <Activity className="w-4 h-4" />,
              badge: election.recentBallotActivity?.length || 0,
            },
            {
              id: "voters",
              label: locale === "bn" ? "ভোটার তালিকা ও কোড" : "Voter Roster & Codes",
              icon: <Users className="w-4 h-4" />,
              badge: voterCodes.length || undefined,
            },
            {
              id: "audit",
              label: t("auditLogHeading"),
              icon: <ShieldCheck className="w-4 h-4" />,
              badge: auditLogs.length || undefined,
            },
          ]}
        />

        {/* TAB 1: RECENT LIVE ACTIVITY */}
        {activeTab === "turnout" && (
          <Card className="p-5 space-y-3 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("liveActivityHeading")}
              </h4>
              <span className="text-xs text-slate-400">
                {locale === "bn" ? "প্রার্থীর নাম সর্বদা গোপন" : "Candidate choice decoupled"}
              </span>
            </div>

            {(!election.recentBallotActivity || election.recentBallotActivity.length === 0) ? (
              <EmptyState
                icon={<Activity className="w-8 h-8 text-slate-400" />}
                title={t("noActivityYet")}
                description={
                  locale === "bn"
                    ? "ভোটারদের ভোট কোড সরবরাহ করে নির্বাচন শুরু করুন।"
                    : "Share the election join code or voter codes to start receiving ballots."
                }
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {election.recentBallotActivity.map((b: any) => (
                  <div
                    key={b.sequenceNumber}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#006A4E] dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
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
                    <span className="text-slate-500 font-mono">
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
          <Card className="p-5 space-y-4 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {locale === "bn" ? "নিবন্ধিত ভোটার ও কোড" : "Registered Voters"}
                </h4>
                <p className="text-xs text-slate-500">
                  {locale === "bn"
                    ? "কারা ভোট দিয়েছেন তা দেখা যাবে, কিন্তু কে কাকে ভোট দিয়েছেন তা সম্পূর্ণ গোপন।"
                    : "Track voter turnout safely without compromising secret ballot privacy."}
                </p>
              </div>
              <Button onClick={downloadVoterCodesCsv} size="sm" variant="outline">
                <Download className="w-3.5 h-3.5 mr-1" />
                CSV
              </Button>
            </div>

            {voterCodes.length === 0 ? (
              <EmptyState
                icon={<Users className="w-8 h-8 text-slate-400" />}
                title={locale === "bn" ? "কোনো নির্দিষ্ট ভোটার কোড নেই" : "No Specific Voter Codes"}
                description={
                  locale === "bn"
                    ? "এটি উন্মুক্ত বা কোডবিহীন নির্বাচন হতে পারে।"
                    : "This election may be open or utilizing device fingerprinting."
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 font-semibold">
                        {locale === "bn" ? "ভোটার কোড" : "Voter Code"}
                      </th>
                      <th className="py-2.5 font-semibold">
                        {locale === "bn" ? "পরিচয় / রোল" : "Identifier / Roll"}
                      </th>
                      <th className="py-2.5 font-semibold">
                        {locale === "bn" ? "ভোট স্ট্যাটাস" : "Status"}
                      </th>
                      <th className="py-2.5 font-semibold">
                        {locale === "bn" ? "সময়" : "Timestamp"}
                      </th>
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {locale === "bn" ? "ভোট সম্পন্ন ✓" : "Voted ✓"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {locale === "bn" ? "অপেক্ষমান" : "Pending"}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                          {v.votedAt ? formatDate(v.votedAt) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* TAB 3: AUDIT LOGS */}
        {activeTab === "audit" && (
          <Card className="p-5 space-y-3 border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t("auditLogHeading")}
            </h4>
            {auditLogs.length === 0 ? (
              <EmptyState
                icon={<ShieldCheck className="w-8 h-8 text-slate-400" />}
                title="No Audit Logs Recorded"
                description="Administrative changes and lifecycle events will be listed here."
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
                  >
                    <div>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 mr-2 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {log.eventType}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {log.details}
                      </span>
                    </div>
                    <span className="text-slate-400 shrink-0 font-mono text-[11px]">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, action: null, title: "", description: "", confirmLabel: "" })
        }
        title={confirmModal.title}
        description={confirmModal.description}
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() =>
                setConfirmModal({ isOpen: false, action: null, title: "", description: "", confirmLabel: "" })
              }
              disabled={actionLoading}
            >
              {locale === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button
              variant={confirmModal.isDanger ? "danger" : "primary"}
              size="md"
              onClick={executeConfirmedAction}
              isLoading={actionLoading}
            >
              {confirmModal.confirmLabel}
            </Button>
          </div>
        </div>
      </Modal>
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
