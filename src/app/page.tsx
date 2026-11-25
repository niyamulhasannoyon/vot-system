"use client";

import React, { useId, useState } from "react";
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
  QrCode,
  Lock,
  ChevronDown,
  Play,
  FileCheck2,
  BookOpen,
  Award,
  Feather,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const joinInputId = useId();

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
    <div className="flex flex-col w-full bg-white dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="py-12 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <p className="inline-flex items-center justify-center lg:justify-start gap-2 text-xs font-medium text-[#006A4E] dark:text-[#34D399]">
              <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>{t("heroBadge")}</span>
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight leading-[1.15]">
              {t("heroTitle")}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t("heroSubtitle")}
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Link href="/elections/create" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  <Vote className="w-4 h-4" strokeWidth={1.75} />
                  <span>{t("heroCtaCreate")}</span>
                </Button>
              </Link>

              <Link href="/vote" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <QrCode className="w-4 h-4 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
                  <span>{t("heroCtaJoin")}</span>
                </Button>
              </Link>
            </div>

            {/* Live Demo Sandbox Card */}
            <div>
              <Link
                href="/vote/CR-2024"
                className="inline-flex items-center gap-3 p-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#121721] hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-white/20 transition-colors text-xs text-slate-800 dark:text-slate-200 group"
              >
                <div className="w-6 h-6 rounded-full bg-[#006A4E] text-white flex items-center justify-center shrink-0">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">{t("heroTryDemo")}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {locale === "bn"
                      ? "কোড: CR-2024 • সরাসরি ব্যালট ও রসিদ যাচাই করুন"
                      : "Code: CR-2024 • Test live ballot & verification seal"}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:text-[#006A4E] dark:group-hover:text-[#34D399] transition-colors shrink-0" />
              </Link>
            </div>

            {/* 3 Confidence Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-white/10 text-left">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#006A4E] dark:text-[#34D399] shrink-0" strokeWidth={1.75} />
                  <span>{t("heroTrustStat1")}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  {t("heroTrustStat1Sub")}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#006A4E] dark:text-[#34D399] shrink-0" strokeWidth={1.75} />
                  <span>{t("heroTrustStat2")}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  {t("heroTrustStat2Sub")}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#006A4E] dark:text-[#34D399] shrink-0" strokeWidth={1.75} />
                  <span>{t("heroTrustStat3")}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  {t("heroTrustStat3Sub")}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Tangible Device Ballot Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              className="w-full max-w-[340px] rounded-3xl bg-slate-900 p-3 shadow-xl border border-slate-800"
              aria-label={t("heroMockupCaption")}
            >
              <div className="w-20 h-3.5 bg-slate-950 rounded-full mx-auto mb-2.5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
              </div>

              <div className="bg-white dark:bg-[#121721] rounded-2xl p-4 border border-slate-200 dark:border-white/10 space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      {locale === "bn" ? "লাইভ ব্যালট" : "Live ballot"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-400 tabular-nums">
                    CR-2024
                  </span>
                </div>

                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-white">
                    {locale === "bn" ? "দশম শ্রেণি সিআর নির্বাচন ২০২৪" : "Class 10 CR Election 2024"}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {locale === "bn" ? "আপনার পছন্দের প্রার্থী নির্বাচন করুন" : "Select your candidate"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-[#006A4E] dark:border-[#10B981] bg-emerald-50/60 dark:bg-emerald-950/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center shrink-0">
                        <BookOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {locale === "bn" ? "সাদিয়া জাহান" : "Sadia Jahan"}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {locale === "bn" ? "রোল ০৩ • বই প্রতীক" : "Roll 03 • Book symbol"}
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#006A4E] dark:text-[#34D399] shrink-0" />
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                        <Award className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {locale === "bn" ? "তানভীর আহমেদ" : "Tanvir Ahmed"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {locale === "bn" ? "রোল ০১ • ফুটবল প্রতীক" : "Roll 01 • Football symbol"}
                        </div>
                      </div>
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700" />
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                        <Feather className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {locale === "bn" ? "মারুফ হোসেন" : "Maruf Hossain"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {locale === "bn" ? "রোল ০৭ • কবুতর প্রতীক" : "Roll 07 • Dove symbol"}
                        </div>
                      </div>
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700" />
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  <div className="w-full py-2.5 rounded-xl bg-[#006A4E] text-white text-xs font-medium text-center flex items-center justify-center gap-1.5">
                    <span>{locale === "bn" ? "ভোট নিশ্চিত করুন" : "Confirm Vote"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <div className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{locale === "bn" ? "গোপন ব্যালট দ্বারা সুরক্ষিত" : "Protected by secret ballot"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Join Code Bar */}
      <section className="bg-slate-50 dark:bg-[#121721]/50 py-8 border-y border-slate-200 dark:border-white/[0.08]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <form
            onSubmit={handleJoinSubmit}
            className="flex flex-col sm:flex-row items-center gap-2.5 bg-white dark:bg-[#121721] p-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs focus-within:border-[#006A4E] dark:focus-within:border-[#10B981] transition-colors"
          >
            <label htmlFor={joinInputId} className="visually-hidden">
              {t("joinBoxTitle")}
            </label>
            <div className="flex-1 w-full flex items-center gap-2.5 px-3">
              <QrCode className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              <input
                id={joinInputId}
                name="joinCode"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                enterKeyHint="go"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                placeholder={t("joinBoxPlaceholder")}
                className="w-full min-h-[38px] bg-transparent border-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 placeholder:normal-case placeholder:tracking-normal font-mono tracking-wider uppercase"
              />
            </div>
            <Button type="submit" size="sm" className="w-full sm:w-auto shrink-0 px-5">
              {t("joinBoxButton")}
            </Button>
          </form>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2.5">
            {t("joinBoxHelper")}
          </p>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("pillarsTitle")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
            {t("pillarsSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center">
              <Lock className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t("pillar1Title")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("pillar1Desc")}
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center">
              <Smartphone className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t("pillar2Title")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("pillar2Desc")}
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t("pillar3Title")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("pillar3Desc")}
            </p>
          </Card>
        </div>
      </section>

      {/* How it Works (4 Steps) */}
      <section className="py-16 md:py-20 bg-slate-50/70 dark:bg-[#121721]/40 border-y border-slate-200 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {t("howItWorksTitle")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
              {t("howItWorksSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { code: "01", title: t("step1Title"), desc: t("step1Desc") },
              { code: "02", title: t("step2Title"), desc: t("step2Desc") },
              { code: "03", title: t("step3Title"), desc: t("step3Desc") },
              { code: "04", title: t("step4Title"), desc: t("step4Desc") },
            ].map((item) => (
              <div
                key={item.code}
                className="p-6 rounded-2xl bg-white dark:bg-[#121721] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-xs"
              >
                <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-[#006A4E] dark:bg-emerald-950/60 dark:text-emerald-300 inline-block tabular-nums">
                  {item.code}
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("useCasesTitle")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
            {locale === "bn"
              ? "বাংলাদেশের বিভিন্ন প্রাতিষ্ঠানিক ক্ষেত্রের জন্য বিশেষভাবে উপযোগী।"
              : "Tailored for the real organizational structure of Bangladesh."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("useCase1Title")}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("useCase1Desc")}
            </p>
          </Card>

          <Card className="p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Users className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("useCase2Title")}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("useCase2Desc")}
            </p>
          </Card>

          <Card className="p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Building2 className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("useCase3Title")}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("useCase3Desc")}
            </p>
          </Card>

          <Card className="p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Vote className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("useCase4Title")}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("useCase4Desc")}
            </p>
          </Card>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 md:py-20 bg-slate-50/70 dark:bg-[#121721]/40 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight text-center mb-10">
            {t("faqTitle")}
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              const panelId = `faq-panel-${idx}`;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#121721] border border-slate-200 dark:border-white/[0.08] rounded-xl overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between font-medium text-slate-900 dark:text-slate-100 hover:text-[#006A4E] dark:hover:text-[#34D399] transition-colors"
                  >
                    <span className="text-sm sm:text-base pr-4 font-semibold">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#006A4E] dark:text-[#34D399]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/[0.06] pt-3"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Callout Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-2xl bg-[#006A4E] text-white p-8 sm:p-12 text-center border border-emerald-700/60 shadow-sm">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {locale === "bn"
                ? "আপনার পরবর্তী নির্বাচন আজই শুরু করুন"
                : "Host your next election in minutes"}
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              {locale === "bn"
                ? "মাত্র ২ মিনিটে তৈরি করুন, ভোটারদের কোড দিন এবং স্বচ্ছ ফলাফল উপভোগ করুন।"
                : "Create in 2 minutes, invite your class or community, and view tamper-proof results."}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/elections/create" className="w-full sm:w-auto">
                <Button
                  size="md"
                  className="w-full sm:w-auto bg-white text-[#006A4E] hover:bg-slate-100 font-semibold"
                >
                  {t("heroCtaCreate")}
                </Button>
              </Link>
              <Link href="/vote/CR-2024" className="w-full sm:w-auto">
                <Button
                  size="md"
                  variant="outline"
                  className="w-full sm:w-auto border-emerald-300/60 text-white hover:bg-emerald-700/50"
                >
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
