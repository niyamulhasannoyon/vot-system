"use client";

import React, { useState } from "react";
import { Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface VoterAuthCardProps {
  electionTitle: string;
  joinCode: string;
  onVerify: (code: string) => void;
}

export function VoterAuthCard({
  electionTitle,
  joinCode,
  onVerify,
}: VoterAuthCardProps) {
  const { locale, t } = useLanguage();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError(locale === "bn" ? "অনুগ্রহ করে আপনার ভোটার কোড দিন।" : "Please enter your voter code.");
      return;
    }
    setError(null);
    onVerify(code.trim().toUpperCase());
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 w-full animate-fade-in">
      <Card className="p-6 sm:p-8 space-y-6 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF7F2] text-[#006A4E] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {t("voterEnterCodeTitle")}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {electionTitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {locale === "bn" ? "আপনার ওয়ান-টাইম ভোটার কোড" : "One-Time Voter Code"}
            </label>
            <input
              type="text"
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              placeholder={t("voterCodePlaceholder")}
              className="w-full px-4 py-3 text-center text-lg font-mono uppercase tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
            />
            {error && (
              <p className="text-xs text-red-500 mt-1.5 text-center font-medium">
                {error}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full gap-2 shadow-sm">
            <span>{t("btnVerifyCode")}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Demo Fast Access helper for seeded test */}
        {joinCode === "CR-2024" && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
            <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">
              {locale === "bn" ? "💡 ডেমো টেস্টের জন্য কোড ব্যবহার করুন:" : "💡 Quick Access Demo Voter Codes:"}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {["CR-V104", "CR-V105", "CR-V106"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCode(c);
                    setError(null);
                  }}
                  className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-[11px] text-slate-400">
          {locale === "bn"
            ? "কোড হারিয়ে গেলে ক্লাস শিক্ষক বা নির্বাচন আয়োজকের সাথে যোগাযোগ করুন।"
            : "If you misplaced your voter code, contact the election coordinator."}
        </div>
      </Card>
    </div>
  );
}
