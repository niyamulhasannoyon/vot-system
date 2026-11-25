"use client";

import React, { useCallback, useEffect, useId, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Clock,
  Users,
  Download,
  AlertTriangle,
  StopCircle,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Copy,
  LogOut,
  Activity,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Progress } from "@/components/ui/Progress";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { getTimeRemaining } from "@/lib/date";
import { downloadCsv } from "@/lib/csv";
import type {
  AuditLogItem,
  ElectionDetail,
  VoterRosterItem,
} from "@/types/election";

interface ConfirmActionState {
  isOpen: boolean;
  action: "CLOSE" | "EXTEND_HOUR" | "EXTEND_DAY" | "DUPLICATE" | null;
  title: string;
  description: string;
  confirmLabel: string;
  isDanger?: boolean;
}

function formatAuditDetails(
  log: AuditLogItem,
  locale: "bn" | "en",
  formatNum: (val: number | string | null | undefined) => string,
  formatDate: (date: Date | string, opts?: { includeTime?: boolean; short?: boolean }) => string
): string {
  if (!log.details) return "";
  try {
    const data = JSON.parse(log.details) as Record<string, unknown>;
    if (log.eventType === "BALLOT_CAST") {
      const seq = typeof data.sequenceNumber === "number" ? data.sequenceNumber : "?";
      const rc = typeof data.receiptCode === "string" ? data.receiptCode : "";
      if (locale === "bn") {
        return rc
          ? `ব্যালট #${formatNum(seq)} গৃহীত (${rc})`
          : `ব্যালট #${formatNum(seq)} ক্রিপ্টোগ্রাফিক চেইনে গৃহীত`;
      }
      return rc
        ? `Ballot #${seq} sealed (${rc})`
        : `Ballot #${seq} sealed in hash chain`;
    }
    if (log.eventType === "ELECTION_CREATED") {
      const candidatesCount =
        typeof data.candidatesCount === "number" ? data.candidatesCount : null;
      const votersCount =
        typeof data.votersCount === "number" ? data.votersCount : null;
      if (locale === "bn") {
        return candidatesCount !== null
          ? `নির্বাচন তৈরি হয়েছে • ${formatNum(candidatesCount)} জন প্রার্থী${
              votersCount ? `, ${formatNum(votersCount)} জন ভোটার` : ""
            }`
          : "নির্বাচন তৈরি হয়েছে";
      }
      return candidatesCount !== null
        ? `Election created • ${candidatesCount} candidates${
            votersCount ? `, ${votersCount} voters` : ""
          }`
        : "Election created";
    }
    if (log.eventType === "VOTER_LIST_UPLOADED") {
      const count = typeof data.count === "number" ? data.count : 0;
      return locale === "bn"
        ? `${formatNum(count)} জন ভোটারের তালিকা নিবন্ধিত হয়েছে`
        : `${count} registered voters imported`;
    }
    if (log.eventType === "DEADLINE_EXTENDED") {
      const hours = typeof data.extendedByHours === "number" ? data.extendedByHours : 1;
      const newEnd =
        typeof data.newEndTime === "string"
          ? formatDate(data.newEndTime, { short: true })
          : "";
      return locale === "bn"
        ? `সময়সীমা +${formatNum(hours)} ঘণ্টা বাড়ানো হয়েছে${newEnd ? ` (${newEnd})` : ""}`
        : `Deadline extended by +${hours}h${newEnd ? ` (${newEnd})` : ""}`;
    }
    if (log.eventType === "ELECTION_CLOSED") {
      return locale === "bn"
        ? "আয়োজক কর্তৃক নির্বাচন সমাপ্ত করা হয়েছে"
        : "Election closed by organizer";
    }
    if (typeof data.message === "string") {
      return data.message;
    }
  } catch {
    // Fallback to raw details
  }
  return log.details;
}

