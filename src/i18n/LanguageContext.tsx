"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { translations, Locale } from "./translations";
import { toBengaliNumber, formatBST } from "@/lib/date";

type TranslationKey = keyof typeof translations.en;
export type ThemeMode = "light" | "dark" | "system";
export type FontSizeMode = "normal" | "large" | "xlarge";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  useBengaliNumerals: boolean;
  setUseBengaliNumerals: (val: boolean | ((prev: boolean) => boolean)) => void;
  fontSize: FontSizeMode;
  setFontSize: (size: FontSizeMode) => void;
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

const emptySubscribe = () => () => {};

function subscribeSystemDark(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyThemeToDom(mode: ThemeMode, systemDark: boolean): boolean {
  const shouldBeDark = mode === "dark" || (mode === "system" && systemDark);
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", shouldBeDark);
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute("content", mode === "system" ? "light dark" : mode);
    }
  }
  return shouldBeDark;
}

function applyFontSizeToDom(size: FontSizeMode): void {
  if (typeof document === "undefined") return;
  if (size === "large") {
    document.documentElement.style.fontSize = "18px";
  } else if (size === "xlarge") {
    document.documentElement.style.fontSize = "20px";
  } else {
    document.documentElement.style.fontSize = "16px";
  }
}

function applyHighContrastToDom(enabled: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("high-contrast", enabled);
}

function subscribeStorage(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const val = localStorage.getItem("votebd_locale");
    return val === "bn" || val === "en" ? val : "en";
  } catch {
    return "en";
  }
}

function readStoredNumerals(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("votebd_bangla_numerals") === "true";
  } catch {
    return false;
  }
}

function readStoredFontSize(): FontSizeMode {
  if (typeof window === "undefined") return "normal";
  try {
    const val = localStorage.getItem("votebd_fontsize");
    return val === "large" || val === "xlarge" ? val : "normal";
  } catch {
    return "normal";
  }
}

function readStoredContrast(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("votebd_high_contrast") === "true";
  } catch {
    return false;
  }
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const val = localStorage.getItem("votebd_theme");
    return val === "dark" || val === "system" || val === "light" ? val : "light";
  } catch {
    return "light";
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [, setVersion] = useState(0);

  const locale = useSyncExternalStore(
    subscribeStorage,
    readStoredLocale,
    () => "en" as Locale
  );
  const useBengaliNumerals = useSyncExternalStore(
    subscribeStorage,
    readStoredNumerals,
    () => false
  );
  const fontSize = useSyncExternalStore(
    subscribeStorage,
    readStoredFontSize,
    () => "normal" as FontSizeMode
  );
  const highContrast = useSyncExternalStore(
    subscribeStorage,
    readStoredContrast,
    () => false
  );
  const theme = useSyncExternalStore(
    subscribeStorage,
    readStoredTheme,
    () => "light" as ThemeMode
  );
  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDark,
    () => false
  );
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = isHydrated
    ? theme === "dark" || (theme === "system" && systemDark)
    : false;

  // Re-apply DOM classes before paint (including React StrictMode dev remounts)
  useLayoutEffect(() => {
    applyThemeToDom(theme, systemDark);
    applyFontSizeToDom(fontSize);
    applyHighContrastToDom(highContrast);
  }, [theme, systemDark, fontSize, highContrast]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const bump = () => setVersion((v) => v + 1);

  const setTheme = (newTheme: ThemeMode) => {
    try {
      localStorage.setItem("votebd_theme", newTheme);
    } catch {
      // Ignore storage errors
    }
    applyThemeToDom(newTheme, getSystemDark());
    bump();
  };

  const setLocale = (newLocale: Locale) => {
    try {
      localStorage.setItem("votebd_locale", newLocale);
      localStorage.setItem(
        "votebd_bangla_numerals",
        newLocale === "bn" ? "true" : "false"
      );
    } catch {
      // Ignore storage errors
    }
    bump();
  };

  const setUseBengaliNumerals = (
    val: boolean | ((prev: boolean) => boolean)
  ) => {
    const current = readStoredNumerals();
    const next = typeof val === "function" ? val(current) : val;
    try {
      localStorage.setItem("votebd_bangla_numerals", String(next));
    } catch {
      // Ignore storage errors
    }
    bump();
  };

  const setFontSize = (size: FontSizeMode) => {
    try {
      localStorage.setItem("votebd_fontsize", size);
    } catch {
      // Ignore storage errors
    }
    applyFontSizeToDom(size);
    bump();
  };

  const setHighContrast = (val: boolean | ((prev: boolean) => boolean)) => {
    const current = readStoredContrast();
    const next = typeof val === "function" ? val(current) : val;
    try {
      localStorage.setItem("votebd_high_contrast", String(next));
    } catch {
      // Ignore storage errors
    }
    applyHighContrastToDom(next);
    bump();
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
