"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { ShieldCheck, Vote, Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { formatBST } from "@/lib/date";

const clockListeners = new Set<() => void>();
let currentNowMs = 0;
let clockTimer: ReturnType<typeof setInterval> | null = null;

function subscribeClock(listener: () => void): () => void {
  clockListeners.add(listener);
  if (typeof window !== "undefined") {
    if (currentNowMs === 0) {
      currentNowMs = Date.now();
    }
    if (!clockTimer) {
      clockTimer = setInterval(() => {
        currentNowMs = Date.now();
        clockListeners.forEach((cb) => cb());
      }, 1000);
    }
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}

function getClockSnapshot(): number {
  if (currentNowMs === 0 && typeof window !== "undefined") {
    currentNowMs = Date.now();
  }
  return currentNowMs;
}

export function Footer() {
  const { locale, useBengaliNumerals, t } = useLanguage();
  const nowMs = useSyncExternalStore(subscribeClock, getClockSnapshot, () => 0);

  const bstTime =
    nowMs > 0
      ? formatBST(new Date(nowMs), {
          locale,
          useBengaliNumerals,
          includeTime: true,
        })
      : "";

  const displayYear = nowMs > 0 ? new Date(nowMs).getFullYear() : 2026;

  return (
    <footer className="w-full bg-slate-900 dark:bg-[#07090D] text-slate-300 border-t border-slate-800 dark:border-white/[0.08] mt-auto print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Honest Disclaimer */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#006A4E] flex items-center justify-center text-white relative shrink-0">
                <Vote className="w-4 h-4" strokeWidth={1.75} />
                <span
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#F42A41]"
                  aria-hidden="true"
                />
              </div>
              <span className="font-semibold text-lg text-white">
                VoteBD (ভোটবিডি)
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {t("brandTagline")}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-xs text-slate-300 leading-relaxed max-w-lg">
              <span className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>
                  {locale === "bn"
                    ? "স্বচ্ছতার অঙ্গীকার ও নীতি"
                    : "Scope & transparency notice"}
                </span>
              </span>
              {t("footerDisclaimer")}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">
              {t("footerQuickLinks")}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  {t("navHome")}
                </Link>
              </li>
              <li>
                <Link
                  href="/elections/create"
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t("navCreate")}
                </Link>
              </li>
              <li>
                <Link href="/vote" className="hover:text-emerald-400 transition-colors">
                  {t("navJoin")}
                </Link>
              </li>
              <li>
                <Link
                  href="/verify"
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t("navVerify")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Realtime Time & Bangladesh Context */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">
              {locale === "bn" ? "সময় ও অবস্থান" : "Time & region"}
            </h4>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" strokeWidth={1.75} />
                <span>{t("footerDhakaTime")}</span>
              </div>
              <div
                className="text-sm font-medium text-white font-mono tabular-nums"
                suppressHydrationWarning
              >
                {bstTime || "Dhaka (BST, UTC+6)"}
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {locale === "bn"
                ? "বাংলাদেশের সকল নির্বাচনের সময়সীমা এশিয়া/ঢাকা (BST) অনুযায়ী নিয়ন্ত্রিত।"
                : "All voting windows are calibrated strictly to Asia/Dhaka (BST, UTC+6)."}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4"
          suppressHydrationWarning
        >
          <div suppressHydrationWarning>
            © {displayYear} VoteBD.{" "}
            {locale === "bn"
              ? "সর্বস্বত্ব সংরক্ষিত। বাংলাদেশের শিক্ষার্থী ও সংগঠনের জন্য নির্মিত।"
              : "Built for educational institutions and community organizations in Bangladesh."}
          </div>
          <div className="text-slate-400 font-mono tabular-nums">
            Asia/Dhaka • SHA-256 Audit Chain
          </div>
        </div>
      </div>
    </footer>
  );
}
