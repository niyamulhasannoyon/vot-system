"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Settings2,
  Menu,
  X,
  Vote,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Contrast,
  Check,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "./ui/Button";

export function Header() {
  const {
    locale,
    setLocale,
    useBengaliNumerals,
    setUseBengaliNumerals,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    t,
  } = useLanguage();

  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [a11yMenuOpen, setA11yMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("navHome") },
    { href: "/elections/create", label: t("navCreate"), icon: PlusCircle },
    { href: "/vote", label: t("navJoin"), icon: Vote },
    { href: "/verify", label: t("navVerify"), icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#006A4E] flex items-center justify-center text-white relative shadow-sm group-hover:scale-105 transition-transform">
            <Vote className="w-5 h-5" />
            {/* Subtle red circle dot inspired by BD flag */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F42A41] ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              VoteBD
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-[#006A4E] dark:bg-emerald-950/80 dark:text-emerald-300">
                {locale === "bn" ? "বাংলাদেশ" : "Bangladesh"}
              </span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 -mt-1 font-medium">
              {locale === "bn" ? "ভোটবিডি • সহজ ও নিরাপদ" : "Secure Institutional Voting"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#EBF7F2] dark:bg-[#064E3B]/40 text-[#006A4E] dark:text-[#34D399]"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Button */}
          <button
            onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            title="Toggle Language / ভাষা পরিবর্তন"
            aria-label="Toggle language between Bangla and English"
          >
            <Globe className="w-3.5 h-3.5 text-[#006A4E]" />
            <span>{locale === "bn" ? "English" : "বাংলা"}</span>
          </button>

          {/* Bengali Numerals Quick Toggle */}
          <button
            onClick={() => setUseBengaliNumerals(!useBengaliNumerals)}
            className={`hidden sm:flex items-center px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              useBengaliNumerals
                ? "border-[#006A4E]/30 bg-[#EBF7F2] dark:bg-[#064E3B]/30 text-[#006A4E] dark:text-[#34D399]"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
            title="Toggle Bangla Numerals / বাংলা সংখ্যা টগল"
            aria-label="Toggle Bengali numerals"
          >
            {useBengaliNumerals ? "১২৩৪" : "1234"}
          </button>

          {/* Accessibility Settings Menu */}
          <div className="relative">
            <button
              onClick={() => setA11yMenuOpen(!a11yMenuOpen)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title={t("a11yTitle")}
              aria-label="Accessibility options"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* A11y Dropdown */}
            {a11yMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-3 text-xs z-50 animate-fade-in"
                role="dialog"
                aria-label="Accessibility settings"
              >
                <div className="font-semibold text-slate-900 dark:text-white pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>{t("a11yTitle")}</span>
                  <button
                    onClick={() => setA11yMenuOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Font Size */}
                <div className="mb-3">
                  <div className="text-slate-500 dark:text-slate-400 mb-1 font-medium">
                    {locale === "bn" ? "অক্ষরের আকার" : "Text Size"}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(["normal", "large", "xlarge"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`py-1 rounded text-center font-medium border ${
                          fontSize === size
                            ? "bg-[#006A4E] text-white border-[#006A4E]"
                            : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {size === "normal" ? "A" : size === "large" ? "A+" : "A++"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* High Contrast */}
                <div className="mb-3">
                  <button
                    onClick={() => setHighContrast(!highContrast)}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium text-slate-800 dark:text-slate-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <Contrast className="w-3.5 h-3.5" />
                      {highContrast ? t("highContrastOn") : t("highContrastOff")}
                    </span>
                    {highContrast && <Check className="w-3.5 h-3.5 text-[#006A4E]" />}
                  </button>
                </div>

                {/* Bangla Numerals in Menu */}
                <div>
                  <button
                    onClick={() => setUseBengaliNumerals(!useBengaliNumerals)}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium text-slate-800 dark:text-slate-200"
                  >
                    <span>
                      {useBengaliNumerals ? t("numeralBangla") : t("numeralEnglish")}
                    </span>
                    {useBengaliNumerals && (
                      <Check className="w-3.5 h-3.5 text-[#006A4E]" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Create CTA in Header (Desktop) */}
          <Link href="/elections/create" className="hidden lg:inline-flex">
            <Button size="sm" variant="primary">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              {t("navCreate")}
            </Button>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open mobile navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-fade-in">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? "bg-[#EBF7F2] text-[#006A4E] font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {Icon && <Icon className="w-5 h-5 text-[#006A4E]" />}
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Link
              href="/elections/create"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button size="md" className="w-full">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                {t("navCreate")}
              </Button>
            </Link>

            <Link
              href="/vote"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button size="md" variant="secondary" className="w-full">
                <Vote className="w-4 h-4 mr-1.5" />
                {t("navJoin")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
