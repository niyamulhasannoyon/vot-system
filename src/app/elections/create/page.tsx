"use client";

import React, { Suspense, useId, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Vote,
  Trash2,
  Calendar,
  Lock,
  Share2,
  Copy,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Upload,
  Download,
} from "lucide-react";
import QRCode from "qrcode";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Stepper } from "@/components/ui/Stepper";
import { useToast } from "@/components/ui/Toast";
import { formatDhakaDateTimeLocal, parseDhakaDateTimeLocal } from "@/lib/date";

interface CandidateDraft {
  id: string;
  name: string;
  nameBn: string;
  symbolEmoji: string;
  bio: string;
}

const emptySubscribe = () => () => {};

function getDefaultSchedule(): { start: string; end: string } {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return {
    start: formatDhakaDateTimeLocal(now),
    end: formatDhakaDateTimeLocal(tomorrow),
  };
}

function CreateElectionContent() {
  const { locale, formatNum, t } = useLanguage();
  const toast = useToast();

  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("class");
  const [electionType, setElectionType] = useState("SINGLE");
  const [maxChoices, setMaxChoices] = useState(2);
  const [allowNota, setAllowNota] = useState(false);

  // Candidates
  const [candidates, setCandidates] = useState<CandidateDraft[]>([
    {
      id: "1",
      name: "Tanvir Ahmed",
      nameBn: "তানভীর আহমেদ",
      symbolEmoji: "⚽",
      bio: "Roll 01 • Sports & discipline",
    },
    {
      id: "2",
      name: "Sadia Jahan",
      nameBn: "সাদিয়া জাহান",
      symbolEmoji: "📚",
      bio: "Roll 03 • Academic notes coordinator",
    },
  ]);

  // Schedule & Rules (stored only on user edit; otherwise computed in BST after hydration)
  const [customStartTime, setCustomStartTime] = useState<string | null>(null);
  const [customEndTime, setCustomEndTime] = useState<string | null>(null);
  const defaultSchedule = isHydrated ? getDefaultSchedule() : { start: "", end: "" };
  const startTime = customStartTime ?? defaultSchedule.start;
  const endTime = customEndTime ?? defaultSchedule.end;

  const [resultVisibility, setResultVisibility] = useState("LIVE");
  const [adminPin, setAdminPin] = useState("");

  // Voter Access
  const [voterAccessType, setVoterAccessType] = useState("JOIN_CODE");
  const [voterListRaw, setVoterListRaw] = useState(
    "101 - Tanvir Ahmed\n102 - Sadia Jahan\n103 - Maruf Hossain\n104 - Nusrat Sharmin"
  );

  // Created Result State
  const [createdResult, setCreatedResult] = useState<{
    joinCode: string;
    slug: string;
    electionId: string;
    votersCount: number;
    qrDataUrl?: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  const descId = useId();
  const catId = useId();
  const typeId = useId();
  const maxChoicesId = useId();
  const startId = useId();
  const endId = useId();
  const visId = useId();
  const pinId = useId();
  const voterListId = useId();

  const steps = [
    { id: 1, title: t("wizardStep1") },
    { id: 2, title: t("wizardStep2") },
    { id: 3, title: t("wizardStep3") },
    { id: 4, title: t("wizardStep4") },
  ];

  const handleElectionTypeChange = (nextType: string) => {
    setElectionType(nextType);
    if (nextType === "YES_NO") {
      setCandidates([
        {
          id: "yes",
          name: "Yes",
          nameBn: "হ্যাঁ",
          symbolEmoji: "✅",
          bio: locale === "bn" ? "প্রস্তাবের পক্ষে" : "In favor",
        },
        {
          id: "no",
          name: "No",
          nameBn: "না",
          symbolEmoji: "❌",
          bio: locale === "bn" ? "প্রস্তাবের বিপক্ষে" : "Against",
        },
      ]);
    }
  };

  const addCandidate = () => {
    const emojis = ["⚽", "📚", "🕊️", "🌟", "🚢", "🌾", "🇧🇩", "🖊️", "🎓"];
    const randomEmoji = emojis[candidates.length % emojis.length];
    setCandidates([
      ...candidates,
      {
        id: `cand-${Date.now()}-${candidates.length}`,
        name: "",
        nameBn: "",
        symbolEmoji: randomEmoji,
        bio: "",
      },
    ]);
  };

  const updateCandidate = (
    id: string,
    field: keyof CandidateDraft,
    value: string
  ) => {
    setCandidates(
      candidates.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeCandidate = (id: string) => {
    if (candidates.length <= 2) {
      toast.error(
        locale === "bn"
          ? "কমপক্ষে ২টি প্রার্থী থাকতে হবে।"
          : "Minimum 2 candidates required."
      );
      return;
    }
    setCandidates(candidates.filter((c) => c.id !== id));
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const cleaned = content
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .join("\n");
        setVoterListRaw(cleaned);
        toast.success(
          locale === "bn"
            ? "ভোটার তালিকা সফলভাবে আপলোড হয়েছে"
            : "Voter roster uploaded"
        );
      }
    };
    reader.readAsText(file);
  };

  const validateStep = (current: number): boolean => {
    setError(null);
    if (current === 1) {
      if (title.trim().length < 3) {
        setError(
          locale === "bn"
            ? "নির্বাচনের শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে।"
            : "Election title must be at least 3 characters."
        );
        return false;
      }
    } else if (current === 2) {
      const validCand = candidates.filter((c) => c.name.trim().length > 0);
      if (validCand.length < 2) {
        setError(
          locale === "bn"
            ? "কমপক্ষে ২টি প্রার্থীর নাম সঠিকভাবে লিখুন।"
            : "Please enter at least 2 candidate names."
        );
        return false;
      }
    } else if (current === 3) {
      const parsedStart = parseDhakaDateTimeLocal(startTime);
      const parsedEnd = parseDhakaDateTimeLocal(endTime);
      if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
        setError(
          locale === "bn"
            ? "অনুগ্রহ করে সঠিক শুরুর এবং শেষের সময় নির্বাচন করুন।"
            : "Please select valid start and end times."
        );
        return false;
      }
      if (parsedEnd <= parsedStart) {
        setError(
          locale === "bn"
            ? "ভোট সমাপ্তির সময় শুরুর চেয়ে পরে হতে হবে।"
            : "End time must be after start time."
        );
        return false;
      }
      if (parsedEnd <= new Date()) {
        setError(
          locale === "bn"
            ? "ভোট সমাপ্তির সময় বর্তমান সময়ের পরে হতে হবে।"
            : "End time must be in the future."
        );
        return false;
      }
      if (!adminPin || adminPin.trim().length < 4) {
        setError(
          locale === "bn"
            ? "কমপক্ষে ৪ ডিজিটের একটি অ্যাডমিন পিন দিন।"
            : "Admin PIN must be at least 4 digits."
        );
        return false;
      }
    } else if (current === 4) {
      if (voterAccessType === "CODE_LIST") {
        const validVoters = voterListRaw
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        if (validVoters.length === 0) {
          setError(
            locale === "bn"
              ? "কোড তালিকা মোডের জন্য অন্তত একজন ভোটারের নাম বা রোল লিখুন।"
              : "Please enter at least 1 voter in the roster."
          );
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePublish = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const validCandidates = candidates.filter((c) => c.name.trim().length > 0);
      const startIso = parseDhakaDateTimeLocal(startTime).toISOString();
      const endIso = parseDhakaDateTimeLocal(endTime).toISOString();

      const response = await fetch("/api/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          titleBn: titleBn.trim() || title.trim(),
          description: description.trim() || undefined,
          category,
          electionType,
          maxChoices:
            electionType === "MULTIPLE"
              ? Math.min(maxChoices, validCandidates.length)
              : 1,
          allowNota,
          startTime: startIso,
          endTime: endIso,
          resultVisibility,
          adminPin: adminPin.trim(),
          voterAccessType,
          voterListRaw,
          candidates: validCandidates,
        }),
      });

      const data = (await response.json()) as {
        joinCode?: string;
        slug?: string;
        electionId?: string;
        votersCount?: number;
        error?: string;
      };
      if (!response.ok || !data.joinCode || !data.slug || !data.electionId) {
        throw new Error(data.error || "Failed to create election");
      }

      const appUrl = window.location.origin;
      const voteUrl = `${appUrl}/vote/${data.joinCode}`;
      const qrDataUrl = await QRCode.toDataURL(voteUrl, {
        width: 320,
        margin: 2,
        color: { dark: "#006A4E", light: "#FFFFFF" },
      });

      setCreatedResult({
        joinCode: data.joinCode,
        slug: data.slug,
        electionId: data.electionId,
        votersCount: data.votersCount ?? 0,
        qrDataUrl,
      });

      toast.success(t("createdSuccessTitle"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("errorGeneric");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyShareLink = async () => {
    if (!createdResult) return;
    try {
      const voteUrl = `${window.location.origin}/vote/${createdResult.joinCode}`;
      await navigator.clipboard.writeText(voteUrl);
      setCopiedLink(true);
      toast.success(t("copiedToast"));
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error(t("errorGeneric"));
    }
  };

  if (createdResult) {
    const voteUrl = `${
      typeof window !== "undefined" ? window.location.origin : ""
    }/vote/${createdResult.joinCode}`;
    const whatsappText = encodeURIComponent(
      locale === "bn"
        ? `ভোটবিডি: ${title} নির্বাচনে ভোট দিন। জয়েন কোড: ${createdResult.joinCode} অথবা লিঙ্ক: ${voteUrl}`
        : `VoteBD: Cast your ballot for ${title}. Join code: ${createdResult.joinCode} or visit: ${voteUrl}`
    );

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
        <Card className="text-center p-6 sm:p-8 space-y-6 border-emerald-600/30 dark:border-emerald-500/30">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006A4E] dark:text-[#34D399] flex items-center justify-center mx-auto border border-emerald-200/70 dark:border-emerald-800/50">
            <CheckCircle2 className="w-7 h-7" strokeWidth={1.75} />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {t("createdSuccessTitle")}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("createdSuccessSubtitle")}
            </p>
          </div>

          {/* Join Code Display */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161C28] border border-slate-200 dark:border-white/10 max-w-sm mx-auto">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              {t("shareCodeLabel")}
            </div>
            <div className="text-3xl font-semibold tracking-wider text-[#006A4E] dark:text-[#34D399] font-mono tabular-nums">
              {createdResult.joinCode}
            </div>
            {createdResult.votersCount > 0 && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                {locale === "bn"
                  ? `${formatNum(createdResult.votersCount)}টি ওয়ান-টাইম ভোটার কোড তৈরি হয়েছে`
                  : `${formatNum(createdResult.votersCount)} one-time voter codes generated`}
              </div>
            )}
          </div>

          {/* QR Code */}
          {createdResult.qrDataUrl && (
            <div className="flex flex-col items-center justify-center gap-2.5">
              <Image
                src={createdResult.qrDataUrl}
                alt={`QR code for election ${createdResult.joinCode}`}
                width={176}
                height={176}
                unoptimized
                className="w-44 h-44 rounded-xl border border-slate-200 dark:border-white/10 p-2 shadow-xs bg-white"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {locale === "bn"
                  ? "স্মার্টফোন ক্যামেরা দিয়ে স্ক্যান করলেই ব্যালট খুলবে"
                  : "Scan with any smartphone camera to open ballot"}
              </span>
              <a
                href={createdResult.qrDataUrl}
                download={`${createdResult.joinCode}-qr.png`}
                className="inline-flex"
              >
                <Button variant="outline" size="sm">
                  <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{t("downloadQrBtn")}</span>
                </Button>
              </a>
            </div>
          )}

          {/* Action Sharing Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Button onClick={copyShareLink} variant="outline">
              <Copy className="w-4 h-4" strokeWidth={1.75} />
              <span>{copiedLink ? t("copiedToast") : t("shareLinkBtn")}</span>
            </Button>

            <a
              href={`https://api.whatsapp.com/send?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block"
            >
              <Button variant="secondary" className="w-full">
                <Share2 className="w-4 h-4 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
                <span>{t("shareWhatsappBtn")}</span>
              </Button>
            </a>
          </div>

          {/* Navigate Next */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/elections/${createdResult.joinCode}/admin`}
              className="flex-1 block"
            >
              <Button size="lg" variant="secondary" className="w-full">
                {t("btnGoToAdmin")}
              </Button>
            </Link>

            <Link
              href={`/vote/${createdResult.joinCode}`}
              className="flex-1 block"
            >
              <Button size="lg" className="w-full">
                <Vote className="w-4 h-4" strokeWidth={1.75} />
                <span>{t("btnGoToVote")}</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 w-full flex-1">
      <div className="mb-6 text-center sm:text-left space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
          {t("wizardTitle")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          {locale === "bn"
            ? "সহজ ৪টি ধাপে সম্পন্ন করুন আপনার ক্লাস বা প্রতিষ্ঠানের নির্বাচন।"
            : "Complete your institutional voting setup in 4 simple steps."}
        </p>
      </div>

      <Stepper steps={steps} currentStep={step} />

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300 flex items-center gap-2"
        >
          <ShieldAlert className="w-5 h-5 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: BASICS */}
      {step === 1 && (
        <Card className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {t("wizardStep1")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === "bn"
                ? "নির্বাচনের নাম ও সাধারণ তথ্য লিখুন।"
                : "Basic title and category configuration."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t("fieldTitle")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("fieldTitlePlaceholder")}
              />
              <Input
                label={
                  locale === "bn"
                    ? "বাংলা শিরোনাম (ঐচ্ছিক)"
                    : "Bangla title (optional)"
                }
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: দশম শ্রেণি সিআর নির্বাচন"
              />
            </div>

            <div>
              <label
                htmlFor={descId}
                className="block text-xs font-medium text-slate-800 dark:text-slate-200 mb-1.5"
              >
                {t("fieldDesc")}
              </label>
              <textarea
                id={descId}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("fieldDescPlaceholder")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161C28] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base sm:text-sm focus:border-[#006A4E] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#006A4E]/15 dark:focus:ring-[#10B981]/20 transition-[border-color,box-shadow] resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={catId}
                  className="block text-xs font-medium text-slate-800 dark:text-slate-200 mb-1.5"
                >
                  {t("fieldCategory")}
                </label>
                <select
                  id={catId}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161C28] text-slate-900 dark:text-white text-base sm:text-sm leading-normal focus:border-[#006A4E] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#006A4E]/15 transition-[border-color,box-shadow] cursor-pointer"
                >
                  <option value="class">{t("catClass")}</option>
                  <option value="club">{t("catClub")}</option>
                  <option value="community">{t("catCommunity")}</option>
                  <option value="poll">{t("catPoll")}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor={typeId}
                  className="block text-xs font-medium text-slate-800 dark:text-slate-200 mb-1.5"
                >
                  {t("fieldType")}
                </label>
                <select
                  id={typeId}
                  value={electionType}
                  onChange={(e) => handleElectionTypeChange(e.target.value)}
                  className="w-full h-11 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161C28] text-slate-900 dark:text-white text-base sm:text-sm leading-normal focus:border-[#006A4E] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#006A4E]/15 transition-[border-color,box-shadow] cursor-pointer"
                >
                  <option value="SINGLE">{t("typeSingle")}</option>
                  <option value="MULTIPLE">{t("typeMultiple")}</option>
                  <option value="RANKED">{t("typeRanked")}</option>
                  <option value="YES_NO">{t("typeYesNo")}</option>
                </select>
              </div>
            </div>

            {electionType === "MULTIPLE" && (
              <div>
                <label
                  htmlFor={maxChoicesId}
                  className="block text-xs font-medium text-slate-800 dark:text-slate-200 mb-1.5"
                >
                  {locale === "bn"
                    ? "একজন ভোটার সর্বোচ্চ কয়টি পছন্দ বেছে নিতে পারবেন"
                    : "Maximum selections per voter"}
                </label>
                <div className="max-w-xs">
                  <select
                    id={maxChoicesId}
                    value={maxChoices}
                    onChange={(e) => setMaxChoices(Number(e.target.value))}
                    className="w-full h-11 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161C28] text-slate-900 dark:text-white text-base sm:text-sm focus:border-[#006A4E] dark:focus:border-[#10B981] focus:ring-2 focus:ring-[#006A4E]/15 cursor-pointer"
                  >
                    {[2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {formatNum(n)}{" "}
                        {locale === "bn" ? "টি প্রার্থী" : "candidates"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* STEP 2: CANDIDATES */}
      {step === 2 && (
        <Card className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {t("candidatesTitle")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("candidatesSubtitle")}
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={addCandidate}>
              + {t("btnAddCandidate")}
            </Button>
          </div>

          <div className="space-y-3">
            {candidates.map((cand, idx) => (
              <div
                key={cand.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#161C28]/60 flex flex-col sm:flex-row items-center gap-3"
              >
                <div className="w-full sm:w-12 flex items-center justify-between sm:justify-center shrink-0">
                  <input
                    type="text"
                    aria-label={`Symbol for candidate ${idx + 1}`}
                    value={cand.symbolEmoji}
                    onChange={(e) =>
                      updateCandidate(cand.id, "symbolEmoji", e.target.value)
                    }
                    placeholder="⚽"
                    className="w-11 h-11 text-center text-xl rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121721] focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/15"
                  />
                  <button
                    type="button"
                    onClick={() => removeCandidate(cand.id)}
                    className="sm:hidden p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                    aria-label={`Remove candidate ${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    aria-label={`Candidate ${idx + 1} name`}
                    value={cand.name}
                    onChange={(e) =>
                      updateCandidate(cand.id, "name", e.target.value)
                    }
                    placeholder={`${t("candidateNamePlaceholder")} ${formatNum(idx + 1)}`}
                    className="h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121721] text-slate-900 dark:text-white text-base sm:text-sm focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/15"
                  />
                  <input
                    type="text"
                    aria-label={`Candidate ${idx + 1} bio`}
                    value={cand.bio}
                    onChange={(e) =>
                      updateCandidate(cand.id, "bio", e.target.value)
                    }
                    placeholder={t("candidateBioPlaceholder")}
                    className="h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121721] text-slate-900 dark:text-white text-base sm:text-sm focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/15"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeCandidate(cand.id)}
                  className="hidden sm:inline-flex p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  aria-label={`Remove candidate ${idx + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* NOTA Toggle */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowNota}
                onChange={(e) => setAllowNota(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#006A4E] focus:ring-[#006A4E]"
              />
              <div>
                <span className="text-sm font-medium text-slate-900 dark:text-white block">
                  {t("allowNotaToggle")}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  {t("allowNotaDesc")}
                </span>
              </div>
            </label>
          </div>
        </Card>
      )}

      {/* STEP 3: RULES & SCHEDULE */}
      {step === 3 && (
        <Card className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {t("rulesTitle")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("rulesSubtitle")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={startId}
                  className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
                  <span>{t("fieldStartTime")}</span>
                </label>
                <input
                  id={startId}
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setCustomStartTime(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161C28] text-slate-900 dark:text-white text-base sm:text-sm font-mono tabular-nums focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/15 transition-[border-color,box-shadow]"
                />
              </div>

              <div>
                <label
                  htmlFor={endId}
                  className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-[#F42A41]" strokeWidth={1.75} />
                  <span>{t("fieldEndTime")}</span>
                </label>
                <input
                  id={endId}
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setCustomEndTime(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161C28] text-slate-900 dark:text-white text-base sm:text-sm font-mono tabular-nums focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/15 transition-[border-color,box-shadow]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={visId}
                className="block text-xs font-medium text-slate-800 dark:text-slate-200 mb-1.5"
              >
                {t("fieldResultVisibility")}
              </label>
              <select
                id={visId}
                value={resultVisibility}
                onChange={(e) => setResultVisibility(e.target.value)}
                className="w-full h-11 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161C28] text-slate-900 dark:text-white text-base sm:text-sm leading-normal focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/15 transition-[border-color,box-shadow] cursor-pointer"
              >
                <option value="LIVE">{t("visLive")}</option>
                <option value="AFTER_CLOSE">{t("visAfterClose")}</option>
              </select>
            </div>

            <div className="pt-1">
              <label
                htmlFor={pinId}
                className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4 text-[#006A4E] dark:text-[#34D399]" strokeWidth={1.75} />
                <span>{t("adminPinLabel")}</span>
              </label>
              <input
                id={pinId}
                name="adminPin"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={8}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder={t("adminPinPlaceholder")}
                className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161C28] text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/15 font-mono text-base sm:text-sm"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                {t("adminPinHelper")}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: VOTER ACCESS & PUBLISH */}
      {step === 4 && (
        <Card className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {t("accessTitle")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === "bn"
                ? "ভোটাররা কীভাবে নির্বাচনে অংশ নেবেন তা নির্ধারণ করুন।"
                : "Choose how eligible voters enter and authenticate."}
            </p>
          </div>

          <div className="space-y-3">
            <label
              className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                voterAccessType === "JOIN_CODE"
                  ? "border-[#006A4E] dark:border-[#10B981] bg-emerald-50/60 dark:bg-emerald-950/30"
                  : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#161C28]/40"
              }`}
            >
              <input
                type="radio"
                name="voterAccess"
                value="JOIN_CODE"
                checked={voterAccessType === "JOIN_CODE"}
                onChange={(e) => setVoterAccessType(e.target.value)}
                className="mt-1 text-[#006A4E] focus:ring-[#006A4E]"
              />
              <div>
                <span className="text-sm font-medium text-slate-900 dark:text-white block">
                  {t("accessTypeJoinCode")}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  {locale === "bn"
                    ? "সবাই একটি সাধারণ জয়েন কোড ব্যবহার করবে এবং প্রতি ডিভাইস থেকে একবার ভোট দেওয়া যাবে।"
                    : "Everyone enters a 6-character code. One ballot per browser/device."}
                </span>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                voterAccessType === "CODE_LIST"
                  ? "border-[#006A4E] dark:border-[#10B981] bg-emerald-50/60 dark:bg-emerald-950/30"
                  : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#161C28]/40"
              }`}
            >
              <input
                type="radio"
                name="voterAccess"
                value="CODE_LIST"
                checked={voterAccessType === "CODE_LIST"}
                onChange={(e) => setVoterAccessType(e.target.value)}
                className="mt-1 text-[#006A4E] focus:ring-[#006A4E]"
              />
              <div>
                <span className="text-sm font-medium text-slate-900 dark:text-white block">
                  {t("accessTypeCodeList")}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  {locale === "bn"
                    ? "রোল বা নামের তালিকা পেস্ট বা CSV আপলোড করুন; প্রতিটি ভোটারের জন্য একক ওয়ান-টাইম কোড তৈরি হবে।"
                    : "Paste student roll list or upload CSV; unique one-time codes generated for high security."}
                </span>
              </div>
            </label>
          </div>

          {voterAccessType === "CODE_LIST" && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={voterListId}
                  className="block text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  {locale === "bn" ? "ভোটার তালিকা (রোল নম্বর / নাম)" : "Voter roster"}
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-[#006A4E] dark:text-[#34D399] font-medium hover:underline">
                  <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{locale === "bn" ? "CSV ফাইল আপলোড" : "Upload CSV"}</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                id={voterListId}
                rows={5}
                value={voterListRaw}
                onChange={(e) => setVoterListRaw(e.target.value)}
                placeholder={t("accessVoterListPlaceholder")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161C28] text-slate-900 dark:text-white text-sm font-mono focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/15 resize-y"
              />
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between tabular-nums">
                <span>{t("accessCodeCountLabel")}</span>
                <span className="font-semibold text-[#006A4E] dark:text-[#34D399]">
                  {formatNum(
                    voterListRaw
                      .split(/\r?\n/)
                      .filter((l) => l.trim().length > 0).length
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161C28] border border-slate-200 dark:border-white/10 text-xs space-y-2">
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {t("summaryReview")}
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 gap-4">
              <span>{t("fieldTitle")}</span>
              <span className="font-medium text-slate-900 dark:text-white text-right">
                {title || "—"}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 tabular-nums">
              <span>{t("totalCandidatesLabel")}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatNum(candidates.filter((c) => c.name.trim()).length)}{" "}
                {allowNota ? "(+ NOTA)" : ""}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Stepper Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200 dark:border-white/10">
        {step > 1 ? (
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setError(null);
              setStep(step - 1);
            }}
            className="h-11 px-5"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            <span>{t("btnBack")}</span>
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button size="md" onClick={handleNext} className="h-11 px-5">
            <span>{t("btnNext")}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </Button>
        ) : (
          <Button
            size="md"
            onClick={handlePublish}
            isLoading={isSubmitting}
            className="h-11 px-8"
          >
            <span>{isSubmitting ? t("btnSaving") : t("btnPublish")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function CreateElectionPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-10 h-10 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading election wizard...</p>
        </div>
      }
    >
      <CreateElectionContent />
    </Suspense>
  );
}
