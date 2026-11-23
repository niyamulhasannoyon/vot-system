"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Vote, Clock, Heart } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { formatBST } from "@/lib/date";

export function Footer() {
  const { locale, useBengaliNumerals, t } = useLanguage();
  const [bstTime, setBstTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setBstTime(
        formatBST(new Date(), {
          locale,
          useBengaliNumerals,
          includeTime: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [locale, useBengaliNumerals]);

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Honest Disclaimer */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#006A4E] flex items-center justify-center text-white relative">
                <Vote className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#F42A41]" />
              </div>
              <span className="font-bold text-lg text-white">VoteBD (ভোটবিডি)</span>
            </div>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {t("brandTagline")}
            </p>

            {/* Clear Honesty Badge */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 leading-relaxed max-w-lg">
              <span className="font-semibold text-emerald-400 block mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {locale === "bn" ? "স্বচ্ছতার অঙ্গীকার ও নীতি" : "Scope & Transparency Notice"}
              </span>
              {t("footerDisclaimer")}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase">
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
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase">
              {locale === "bn" ? "সময় ও অবস্থান" : "Time & Region"}
            </h4>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t("footerDhakaTime")}</span>
              </div>
              <div
                className="text-sm font-semibold text-white font-mono"
                suppressHydrationWarning
              >
                {mounted && bstTime ? bstTime : "ঢাকা, বাংলাদেশ"}
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
            © {mounted ? new Date().getFullYear() : 2026} VoteBD.{" "}
            {locale === "bn"
              ? "সর্বস্বত্ব সংরক্ষিত। বাংলাদেশের শিক্ষার্থী ও সংগঠনের জন্য নিবেদিত।"
              : "All rights reserved. Dedicated to communities & students of Bangladesh."}
          </div>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-[#F42A41] fill-current" />
            <span>for Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
