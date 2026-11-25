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
import { useLanguage, ThemeMode, FontSizeMode } from "@/i18n/LanguageContext";
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
    if (a11yMenuOpen || mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [a11yMenuOpen, mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: t("navHome") },
    { href: "/vote", label: t("navJoin"), icon: Vote },
    { href: "/verify", label: t("navVerify"), icon: ShieldCheck },
  ];

  const themeOptions: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: "light", label: t("themeLight"), icon: Sun },
    { id: "dark", label: t("themeDark"), icon: Moon },
    { id: "system", label: t("themeSystem"), icon: Monitor },
  ];

  const fontSizeOptions: { size: FontSizeMode; label: string }[] = [
    { size: "normal", label: "A (100%)" },
    { size: "large", label: "A+ (112%)" },
    { size: "xlarge", label: "A++ (125%)" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0B0E14]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#006A4E] flex items-center justify-center text-white relative shrink-0">
            <Vote className="w-5 h-5" strokeWidth={1.75} />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F42A41] ring-2 ring-white dark:ring-[#0B0E14]"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-tight whitespace-nowrap">
              {locale === "bn" ? "ভোটবিডি" : "VoteBD"}
            </span>
            <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight whitespace-nowrap">
              {locale === "bn" ? "স্বচ্ছ ও নিরাপদ ভোটিং" : "Secure Institutional Voting"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-1 shrink-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800/80 text-[#006A4E] dark:text-[#34D399]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
            className="h-9 flex items-center gap-1.5 px-2.5 sm:px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121721] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors"
            title={locale === "bn" ? "Switch to English" : "বাংলা ভাষায় পরিবর্তন করুন"}
            aria-label={locale === "bn" ? "Switch language to English" : "Switch language to Bangla"}
          >
            <Globe className="w-3.5 h-3.5 text-[#006A4E] dark:text-[#34D399] shrink-0" strokeWidth={1.75} />
            <span>{locale === "bn" ? "English" : "বাংলা"}</span>
          </button>

          {/* Quick Theme Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121721] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
            )}
          </button>

          {/* Accessibility Settings Menu (Desktop / Tablet; Mobile uses drawer) */}
          <div className="relative hidden sm:block" ref={menuRef}>
            <button
              type="button"
              onClick={() => setA11yMenuOpen(!a11yMenuOpen)}
              className={`h-9 w-9 flex items-center justify-center rounded-lg border transition-colors ${
                a11yMenuOpen
                  ? "border-[#006A4E] bg-emerald-50 text-[#006A4E] dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700"
                  : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#121721] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
              title={t("a11yTitle")}
              aria-label={t("a11yTitle")}
              aria-expanded={a11yMenuOpen}
            >
              <Settings2 className="w-4 h-4" strokeWidth={1.75} />
            </button>

            {a11yMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#121721] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-3.5 text-xs z-50 animate-fade-in"
                role="dialog"
                aria-label={t("a11yTitle")}
              >
                <div className="font-semibold text-slate-900 dark:text-white pb-2 mb-2.5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <span>{t("a11yTitle")}</span>
                  <button
                    type="button"
                    onClick={() => setA11yMenuOpen(false)}
                    aria-label="Close settings"
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
                    {themeOptions.map((item) => {
                      const Icon = item.icon;
                      const selected = theme === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTheme(item.id)}
                          className={`py-1.5 px-2 rounded-lg text-center font-medium border flex items-center justify-center gap-1 transition-colors ${
                            selected
                              ? "bg-[#006A4E] text-white border-[#006A4E]"
                              : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                    {locale === "bn" ? "অক্ষরের আকার (Text Size)" : "Text size"}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {fontSizeOptions.map((item) => (
                      <button
                        key={item.size}
                        type="button"
                        onClick={() => setFontSize(item.size)}
                        className={`py-1.5 rounded-lg text-center font-medium border transition-colors ${
                          fontSize === item.size
                            ? "bg-[#006A4E] text-white border-[#006A4E]"
                            : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bengali Numerals */}
                <div className="mb-2.5">
                  <button
                    type="button"
                    onClick={() => setUseBengaliNumerals(!useBengaliNumerals)}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium text-slate-800 dark:text-slate-200 transition-colors"
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
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium text-slate-800 dark:text-slate-200 transition-colors"
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
          <Link href="/elections/create" className="hidden md:inline-flex shrink-0">
            <Button size="sm" variant="primary" className="h-9 px-3.5 gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{t("navCreate")}</span>
            </Button>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 shrink-0"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#121721] border-b border-slate-200 dark:border-white/10 px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-lg">
          <nav aria-label="Mobile" className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#EBF7F2] dark:bg-[#064E3B]/30 text-[#006A4E] dark:text-[#34D399]"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-[#006A4E] dark:text-[#34D399]" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Accessibility Options */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2.5 text-xs">
            <div className="font-medium text-slate-500 dark:text-slate-400">
              {t("a11yTitle")}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {fontSizeOptions.map((item) => (
                <button
                  key={item.size}
                  type="button"
                  onClick={() => setFontSize(item.size)}
                  className={`py-1.5 rounded-lg text-center font-medium border transition-colors ${
                    fontSize === item.size
                      ? "bg-[#006A4E] text-white border-[#006A4E]"
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setUseBengaliNumerals(!useBengaliNumerals)}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
              >
                <span>{useBengaliNumerals ? "১২৩৪" : "1234"}</span>
                <span className="text-[#006A4E] dark:text-[#34D399] font-medium">
                  {useBengaliNumerals ? "BN" : "EN"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
              >
                <span className="flex items-center gap-1">
                  <Contrast className="w-3.5 h-3.5" />
                  <span>{locale === "bn" ? "কনট্রাস্ট" : "Contrast"}</span>
                </span>
                <span className="text-[#006A4E] dark:text-[#34D399] font-medium">
                  {highContrast ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/10">
            <Link
              href="/elections/create"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full block"
            >
              <Button size="md" className="w-full">
                <PlusCircle className="w-4 h-4" />
                <span>{t("navCreate")}</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
