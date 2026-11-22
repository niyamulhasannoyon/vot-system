"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, Locale } from "./translations";
import { toBengaliNumber, formatBST } from "@/lib/date";

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  useBengaliNumerals: boolean;
  setUseBengaliNumerals: (val: boolean | ((prev: boolean) => boolean)) => void;
  fontSize: "normal" | "large" | "xlarge";
  setFontSize: (size: "normal" | "large" | "xlarge") => void;
  highContrast: boolean;
  setHighContrast: (val: boolean | ((prev: boolean) => boolean)) => void;
  t: (key: TranslationKey) => string;
  formatNum: (val: number | string | null | undefined) => string;
  formatDate: (
    date: Date | string,
    options?: { includeTime?: boolean; short?: boolean }
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English ("en") as requested for full professional institutional use
  const [locale, setLocaleState] = useState<Locale>("en");
  const [useBengaliNumerals, setUseBengaliNumeralsState] = useState<boolean>(false);
  const [fontSize, setFontSizeState] = useState<"normal" | "large" | "xlarge">("normal");
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem("votebd_locale") as Locale;
      if (savedLocale === "bn" || savedLocale === "en") {
        setLocaleState(savedLocale);
      } else {
        setLocaleState("en");
        localStorage.setItem("votebd_locale", "en");
      }

      const savedNumerals = localStorage.getItem("votebd_bangla_numerals");
      if (savedNumerals !== null) {
        setUseBengaliNumeralsState(savedNumerals === "true");
      } else {
        setUseBengaliNumeralsState(false);
      }

      const savedFontSize = localStorage.getItem("votebd_fontsize") as "normal" | "large" | "xlarge";
      if (savedFontSize) {
        setFontSizeState(savedFontSize);
      }

      const savedContrast = localStorage.getItem("votebd_high_contrast");
      if (savedContrast !== null) {
        setHighContrastState(savedContrast === "true");
      }
    } catch {
      // LocalStorage unavailable in SSR or private mode
    }
    setMounted(true);
  }, []);

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
  };

  const setHighContrast = (
    val: boolean | ((prev: boolean) => boolean)
  ) => {
    setHighContrastState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      try {
        localStorage.setItem("votebd_high_contrast", String(next));
      } catch {}
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
        t,
        formatNum,
        formatDate,
      }}
    >
      <div
        className={`min-h-screen transition-colors duration-200 ${
          highContrast ? "high-contrast" : ""
        } ${
          fontSize === "large"
            ? "text-[1.075rem]"
            : fontSize === "xlarge"
            ? "text-[1.175rem]"
            : ""
        }`}
      >
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
