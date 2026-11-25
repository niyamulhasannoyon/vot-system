"use client";

import React, { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Vote, ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function JoinElectionPage() {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError(
        locale === "bn"
          ? "অনুগ্রহ করে নির্বাচনের কোড দিন।"
          : "Please enter a valid election code."
      );
      return;
    }
    router.push(`/vote/${encodeURIComponent(code.trim().toUpperCase())}`);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 w-full flex-1 flex flex-col justify-center">
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center mx-auto border border-emerald-200/70 dark:border-emerald-900/50">
            <Vote className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {t("voterHeading")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {locale === "bn"
              ? "আয়োজক থেকে প্রাপ্ত ৬ অক্ষরের জয়েন কোড লিখুন"
              : "Enter the 6-character election join code from your organizer"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={inputId}
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              {locale === "bn" ? "নির্বাচন জয়েন কোড" : "Election join code"}
            </label>
            <input
              id={inputId}
              name="joinCode"
              type="text"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              enterKeyHint="go"
              value={code}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? errorId : undefined}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              placeholder={locale === "bn" ? "যেমন: CR-2024" : "e.g. CR-2024"}
              className="w-full h-12 px-4 text-center text-xl font-mono uppercase tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#161C28] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:normal-case placeholder:tracking-normal focus:border-[#006A4E] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#006A4E]/15 dark:focus:ring-[#10B981]/20 transition-[border-color,box-shadow]"
            />
            {error && (
              <p
                id={errorId}
                role="alert"
                className="text-xs text-red-600 dark:text-red-400 mt-2 text-center font-medium"
              >
                {error}
              </p>
            )}
          </div>

          <Button type="submit" size="md" className="w-full h-11">
            <span>{t("joinBoxButton")}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08] text-center space-y-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">
            {locale === "bn" ? "সরাসরি পরীক্ষা করতে চান?" : "Want to test right away?"}
          </span>
          <Link
            href="/vote/CR-2024"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#006A4E] dark:text-[#34D399] hover:underline"
          >
            <span>{t("heroTryDemo")}</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
          <span>{locale === "bn" ? "১০০% গোপন ও সুরক্ষিত ব্যালট" : "100% secret & tamper-proof"}</span>
        </div>
      </Card>
    </div>
  );
}
