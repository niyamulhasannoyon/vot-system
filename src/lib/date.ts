/**
 * Utility helpers for Bangladesh Standard Time (BST, UTC+6) and Bengali numerals.
 */

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBengaliNumber(val: number | string | null | undefined): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)]);
}

export function formatNumberWithLocale(
  val: number | string,
  useBengaliNumerals: boolean
): string {
  if (useBengaliNumerals) {
    return toBengaliNumber(val);
  }
  return String(val);
}

/**
 * Formats a Date into `YYYY-MM-DDTHH:mm` strictly in Asia/Dhaka (UTC+6)
 * for `<input type="datetime-local">` controls.
 */
export function formatDhakaDateTimeLocal(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

/**
 * Parses a `YYYY-MM-DDTHH:mm` datetime-local string explicitly as Asia/Dhaka (UTC+6).
 */
export function parseDhakaDateTimeLocal(value: string): Date {
  const trimmed = value.trim();
  if (!trimmed) return new Date(NaN);
  // If already contains timezone offset or Z, parse directly
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }
  const normalized = trimmed.length === 16 ? `${trimmed}:00` : trimmed;
  return new Date(`${normalized}+06:00`);
}

/**
 * Formats a Date object or ISO string in BST (Asia/Dhaka).
 */
export function formatBST(
  date: Date | string,
  options: {
    locale?: "bn" | "en";
    useBengaliNumerals?: boolean;
    includeTime?: boolean;
    short?: boolean;
  } = {}
): string {
  const {
    locale = "bn",
    useBengaliNumerals = true,
    includeTime = true,
    short = false,
  } = options;

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const timeZone = "Asia/Dhaka";

  const dateOpts: Intl.DateTimeFormatOptions = {
    timeZone,
    day: "numeric",
    month: short ? "short" : "long",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }
      : {}),
  };

  try {
    let formatted = new Intl.DateTimeFormat(
      locale === "bn" ? "bn-BD" : "en-US",
      dateOpts
    ).format(d);

    if (locale === "bn" && !useBengaliNumerals) {
      formatted = formatted.replace(/[০-৯]/g, (char) =>
        String(BENGALI_DIGITS.indexOf(char))
      );
    } else if (locale === "en" && useBengaliNumerals) {
      formatted = toBengaliNumber(formatted);
    }

    return formatted;
  } catch {
    return d.toLocaleString("en-US", { timeZone });
  }
}

/**
 * Calculates remaining time until a date and formats nicely.
 */
export function getTimeRemaining(
  targetDate: Date | string,
  locale: "bn" | "en" = "bn",
  useBengaliNumerals = true
): {
  isEnded: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  label: string;
} {
  const target = typeof targetDate === "string" ? new Date(targetDate).getTime() : targetDate.getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return {
      isEnded: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      label: locale === "bn" ? "ভোটগ্রহণ সমাপ্ত" : "Voting ended",
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  let label = "";
  if (locale === "bn") {
    if (days > 0) {
      label = `${formatNumberWithLocale(days, useBengaliNumerals)} দিন ${formatNumberWithLocale(hours, useBengaliNumerals)} ঘণ্টা বাকি`;
    } else if (hours > 0) {
      label = `${formatNumberWithLocale(hours, useBengaliNumerals)} ঘণ্টা ${formatNumberWithLocale(minutes, useBengaliNumerals)} মিনিট বাকি`;
    } else {
      label = `${formatNumberWithLocale(minutes, useBengaliNumerals)} মিনিট ${formatNumberWithLocale(seconds, useBengaliNumerals)} সেকেন্ড বাকি`;
    }
  } else {
    if (days > 0) {
      label = `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      label = `${hours}h ${minutes}m remaining`;
    } else {
      label = `${minutes}m ${seconds}s remaining`;
    }
  }

  return { isEnded: false, days, hours, minutes, seconds, label };
}
