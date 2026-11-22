"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Vote, ArrowRight, ShieldCheck, Sparkles, QrCode } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function JoinElectionPage() {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError(locale === "bn" ? "অনুগ্রহ করে নির্বাচনের কোড দিন।" : "Please enter a valid election code.");
      return;
    }
    router.push(`/vote/${encodeURIComponent(code.trim().toUpperCase())}`);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 w-full">
      <Card className="p-6 sm:p-8 space-y-6 shadow-md border-slate-200/90 dark:border-slate-800">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF7F2] text-[#006A4E] flex items-center justify-center mx-auto shadow-sm">
            <Vote className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t("voterHeading")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {locale === "bn"
              ? "আয়োজক থেকে প্রাপ্ত ৬ অক্ষরের জয়েন কোড লিখুন"
              : "Enter the 6-character election join code from your organizer"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {locale === "bn" ? "নির্বাচন জয়েন কোড" : "Election Join Code"}
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                }}
                placeholder="যেমন: CR-2024"
                className="w-full px-4 py-3 text-center text-xl font-mono uppercase tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 mt-1.5 text-center font-medium">
                {error}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full gap-2">
            <span>{t("joinBoxButton")}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Demo Fast Access Link */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <span className="text-xs text-slate-500 block mb-2">
            {locale === "bn" ? "টেস্ট করতে চান?" : "Want to test instantly?"}
          </span>
          <Link
            href="/vote/CR-2024"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006A4E] hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("heroTryDemo")}
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#006A4E]" />
          <span>{locale === "bn" ? "১০০% গোপন ও সুরক্ষিত ব্যালট" : "100% Secret & Tamper-Proof"}</span>
        </div>
      </Card>
    </div>
  );
}
