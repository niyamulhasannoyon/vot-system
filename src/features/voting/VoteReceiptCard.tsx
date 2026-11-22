"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  ShieldCheck,
  Vote,
  ExternalLink,
} from "lucide-react";
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

  const copyReceipt = () => {
    navigator.clipboard.writeText(receiptCode);
    setCopied(true);
    toast.success(t("copiedToast"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-16 w-full animate-fade-in">
      <Card className="text-center p-6 sm:p-8 space-y-6 border-2 border-emerald-500/30">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t("voteSuccessTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t("voteSuccessSubtitle")}
          </p>
        </div>

        {/* Anonymous Digital Receipt Box */}
        <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            {t("receiptLabel")}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-widest text-[#006A4E] dark:text-[#34D399] font-mono">
            {receiptCode}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <span>{locale === "bn" ? "ব্লক ক্রম #" : "Block Sequence #"}:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {formatNum(sequenceNumber)}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-left leading-relaxed">
          <span className="font-bold block mb-1 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
            {locale === "bn" ? "গোপনীয়তার নিশ্চয়তা" : "Secret Ballot Guarantee"}
          </span>
          {t("receiptProofNote")}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button onClick={copyReceipt} variant="outline" className="w-full gap-2">
            <Copy className="w-4 h-4" />
            {copied ? t("copiedToast") : t("btnCopyReceipt")}
          </Button>

          <Link href={`/verify?code=${receiptCode}`} className="w-full inline-flex">
            <Button variant="secondary" className="w-full gap-2">
              <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
              {t("btnVerifyNow")}
            </Button>
          </Link>

          <Link href={`/elections/${joinCode}/results`} className="w-full inline-flex">
            <Button size="lg" className="w-full gap-2">
              <Vote className="w-4 h-4" />
              {t("btnGoToResults")}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
