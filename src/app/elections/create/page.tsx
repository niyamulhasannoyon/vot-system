"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Vote,
  Plus,
  Trash2,
  Calendar,
  Lock,
  Share2,
  QrCode,
  Copy,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Users,
  ShieldAlert,
  Info,
} from "lucide-react";
import QRCode from "qrcode";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";

interface Candidate {
  id: string;
  name: string;
  nameBn: string;
  symbolEmoji: string;
  bio: string;
}

export default function CreateElectionPage() {
  const { locale, formatNum, t } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("class");
  const [electionType, setElectionType] = useState("SINGLE");
  const [allowNota, setAllowNota] = useState(false);

  // Candidates
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: "1",
      name: "Tanvir Ahmed",
      nameBn: "তানভীর আহমেদ",
      symbolEmoji: "⚽",
      bio: "Roll 01",
    },
    {
      id: "2",
      name: "Sadia Jahan",
      nameBn: "সাদিয়া জাহান",
      symbolEmoji: "📚",
      bio: "Roll 03",
    },
  ]);

  // Schedule & Rules
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [resultVisibility, setResultVisibility] = useState("LIVE");
  const [adminPin, setAdminPin] = useState("");

  useEffect(() => {
    const now = new Date();
    setStartTime(now.toISOString().slice(0, 16));
    setEndTime(new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  }, []);

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

  // Stepper definition
  const steps = [
    { id: 1, title: t("wizardStep1") },
    { id: 2, title: t("wizardStep2") },
    { id: 3, title: t("wizardStep3") },
    { id: 4, title: t("wizardStep4") },
  ];

  // Candidates manipulation
  const addCandidate = () => {
    const emojis = ["⚽", "📚", "🕊️", "🌟", "🚢", "🌾", "🇧🇩", "🖊️", "🎓"];
    const randomEmoji = emojis[candidates.length % emojis.length];
    setCandidates([
      ...candidates,
      {
        id: Date.now().toString(),
        name: "",
        nameBn: "",
        symbolEmoji: randomEmoji,
        bio: "",
      },
    ]);
  };

  const updateCandidate = (id: string, field: keyof Candidate, value: string) => {
    setCandidates(
      candidates.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeCandidate = (id: string) => {
    if (candidates.length <= 2) {
      alert(locale === "bn" ? "কমপক্ষে ২টি প্রার্থী থাকতে হবে।" : "Minimum 2 candidates required.");
      return;
    }
    setCandidates(candidates.filter((c) => c.id !== id));
  };

  // Step Validations
  const validateStep = (current: number): boolean => {
    setError(null);
    if (current === 1) {
      if (!title.trim()) {
        setError(locale === "bn" ? "নির্বাচনের শিরোনাম প্রদান করুন।" : "Please enter an election title.");
        return false;
      }
    } else if (current === 2) {
      const validCand = candidates.filter((c) => c.name.trim().length > 0);
      if (validCand.length < 2) {
        setError(locale === "bn" ? "কমপক্ষে ২টি প্রার্থীর নাম সঠিকভাবে লিখুন।" : "Please enter at least 2 valid candidate names.");
        return false;
      }
    } else if (current === 3) {
      if (!adminPin || adminPin.trim().length < 4) {
        setError(locale === "bn" ? "কমপক্ষে ৪ ডিজিটের একটি অ্যাডমিন পিন দিন।" : "Admin PIN must be at least 4 digits.");
        return false;
      }
      if (new Date(endTime) <= new Date(startTime)) {
        setError(locale === "bn" ? "ভোট সমাপ্তির সময় শুরুর চেয়ে পরে হতে হবে।" : "End time must be after start time.");
        return false;
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
      const response = await fetch("/api/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          titleBn: titleBn || title,
          description,
          category,
          electionType,
          allowNota,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          resultVisibility,
          adminPin,
          voterAccessType,
          voterListRaw,
          candidates: candidates.filter((c) => c.name.trim().length > 0),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create election");
      }

      // Generate QR Code
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
        votersCount: data.votersCount,
        qrDataUrl,
      });
    } catch (err: any) {
      setError(err.message || t("errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyShareLink = () => {
    if (!createdResult) return;
    const voteUrl = `${window.location.origin}/vote/${createdResult.joinCode}`;
    navigator.clipboard.writeText(voteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If successfully created, show celebratory launch screen
  if (createdResult) {
    const voteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/vote/${createdResult.joinCode}`;
    const whatsappText = encodeURIComponent(
      locale === "bn"
        ? `ভোটবিডি: ${title} নির্বাচনে ভোট দিন! জয়েন কোড: ${createdResult.joinCode} অথবা লিঙ্কে ক্লিক করুন: ${voteUrl}`
        : `VoteBD: Cast your ballot for ${title}! Join code: ${createdResult.joinCode} or visit: ${voteUrl}`
    );

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="text-center p-8 space-y-6 border-2 border-emerald-500/30">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {t("createdSuccessTitle")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("createdSuccessSubtitle")}
            </p>
          </div>

          {/* Join Code Display */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
              {t("shareCodeLabel")}
            </div>
            <div className="text-3xl font-extrabold tracking-widest text-[#006A4E] font-mono">
              {createdResult.joinCode}
            </div>
          </div>

          {/* QR Code */}
          {createdResult.qrDataUrl && (
            <div className="flex flex-col items-center justify-center">
              <img
                src={createdResult.qrDataUrl}
                alt="QR Code"
                className="w-44 h-44 rounded-xl border border-slate-200 p-2 shadow-sm bg-white"
              />
              <span className="text-xs text-slate-500 mt-2">
                {locale === "bn"
                  ? "ভোটাররা মোবাইল ক্যামেরা দিয়ে স্ক্যান করলেই ব্যালট খুলবে"
                  : "Scan with any smartphone camera to open ballot"}
              </span>
            </div>
          )}

          {/* Action Sharing Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button onClick={copyShareLink} variant="outline" className="gap-2">
              <Copy className="w-4 h-4" />
              {copiedLink ? t("copiedToast") : t("shareLinkBtn")}
            </Button>

            <a
              href={`https://api.whatsapp.com/send?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex"
            >
              <Button variant="primary" className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white">
                <Share2 className="w-4 h-4" />
                {t("shareWhatsappBtn")}
              </Button>
            </a>
          </div>

          {/* Navigate Next */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/elections/${createdResult.joinCode}/admin`}
              className="flex-1 inline-flex"
            >
              <Button size="lg" variant="secondary" className="w-full">
                {t("btnGoToAdmin")}
              </Button>
            </Link>

            <Link
              href={`/vote/${createdResult.joinCode}`}
              className="flex-1 inline-flex"
            >
              <Button size="lg" className="w-full gap-2">
                <Vote className="w-4 h-4" />
                {t("btnGoToVote")}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t("wizardTitle")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          {locale === "bn"
            ? "সহজ ৪টি ধাপে সম্পন্ন করুন আপনার ক্লাস বা প্রতিষ্ঠানের নির্বাচন।"
            : "Complete your institutional voting setup in 4 simple steps."}
        </p>
      </div>

      <Stepper steps={steps} currentStep={step} />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: BASICS */}
      {step === 1 && (
        <Card className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("wizardStep1")}
            </h3>
            <p className="text-xs text-slate-500">
              {locale === "bn"
                ? "নির্বাচনের নাম ও সাধারণ তথ্য লিখুন।"
                : "Basic title and category configuration."}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                {t("fieldTitle")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("fieldTitlePlaceholder")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                {t("fieldDesc")}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("fieldDescPlaceholder")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {t("fieldCategory")}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                >
                  <option value="class">{t("catClass")}</option>
                  <option value="club">{t("catClub")}</option>
                  <option value="community">{t("catCommunity")}</option>
                  <option value="poll">{t("catPoll")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {t("fieldType")}
                </label>
                <select
                  value={electionType}
                  onChange={(e) => setElectionType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                >
                  <option value="SINGLE">{t("typeSingle")}</option>
                  <option value="MULTIPLE">{t("typeMultiple")}</option>
                  <option value="YES_NO">{t("typeYesNo")}</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: CANDIDATES */}
      {step === 2 && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("candidatesTitle")}
              </h3>
              <p className="text-xs text-slate-500">{t("candidatesSubtitle")}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={addCandidate}>
              {t("btnAddCandidate")}
            </Button>
          </div>

          <div className="space-y-3">
            {candidates.map((cand, idx) => (
              <div
                key={cand.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-3"
              >
                {/* Emoji / Symbol picker input */}
                <div className="w-14 shrink-0">
                  <input
                    type="text"
                    value={cand.symbolEmoji}
                    onChange={(e) =>
                      updateCandidate(cand.id, "symbolEmoji", e.target.value)
                    }
                    placeholder="⚽"
                    title="প্রতীক বা ইমোজি"
                    className="w-12 h-12 text-center text-2xl rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  />
                </div>

                {/* Candidate Name & Bio */}
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cand.name}
                    onChange={(e) =>
                      updateCandidate(cand.id, "name", e.target.value)
                    }
                    placeholder={`${t("candidateNamePlaceholder")} ${formatNum(idx + 1)}`}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  />
                  <input
                    type="text"
                    value={cand.bio}
                    onChange={(e) =>
                      updateCandidate(cand.id, "bio", e.target.value)
                    }
                    placeholder={t("candidateBioPlaceholder")}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  />
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeCandidate(cand.id)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  aria-label="Remove candidate"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* NOTA Toggle */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowNota}
                onChange={(e) => setAllowNota(e.target.checked)}
                className="w-4 h-4 mt-1 rounded text-[#006A4E] focus:ring-[#006A4E]"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                  {t("allowNotaToggle")}
                </span>
                <span className="text-xs text-slate-500 block">
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("rulesTitle")}
            </h3>
            <p className="text-xs text-slate-500">{t("rulesSubtitle")}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#006A4E]" />
                  {t("fieldStartTime")}
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#F42A41]" />
                  {t("fieldEndTime")}
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                {t("fieldResultVisibility")}
              </label>
              <select
                value={resultVisibility}
                onChange={(e) => setResultVisibility(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
              >
                <option value="LIVE">{t("visLive")}</option>
                <option value="AFTER_CLOSE">{t("visAfterClose")}</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#006A4E]" />
                {t("adminPinLabel")}
              </label>
              <input
                type="password"
                maxLength={8}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder={t("adminPinPlaceholder")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#006A4E] focus:outline-none font-mono"
              />
              <p className="text-xs text-slate-500 mt-1">
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("accessTitle")}
            </h3>
            <p className="text-xs text-slate-500">
              {locale === "bn"
                ? "ভোটাররা কীভাবে নির্বাচনে অংশ নেবেন তা নির্ধারণ করুন।"
                : "Choose how eligible voters enter and authenticate."}
            </p>
          </div>

          <div className="space-y-3">
            <label
              className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                voterAccessType === "JOIN_CODE"
                  ? "border-[#006A4E] bg-[#EBF7F2] dark:bg-[#064E3B]/20"
                  : "border-slate-200 dark:border-slate-700"
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
                <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                  {t("accessTypeJoinCode")}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {locale === "bn"
                    ? "সবাই একটি সাধারণ কোড লিখবে। ডিভাইস আইডি দ্বারা একবার ভোট নিশ্চিত করা হয়।"
                    : "Everyone enters a 6-character code. Simple for classes and quick polls."}
                </span>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                voterAccessType === "CODE_LIST"
                  ? "border-[#006A4E] bg-[#EBF7F2] dark:bg-[#064E3B]/20"
                  : "border-slate-200 dark:border-slate-700"
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
                <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                  {t("accessTypeCodeList")}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {locale === "bn"
                    ? "রোল বা নামের তালিকা পেস্ট করুন; প্রতিটি ভোটারের জন্য একক ওয়ান-টাইম কোড তৈরি হবে।"
                    : "Paste student roll list; unique one-time codes generated for maximum integrity."}
                </span>
              </div>
            </label>
          </div>

          {/* Voter List Box */}
          {voterAccessType === "CODE_LIST" && (
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                {locale === "bn" ? "ভোটার তালিকা (রোল নম্বর / নাম)" : "Voter Roster"}
              </label>
              <textarea
                rows={5}
                value={voterListRaw}
                onChange={(e) => setVoterListRaw(e.target.value)}
                placeholder={t("accessVoterListPlaceholder")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono focus:ring-2 focus:ring-[#006A4E] focus:outline-none"
              />
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>{t("accessCodeCountLabel")}</span>
                <span className="font-bold text-[#006A4E]">
                  {formatNum(
                    voterListRaw
                      .split("\n")
                      .filter((l) => l.trim().length > 0).length
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Final Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {t("summaryReview")}:
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{t("fieldTitle")}:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {title}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{t("totalCandidatesLabel")}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatNum(candidates.length)} {allowNota ? "(+ NOTA)" : ""}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Stepper Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
        {step > 1 ? (
          <Button variant="secondary" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {t("btnBack")}
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button onClick={handleNext}>
            {t("btnNext")}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        ) : (
          <Button
            onClick={handlePublish}
            isLoading={isSubmitting}
            className="bg-[#006A4E] hover:bg-[#00533C] text-white px-8"
          >
            {isSubmitting ? t("btnSaving") : t("btnPublish")}
          </Button>
        )}
      </div>
    </div>
  );
}
