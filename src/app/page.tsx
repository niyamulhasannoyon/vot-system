"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Users,
  GraduationCap,
  Building2,
  Vote,
  ArrowRight,
  Sparkles,
  QrCode,
  Lock,
  ChevronDown,
  Play,
  FileCheck2,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  const { locale, formatNum, t } = useLanguage();
  const router = useRouter();
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    router.push(`/vote/${encodeURIComponent(joinCodeInput.trim().toUpperCase())}`);
  };

  const faqs = [
    { q: t("faqQ1"), a: t("faqA1") },
    { q: t("faqQ2"), a: t("faqA2") },
    { q: t("faqQ3"), a: t("faqA3") },
    { q: t("faqQ4"), a: t("faqA4") },
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Subtle background decoration */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-[#006A4E]/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF7F2] dark:bg-[#064E3B]/30 border border-[#006A4E]/20 text-[#006A4E] dark:text-[#34D399] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("heroBadge")}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              {t("heroTitle")}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t("heroSubtitle")}
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link href="/elections/create" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <Vote className="w-5 h-5" />
                  {t("heroCtaCreate")}
                </Button>
              </Link>

              <Link href="/vote" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2">
                  <QrCode className="w-5 h-5 text-[#006A4E]" />
                  {t("heroCtaJoin")}
                </Button>
              </Link>
            </div>

            {/* Live Demo Sandbox One-Click Card */}
            <div className="pt-2">
              <Link
                href="/vote/CR-2024"
                className="inline-flex items-center gap-3 p-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 hover:border-[#006A4E] transition-all group"
              >
                <div className="w-6 h-6 rounded-full bg-[#006A4E] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">{t("heroTryDemo")}</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {locale === "bn"
                      ? "কোড: CR-2024 • সরাসরি ব্যালট টেস্ট করুন"
                      : "Code: CR-2024 • Test live ballot and receipt"}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform text-[#006A4E]" />
              </Link>
            </div>

            {/* 3 Confidence Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-left">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#006A4E]" />
                  {t("heroTrustStat1")}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {t("heroTrustStat1Sub")}
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
                  {t("heroTrustStat2")}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {t("heroTrustStat2Sub")}
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#006A4E]" />
                  {t("heroTrustStat3")}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {t("heroTrustStat3Sub")}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Interactive Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl ring-1 ring-slate-800">
              {/* Speaker / Camera Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>

              {/* Screen Content */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-[2rem] pt-8 pb-4 px-4 overflow-hidden border border-slate-200/50 dark:border-slate-800">
                {/* Header in Phone */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F42A41] animate-ping" />
                    <span className="text-[11px] font-bold text-[#F42A41] uppercase tracking-wider">
                      লাইভ ব্যালট
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">CR-2024</span>
                </div>

                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  দশম শ্রেণি সিআর নির্বাচন ২০২৪
                </div>
                <div className="text-[11px] text-slate-500 mb-3">
                  আপনার পছন্দের প্রার্থীকে বেছে নিন:
                </div>

                {/* Candidate Mockup Cards */}
                <div className="space-y-2 mb-4">
                  <div className="p-2.5 rounded-xl border-2 border-[#006A4E] bg-[#EBF7F2] dark:bg-[#064E3B]/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📚</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          সাদিয়া জাহান
                        </div>
                        <div className="text-[10px] text-slate-500">রোল ০৩ • বই প্রতীক</div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#006A4E]" />
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚽</span>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          তানভীর আহমেদ
                        </div>
                        <div className="text-[10px] text-slate-400">রোল ০১ • ফুটবল প্রতীক</div>
                      </div>
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🕊️</span>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          মারুফ হোসেন
                        </div>
                        <div className="text-[10px] text-slate-400">রোল ০৭ • কবুতর প্রতীক</div>
                      </div>
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                  </div>
                </div>

                {/* Confirm Mock Button */}
                <div className="pt-2">
                  <div className="w-full py-2.5 rounded-xl bg-[#006A4E] text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm">
                    ভোট নিশ্চিত করুন
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <div className="text-[10px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    গোপন ব্যালট দ্বারা সুরক্ষিত
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Join Code Bar */}
      <section className="bg-slate-100 dark:bg-slate-800/60 py-8 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <form
            onSubmit={handleJoinSubmit}
            className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex-1 w-full flex items-center gap-3 px-3">
              <QrCode className="w-5 h-5 text-[#006A4E]" />
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                placeholder={t("joinBoxPlaceholder")}
                className="w-full bg-transparent border-none focus:outline-none text-base text-slate-900 dark:text-white placeholder:text-slate-400 font-medium uppercase"
              />
            </div>
            <Button type="submit" size="md" className="w-full sm:w-auto shrink-0">
              {t("joinBoxButton")}
            </Button>
          </form>
          <p className="text-xs text-slate-500 text-center mt-2.5">
            {t("joinBoxHelper")}
          </p>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("pillarsTitle")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-base">
            {t("pillarsSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="relative overflow-hidden group hover:border-[#006A4E]/50">
            <div className="w-12 h-12 rounded-xl bg-[#EBF7F2] text-[#006A4E] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t("pillar1Title")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("pillar1Desc")}
            </p>
          </Card>

          <Card className="relative overflow-hidden group hover:border-[#006A4E]/50">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t("pillar2Title")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("pillar2Desc")}
            </p>
          </Card>

          <Card className="relative overflow-hidden group hover:border-[#006A4E]/50">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t("pillar3Title")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("pillar3Desc")}
            </p>
          </Card>
        </div>
      </section>

      {/* How it Works (4 Steps) */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("howItWorksTitle")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-base">
              {t("howItWorksSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative">
              <span className="text-3xl font-extrabold text-[#006A4E] mb-3 block">
                {formatNum(1)}
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                {t("step1Title")}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("step1Desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative">
              <span className="text-3xl font-extrabold text-[#006A4E] mb-3 block">
                {formatNum(2)}
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                {t("step2Title")}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("step2Desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative">
              <span className="text-3xl font-extrabold text-[#006A4E] mb-3 block">
                {formatNum(3)}
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                {t("step3Title")}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("step3Desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative">
              <span className="text-3xl font-extrabold text-[#006A4E] mb-3 block">
                {formatNum(4)}
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                {t("step4Title")}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("step4Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("useCasesTitle")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-base">
            {locale === "bn"
              ? "বাংলাদেশের বিভিন্ন ক্ষেত্রের জন্য বিশেষভাবে উপযোগী।"
              : "Tailored for the real organizational structure of Bangladesh."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:border-[#006A4E]/50">
            <GraduationCap className="w-8 h-8 text-[#006A4E] mb-3" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t("useCase1Title")}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("useCase1Desc")}
            </p>
          </Card>

          <Card className="hover:border-[#006A4E]/50">
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t("useCase2Title")}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("useCase2Desc")}
            </p>
          </Card>

          <Card className="hover:border-[#006A4E]/50">
            <Building2 className="w-8 h-8 text-emerald-600 mb-3" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t("useCase3Title")}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("useCase3Desc")}
            </p>
          </Card>

          <Card className="hover:border-[#006A4E]/50">
            <Vote className="w-8 h-8 text-purple-600 mb-3" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t("useCase4Title")}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("useCase4Desc")}
            </p>
          </Card>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center mb-10">
            {t("faqTitle")}
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-semibold text-slate-900 dark:text-white hover:text-[#006A4E] transition-colors"
                  >
                    <span className="text-base pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-[#006A4E]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-[#006A4E] to-[#00533C] text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto relative z-10 space-y-5">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {locale === "bn"
                ? "আপনার পরবর্তী নির্বাচন আজই শুরু করুন"
                : "Host your next election in minutes"}
            </h3>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              {locale === "bn"
                ? "মাত্র ২ মিনিটে তৈরি করুন, ভোটারদের কোড দিন এবং স্বচ্ছ ফলাফল উপভোগ করুন।"
                : "Create in 2 minutes, invite your class or community, and view tamper-proof results."}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/elections/create" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-[#006A4E] hover:bg-slate-100">
                  {t("heroCtaCreate")}
                </Button>
              </Link>
              <Link href="/vote/CR-2024" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  {t("navDemo")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
