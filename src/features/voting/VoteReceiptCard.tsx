"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, ShieldCheck, Vote } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

interface VoteReceiptCardProps {
  receiptCode: string;
  sequenceNumber: number;
  joinCode: string;
}

export function VoteReceiptCard({
  receiptCode,
  sequenceNumber,
  joinCode,
}: VoteReceiptCardProps) {
  const { locale, formatNum, t } = useLanguage();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const copyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(receiptCode);
      setCopied(true);
      toast.success(t("copiedToast"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("errorGeneric"));
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-16 w-full animate-fade-in">
      <Card className="text-center p-6 sm:p-8 space-y-6 border-emerald-600/30 dark:border-emerald-500/30">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center mx-auto border border-emerald-200/70 dark:border-emerald-800/50">
          <CheckCircle2 className="w-7 h-7" strokeWidth={1.75} />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            {t("voteSuccessTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t("voteSuccessSubtitle")}
          </p>
        </div>

        {/* Anonymous Digital Receipt Box */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#161C28] border border-slate-200 dark:border-white/10 space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t("receiptLabel")}
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-wider text-[#006A4E] dark:text-[#34D399] font-mono tabular-nums">
            {receiptCode}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 tabular-nums">
            <span>{locale === "bn" ? "ব্লক ক্রম #" : "Block sequence #"}</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
              {formatNum(sequenceNumber)}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-left leading-relaxed">
          <span className="font-semibold mb-1 text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
            <span>{locale === "bn" ? "গোপনীয়তার নিশ্চয়তা" : "Secret ballot guarantee"}</span>
          </span>
          {t("receiptProofNote")}
        </div>

        <div className="space-y-2.5 pt-1">
          <Button onClick={copyReceipt} variant="outline" className="w-full">
            <Copy className="w-4 h-4" strokeWidth={1.75} />
            <span>{copied ? t("copiedToast") : t("btnCopyReceipt")}</span>
          </Button>

          <Link href={`/verify?code=${encodeURIComponent(receiptCode)}`} className="w-full block">
            <Button variant="secondary" className="w-full">
              <ShieldCheck className="w-4 h-4 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
              <span>{t("btnVerifyNow")}</span>
            </Button>
          </Link>

          <Link href={`/elections/${encodeURIComponent(joinCode)}/results`} className="w-full block">
            <Button size="lg" className="w-full">
              <Vote className="w-4 h-4" strokeWidth={1.75} />
              <span>{t("btnGoToResults")}</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
