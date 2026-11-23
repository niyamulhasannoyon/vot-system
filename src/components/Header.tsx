"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Contrast,
  Check,
  Sun,
  Moon,
  Monitor,
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
    theme,
    setTheme,
    isDark,
    t,
  } = useLanguage();

  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [a11yMenuOpen, setA11yMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setA11yMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setA11yMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }
    if (a11yMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [a11yMenuOpen]);

  const navLinks = [
    { href: "/", label: t("navHome") },
    { href: "/vote", label: t("navJoin"), icon: Vote },
    { href: "/verify", label: t("navVerify"), icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#006A4E] flex items-center justify-center text-white relative shadow-sm transition-transform group-hover:scale-105">
            <Vote className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F42A41] ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
              VoteBD
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-[#006A4E] dark:bg-emerald-950/80 dark:text-emerald-300">
                {locale === "bn" ? "বাংলাদেশ" : "Bangladesh"}
              </span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
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
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-[#006A4E] dark:text-[#34D399] font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
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
            type="button"
            onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
            className="h-9 flex items-center gap-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            title={locale === "bn" ? "Switch to English" : "বাংলা ভাষায় পরিবর্তন করুন"}
            aria-label="Toggle language between Bangla and English"
          >
            <Globe className="w-3.5 h-3.5 text-[#006A4E] dark:text-[#34D399]" />
            <span>{locale === "bn" ? "English" : "বাংলা"}</span>
          </button>

          {/* Quick Theme Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle color theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Accessibility Settings Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setA11yMenuOpen(!a11yMenuOpen)}
              className={`h-9 w-9 flex items-center justify-center rounded-lg border transition-colors ${
                a11yMenuOpen
                  ? "border-[#006A4E] bg-emerald-50 text-[#006A4E] dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
              title={t("a11yTitle")}
              aria-label="Accessibility options"
              aria-expanded={a11yMenuOpen}
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* A11y Dropdown */}
            {a11yMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3.5 text-xs z-50 animate-fade-in"
                role="dialog"
                aria-label="Accessibility settings"
              >
                <div className="font-semibold text-slate-900 dark:text-white pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>{t("a11yTitle")}</span>
                  <button
                    type="button"
                    onClick={() => setA11yMenuOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Theme Selector */}
                <div className="mb-3">
                  <div className="text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                    {t("themeTitle")}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "light", label: t("themeLight"), icon: Sun },
                      { id: "dark", label: t("themeDark"), icon: Moon },
                      { id: "system", label: t("themeSystem"), icon: Monitor },
                    ].map((item) => {
                      const Icon = item.icon;
                      const selected = theme === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTheme(item.id as any)}
                          className={`py-1.5 px-2 rounded-lg text-center font-medium border flex items-center justify-center gap-1 transition-colors ${
                            selected
                              ? "bg-[#006A4E] text-white border-[#006A4E]"
                              : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Size */}
                <div className="mb-3">
                  <div className="text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                    {locale === "bn" ? "অক্ষরের আকার (Text Size)" : "Text Size"}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { size: "normal", label: "A (100%)" },
                      { size: "large", label: "A+ (112%)" },
                      { size: "xlarge", label: "A++ (125%)" },
                    ].map((item) => (
                      <button
                        key={item.size}
                        type="button"
                        onClick={() => setFontSize(item.size as any)}
                        className={`py-1.5 rounded-lg text-center font-medium border transition-colors ${
                          fontSize === item.size
                            ? "bg-[#006A4E] text-white border-[#006A4E]"
                            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bengali Numerals */}
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => setUseBengaliNumerals(!useBengaliNumerals)}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <span>
                      {useBengaliNumerals ? t("numeralBangla") : t("numeralEnglish")}
                    </span>
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        useBengaliNumerals
                          ? "bg-[#006A4E] border-[#006A4E] text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {useBengaliNumerals && <Check className="w-3 h-3" />}
                    </span>
                  </button>
                </div>

                {/* High Contrast */}
                <div>
                  <button
                    type="button"
                    onClick={() => setHighContrast(!highContrast)}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Contrast className="w-3.5 h-3.5 text-[#006A4E] dark:text-[#34D399]" />
                      {highContrast ? t("highContrastOn") : t("highContrastOff")}
                    </span>
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        highContrast
                          ? "bg-[#006A4E] border-[#006A4E] text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {highContrast && <Check className="w-3 h-3" />}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA in Header */}
          <Link href="/elections/create" className="hidden sm:inline-flex">
            <Button size="sm" variant="primary" className="h-9 px-3.5 gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t("navCreate")}</span>
            </Button>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            aria-label="Open mobile navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-lg">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#EBF7F2] dark:bg-[#064E3B]/30 text-[#006A4E] dark:text-[#34D399] font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-[#006A4E] dark:text-[#34D399]" />}
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
              <Button size="md" className="w-full gap-2">
                <PlusCircle className="w-4 h-4" />
                {t("navCreate")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
