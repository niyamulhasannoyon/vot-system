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
  Copy,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

function VerifyContent() {
  const searchParams = useSearchParams();
  const { locale, formatNum, formatDate, t } = useLanguage();
  const { showToast } = useToast();

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

  const copyToClipboard = async (text: string, label: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      showToast(`${label} ${locale === "bn" ? "কপি করা হয়েছে" : "copied to clipboard"}`, "success");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16 w-full space-y-6 animate-fade-in flex-1">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900/50">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t("verifyHeading")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {t("verifySubtitle")}
        </p>
      </div>

      {/* Input Box */}
      <Card className="p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
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
                className="w-full h-12 px-4 text-center text-lg sm:text-xl font-mono uppercase tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/20 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            size="md"
            className="w-full h-11 gap-2 font-medium"
          >
            <Search className="w-4 h-4" />
            <span>{t("btnCheckReceipt")}</span>
          </Button>
        </form>

        {/* Demo Fast Access Sample */}
        <div className="pt-2 text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {locale === "bn" ? "ডেমো রসিদ কোড টেস্ট করুন:" : "Sample demo receipt:"}{" "}
            <button
              type="button"
              onClick={() => {
                setReceiptInput("VBD-E7A1-420B");
                verifyCode("VBD-E7A1-420B");
              }}
              className="font-mono text-[#006A4E] dark:text-[#34D399] underline font-semibold ml-1 hover:text-emerald-700 dark:hover:text-emerald-400"
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
        <div className="space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#006A4E] dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0">
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

              <button
                onClick={() => copyToClipboard(result.receiptCode, "Receipt Code")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Copy receipt code"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{result.receiptCode}</span>
              </button>
            </div>

            {/* Verification Metadata Grid */}
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
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#006A4E] dark:text-[#34D399] font-bold">
                    {result.ballotHashTruncated}
                  </span>
                  {result.ballotHash && (
                    <button
                      onClick={() => copyToClipboard(result.ballotHash, "Full SHA-256 Hash")}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Copy full 64-char hash"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Secret Ballot Assurance */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
              <span>
                {locale === "bn"
                  ? "ভোটারের গোপনীয়তা নিশ্চিত রাখতে এই অডিট স্ক্রিনে আপনি কাকে ভোট দিয়েছেন তা প্রকাশ করা হয় না। শুধুমাত্র নিশ্চিত করা হয় যে ভোটটি সিলগালা হয়ে চূড়ান্ত ফলাফলে অন্তর্ভুক্ত রয়েছে।"
                  : "To preserve your secret ballot, this verification proves your vote is officially included in the tally without revealing which candidate you chose."}
              </span>
            </div>
          </Card>

          {/* VISUAL CRYPTOGRAPHIC BLOCK EXPLORER */}
          <Card className="p-6 sm:p-8 space-y-4 border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#006A4E]" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {locale === "bn" ? "ক্রিপ্টোগ্রাফিক চেইন এক্সপ্লোরার" : "Cryptographic Hash Chain"}
                </h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                SHA-256 Verified
              </span>
            </div>

            <p className="text-xs text-slate-500">
              {locale === "bn"
                ? "প্রতিটি ব্যালট পূর্ববর্তী ব্যালটের ক্রিপ্টোগ্রাফিক হ্যাশের সাথে সিকোয়েন্স অনুযায়ী লক করা থাকে। নিচে এই নির্বাচনের ব্লক চেইনের দৃশ্যমান লিঙ্ক দেখানো হলো:"
                : "Each ballot is cryptographically chained to the preceding ballot in strict chronological order. Tampering with any past block breaks all downstream seals."}
            </p>

            {/* Horizontal Block Chain Scroll */}
            <div className="overflow-x-auto pb-2 pt-2">
              <div className="flex items-center gap-2 min-w-max">
                {/* Genesis Block */}
                <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-center w-36 shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Genesis Block
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 block my-1">
                    #0 GENESIS
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">
                    {result.genesisHashTruncated || "GENESIS-SEAL"}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

                {/* Ballot Blocks */}
                {result.chainBlocks && result.chainBlocks.length > 0 ? (
                  result.chainBlocks.map((b: any, index: number) => (
                    <React.Fragment key={b.sequenceNumber}>
                      <div
                        className={`p-3 rounded-xl border text-center w-40 shrink-0 transition-all ${
                          b.isTarget
                            ? "border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20 shadow-md"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                              b.isTarget
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            #{formatNum(b.sequenceNumber)}
                          </span>
                          {b.isTarget && (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              {locale === "bn" ? "আপনার ভোট ✓" : "Your Ballot ✓"}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          {b.receiptCode}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-1 truncate">
                          {b.shortHash}
                        </span>
                      </div>

                      {index < result.chainBlocks.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="p-3 rounded-xl border border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-center w-40 shrink-0">
                    <span className="text-[10px] font-bold text-emerald-700">
                      #{formatNum(result.sequenceNumber)}
                    </span>
                    <span className="font-mono text-xs font-bold block">{result.receiptCode}</span>
                  </div>
                )}
              </div>
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
        </div>
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
