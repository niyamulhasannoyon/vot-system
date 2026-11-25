"use client";

import React, { useId, useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface VoterAuthCardProps {
  electionId: string;
  electionTitle: string;
  joinCode: string;
  onVerify: (code: string) => void;
}

export function VoterAuthCard({
  electionId,
  electionTitle,
  joinCode,
  onVerify,
}: VoterAuthCardProps) {
  const { locale, t } = useLanguage();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputId = useId();
  const errorId = useId();

  const verifyVoterCode = async (candidateCode: string) => {
    const clean = candidateCode.trim().toUpperCase();
    if (!clean) {
      setError(
        locale === "bn"
          ? "অনুগ্রহ করে আপনার ভোটার কোড দিন।"
          : "Please enter your voter code."
      );
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch(`/api/elections/${encodeURIComponent(electionId)}/verify-voter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterCode: clean }),
      });
      const data = (await res.json()) as { valid?: boolean; error?: string };

      if (!res.ok || !data.valid) {
        setError(data.error || t("errorGeneric"));
        return;
      }

      onVerify(clean);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyVoterCode(code);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 w-full animate-fade-in">
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#EBF7F2] dark:bg-emerald-950/60 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center mx-auto border border-emerald-200/60 dark:border-emerald-800/40">
            <Lock className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            {t("voterEnterCodeTitle")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {electionTitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={inputId}
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              {locale === "bn" ? "আপনার ওয়ান-টাইম ভোটার কোড" : "One-time voter code"}
            </label>
            <input
              id={inputId}
              name="voterCode"
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
              placeholder={t("voterCodePlaceholder")}
              className="w-full h-12 px-4 text-center text-lg font-mono uppercase tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#161C28] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:normal-case placeholder:tracking-normal focus:border-[#006A4E] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#006A4E]/15 dark:focus:ring-[#10B981]/20 transition-[border-color,box-shadow]"
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

          <Button type="submit" size="lg" isLoading={isVerifying} className="w-full">
            <span>{t("btnVerifyCode")}</span>
            {!isVerifying && <ArrowRight className="w-4 h-4" strokeWidth={1.75} />}
          </Button>
        </form>

        {/* Demo Fast Access helper for seeded test */}
        {joinCode === "CR-2024" && (
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-xs">
            <span className="font-medium text-emerald-900 dark:text-emerald-300 block mb-2">
              {locale === "bn"
                ? "ডেমো পরীক্ষার জন্য সক্রিয় ভোটার কোড:"
                : "Demo active voter codes:"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {["CR-V104", "CR-V105", "CR-V106"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCode(c);
                    setError(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-emerald-300/80 dark:border-emerald-700 font-mono text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          {locale === "bn"
            ? "কোড হারিয়ে গেলে ক্লাস শিক্ষক বা নির্বাচন আয়োজকের সাথে যোগাযোগ করুন।"
            : "If you misplaced your voter code, contact the election organizer."}
        </div>
      </Card>
    </div>
  );
}
