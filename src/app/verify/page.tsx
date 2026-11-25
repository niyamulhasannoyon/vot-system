"use client";

import React, { useCallback, useEffect, useId, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Vote,
  Lock,
  Copy,
  Layers,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { VerificationResult } from "@/types/election";

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialQueryCode = searchParams.get("code") ?? "";
  const { locale, formatNum, formatDate, t } = useLanguage();
  const { showToast } = useToast();

  const [receiptInput, setReceiptInput] = useState(initialQueryCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  const verifyCode = useCallback(
    async (codeToVerify: string) => {
      const trimmed = codeToVerify.trim().toUpperCase();
      if (!trimmed) return;

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const res = await fetch(`/api/verify/${encodeURIComponent(trimmed)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as VerificationResult;
        if (!res.ok) {
          throw new Error(data.error || t("receiptNotFound"));
        }
        setResult(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("receiptNotFound");
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  // Run verification automatically when `?code=` query parameter is present
  useEffect(() => {
    if (!initialQueryCode) return;
    let cancelled = false;
    const trimmed = initialQueryCode.trim().toUpperCase();
    fetch(`/api/verify/${encodeURIComponent(trimmed)}`, { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json()) as VerificationResult;
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || t("receiptNotFound"));
          setResult(null);
        } else {
          setResult(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t("receiptNotFound"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialQueryCode, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(receiptInput);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(
        `${label} ${locale === "bn" ? "কপি করা হয়েছে" : "copied to clipboard"}`,
        "success"
      );
    } catch {
      showToast(t("errorGeneric"), "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16 w-full space-y-6 animate-fade-in flex-1">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center mx-auto border border-emerald-200/70 dark:border-emerald-900/50">
          <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
          {t("verifyHeading")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {t("verifySubtitle")}
        </p>
      </div>

      {/* Input Box */}
      <Card className="p-6 sm:p-8 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={inputId}
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              {t("verifyInputLabel")}
            </label>
            <input
              id={inputId}
              name="receiptCode"
              type="text"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              enterKeyHint="search"
              value={receiptInput}
              onChange={(e) => {
                setReceiptInput(e.target.value);
                setError(null);
              }}
              placeholder={t("verifyInputPlaceholder")}
              className="w-full h-12 px-4 text-center text-lg sm:text-xl font-mono uppercase tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#161C28] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:normal-case placeholder:tracking-normal focus:border-[#006A4E] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#006A4E]/15 dark:focus:ring-[#10B981]/20 transition-[border-color,box-shadow]"
            />
          </div>

          <Button
            type="submit"
            isLoading={loading}
            size="md"
            className="w-full h-11"
          >
            {!loading && <Search className="w-4 h-4" strokeWidth={1.75} />}
            <span>{t("btnCheckReceipt")}</span>
          </Button>
        </form>

        {/* Demo Fast Access Sample */}
        <div className="pt-2 text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {locale === "bn" ? "ডেমো রসিদ কোড পরীক্ষা করুন:" : "Sample demo receipt:"}{" "}
            <button
              type="button"
              onClick={() => {
                setReceiptInput("VBD-E7A1-420B");
                verifyCode("VBD-E7A1-420B");
              }}
              className="font-mono text-[#006A4E] dark:text-[#34D399] underline font-medium ml-1 hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              VBD-E7A1-420B
            </button>
          </span>
        </div>
      </Card>

      {/* ERROR CARD */}
      {error && (
        <Card className="p-6 text-center space-y-2 border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20">
          <XCircle className="w-8 h-8 text-[#F42A41] mx-auto" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-red-900 dark:text-red-200">
            {t("receiptNotFound")}
          </h2>
          <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
        </Card>
      )}

      {/* TAMPERED CHAIN ALERT */}
      {result && !result.verified && (
        <Card className="p-6 text-center space-y-3 border-red-300 dark:border-red-800 bg-red-50/60 dark:bg-red-950/30">
          <AlertTriangle className="w-9 h-9 text-[#D71D32] mx-auto" strokeWidth={1.75} />
          <h2 className="text-base font-semibold text-red-900 dark:text-red-200">
            {locale === "bn"
              ? "সতর্কতা: হ্যাশ-চেইন যাচাইকরণ ব্যর্থ হয়েছে"
              : "Integrity alert: hash chain verification failed"}
          </h2>
          <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
            {locale === "bn"
              ? "এই ব্যালটের ক্রিপ্টোগ্রাফিক সিল বা পূর্ববর্তী ব্লকের সংযোগে অসঙ্গতি পাওয়া গেছে।"
              : "A cryptographic mismatch was detected in this ballot seal or its upstream chain linkage."}
          </p>
        </Card>
      )}

      {/* VERIFIED SUCCESS PROOF CARD */}
      {result && result.verified && (
        <div className="space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 border-emerald-600/30 dark:border-emerald-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100/80 text-[#006A4E] dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <div>
                  <Badge variant="success" className="mb-1">
                    {t("receiptChainIntegrity")}
                  </Badge>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t("receiptFoundTitle")}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(result.receiptCode, "Receipt Code")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors tabular-nums"
                title="Copy receipt code"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{result.receiptCode}</span>
              </button>
            </div>

            {/* Verification Metadata Grid */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161C28] border border-slate-200 dark:border-white/10 divide-y divide-slate-200 dark:divide-white/[0.08] text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {locale === "bn" ? "নির্বাচনের শিরোনাম" : "Election"}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white text-right">
                  {locale === "bn"
                    ? result.electionTitleBn || result.electionTitle
                    : result.electionTitle}
                </span>
              </div>

              <div className="py-2.5 flex justify-between gap-4 tabular-nums">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {t("receiptBlockNumber")}
                </span>
                <span className="font-mono font-semibold text-[#006A4E] dark:text-[#34D399]">
                  {locale === "bn"
                    ? `#${formatNum(result.sequenceNumber)} (${formatNum(result.totalBallotsInElection)} টির মধ্যে)`
                    : `#${formatNum(result.sequenceNumber)} of ${formatNum(result.totalBallotsInElection)}`}
                </span>
              </div>

              <div className="py-2.5 flex justify-between gap-4 tabular-nums">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {t("receiptTimestamp")}
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-right">
                  {formatDate(result.castAt)}
                </span>
              </div>

              <div className="py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {locale === "bn" ? "পূর্ববর্তী ব্লক হ্যাশ" : "Previous hash"}
                </span>
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  {result.prevHashTruncated}
                </span>
              </div>

              <div className="py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {locale === "bn" ? "ব্যালট সিল হ্যাশ (SHA-256)" : "Ballot seal hash"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#006A4E] dark:text-[#34D399] font-semibold">
                    {result.ballotHashTruncated}
                  </span>
                  {result.ballotHash && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.ballotHash, "SHA-256 Hash")}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded"
                      aria-label="Copy full SHA-256 hash"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161C28]/70 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#006A4E] dark:text-[#34D399] shrink-0 mt-0.5" strokeWidth={1.75} />
              <span>
                {locale === "bn"
                  ? "ভোটারের গোপনীয়তা নিশ্চিত রাখতে এই অডিট স্ক্রিনে আপনি কাকে ভোট দিয়েছেন তা প্রকাশ করা হয় না। শুধুমাত্র নিশ্চিত করা হয় যে ভোটটি সিলগালা হয়ে চূড়ান্ত ফলাফলে অন্তর্ভুক্ত রয়েছে।"
                  : "To preserve your secret ballot, this verification proves your vote is officially included in the tally without revealing which candidate you chose."}
              </span>
            </div>
          </Card>

          {/* VISUAL CRYPTOGRAPHIC BLOCK EXPLORER */}
          <Card className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {locale === "bn" ? "ক্রিপ্টোগ্রাফিক চেইন এক্সপ্লোরার" : "Cryptographic hash chain"}
                </h3>
              </div>
              <span className="text-xs font-mono text-[#006A4E] dark:text-[#34D399] font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                SHA-256 Verified
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {locale === "bn"
                ? "প্রতিটি ব্যালট পূর্ববর্তী ব্যালটের ক্রিপ্টোগ্রাফিক হ্যাশের সাথে সিকোয়েন্স অনুযায়ী লক করা থাকে। নিচে এই নির্বাচনের ব্লক চেইনের দৃশ্যমান লিঙ্ক দেখানো হলো:"
                : "Each ballot is cryptographically chained to the preceding ballot in chronological order. Tampering with any past block breaks all downstream seals."}
            </p>

            <div className="overflow-x-auto pb-2 pt-2">
              <div className="flex items-center gap-2 min-w-max">
                <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#161C28] text-center w-36 shrink-0">
                  <span className="text-[10px] font-medium text-slate-400 block">
                    Genesis block
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 block my-1 tabular-nums">
                    #0 GENESIS
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">
                    {result.genesisHashTruncated || "GENESIS-SEAL"}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />

                {result.chainBlocks && result.chainBlocks.length > 0 ? (
                  result.chainBlocks.map((b, index) => (
                    <React.Fragment key={b.sequenceNumber}>
                      <div
                        className={`p-3 rounded-xl border text-center w-40 shrink-0 transition-colors ${
                          b.isTarget
                            ? "border-[#006A4E] dark:border-[#10B981] bg-emerald-50/70 dark:bg-emerald-950/50 ring-2 ring-[#006A4E]/15"
                            : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#161C28]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 tabular-nums">
                          <span
                            className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full ${
                              b.isTarget
                                ? "bg-[#006A4E] text-white"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            #{formatNum(b.sequenceNumber)}
                          </span>
                          {b.isTarget && (
                            <span className="text-[10px] font-semibold text-[#006A4E] dark:text-[#34D399]">
                              {locale === "bn" ? "আপনার ভোট" : "Your ballot"}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 block tabular-nums">
                          {b.receiptCode}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-1 truncate">
                          {b.shortHash}
                        </span>
                      </div>

                      {index < result.chainBlocks.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="p-3 rounded-xl border border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-center w-40 shrink-0">
                    <span className="text-[10px] font-semibold text-emerald-700 tabular-nums">
                      #{formatNum(result.sequenceNumber)}
                    </span>
                    <span className="font-mono text-xs font-semibold block">{result.receiptCode}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/elections/${encodeURIComponent(result.electionJoinCode || result.electionSlug)}/results`}
                className="w-full block"
              >
                <Button size="md" variant="secondary" className="w-full">
                  <Vote className="w-4 h-4" strokeWidth={1.75} />
                  <span>{locale === "bn" ? "এই নির্বাচনের ফলাফল দেখুন" : "View election results"}</span>
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
          <div className="w-10 h-10 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading verification engine...</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
