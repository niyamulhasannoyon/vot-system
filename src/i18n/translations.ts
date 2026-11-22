export type Locale = "bn" | "en";

export const translations = {
  bn: {
    // Brand
    brandName: "ভোটবিডি",
    brandTagline: "বাংলাদেশের জন্য আধুনিক, নিরাপদ ও সহজ ভোটিং প্ল্যাটফর্ম",
    brandBadge: "বাংলাদেশি প্রতিষ্ঠানের বিশ্বস্ত ভোটিং প্ল্যাটফর্ম",

    // Navigation
    navHome: "হোম",
    navCreate: "নতুন নির্বাচন",
    navJoin: "ভোট দিন",
    navVerify: "রসিদ যাচাই",
    navDemo: "ডেমো নির্বাচন",

    // Accessibility Controls
    a11yTitle: "অ্যাক্সেসিবিলিটি সেটিংস",
    textSizeSmall: "ছোট লেখা",
    textSizeNormal: "স্বাভাবিক",
    textSizeLarge: "বড় লেখা",
    highContrastOn: "হাই-কনট্রাস্ট অন",
    highContrastOff: "হাই-কনট্রাস্ট অফ",
    numeralBangla: "বাংলা সংখ্যা (১২৩)",
    numeralEnglish: "ইংরেজি সংখ্যা (123)",
    langToggle: "English",

    // Landing Page Hero
    heroBadge: "ক্লাস, ক্লাব ও কমিউনিটির জন্য সহজ ভোটিং",
    heroTitle: "ভোটাভুটি হোক স্বচ্ছ, নিরপেক্ষ ও সম্পূর্ণ নিরাপদ।",
    heroSubtitle:
      "ক্লাস রিপ্রেজেন্টেটিভ নির্বাচন, হল সংসদ, ক্লাব কিংবা পাড়া-মহল্লার সমিতি—সব ধরণের নির্বাচনের জন্য মোবাইল-বান্ধব আধুনিক সমাধান। কোনো প্রযুক্তিগত জটিলতা ছাড়া ৩০ সেকেন্ডে ভোট দিন।",
    heroCtaCreate: "নির্বাচন তৈরি করুন",
    heroCtaJoin: "কোড দিয়ে ভোট দিন",
    heroTryDemo: "সরাসরি ডেমো দেখুন (দশম শ্রেণি সিআর নির্বাচন)",
    heroMockupCaption: "মোবাইলে তাৎক্ষণিক ও গোপন ব্যালট পেপার",
    heroTrustStat1: "১০০% গোপনীয়",
    heroTrustStat1Sub: "ভোটারের পরিচয়ের সাথে পছন্দের কোনো সংযোগ থাকে না",
    heroTrustStat2: "ট্যাম্পার-প্রুফ চেইন",
    heroTrustStat2Sub: "প্রতিটি ব্যালট ক্রিপ্টোগ্রাফিক হ্যাশ দ্বারা সুরক্ষিত",
    heroTrustStat3: "সবার জন্য সহজ",
    heroTrustStat3Sub: "লো-এন্ড অ্যান্ড্রয়েড এবং থ্রি-জি নেটওয়ার্কেও সুপারফাস্ট",

    // Join Code Box
    joinBoxTitle: "আপনার কাছে কি নির্বাচনের কোড আছে?",
    joinBoxPlaceholder: "যেমন: CR-2024 বা 6-ডিজিট কোড লিখুন",
    joinBoxButton: "ব্যালট খুলুন",
    joinBoxHelper: "নির্বাচনের আয়োজক থেকে প্রাপ্ত ৬ অক্ষরের কোড অথবা লিঙ্ক দিন।",

    // Pillars
    pillarsTitle: "কেন ভোটবিডি বেছে নেবেন?",
    pillarsSubtitle: "বাংলাদেশের স্থানীয় প্রতিষ্ঠানগুলোর বাস্তব চাহিদার ওপর ভিত্তি করে নির্মিত ৩টি মূল স্তম্ভ।",
    pillar1Title: "সর্বোচ্চ নিরাপত্তা ও গোপন ব্যালট",
    pillar1Desc:
      "ডাটাবেজে ভোটারের পরিচয় এবং ভোট সম্পূর্ণ আলাদা সংরক্ষিত থাকে। আয়োজক বা অ্যাডমিনও জানতে পারবেন না কে কাকে ভোট দিয়েছেন। এক ভোটার কখনোই দুটি ভোট দিতে পারবেন না।",
    pillar2Title: "সবার জন্য সহজ ও মোবাইল-ফার্স্ট",
    pillar2Desc:
      "কোনো জটিল রেজিস্ট্রেশন বা পাসওয়ার্ডের ঝামেলা নেই। প্রত্যন্ত অঞ্চলের সাধারণ স্মার্টফোন এবং ধীরগতির ইন্টারনেটেও পলকের মধ্যে পেজ লোড হয়।",
    pillar3Title: "স্বচ্ছতা ও ডিজিটাল রসিদ",
    pillar3Desc:
      "ভোট দেওয়ার পর পাবেন একটি গোপন ডিজিটাল রসিদ কোড। নির্বাচন শেষে যে কেউ যাচাই করে দেখতে পারেন তাদের ভোটটি সঠিকভাবে গণনা করা হয়েছে কি না।",

    // How it works
    howItWorksTitle: "কীভাবে কাজ করে?",
    howItWorksSubtitle: "মাত্র ৪টি সহজ ধাপে সম্পন্ন করুন আপনার নির্বাচন।",
    step1Title: "১. নির্বাচন তৈরি করুন",
    step1Desc: "প্রার্থী তালিকা, নিয়ম এবং শুরুর ও শেষের সময় নির্ধারণ করুন। ২ মিনিটের মধ্যে প্রস্তুত!",
    step2Title: "২. ভোটারদের আমন্ত্রণ জানান",
    step2Desc: "হোয়াটসঅ্যাপ, মেসেঞ্জার বা প্রিন্ট করা কিউআর কোডের মাধ্যমে লিংক বা ভোটার কোড শেয়ার করুন।",
    step3Title: "৩. স্বাচ্ছন্দ্যে ভোট দিন",
    step3Desc: "ভোটাররা মোবাইল থেকে প্রার্থী বেছে নিয়ে কনফার্ম করবেন এবং একটি ডিজিটাল রসিদ পাবেন।",
    step4Title: "৪. তাৎক্ষণিক ফলাফল দেখুন",
    step4Desc: "নির্ধারিত সময় শেষে স্বয়ংক্রিয়ভাবে বিজয়ী, শতকরা হার ও ভিজ্যুয়াল গ্রাফ প্রকাশিত হবে।",

    // Use cases
    useCasesTitle: "কারা ব্যবহার করছেন?",
    useCase1Title: "স্কুল, কলেজ ও বিশ্ববিদ্যালয়",
    useCase1Desc: "ক্লাস রিপ্রেজেন্টেটিভ (CR), ব্যাচ কো-অর্ডিনেটর, হল সংসদ ও ডিপার্টমেন্ট নির্বাচন।",
    useCase2Title: "ক্লাব ও সামাজিক সংগঠন",
    useCase2Desc: "ডিবেটিং ক্লাব, রোভার স্কাউট, রোটারি ও স্বেচ্ছাসেবী সংগঠনের কার্যকরী কমিটি গঠন।",
    useCase3Title: "মসজিদ, সমিতি ও ফ্ল্যাট ওনার্স",
    useCase3Desc: "সমবায় সমিতি, মসজিদ কমিটি, ফ্ল্যাট মালিক সমিতি ও পাড়া-মহল্লার নির্বাচন।",
    useCase4Title: "দ্রুত কুইক পোল ও জরিপ",
    useCase4Desc: "ক্লাস ট্যুরের স্থান নির্ধারণ, বার্ষিক পিকনিকের তারিখ বা বন্ধুদের যেকোনো সাধারণ মতামত।",

    // FAQ
    faqTitle: "সচরাচর জিজ্ঞাসিত প্রশ্ন",
    faqQ1: "আমার ভোট কি সত্যিই গোপন থাকে? অ্যাডমিন বা শিক্ষক কি দেখতে পাবেন?",
    faqA1: "হ্যাঁ, আপনার ভোট ১০০% গোপন। ভোটবিডির ডাটাবেজে ভোটারের তালিকা (কে ভোট দিয়েছেন) এবং ব্যালট বক্স (কোন প্রার্থী ভোট পেয়েছেন) দুটি সম্পূর্ণ পৃথকভাবে রাখা হয়। কোনোভাবেই ভোটারের নামের সাথে প্রার্থীর পছন্দের সংযোগ বের করা প্রযুক্তিগতভাবে অসম্ভব।",
    faqQ2: "এক ব্যক্তি কি একাধিকবার ভোট দিতে পারবেন?",
    faqA2: "একদমই না। প্রতিটি ভোটার কোড বা অ্যাকাউন্টে একবারের বেশি ভোট দেওয়া যায় না। আপনি কনফার্ম করার সাথে সাথে কোডটি স্বয়ংক্রিয়ভাবে বাতিল হয়ে যায়।",
    faqQ3: "ফলাফল কি টেম্পার বা পরিবর্তন করা সম্ভব?",
    faqA3: "না। প্রতিটি ব্যালট ক্রিপ্টোগ্রাফিক হ্যাশ-চেইনে ব্লকচেইনের মতো সংরক্ষিত থাকে। কোনো ব্যালট মোছা বা পরিবর্তন করতে গেলে পুরো অডিট চেইন ভেঙে যাবে এবং তা তাৎক্ষণিক ধরা পড়বে।",
    faqQ4: "এটি কি জাতীয় বা সরকারি নির্বাচনের জন্য?",
    faqA4: "না, ভোটবিডি স্পষ্টভাবেই শিক্ষাপ্রতিষ্ঠান, ছাত্র সংসদ, কর্পোরেট অফিস, হাউজিং সোসাইটি ও সামাজিক ক্লাবের অভ্যন্তরীণ গণতান্ত্রিক প্রক্রিয়ার জন্য প্রস্তুত করা হয়েছে। এটি কোনো সরকারি বা জাতীয় নির্বাচন কমিশনের প্ল্যাটফর্ম নয়।",

    // Footer
    footerDisclaimer:
      "স্বচ্ছতার অঙ্গীকার: ভোটবিডি একটি স্বাধীন প্রাতিষ্ঠানিক ও কমিউনিটি ভোটিং টুল। এটি জাতীয় বা সরকারি নির্বাচনের জন্য প্রযোজ্য নয়। সকল তথ্য এনক্রিপ্টেড এবং নিরপেক্ষভাবে পরিচালিত।",
    footerQuickLinks: "দ্রুত লিঙ্ক",
    footerSecurity: "নিরাপত্তা ও অডিট",
    footerContact: "যোগাযোগ ও সহায়তা",
    footerDhakaTime: "বাংলাদেশ মান সময় (BST, UTC+6):",

    // Election Wizard
    wizardTitle: "নতুন নির্বাচন পরিচালনা করুন",
    wizardStep1: "১. মৌলিক তথ্য",
    wizardStep2: "২. প্রার্থী ও বিকল্প",
    wizardStep3: "৩. নিয়ম ও সময়সূচী",
    wizardStep4: "৪. ভোটার অ্যাক্সেস ও প্রকাশ",
    btnNext: "পরবর্তী ধাপ",
    btnBack: "পূর্ববর্তী",
    btnPublish: "নির্বাচন শুরু করুন",
    btnSaving: "সংরক্ষণ করা হচ্ছে...",

    // Wizard Step 1
    fieldTitle: "নির্বাচনের শিরোনাম *",
    fieldTitlePlaceholder: "যেমন: দশম শ্রেণি সিআর নির্বাচন ২০২৪",
    fieldDesc: "বিবরণ বা নির্দেশনা",
    fieldDescPlaceholder: "ভোটারদের জন্য কোনো বিশেষ বার্তা থাকলে লিখুন...",
    fieldCategory: "ক্যাটাগরি",
    catClass: "শ্রেণি / শিক্ষাপ্রতিষ্ঠান",
    catClub: "ক্লাব / ছাত্র সংগঠন",
    catCommunity: "সমিতি / মসজিদ / হাউজিং",
    catPoll: "কুইক পোল / মতামত",
    fieldType: "ভোটের ধরন",
    typeSingle: "একক বাছাই (Single Choice) - ১ জন বিজয়ী",
    typeMultiple: "একাধিক বাছাই (Multiple Choice) - নির্দিষ্ট সংখ্যক বিজয়ী",
    typeRanked: "র‌্যাঙ্কড চয়েস (Ranked Choice) - অগ্রাধিকার ভিত্তিক ক্রম",
    typeYesNo: "হ্যাঁ / না সম্মতি (Yes / No Referendum)",

    // Wizard Step 2
    candidatesTitle: "প্রার্থী বা বিকল্পের তালিকা",
    candidatesSubtitle: "কমপক্ষে ২টি প্রার্থী বা বিকল্প যোগ করুন। ড্র্যাগ করে ক্রম সাজাতে পারেন।",
    btnAddCandidate: "+ নতুন প্রার্থী যোগ করুন",
    candidateNamePlaceholder: "প্রার্থীর নাম",
    candidateSymbolPlaceholder: "প্রতীক বা ইমোজি (যেমন: ⚽, 📚, 🕊️)",
    candidateBioPlaceholder: "সংক্ষিপ্ত পরিচিতি বা রোল নম্বর",
    allowNotaToggle: "\"উপরের কাউকে নয়\" (NOTA) বিকল্প যুক্ত করুন",
    allowNotaDesc: "ভোটাররা চাইলে কোনো নির্দিষ্ট প্রার্থীকে পছন্দ না করে অসন্তোষ জানাতে পারবেন।",

    // Wizard Step 3
    rulesTitle: "সময়সীমা ও গোপনীয়তা সেটিংস",
    rulesSubtitle: "ভোট শুরু ও শেষের সময় এবং ফলাফলের নিয়ম ঠিক করুন।",
    fieldStartTime: "ভোট শুরুর সময় (BST)",
    fieldEndTime: "ভোট সমাপ্তির সময় (BST)",
    fieldResultVisibility: "ফলাফল দৃশ্যমানতা",
    visAfterClose: "ভোট শেষ হওয়ার পর প্রকাশিত হবে (গোপনীয়তা নিশ্চিত করে)",
    visLive: "ভোট চলাকালীন লাইভ ফলাফল দেখানো হবে",
    adminPinLabel: "অ্যাডমিন ম্যানেজমেন্ট পিন (PIN) *",
    adminPinPlaceholder: "৪ থেকে ৬ ডিজিটের গোপন পিন দিন",
    adminPinHelper: "এই পিন দিয়ে আপনি পরবর্তীতে নির্বাচন বন্ধ করতে বা ফলাফল এক্সপোর্ট করতে পারবেন। কাউকে জানাবেন না।",

    // Wizard Step 4
    accessTitle: "ভোটার প্রবেশাধিকার ও নিরাপত্তা স্তর",
    accessTypeJoinCode: "উন্মুক্ত জয়েন কোড (সবাই জয়েন কোড দিয়ে এক ডিভাইস থেকে একবার ভোট দেবে)",
    accessTypeCodeList: "ভোটার রোল/কোড তালিকা (সবচেয়ে সুরক্ষিত: প্রতিটি ভোটারের জন্য একক ওয়ান-টাইম কোড)",
    accessVoterListPlaceholder: "এখানে রোল বা নাম পেস্ট করুন (প্রতি লাইনে একটি): \n১০১ - তানভীর আহমেদ\n১০২ - সাদিয়া জাহান\n১০৩ - মারুফ হোসেন",
    accessCodeCountLabel: "মোট ওয়ান-টাইম কোড তৈরি হবে:",
    summaryReview: "নির্বাচনের সংক্ষিপ্ত বিবরণ",
    totalCandidatesLabel: "মোট প্রার্থী:",
    votingWindowLabel: "ভোটের সময়সীমা:",

    // Created Success Screen
    createdSuccessTitle: "নির্বাচন সফলভাবে তৈরি হয়েছে!",
    createdSuccessSubtitle: "আপনার নির্বাচনটি এখন লাইভ। ভোটারদের সাথে নিচের কোড বা লিঙ্ক শেয়ার করুন।",
    shareCodeLabel: "নির্বাচন জয়েন কোড:",
    shareLinkBtn: "লিঙ্ক কপি করুন",
    shareWhatsappBtn: "হোয়াটসঅ্যাপে পাঠান",
    downloadQrBtn: "কিউআর কোড সংরক্ষণ করুন",
    btnGoToAdmin: "অ্যাডমিন ড্যাশবোর্ডে যান",
    btnGoToVote: "ভোট পেজ ওপেন করুন",

    // Voter Experience (Ballot)
    voterHeading: "ব্যালট পেপার",
    voterEnterCodeTitle: "ভোটার যাচাইকরণ",
    voterEnterCodeSubtitle: "ভোট দেওয়ার জন্য আপনার জন্য বরাদ্দকৃত ওয়ান-টাইম ভোটার কোড দিন।",
    voterCodePlaceholder: "যেমন: V-7824 বা আপনার রোল",
    btnVerifyCode: "ব্যালট পেপারে প্রবেশ করুন",
    voterAlreadyVoted: "এই কোড দিয়ে ইতোমধ্যে ভোট দেওয়া হয়েছে। এক ভোটার একবারই ভোট দিতে পারেন।",
    voterSelectInstructionSingle: "যেকোনো একজন প্রার্থীকে বেছে নিয়ে নিচে ‘পরবর্তী’ চাপুন।",
    voterSelectInstructionMultiple: "সর্বোচ্চ প্রার্থীদের বেছে নিন।",
    voterSelectInstructionRanked: "আপনার পছন্দ অনুযায়ী ১, ২, ৩ ক্রম নির্বাচন করুন।",
    btnSelect: "বেছে নিন",
    btnSelected: "বাছাই করা হয়েছে ✓",
    btnReviewSelection: "বাছাই পর্যালোচনা করুন",
    reviewTitle: "আপনার ভোট নিশ্চিত করুন",
    reviewSubtitle: "ভোট জমা দেওয়ার পর তা আর পরিবর্তন করা যাবে না। দয়া করে আপনার পছন্দ মিলিয়ে নিন।",
    chosenCandidate: "আপনার নির্বাচিত প্রার্থী:",
    btnConfirmVote: "হ্যাঁ, ভোট চূড়ান্ত করুন",
    btnChangeSelection: "পছন্দ পরিবর্তন করতে ফিরে যান",
    submittingVote: "ভোট জমা হচ্ছে...",

    // Vote Confirmation Receipt
    voteSuccessTitle: "আপনার ভোট সফলভাবে গৃহীত হয়েছে!",
    voteSuccessSubtitle: "আপনার মতামত গণতান্ত্রিকভাবে সংরক্ষিত হয়েছে। নিচে আপনার ডিজিটাল রসিদ দেওয়া হলো।",
    receiptLabel: "আপনার ব্যালট রসিদ কোড:",
    receiptProofNote:
      "এই কোডটি সংরক্ষণ করুন। নির্বাচন শেষে ফলাফল পেজে গিয়ে আপনি যাচাই করতে পারবেন আপনার ভোটটি ঠিকভাবে গণনায় এসেছে কি না। আপনার পরিচয় কখনোই কারো কাছে প্রকাশিত হবে না।",
    btnCopyReceipt: "রসিদ কপি করুন",
    btnGoToResults: "ফলাফল ও টার্নআউট দেখুন",
    btnVerifyNow: "রসিদ এখনই যাচাই করুন",

    // Results Page
    resultsTitle: "নির্বাচনী ফলাফল",
    resultsLiveBadge: "লাইভ টার্নআউট",
    resultsClosedBadge: "ভোট সমাপ্ত",
    winnerHighlight: "বিজয়ী প্রার্থী",
    winnerVotes: "প্রাপ্ত ভোট",
    winnerVoteShare: "ভোটের হার",
    tieTitle: "সমতা (Tie)! একাধিক প্রার্থী সমান ভোট পেয়েছেন",
    totalVotesCast: "মোট কাস্ট হওয়া ভোট",
    totalRegistered: "মোট নিবন্ধিত ভোটার",
    turnoutRate: "টার্নআউট",
    timeRemainingLabel: "অবশিষ্ট সময়",
    chartTitle: "ভোটের পরিসংখ্যান",
    btnExportCsv: "ফলাফল CSV ডাউনলোড",
    btnPrintResults: "প্রিন্ট বা PDF সংরক্ষণ",
    btnAdminDashboard: "অ্যাডমিন প্যানেল",

    // Admin Dashboard
    adminTitle: "নির্বাচন পরিচালনা ড্যাশবোর্ড",
    adminSubtitle: "রিয়েল-টাইম টার্নআউট পর্যবেক্ষণ ও কন্ট্রোল রুম।",
    adminPinPrompt: "অ্যাডমিন পিন দিয়ে লগইন করুন",
    adminPinInput: "অ্যাডমিন পিন লিখুন",
    btnLoginAdmin: "ড্যাশবোর্ডে প্রবেশ করুন",
    btnEndNow: "ভোট এখনই সমাপ্ত করুন",
    btnExtend1Hour: "+১ ঘণ্টা সময় বাড়ান",
    btnExtend1Day: "+১ দিন সময় বাড়ান",
    btnDownloadCodes: "ভোটার কোড তালিকা (CSV)",
    auditLogHeading: "সিস্টেম ও অডিট লগ",
    liveActivityHeading: "সাম্প্রতিক ভোটের টাইমস্ট্যাম্প (সম্পূর্ণ গোপন ব্যালট)",
    noActivityYet: "এখনও কোনো ভোট জমা পড়েনি।",

    // Verify Page
    verifyHeading: "ডিজিটাল ব্যালট অডিট ও যাচাইকরণ",
    verifySubtitle: "ভোটবিডির ক্রিপ্টোগ্রাফিক হ্যাশ-চেইনের মাধ্যমে নিশ্চিত হোন আপনার দেওয়া ভোট গণনায় অন্তর্ভুক্ত হয়েছে।",
    verifyInputLabel: "আপনার ব্যালট রসিদ কোড দিন",
    verifyInputPlaceholder: "যেমন: VBD-74AB-92EF",
    btnCheckReceipt: "রসিদ স্ট্যাটাস চেক করুন",
    receiptFoundTitle: "ভোট সঠিকভাবে গণনায় অন্তর্ভুক্ত রয়েছে!",
    receiptBlockNumber: "ব্লক সিকোয়েন্স নম্বর:",
    receiptTimestamp: "ভোট দেওয়ার সময় (BST):",
    receiptChainIntegrity: "হ্যাশ-চেইন স্ট্যাটাস: অক্ষত ও বৈধ (Verified ✓)",
    receiptNotFound: "দুঃখিত, এই রসিদ কোডটি পাওয়া যায়নি। কোডটি পুনরায় চেক করুন।",

    // General
    loading: "লোড হচ্ছে...",
    errorGeneric: "একটি ত্রুটি হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।",
    copiedToast: "ক্লিপবোর্ডে কপি করা হয়েছে!",
  },
  en: {
    // Brand
    brandName: "VoteBD",
    brandTagline: "Modern, Secure & Accessible Voting Platform for Bangladesh",
    brandBadge: "Trusted Organizational Voting for Bangladesh",

    // Navigation
    navHome: "Home",
    navCreate: "Create Election",
    navJoin: "Vote Now",
    navVerify: "Verify Receipt",
    navDemo: "Demo Election",

    // Accessibility Controls
    a11yTitle: "Accessibility Settings",
    textSizeSmall: "Small text",
    textSizeNormal: "Normal",
    textSizeLarge: "Large text",
    highContrastOn: "High-contrast ON",
    highContrastOff: "High-contrast OFF",
    numeralBangla: "Bangla Numerals (১২৩)",
    numeralEnglish: "English Numerals (123)",
    langToggle: "বাংলা",

    // Landing Page Hero
    heroBadge: "Clean, Honest Voting for Classes, Clubs & Communities",
    heroTitle: "Elections that are transparent, fair, and truly private.",
    heroSubtitle:
      "Class representative elections, student dorms, clubs, or residential housing societies—a mobile-first voting platform designed for real people. Cast your ballot in under 30 seconds with zero friction.",
    heroCtaCreate: "Create an Election",
    heroCtaJoin: "Enter Join Code",
    heroTryDemo: "Try Live Demo (Class 10 CR Election)",
    heroMockupCaption: "Instant mobile ballot card preview",
    heroTrustStat1: "100% Secret Ballot",
    heroTrustStat1Sub: "Zero database relation between voter identity and selected candidate",
    heroTrustStat2: "Tamper-Proof Chain",
    heroTrustStat2Sub: "Every ballot sealed cryptographically into an immutable audit chain",
    heroTrustStat3: "Built for Everyone",
    heroTrustStat3Sub: "Superfast on low-end Android smartphones and 3G networks",

    // Join Code Box
    joinBoxTitle: "Have an Election Code?",
    joinBoxPlaceholder: "e.g. CR-2024 or 6-digit code",
    joinBoxButton: "Open Ballot",
    joinBoxHelper: "Enter the 6-character code or link shared by the organizer.",

    // Pillars
    pillarsTitle: "Why Choose VoteBD?",
    pillarsSubtitle: "Three core pillars designed specifically for the real-world Bangladeshi institutional context.",
    pillar1Title: "Strict Security & True Secret Ballot",
    pillar1Desc:
      "Voter identity and cast ballots are stored in separate, unlinked tables. Not even the election administrator can see who voted for whom. Atomic enforcement guarantees strict one-voter-one-vote.",
    pillar2Title: "Accessible & Built for Mobile",
    pillar2Desc:
      "No mandatory password creation or complicated downloads. Loads instantaneously even on basic mobile devices and fluctuating mobile data.",
    pillar3Title: "Verifiable Transparency & Digital Receipts",
    pillar3Desc:
      "Every voter receives an anonymous receipt code after voting. Anyone can independently verify that their vote was counted without exposing their choice.",

    // How it works
    howItWorksTitle: "How It Works",
    howItWorksSubtitle: "Run a complete election in four simple, guided steps.",
    step1Title: "1. Create Election",
    step1Desc: "Add candidates, choose voting rules, and set Dhaka time boundaries in 2 minutes.",
    step2Title: "2. Invite Voters",
    step2Desc: "Share via WhatsApp, QR code, or distribute individual one-time voter codes.",
    step3Title: "3. Cast Secret Ballot",
    step3Desc: "Voters select their choice on a clean mobile screen and receive an instant proof receipt.",
    step4Title: "4. Instant Results",
    step4Desc: "Automatic real-time or post-close tally with visual charts and verifiable audit log.",

    // Use cases
    useCasesTitle: "Who Uses VoteBD?",
    useCase1Title: "Schools, Colleges & Universities",
    useCase1Desc: "Class representative (CR), batch coordinator, hall committees, and departmental councils.",
    useCase2Title: "Clubs & Student Societies",
    useCase2Desc: "Debate clubs, cultural forums, tech chapters, and volunteer executive boards.",
    useCase3Title: "Mosque, Samity & Housing Societies",
    useCase3Desc: "Cooperative societies, mosque management, flat owners associations, and NGO committees.",
    useCase4Title: "Quick Polls & Group Decisions",
    useCase4Desc: "Deciding tour destinations, picnic dates, event themes, or quick surveys.",

    // FAQ
    faqTitle: "Frequently Asked Questions",
    faqQ1: "Is my vote genuinely secret? Can the teacher or organizer see it?",
    faqA1: "Yes, completely secret. The voter registry ('who voted') and the ballot box ('which option received a vote') are strictly disconnected. There is no technical way for any admin to trace a vote back to your name.",
    faqQ2: "Can anyone vote more than once?",
    faqA2: "No. Our database uses atomic single-vote locking. As soon as a voter code or device is confirmed, it is marked as used and cannot cast another ballot.",
    faqQ3: "Can results be altered or manipulated?",
    faqA3: "No. Each vote is chained to the previous vote using SHA-256 cryptographic hashing. Modifying or deleting any ballot breaks the mathematical chain instantly.",
    faqQ4: "Is this intended for national or government elections?",
    faqA4: "No. VoteBD is built honestly and specifically for organizational, academic, and community elections. It is not an official government or national election tool.",

    // Footer
    footerDisclaimer:
      "Commitment to Honesty: VoteBD is an independent organizational and community voting tool, not intended for state or national elections. All data is encrypted and neutrally tallied.",
    footerQuickLinks: "Quick Links",
    footerSecurity: "Security & Audit",
    footerContact: "Support & Docs",
    footerDhakaTime: "Bangladesh Standard Time (BST, UTC+6):",

    // Election Wizard
    wizardTitle: "Create a New Election",
    wizardStep1: "1. Basics",
    wizardStep2: "2. Candidates",
    wizardStep3: "3. Rules & Schedule",
    wizardStep4: "4. Access & Publish",
    btnNext: "Next Step",
    btnBack: "Back",
    btnPublish: "Launch Election",
    btnSaving: "Saving...",

    // Wizard Step 1
    fieldTitle: "Election Title *",
    fieldTitlePlaceholder: "e.g. Class 10 CR Election 2024",
    fieldDesc: "Description or Instructions",
    fieldDescPlaceholder: "Any instructions for voters...",
    fieldCategory: "Category",
    catClass: "School / College / University",
    catClub: "Club / Student Organization",
    catCommunity: "Community / Mosque / Society",
    catPoll: "Quick Poll / Survey",
    fieldType: "Election Type",
    typeSingle: "Single Choice - 1 Winner",
    typeMultiple: "Multiple Choice - Multiple Winners",
    typeRanked: "Ranked Choice - Preference Order",
    typeYesNo: "Yes / No Referendum",

    // Wizard Step 2
    candidatesTitle: "Candidates & Options",
    candidatesSubtitle: "Add at least 2 candidates or options. Reorder or customize icons.",
    btnAddCandidate: "+ Add Candidate",
    candidateNamePlaceholder: "Candidate Name",
    candidateSymbolPlaceholder: "Symbol or Emoji (e.g. ⚽, 📚, 🕊️)",
    candidateBioPlaceholder: "Short bio or student roll",
    allowNotaToggle: "Add \"None of the above\" (NOTA) option",
    allowNotaDesc: "Allow voters to express dissent if they do not prefer any candidate.",

    // Wizard Step 3
    rulesTitle: "Timing & Privacy Settings",
    rulesSubtitle: "Set Dhaka time window and result visibility rules.",
    fieldStartTime: "Start Time (BST)",
    fieldEndTime: "End Time (BST)",
    fieldResultVisibility: "Result Visibility",
    visAfterClose: "Revealed only after election closes (Maximizes secrecy)",
    visLive: "Live turnout and tally visible while voting",
    adminPinLabel: "Admin Management PIN *",
    adminPinPlaceholder: "4 to 6 digit secret PIN",
    adminPinHelper: "Used to manage your election, close early, or export data. Keep this private.",

    // Wizard Step 4
    accessTitle: "Voter Access & Security Level",
    accessTypeJoinCode: "Open Join Code (Voters enter code; 1 vote per device)",
    accessTypeCodeList: "Voter Roll / Code List (High Security: unique one-time codes per student)",
    accessVoterListPlaceholder: "Paste student roll or names (one per line): \n101 - Tanvir Ahmed\n102 - Sadia Jahan\n103 - Maruf Hossain",
    accessCodeCountLabel: "Total one-time voter codes to generate:",
    summaryReview: "Election Summary",
    totalCandidatesLabel: "Total Candidates:",
    votingWindowLabel: "Voting Window:",

    // Created Success Screen
    createdSuccessTitle: "Election Created Successfully!",
    createdSuccessSubtitle: "Your election is now live. Share the code or link with voters.",
    shareCodeLabel: "Election Join Code:",
    shareLinkBtn: "Copy Link",
    shareWhatsappBtn: "Share to WhatsApp",
    downloadQrBtn: "Download QR Code",
    btnGoToAdmin: "Go to Admin Dashboard",
    btnGoToVote: "Open Ballot Page",

    // Voter Experience (Ballot)
    voterHeading: "Official Ballot Paper",
    voterEnterCodeTitle: "Voter Verification",
    voterEnterCodeSubtitle: "Enter the one-time voter code assigned to you by the organizer.",
    voterCodePlaceholder: "e.g. V-7824 or Student Roll",
    btnVerifyCode: "Enter Voting Booth",
    voterAlreadyVoted: "This voter code has already been used. Each voter can only cast one ballot.",
    voterSelectInstructionSingle: "Select one candidate below and click 'Review Selection'.",
    voterSelectInstructionMultiple: "Select your desired candidates.",
    voterSelectInstructionRanked: "Order candidates by your 1st, 2nd, and 3rd preference.",
    btnSelect: "Select",
    btnSelected: "Selected ✓",
    btnReviewSelection: "Review Selection",
    reviewTitle: "Confirm Your Vote",
    reviewSubtitle: "Once submitted, your vote cannot be changed or recalled. Please review carefully.",
    chosenCandidate: "Your Selected Candidate:",
    btnConfirmVote: "Confirm and Cast Ballot",
    btnChangeSelection: "Go back to change",
    submittingVote: "Submitting ballot...",

    // Vote Confirmation Receipt
    voteSuccessTitle: "Ballot Cast Successfully!",
    voteSuccessSubtitle: "Your voice is officially counted. Below is your anonymous digital receipt.",
    receiptLabel: "Your Ballot Receipt Code:",
    receiptProofNote:
      "Save this code. You can use it anytime on the results page to verify your ballot was included in the final count, without revealing who you voted for.",
    btnCopyReceipt: "Copy Receipt Code",
    btnGoToResults: "View Live Turnout & Results",
    btnVerifyNow: "Verify Receipt Now",

    // Results Page
    resultsTitle: "Election Results",
    resultsLiveBadge: "Live Turnout",
    resultsClosedBadge: "Election Closed",
    winnerHighlight: "Projected Winner",
    winnerVotes: "Total Votes",
    winnerVoteShare: "Vote Share",
    tieTitle: "Tie Detected! Multiple candidates received equal votes",
    totalVotesCast: "Total Ballots Cast",
    totalRegistered: "Eligible Voters",
    turnoutRate: "Voter Turnout",
    timeRemainingLabel: "Time Remaining",
    chartTitle: "Vote Breakdown",
    btnExportCsv: "Export Results (CSV)",
    btnPrintResults: "Print / Save PDF",
    btnAdminDashboard: "Admin Dashboard",

    // Admin Dashboard
    adminTitle: "Election Management Dashboard",
    adminSubtitle: "Live voter participation and administrative controls.",
    adminPinPrompt: "Enter Admin PIN to Authenticate",
    adminPinInput: "Admin PIN",
    btnLoginAdmin: "Access Dashboard",
    btnEndNow: "Close Election Now",
    btnExtend1Hour: "Extend Deadline (+1 Hour)",
    btnExtend1Day: "Extend Deadline (+1 Day)",
    btnDownloadCodes: "Download Voter Codes (CSV)",
    auditLogHeading: "Audit Log & System Events",
    liveActivityHeading: "Recent Ballot Activity (Strict Secret Ballot)",
    noActivityYet: "No ballots cast yet.",

    // Verify Page
    verifyHeading: "Digital Ballot Verification",
    verifySubtitle: "Verify your ballot inclusion in the tamper-evident cryptographic hash chain.",
    verifyInputLabel: "Enter your Ballot Receipt Code",
    verifyInputPlaceholder: "e.g. VBD-74AB-92EF",
    btnCheckReceipt: "Verify Ballot Status",
    receiptFoundTitle: "Ballot Officially Counted and Sealed!",
    receiptBlockNumber: "Block Sequence #:",
    receiptTimestamp: "Cast Timestamp (BST):",
    receiptChainIntegrity: "Cryptographic Chain: Intact & Validated ✓",
    receiptNotFound: "No ballot found with this receipt code. Please check and try again.",

    // General
    loading: "Loading...",
    errorGeneric: "An error occurred. Please try again.",
    copiedToast: "Copied to clipboard!",
  },
};
