"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, Locale } from "./translations";
import { toBengaliNumber, formatBST } from "@/lib/date";

type TranslationKey = keyof typeof translations.en;
export type ThemeMode = "light" | "dark" | "system";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  useBengaliNumerals: boolean;
  setUseBengaliNumerals: (val: boolean | ((prev: boolean) => boolean)) => void;
  fontSize: "normal" | "large" | "xlarge";
  setFontSize: (size: "normal" | "large" | "xlarge") => void;
  highContrast: boolean;
  setHighContrast: (val: boolean | ((prev: boolean) => boolean)) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  t: (key: TranslationKey) => string;
  formatNum: (val: number | string | null | undefined) => string;
  formatDate: (
    date: Date | string,
    options?: { includeTime?: boolean; short?: boolean }
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [useBengaliNumerals, setUseBengaliNumeralsState] = useState<boolean>(false);
  const [fontSize, setFontSizeState] = useState<"normal" | "large" | "xlarge">("normal");
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem("votebd_locale") as Locale;
      if (savedLocale === "bn" || savedLocale === "en") {
        setLocaleState(savedLocale);
      }

      const savedNumerals = localStorage.getItem("votebd_bangla_numerals");
      if (savedNumerals !== null) {
        setUseBengaliNumeralsState(savedNumerals === "true");
      }

      const savedFontSize = localStorage.getItem("votebd_fontsize") as "normal" | "large" | "xlarge";
      if (savedFontSize) {
        setFontSizeState(savedFontSize);
        applyFontSize(savedFontSize);
      }

      const savedContrast = localStorage.getItem("votebd_high_contrast");
      if (savedContrast !== null) {
        const hc = savedContrast === "true";
        setHighContrastState(hc);
        if (hc) document.documentElement.classList.add("high-contrast");
      }

      const savedTheme = localStorage.getItem("votebd_theme") as ThemeMode;
      const initialTheme = savedTheme || "light";
      setThemeState(initialTheme);
      applyTheme(initialTheme);
    } catch {
      // LocalStorage unavailable in SSR
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = mode === "dark" || (mode === "system" && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const applyFontSize = (size: "normal" | "large" | "xlarge") => {
    if (size === "large") {
      document.documentElement.style.fontSize = "18px";
    } else if (size === "xlarge") {
      document.documentElement.style.fontSize = "20px";
    } else {
      document.documentElement.style.fontSize = "16px";
    }
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("votebd_theme", newTheme);
    } catch {}
    applyTheme(newTheme);
  };

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("votebd_locale", newLocale);
      if (newLocale === "bn") {
        setUseBengaliNumeralsState(true);
        localStorage.setItem("votebd_bangla_numerals", "true");
      } else {
        setUseBengaliNumeralsState(false);
        localStorage.setItem("votebd_bangla_numerals", "false");
      }
    } catch {}
  };

  const setUseBengaliNumerals = (
    val: boolean | ((prev: boolean) => boolean)
  ) => {
    setUseBengaliNumeralsState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      try {
        localStorage.setItem("votebd_bangla_numerals", String(next));
      } catch {}
      return next;
    });
  };

  const setFontSize = (size: "normal" | "large" | "xlarge") => {
    setFontSizeState(size);
    try {
      localStorage.setItem("votebd_fontsize", size);
    } catch {}
    applyFontSize(size);
  };

  const setHighContrast = (
    val: boolean | ((prev: boolean) => boolean)
  ) => {
    setHighContrastState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      try {
        localStorage.setItem("votebd_high_contrast", String(next));
      } catch {}
      if (next) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
      return next;
    });
  };

  const t = (key: TranslationKey): string => {
    const dict = translations[locale] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  const formatNum = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined) return "";
    if (useBengaliNumerals) {
      return toBengaliNumber(val);
    }
    return String(val);
  };

  const formatDate = (
    date: Date | string,
    options?: { includeTime?: boolean; short?: boolean }
  ): string => {
    return formatBST(date, {
      locale,
      useBengaliNumerals,
      includeTime: options?.includeTime ?? true,
      short: options?.short ?? false,
    });
  };

  return (
    <LanguageContext.Provider
      value={{
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
        formatNum,
        formatDate,
      }}
    >
      <div className="min-h-screen transition-colors duration-200">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