function AdminDashboardContent() {
  const params = useParams();
  const router = useRouter();
  const { locale, useBengaliNumerals, formatNum, formatDate, t } = useLanguage();
  const { showToast } = useToast();
  const id = decodeURIComponent((params.id as string) || "").trim();
  const pinInputId = useId();
  const pinErrorId = useId();

  const [adminPin, setAdminPin] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [voterCodes, setVoterCodes] = useState<VoterRosterItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("turnout");

  const [confirmModal, setConfirmModal] = useState<ConfirmActionState>({
    isOpen: false,
    action: null,
    title: "",
    description: "",
    confirmLabel: "",
  });

  const getStorageKey = (electionId: string) => `votebd_admin_token_${electionId}`;

  const fetchDashboard = useCallback(
    async (electionId: string, token?: string | null, pin?: string) => {
      const res = await fetch(`/api/elections/${encodeURIComponent(electionId)}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPin: pin || undefined,
          sessionToken: token || undefined,
          action: "GET_DASHBOARD",
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        voters?: VoterRosterItem[];
        logs?: AuditLogItem[];
        election?: ElectionDetail;
        sessionToken?: string;
        error?: string;
      };
      return { ok: res.ok, data };
    },
    []
  );

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    const controller = new AbortController();

    async function init() {
      try {
        setLoading(true);
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
        if (!isMounted) return;

        const elec = data.election;
        setElection(elec);

        const cachedToken = sessionStorage.getItem(getStorageKey(elec.id));
        if (cachedToken) {
          const dash = await fetchDashboard(elec.id, cachedToken);
          if (!isMounted) return;
          if (dash.ok && dash.data.success) {
            setSessionToken(dash.data.sessionToken || cachedToken);
            setIsAuthenticated(true);
            if (dash.data.voters) setVoterCodes(dash.data.voters);
            if (dash.data.logs) setAuditLogs(dash.data.logs);
            if (dash.data.election) setElection(dash.data.election);
          } else {
            sessionStorage.removeItem(getStorageKey(elec.id));
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (isMounted) {
          const msg = err instanceof Error ? err.message : t("errorGeneric");
          setAuthError(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, fetchDashboard, t]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin || !election) return;

    setActionLoading(true);
    setAuthError(null);

    try {
      const dash = await fetchDashboard(election.id, null, adminPin);
      if (!dash.ok || !dash.data.success) {
        throw new Error(dash.data.error || "Invalid PIN");
      }

      setIsAuthenticated(true);
      if (dash.data.sessionToken) {
        setSessionToken(dash.data.sessionToken);
        sessionStorage.setItem(getStorageKey(election.id), dash.data.sessionToken);
      }
      if (dash.data.voters) setVoterCodes(dash.data.voters);
      if (dash.data.logs) setAuditLogs(dash.data.logs);
      if (dash.data.election) setElection(dash.data.election);

      showToast(
        locale === "bn"
          ? "অ্যাডমিন প্যানেলে প্রবেশ সফল হয়েছে"
          : "Authenticated",
        "success"
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("errorGeneric");
      setAuthError(message);
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

  const promptAction = (
    action: "CLOSE" | "EXTEND_HOUR" | "EXTEND_DAY" | "DUPLICATE"
  ) => {
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
        title: `${t("confirmExtendTitle")} (+1h)`,
        description:
          locale === "bn"
            ? "নির্বাচনের শেষ সময় ১ ঘণ্টা বৃদ্ধি করা হবে এবং স্ট্যাটাস সক্রিয় থাকবে।"
            : "The election closing time will be extended by 1 hour and kept active.",
        confirmLabel: t("btnExtend1Hour"),
        isDanger: false,
      });
    } else if (action === "EXTEND_DAY") {
      setConfirmModal({
        isOpen: true,
        action: "EXTEND_DAY",
        title: `${t("confirmExtendTitle")} (+24h)`,
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

  const executeConfirmedAction = async () => {
    const action = confirmModal.action;
    if (!action || !election) return;

    setActionLoading(true);

    try {
      const res = await fetch(`/api/elections/${encodeURIComponent(election.id)}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPin: adminPin || undefined,
          sessionToken: sessionToken || undefined,
          action,
        }),
      });
      const data = (await res.json()) as {
        duplicatedJoinCode?: string;
        sessionToken?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Action failed");

      setConfirmModal({
        isOpen: false,
        action: null,
        title: "",
        description: "",
        confirmLabel: "",
      });

      if (action === "DUPLICATE") {
        showToast(t("duplicateSuccess"), "success");
        if (data.duplicatedJoinCode) {
          router.push(`/elections/${data.duplicatedJoinCode}/admin`);
        }
      } else {
        showToast(
          locale === "bn"
            ? "অ্যাকশন সফলভাবে কার্যকর হয়েছে"
            : "Action completed",
          "success"
        );
        const activeToken = data.sessionToken || sessionToken;
        const dash = await fetchDashboard(election.id, activeToken, adminPin);
        if (dash.ok && dash.data.success) {
          if (dash.data.voters) setVoterCodes(dash.data.voters);
          if (dash.data.logs) setAuditLogs(dash.data.logs);
          if (dash.data.election) setElection(dash.data.election);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to execute action";
      showToast(message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const downloadVoterCodesCsv = () => {
    if (!election || voterCodes.length === 0) {
      showToast(
        locale === "bn" ? "কোনো ভোটার পাওয়া যায়নি" : "No voters found to export",
        "warning"
      );
      return;
    }
    const rows: Array<Array<string | number | null | undefined>> = [
      ["Voter Code", "Identifier", "Status", "Voted At (BST)"],
    ];
    for (const v of voterCodes) {
      rows.push([
        v.voterCode,
        v.identifier || "",
        v.hasVoted ? "VOTED" : "PENDING",
        v.votedAt ? formatDate(v.votedAt) : "",
      ]);
    }
    downloadCsv(`${election.slug}-voter-codes.csv`, rows);
    showToast(
      locale === "bn" ? "ভোটার তালিকা ডাউনলোড সম্পন্ন" : "Voter codes exported to CSV",
      "success"
    );
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">{t("loading")}</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <EmptyState
          icon={<AlertTriangle className="w-8 h-8 text-[#F42A41]" />}
          title={locale === "bn" ? "নির্বাচন পাওয়া যায়নি" : "Election not found"}
          description={
            locale === "bn"
              ? "প্রদত্ত কোড বা লিংকের সাথে কোনো নির্বাচন মেলেনি।"
              : "We could not find the election you requested. Check the code or URL."
          }
          actionLabel={t("navHome")}
          onAction={() => router.push("/")}
        />
      </div>
    );
  }

  // PIN GATE
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 w-full animate-fade-in">
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#EBF7F2] dark:bg-emerald-950/60 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center mx-auto border border-emerald-200/70 dark:border-emerald-800/40">
              <Lock className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {t("adminTitle")}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === "bn" ? election.titleBn || election.title : election.title}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor={pinInputId}
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t("adminPinPrompt")}
              </label>
              <input
                id={pinInputId}
                name="adminPin"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={8}
                autoFocus
                value={adminPin}
                aria-invalid={authError ? "true" : "false"}
                aria-describedby={authError ? pinErrorId : undefined}
                onChange={(e) => {
                  setAdminPin(e.target.value);
                  setAuthError(null);
                }}
                placeholder={t("adminPinPlaceholder")}
                className="w-full h-12 px-4 text-center text-xl font-mono tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#161C28] text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:text-sm placeholder:tracking-normal focus:border-[#006A4E] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#006A4E]/15 transition-[border-color,box-shadow]"
              />
              {authError && (
                <p
                  id={pinErrorId}
                  role="alert"
                  className="text-xs text-red-600 dark:text-red-400 mt-2 text-center font-medium"
                >
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

          {election.joinCode === "CR-2024" && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#161C28] text-xs text-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 font-mono tabular-nums">
              {locale === "bn"
                ? "ডেমো নির্বাচনের অ্যাডমিন পিন: 1234"
                : "Demo election admin PIN: 1234"}
            </div>
          )}
        </Card>
      </div>
    );
  }

  const isClosed = election.status === "CLOSED";
  const timeRem = getTimeRemaining(election.endTime, locale, useBengaliNumerals);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={isClosed ? "neutral" : "live"}>
              {isClosed ? t("resultsClosedBadge") : t("resultsLiveBadge")}
            </Badge>
            <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md tabular-nums">
              {election.joinCode}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
            {locale === "bn" ? election.titleBn || election.title : election.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/vote/${encodeURIComponent(election.joinCode)}`} target="_blank">
            <Button variant="secondary" size="sm">
              <span>{t("btnGoToVote")}</span>
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Button>
          </Link>
          <Link href={`/elections/${encodeURIComponent(election.joinCode)}/results`}>
            <Button variant="primary" size="sm">
              <span>{t("btnGoToResults")}</span>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-slate-600 dark:text-slate-300 hover:text-red-600"
            title={t("btnLockAdmin")}
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="sm:hidden">{locale === "bn" ? "লক" : "Lock"}</span>
            <span className="hidden sm:inline">{t("btnLockAdmin")}</span>
          </Button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            {t("totalVotesCast")}
          </span>
          <div className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight tabular-nums">
            {formatNum(election.totalBallotsCast)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block tabular-nums">
            {election.voterAccessType === "CODE_LIST"
              ? locale === "bn"
                ? `${formatNum(election.totalEligibleVoters)} জনের মধ্যে`
                : `out of ${election.totalEligibleVoters} eligible voters`
              : locale === "bn"
              ? "উন্মুক্ত জয়েন কোড নির্বাচন"
              : "Open join-code election"}
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            {t("turnoutRate")}
          </span>
          {election.turnoutPercentage !== null ? (
            <>
              <div className="text-3xl font-semibold text-[#006A4E] dark:text-[#34D399] tracking-tight tabular-nums">
                {formatNum(election.turnoutPercentage)}%
              </div>
              <Progress value={election.turnoutPercentage} className="mt-2" />
            </>
          ) : (
            <div className="text-3xl font-semibold text-[#006A4E] dark:text-[#34D399] tracking-tight tabular-nums">
              {formatNum(election.totalBallotsCast)}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            {t("timeRemainingLabel")}
          </span>
          <div className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1 tabular-nums">
            <Clock className="w-4 h-4 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
            <span>
              {isClosed ? (locale === "bn" ? "সমাপ্ত" : "Closed") : timeRem.label}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block font-mono tabular-nums">
            {formatDate(election.endTime, { short: true })}
          </span>
        </Card>
      </div>

      {/* ADMIN CONTROL ACTIONS */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          {locale === "bn" ? "নির্বাচন নিয়ন্ত্রণ" : "Administrative controls"}
        </h2>

        <div className="flex flex-wrap gap-2.5">
          {!isClosed && (
            <Button
              onClick={() => promptAction("CLOSE")}
              disabled={actionLoading}
              variant="danger"
              size="sm"
            >
              <StopCircle className="w-4 h-4" strokeWidth={1.75} />
              <span>{t("btnEndNow")}</span>
            </Button>
          )}

          <Button
            onClick={() => promptAction("EXTEND_HOUR")}
            disabled={actionLoading}
            variant="outline"
            size="sm"
          >
            <Clock className="w-4 h-4 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
            <span>{t("btnExtend1Hour")}</span>
          </Button>

          <Button
            onClick={() => promptAction("EXTEND_DAY")}
            disabled={actionLoading}
            variant="outline"
            size="sm"
          >
            <Clock className="w-4 h-4 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
            <span>{t("btnExtend1Day")}</span>
          </Button>

          <Button
            onClick={() => promptAction("DUPLICATE")}
            disabled={actionLoading}
            variant="outline"
            size="sm"
          >
            <Copy className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
            <span>{t("btnDuplicate")}</span>
          </Button>

          <Button onClick={downloadVoterCodesCsv} variant="secondary" size="sm">
            <Download className="w-4 h-4" strokeWidth={1.75} />
            <span>{t("btnDownloadCodes")}</span>
          </Button>
        </div>
      </Card>

      {/* TABS: VOTER CODES & AUDIT TRAIL */}
      <div className="space-y-4">
        <Tabs
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
          ariaLabel={locale === "bn" ? "অ্যাডমিন প্যানেল বিভাগ" : "Admin dashboard sections"}
          tabs={[
            {
              id: "turnout",
              label: locale === "bn" ? "সাম্প্রতিক কার্যকলাপ" : "Live activity",
              icon: <Activity className="w-4 h-4" />,
              badge: formatNum(election.recentBallotActivity?.length || 0),
            },
            {
              id: "voters",
              label: locale === "bn" ? "ভোটার তালিকা ও কোড" : "Voter roster & codes",
              icon: <Users className="w-4 h-4" />,
              badge: voterCodes.length > 0 ? formatNum(voterCodes.length) : undefined,
            },
            {
              id: "audit",
              label: t("auditLogHeading"),
              icon: <ShieldCheck className="w-4 h-4" />,
              badge: auditLogs.length > 0 ? formatNum(auditLogs.length) : undefined,
            },
          ]}
        />

        {/* TAB 1: RECENT LIVE ACTIVITY */}
        <div
          role="tabpanel"
          aria-labelledby="tab-turnout"
          hidden={activeTab !== "turnout"}
        >
          {activeTab === "turnout" && (
            <Card className="p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t("liveActivityHeading")}
                </h3>
                <span className="text-xs text-slate-400">
                  {locale === "bn" ? "প্রার্থীর নাম সর্বদা গোপন" : "Candidate choice decoupled"}
                </span>
              </div>

              {!election.recentBallotActivity || election.recentBallotActivity.length === 0 ? (
                <EmptyState
                  icon={<Activity className="w-8 h-8 text-slate-400" />}
                  title={t("noActivityYet")}
                  description={
                    locale === "bn"
                      ? "ভোটারদের কোড সরবরাহ করে নির্বাচন শুরু করুন।"
                      : "Share the election join code or voter codes to start receiving ballots."
                  }
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {election.recentBallotActivity.map((b) => (
                    <div
                      key={b.sequenceNumber}
                      className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-emerald-100 text-[#006A4E] dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-semibold text-[11px] font-mono tabular-nums shrink-0">
                          #{formatNum(b.sequenceNumber)}
                        </span>
                        <div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {locale === "bn" ? "গোপন ব্যালট কাস্ট হয়েছে" : "Anonymous ballot cast"}
                          </span>
                          <span className="text-slate-400 ml-2 font-mono tabular-nums">
                            {b.receiptCode}
                          </span>
                        </div>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {formatDate(b.castAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* TAB 2: VOTER CODES */}
        <div
          role="tabpanel"
          aria-labelledby="tab-voters"
          hidden={activeTab !== "voters"}
        >
          {activeTab === "voters" && (
            <Card className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {locale === "bn" ? "নিবন্ধিত ভোটার ও কোড" : "Registered voters"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {locale === "bn"
                      ? "কারা ভোট দিয়েছেন তা দেখা যাবে, কিন্তু কে কাকে ভোট দিয়েছেন তা সম্পূর্ণ গোপন।"
                      : "Track turnout without revealing how any voter voted."}
                  </p>
                </div>
                <Button onClick={downloadVoterCodesCsv} size="sm" variant="outline">
                  <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>CSV</span>
                </Button>
              </div>

              {voterCodes.length === 0 ? (
                <EmptyState
                  icon={<Users className="w-8 h-8 text-slate-400" />}
                  title={locale === "bn" ? "কোনো নির্দিষ্ট ভোটার কোড নেই" : "No voter roster"}
                  description={
                    locale === "bn"
                      ? "উন্মুক্ত জয়েন কোড নির্বাচনে আগাম ভোটার তালিকা থাকে না।"
                      : "Open join-code elections do not require pre-generated voter codes."
                  }
                />
              ) : (
                <div
                  tabIndex={0}
                  role="region"
                  aria-label={locale === "bn" ? "ভোটার তালিকা" : "Registered voter roster"}
                  className="overflow-x-auto"
                >
                  <table className="w-full text-left text-xs border-collapse">
                    <caption className="visually-hidden">
                      {locale === "bn" ? "ভোটার কোড ও অংশগ্রহণ তালিকা" : "Voter codes and participation status"}
                    </caption>
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs">
                        <th scope="col" className="py-2.5 pr-4 font-medium">
                          {locale === "bn" ? "ভোটার কোড" : "Voter code"}
                        </th>
                        <th scope="col" className="py-2.5 pr-4 font-medium">
                          {locale === "bn" ? "পরিচয় / রোল" : "Identifier"}
                        </th>
                        <th scope="col" className="py-2.5 pr-4 font-medium">
                          {locale === "bn" ? "অবস্থা" : "Status"}
                        </th>
                        <th scope="col" className="py-2.5 font-medium">
                          {locale === "bn" ? "সময়" : "Timestamp"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                      {voterCodes.map((v) => (
                        <tr key={v.voterCode}>
                          <td className="py-2.5 pr-4 font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                            {v.voterCode}
                          </td>
                          <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400">
                            {v.identifier || "—"}
                          </td>
                          <td className="py-2.5 pr-4 whitespace-nowrap">
                            {v.hasVoted ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                                {locale === "bn" ? "ভোট সম্পন্ন" : "Voted"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {locale === "bn" ? "অপেক্ষমাণ" : "Pending"}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap tabular-nums">
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
        </div>

        {/* TAB 3: AUDIT LOGS */}
        <div
          role="tabpanel"
          aria-labelledby="tab-audit"
          hidden={activeTab !== "audit"}
        >
          {activeTab === "audit" && (
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t("auditLogHeading")}
              </h3>
              {auditLogs.length === 0 ? (
                <EmptyState
                  icon={<ShieldCheck className="w-8 h-8 text-slate-400" />}
                  title={locale === "bn" ? "কোনো অডিট লগ নেই" : "No audit logs recorded"}
                  description={
                    locale === "bn"
                      ? "নির্বাচনের সকল কার্যক্রম এখানে লিপিবদ্ধ থাকবে।"
                      : "Administrative changes and lifecycle events will be listed here."
                  }
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-medium text-[#006A4E] dark:text-[#34D399] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          {log.eventType}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {formatAuditDetails(log, locale, formatNum, formatDate)}
                        </span>
                      </div>
                      <span className="text-slate-400 shrink-0 font-mono text-[11px] tabular-nums">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            action: null,
            title: "",
            description: "",
            confirmLabel: "",
          })
        }
        preventClose={actionLoading}
        title={confirmModal.title}
        description={confirmModal.description}
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() =>
                setConfirmModal({
                  isOpen: false,
                  action: null,
                  title: "",
                  description: "",
                  confirmLabel: "",
                })
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
          <div className="w-10 h-10 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading admin dashboard...</p>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
