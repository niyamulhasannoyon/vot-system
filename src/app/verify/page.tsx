"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Hash,
  Clock,
  Vote,
  ExternalLink,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function VerifyContent() {
  const searchParams = useSearchParams();
  const { locale, formatNum, formatDate, t } = useLanguage();

  const [receiptInput, setReceiptInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-verify if code passed in query params
  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setReceiptInput(urlCode);
      verifyCode(urlCode);
    }
  }, [searchParams]);

  const verifyCode = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(codeToVerify.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("receiptNotFound"));
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || t("receiptNotFound"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(receiptInput);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20 w-full space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#EBF7F2] text-[#006A4E] flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t("verifyHeading")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          {t("verifySubtitle")}
        </p>
      </div>

      {/* Input Box */}
      <Card className="p-6 sm:p-8 space-y-5 border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {t("verifyInputLabel")}
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={receiptInput}
                onChange={(e) => {
                  setReceiptInput(e.target.value);
                  setError(null);
                }}
                placeholder={t("verifyInputPlaceholder")}
                className="w-full px-4 py-3 text-center text-lg sm:text-xl font-mono uppercase tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            size="lg"
            className="w-full gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{t("btnCheckReceipt")}</span>
          </Button>
        </form>

        {/* Demo Fast Access Sample */}
        <div className="pt-2 text-center">
          <span className="text-xs text-slate-400">
            {locale === "bn" ? "ডেমো রসিদ কোড টেস্ট করুন:" : "Sample demo receipt:"}{" "}
            <button
              type="button"
              onClick={() => {
                setReceiptInput("VBD-E7A1-420B");
                verifyCode("VBD-E7A1-420B");
              }}
              className="font-mono text-[#006A4E] underline font-semibold ml-1"
            >
              VBD-E7A1-420B
            </button>
          </span>
        </div>
      </Card>

      {/* ERROR CARD */}
      {error && (
        <Card className="p-6 text-center space-y-2 border-red-200 bg-red-50/40 dark:bg-red-950/20">
          <XCircle className="w-8 h-8 text-[#F42A41] mx-auto" />
          <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
            {t("receiptNotFound")}
          </h3>
          <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
        </Card>
      )}

      {/* VERIFIED SUCCESS PROOF CARD */}
      {result && result.verified && (
        <Card className="p-6 sm:p-8 space-y-6 border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#006A4E] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <Badge variant="success" className="mb-1">
                {t("receiptChainIntegrity")}
              </Badge>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("receiptFoundTitle")}
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700 text-xs sm:text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">
                {locale === "bn" ? "নির্বাচনের শিরোনাম" : "Election"}:
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-right">
                {locale === "bn" ? result.electionTitleBn || result.electionTitle : result.electionTitle}
              </span>
            </div>

            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">
                {t("receiptBlockNumber")}
              </span>
              <span className="font-mono font-bold text-[#006A4E] dark:text-[#34D399]">
                #{formatNum(result.sequenceNumber)} ({formatNum(result.totalBallotsInElection)} টির মধ্যে)
              </span>
            </div>

            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">
                {t("receiptTimestamp")}
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {formatDate(result.castAt)}
              </span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-slate-500 font-medium">
                {locale === "bn" ? "পূর্ববর্তী ব্লক হ্যাশ" : "Previous Hash"}:
              </span>
              <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                {result.prevHashTruncated}
              </span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-slate-500 font-medium">
                {locale === "bn" ? "ব্যালট সিল হ্যাশ (SHA-256)" : "Ballot Seal Hash"}:
              </span>
              <span className="font-mono text-[11px] text-[#006A4E] dark:text-[#34D399] font-bold">
                {result.ballotHashTruncated}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
            <span>
              {locale === "bn"
                ? "ভোটারের গোপনীয়তা নিশ্চিত রাখতে এই অডিট স্ক্রিনে আপনি কাকে ভোট দিয়েছেন তা প্রকাশ করা হয় না। শুধুমাত্র নিশ্চিত করা হয় যে ভোটটি সিলগালা হয়ে চূড়ান্ত ফলাফলে যুক্ত রয়েছে।"
                : "To preserve your secret ballot, this verification proves your vote is officially included in the tally without revealing which candidate you chose."}
            </span>
          </div>

          <div className="pt-2">
            <Link href={`/elections/${result.electionSlug}/results`} className="w-full inline-flex">
              <Button size="md" variant="secondary" className="w-full gap-2">
                <Vote className="w-4 h-4" />
                <span>{locale === "bn" ? "এই নির্বাচনের ফলাফল দেখুন" : "View Election Results"}</span>
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function VerifyReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-12 h-12 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading verification engine...</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
