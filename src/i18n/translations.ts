export type Locale = "bn" | "en";

export const translations = {
  bn: {
    // Brand
    brandName: "ভোটবিডি",
    brandTagline: "বাংলাদেশের জন্য নিরাপদ, স্বচ্ছ ও সহজ প্রাতিষ্ঠানিক ভোটিং প্ল্যাটফর্ম",
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
    highContrastOn: "হাই-কনট্রাস্ট চালু",
    highContrastOff: "হাই-কনট্রাস্ট বন্ধ",
    numeralBangla: "বাংলা সংখ্যা (১২৩৪)",
    numeralEnglish: "ইংরেজি সংখ্যা (1234)",
    themeTitle: "থিম নির্বাচন",
    themeLight: "লাইট",
    themeDark: "ডার্ক",
    themeSystem: "সিস্টেম",
    langToggle: "English",

    // Landing Page Hero
    heroBadge: "ক্লাস, ক্লাব ও কমিউনিটির জন্য ভোটিং ব্যবস্থা",
    heroTitle: "ভোটাভুটি হোক স্বচ্ছ, নিরপেক্ষ ও সম্পূর্ণ নিরাপদ",
    heroSubtitle:
      "ক্লাস রিপ্রেজেন্টেটিভ নির্বাচন, হল সংসদ, ক্লাব কিংবা পাড়া-মহল্লার সমিতি—সব ধরনের প্রাতিষ্ঠানিক নির্বাচনের জন্য মোবাইল-বান্ধব সমাধান। কোনো প্রযুক্তিগত জটিলতা ছাড়া ৩০ সেকেন্ডে গোপন ব্যালটে ভোট দিন।",
    heroCtaCreate: "নির্বাচন তৈরি করুন",
    heroCtaJoin: "কোড দিয়ে ভোট দিন",
    heroTryDemo: "সরাসরি ডেমো দেখুন (দশম শ্রেণি সিআর নির্বাচন)",
    heroMockupCaption: "মোবাইলে তাৎক্ষণিক ও গোপন ব্যালট পেপার",
    heroTrustStat1: "১০০% গোপনীয়",
    heroTrustStat1Sub: "ভোটারের পরিচয়ের সাথে পছন্দের কোনো সংযোগ থাকে না",
    heroTrustStat2: "ট্যাম্পার-প্রুফ চেইন",
    heroTrustStat2Sub: "প্রতিটি ব্যালট ক্রিপ্টোগ্রাফিক হ্যাশ দ্বারা সুরক্ষিত",
    heroTrustStat3: "সবার জন্য সহজ",
    heroTrustStat3Sub: "সাধারণ স্মার্টফোন এবং ধীর গতির নেটওয়ার্কেও দ্রুত কাজ করে",

    // Join Code Box
    joinBoxTitle: "আপনার কাছে কি নির্বাচনের কোড আছে",
    joinBoxPlaceholder: "যেমন: CR-2024 বা ৬ অক্ষরের কোড",
    joinBoxButton: "ব্যালট খুলুন",
    joinBoxHelper: "নির্বাচনের আয়োজক থেকে প্রাপ্ত ৬ অক্ষরের কোড অথবা লিঙ্ক দিন।",

    // Pillars
    pillarsTitle: "কেন ভোটবিডি বেছে নেবেন",
    pillarsSubtitle: "বাংলাদেশের স্থানীয় প্রতিষ্ঠানগুলোর বাস্তব চাহিদার ওপর ভিত্তি করে নির্মিত তিনটি মূল স্তম্ভ।",
    pillar1Title: "সর্বোচ্চ নিরাপত্তা ও গোপন ব্যালট",
    pillar1Desc:
      "ডাটাবেজে ভোটারের পরিচয় এবং ভোট সম্পূর্ণ আলাদা সংরক্ষিত থাকে। আয়োজক বা অ্যাডমিনও জানতে পারবেন না কে কাকে ভোট দিয়েছেন। এক ভোটার কখনোই দুটি ভোট দিতে পারবেন না।",
    pillar2Title: "সবার জন্য সহজ ও মোবাইল-ফার্স্ট",
    pillar2Desc:
      "কোনো জটিল রেজিস্ট্রেশন বা পাসওয়ার্ডের ঝামেলা নেই। সাধারণ স্মার্টফোন এবং ধীর গতির ইন্টারনেটেও দ্রুত পেজ লোড হয়।",
    pillar3Title: "স্বচ্ছতা ও ডিজিটাল রসিদ",
    pillar3Desc:
      "ভোট দেওয়ার পর পাবেন একটি গোপন ডিজিটাল রসিদ কোড। নির্বাচন শেষে যে কেউ যাচাই করে দেখতে পারেন তাদের ভোটটি সঠিকভাবে গণনা করা হয়েছে কি না।",

    // How it works
    howItWorksTitle: "কীভাবে কাজ করে",
    howItWorksSubtitle: "মাত্র ৪টি সহজ ধাপে সম্পন্ন করুন আপনার নির্বাচন।",
    step1Title: "১. নির্বাচন তৈরি করুন",
    step1Desc: "প্রার্থী তালিকা, নিয়ম এবং শুরুর ও শেষের সময় নির্ধারণ করুন। ২ মিনিটের মধ্যে প্রস্তুত।",
    step2Title: "২. ভোটারদের আমন্ত্রণ জানান",
    step2Desc: "হোয়াটসঅ্যাপ, মেসেঞ্জার বা প্রিন্ট করা কিউআর কোডের মাধ্যমে লিংক বা ভোটার কোড শেয়ার করুন।",
    step3Title: "৩. স্বাচ্ছন্দ্যে ভোট দিন",
    step3Desc: "ভোটাররা মোবাইল থেকে প্রার্থী বেছে নিয়ে কনফার্ম করবেন এবং একটি ডিজিটাল রসিদ পাবেন।",
    step4Title: "৪. তাৎক্ষণিক ফলাফল দেখুন",
    step4Desc: "নির্ধারিত সময় শেষে স্বয়ংক্রিয়ভাবে বিজয়ী, শতকরা হার ও ভিজ্যুয়াল গ্রাফ প্রকাশিত হবে।",

    // Use cases
    useCasesTitle: "কারা ব্যবহার করছেন",
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
    faqA1:
      "হ্যাঁ, আপনার ভোট ১০০% গোপন। ভোটবিডির ডাটাবেজে ভোটারের তালিকা (কে ভোট দিয়েছেন) এবং ব্যালট বক্স (কোন প্রার্থী ভোট পেয়েছেন) দুটি সম্পূর্ণ পৃথকভাবে রাখা হয়। কোনোভাবেই ভোটারের নামের সাথে প্রার্থীর পছন্দের সংযোগ বের করা প্রযুক্তিগতভাবে সম্ভব নয়।",
    faqQ2: "এক ব্যক্তি কি একাধিকবার ভোট দিতে পারবেন?",
    faqA2:
      "না। প্রতিটি ভোটার কোড বা ডিভাইসে একবারের বেশি ভোট দেওয়া যায় না। আপনি কনফার্ম করার সাথে সাথে কোডটি স্বয়ংক্রিয়ভাবে ব্যবহৃত হিসেবে চিহ্নিত হয়।",
    faqQ3: "ফলাফল কি টেম্পার বা পরিবর্তন করা সম্ভব?",
    faqA3:
      "না। প্রতিটি ব্যালট ক্রিপ্টোগ্রাফিক হ্যাশ-চেইনে সংরক্ষিত থাকে। কোনো ব্যালট মোছা বা পরিবর্তন করতে গেলে পুরো অডিট চেইন ভেঙে যাবে এবং তা তাৎক্ষণিক ধরা পড়বে।",
    faqQ4: "এটি কি জাতীয় বা সরকারি নির্বাচনের জন্য?",
    faqA4:
      "না, ভোটবিডি শিক্ষাপ্রতিষ্ঠান, ছাত্র সংসদ, ক্লাব, হাউজিং সোসাইটি ও সামাজিক সংগঠনের অভ্যন্তরীণ গণতান্ত্রিক প্রক্রিয়ার জন্য প্রস্তুত করা হয়েছে। এটি কোনো সরকারি বা জাতীয় নির্বাচন কমিশনের প্ল্যাটফর্ম নয়।",

    // Footer
    footerDisclaimer:
      "স্বচ্ছতার অঙ্গীকার: ভোটবিডি একটি স্বাধীন প্রাতিষ্ঠানিক ও কমিউনিটি ভোটিং টুল। এটি জাতীয় বা সরকারি নির্বাচনের জন্য প্রযোজ্য নয়। সকল তথ্য নিরপেক্ষভাবে পরিচালিত ও সংরক্ষিত।",
    footerQuickLinks: "দ্রুত লিঙ্ক",
    footerSecurity: "নিরাপত্তা ও অডিট",
    footerContact: "যোগাযোগ ও সহায়তা",
    footerDhakaTime: "বাংলাদেশ মান সময় (BST, UTC+6)",

    // Election Wizard
    wizardTitle: "নতুন নির্বাচন তৈরি করুন",
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
    fieldTitlePlaceholder: "যেমন: দশম শ্রেণি সিআর নির্বাচন ২০২৬",
    fieldDesc: "বিবরণ বা নির্দেশনা",
    fieldDescPlaceholder: "ভোটারদের জন্য কোনো বিশেষ বার্তা থাকলে লিখুন",
    fieldCategory: "ক্যাটাগরি",
    catClass: "শ্রেণি / শিক্ষাপ্রতিষ্ঠান",
    catClub: "ক্লাব / ছাত্র সংগঠন",
    catCommunity: "সমিতি / মসজিদ / হাউজিং",
    catPoll: "কুইক পোল / মতামত",
    fieldType: "ভোটের ধরন",
    typeSingle: "একক বাছাই (Single Choice)",
    typeMultiple: "একাধিক বাছাই (Multiple Choice)",
    typeRanked: "র‌্যাঙ্কড চয়েস (Ranked Choice)",
    typeYesNo: "হ্যাঁ / না সম্মতি (Yes / No)",

    // Wizard Step 2
    candidatesTitle: "প্রার্থী বা বিকল্পের তালিকা",
    candidatesSubtitle: "কমপক্ষে ২টি প্রার্থী বা বিকল্প যোগ করুন।",
    btnAddCandidate: "প্রার্থী যোগ করুন",
    candidateNamePlaceholder: "প্রার্থীর নাম",
    candidateSymbolPlaceholder: "প্রতীক",
    candidateBioPlaceholder: "সংক্ষিপ্ত পরিচিতি বা রোল",
    allowNotaToggle: "\"উপরের কাউকে নয়\" (NOTA) বিকল্প যুক্ত করুন",
    allowNotaDesc: "ভোটাররা চাইলে কোনো নির্দিষ্ট প্রার্থীকে পছন্দ না করে অসন্তোষ জানাতে পারবেন।",

    // Wizard Step 3
    rulesTitle: "সময়সীমা ও গোপনীয়তা সেটিংস",
    rulesSubtitle: "বাংলাদেশ মান সময় অনুযায়ী শুরু ও শেষ এবং ফলাফলের নিয়ম ঠিক করুন।",
    fieldStartTime: "ভোট শুরুর সময় (BST)",
    fieldEndTime: "ভোট সমাপ্তির সময় (BST)",
    fieldResultVisibility: "ফলাফল দৃশ্যমানতা",
    visAfterClose: "ভোট শেষ হওয়ার পর প্রকাশিত হবে",
    visLive: "ভোট চলাকালীন লাইভ ফলাফল দেখা যাবে",
    adminPinLabel: "অ্যাডমিন ম্যানেজমেন্ট পিন (PIN) *",
    adminPinPlaceholder: "৪–৮ ডিজিটের পিন",
    adminPinHelper: "এই পিন দিয়ে আপনি পরবর্তীতে নির্বাচন বন্ধ করতে বা ফলাফল এক্সপোর্ট করতে পারবেন।",

    // Wizard Step 4
    accessTitle: "ভোটার প্রবেশাধিকার ও নিরাপত্তা স্তর",
    accessTypeJoinCode: "উন্মুক্ত জয়েন কোড (এক ডিভাইস থেকে একবার ভোট)",
    accessTypeCodeList: "ভোটার রোল ও কোড তালিকা (প্রতিটি ভোটারের জন্য একক ওয়ান-টাইম কোড)",
    accessVoterListPlaceholder: "রোল বা নাম লিখুন (প্রতি লাইনে একটি):\n১০১ - তানভীর আহমেদ\n১০২ - সাদিয়া জাহান\n১০৩ - মারুফ হোসেন",
    accessCodeCountLabel: "মোট ওয়ান-টাইম কোড তৈরি হবে",
    summaryReview: "নির্বাচনের সংক্ষিপ্ত বিবরণ",
    totalCandidatesLabel: "মোট প্রার্থী",
    votingWindowLabel: "ভোটের সময়সীমা",

    // Created Success Screen
    createdSuccessTitle: "নির্বাচন সফলভাবে তৈরি হয়েছে",
    createdSuccessSubtitle: "আপনার নির্বাচনটি এখন সক্রিয়। ভোটারদের সাথে নিচের কোড বা লিঙ্ক শেয়ার করুন।",
    shareCodeLabel: "নির্বাচন জয়েন কোড",
    shareLinkBtn: "লিঙ্ক কপি করুন",
    shareWhatsappBtn: "হোয়াটসঅ্যাপে পাঠান",
    downloadQrBtn: "কিউআর কোড ডাউনলোড",
    btnGoToAdmin: "অ্যাডমিন ড্যাশবোর্ডে যান",
    btnGoToVote: "ভোট পেজ খুলুন",

    // Voter Experience (Ballot)
    voterHeading: "ব্যালট পেপার",
    voterEnterCodeTitle: "ভোটার যাচাইকরণ",
    voterEnterCodeSubtitle: "ভোট দেওয়ার জন্য আপনার জন্য বরাদ্দকৃত ওয়ান-টাইম ভোটার কোড দিন।",
    voterCodePlaceholder: "যেমন: CR-V104",
    btnVerifyCode: "ব্যালট পেপারে প্রবেশ করুন",
    voterAlreadyVoted: "এই কোড দিয়ে ইতোমধ্যে ভোট দেওয়া হয়েছে। এক ভোটার একবারই ভোট দিতে পারেন।",
    voterSelectInstructionSingle: "একজন প্রার্থী বেছে নিয়ে ‘বাছাই পর্যালোচনা’ চাপুন",
    voterSelectInstructionMultiple: "আপনার পছন্দের প্রার্থীদের বেছে নিন",
    voterSelectInstructionRanked: "অগ্রাধিকার অনুযায়ী ১, ২, ৩ ক্রমে বেছে নিন",
    btnSelect: "বেছে নিন",
    btnSelected: "বাছাই করা হয়েছে",
    btnReviewSelection: "বাছাই পর্যালোচনা করুন",
    reviewTitle: "আপনার ভোট নিশ্চিত করুন",
    reviewSubtitle: "ভোট জমা দেওয়ার পর তা আর পরিবর্তন করা যাবে না। দয়া করে আপনার পছন্দ মিলিয়ে নিন।",
    chosenCandidate: "আপনার নির্বাচিত প্রার্থী",
    btnConfirmVote: "ভোট চূড়ান্ত করুন",
    btnChangeSelection: "পছন্দ পরিবর্তন করতে ফিরে যান",
    submittingVote: "ভোট জমা হচ্ছে...",

    // Vote Confirmation Receipt
    voteSuccessTitle: "আপনার ভোট সফলভাবে গৃহীত হয়েছে",
    voteSuccessSubtitle: "আপনার মতামত গোপন ব্যালটে সংরক্ষিত হয়েছে। নিচে আপনার ডিজিটাল রসিদ দেওয়া হলো।",
    receiptLabel: "আপনার ব্যালট রসিদ কোড",
    receiptProofNote:
      "এই কোডটি সংরক্ষণ করুন। যেকোনো সময় রসিদ যাচাই পেজে গিয়ে আপনি নিশ্চিত হতে পারবেন আপনার ভোটটি হ্যাশ-চেইনে সঠিকভাবে গণনায় এসেছে কি না।",
    btnCopyReceipt: "রসিদ কপি করুন",
    btnGoToResults: "ফলাফল ও টার্নআউট দেখুন",
    btnVerifyNow: "রসিদ যাচাই করুন",

    // Results Page
    resultsTitle: "নির্বাচনী ফলাফল",
    resultsLiveBadge: "লাইভ টার্নআউট",
    resultsClosedBadge: "ভোট সমাপ্ত",
    winnerHighlight: "বিজয়ী প্রার্থী",
    winnerVotes: "প্রাপ্ত ভোট",
    winnerVoteShare: "ভোটের হার",
    tieTitle: "সমতা (Tie): একাধিক প্রার্থী সমান ভোট পেয়েছেন",
    totalVotesCast: "মোট কাস্ট হওয়া ভোট",
    totalRegistered: "মোট নিবন্ধিত ভোটার",
    turnoutRate: "টার্নআউট",
    timeRemainingLabel: "অবশিষ্ট সময়",
    chartTitle: "ভোটের পরিসংখ্যান",
    btnExportCsv: "CSV ডাউনলোড",
    btnPrintResults: "প্রিন্ট / PDF",
    btnAdminDashboard: "অ্যাডমিন প্যানেল",

    // Admin Dashboard
    adminTitle: "নির্বাচন পরিচালনা ড্যাশবোর্ড",
    adminSubtitle: "রিয়েল-টাইম টার্নআউট পর্যবেক্ষণ ও কন্ট্রোল রুম",
    adminPinPrompt: "অ্যাডমিন পিন দিয়ে লগইন করুন",
    adminPinInput: "অ্যাডমিন পিন লিখুন",
    btnLoginAdmin: "ড্যাশবোর্ডে প্রবেশ করুন",
    btnEndNow: "ভোট সমাপ্ত করুন",
    btnExtend1Hour: "+১ ঘণ্টা বাড়ান",
    btnExtend1Day: "+১ দিন বাড়ান",
    btnDownloadCodes: "ভোটার কোড (CSV)",
    btnDuplicate: "ডুপ্লিকেট করুন",
    btnLockAdmin: "লক সেশন",
    duplicateSuccess: "নির্বাচন সফলভাবে ডুপ্লিকেট করা হয়েছে",
    confirmCloseTitle: "আপনি কি এখনই নির্বাচন সমাপ্ত করতে চান",
    confirmCloseDesc: "সমাপ্ত করলে আর কোনো ভোটার ভোট দিতে পারবেন না। চূড়ান্ত ফলাফল তাৎক্ষণিক স্থির হয়ে যাবে।",
    confirmExtendTitle: "নির্বাচনের সময়সীমা বৃদ্ধি",
    confirmDuplicateTitle: "নতুন মেয়াদের জন্য নির্বাচন ক্লোন করুন",
    confirmDuplicateDesc: "এটি বর্তমান প্রার্থী ও সেটিংস রেখে নতুন কোড সহ একটি সতেজ নির্বাচন তৈরি করবে।",
    auditLogHeading: "সিস্টেম ও অডিট লগ",
    liveActivityHeading: "সাম্প্রতিক ভোটের টাইমস্ট্যাম্প (গোপন ব্যালট)",
    noActivityYet: "এখনও কোনো ভোট জমা পড়েনি।",

    // Verify Page
    verifyHeading: "ডিজিটাল ব্যালট অডিট ও যাচাইকরণ",
    verifySubtitle: "ভোটবিডির ক্রিপ্টোগ্রাফিক হ্যাশ-চেইনের মাধ্যমে নিশ্চিত হোন আপনার দেওয়া ভোট গণনায় অন্তর্ভুক্ত হয়েছে।",
    verifyInputLabel: "আপনার ব্যালট রসিদ কোড দিন",
    verifyInputPlaceholder: "যেমন: VBD-E7A1-420B",
    btnCheckReceipt: "রসিদ যাচাই করুন",
    receiptFoundTitle: "ভোট সঠিকভাবে গণনায় অন্তর্ভুক্ত রয়েছে",
    receiptBlockNumber: "ব্লক সিকোয়েন্স নম্বর",
    receiptTimestamp: "ভোট দেওয়ার সময় (BST)",
    receiptChainIntegrity: "হ্যাশ-চেইন স্ট্যাটাস: অক্ষত ও বৈধ",
    receiptNotFound: "এই রসিদ কোডটি পাওয়া যায়নি। কোডটি পুনরায় যাচাই করুন।",

    // General
    loading: "লোড হচ্ছে...",
    errorGeneric: "একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    copiedToast: "ক্লিপবোর্ডে কপি করা হয়েছে",
  },
  en: {
    // Brand
    brandName: "VoteBD",
    brandTagline: "Secure, transparent, and accessible institutional voting for Bangladesh",
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
    numeralBangla: "Bangla Numerals (১২৩৪)",
    numeralEnglish: "English Numerals (1234)",
    themeTitle: "Appearance",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    langToggle: "বাংলা",

    // Landing Page Hero
    heroBadge: "Voting for classes, clubs, and communities",
    heroTitle: "Elections that are transparent, fair, and truly private",
    heroSubtitle:
      "Class representative elections, student dorms, clubs, or residential housing societies—a mobile-first voting platform built for real organizations. Cast your secret ballot in under 30 seconds.",
    heroCtaCreate: "Create an Election",
    heroCtaJoin: "Enter Join Code",
    heroTryDemo: "Try Live Demo (Class 10 CR Election)",
    heroMockupCaption: "Instant mobile ballot card preview",
    heroTrustStat1: "100% Secret Ballot",
    heroTrustStat1Sub: "Zero database link between voter identity and selected candidate",
    heroTrustStat2: "Tamper-Proof Chain",
    heroTrustStat2Sub: "Every ballot sealed cryptographically in a verifiable audit chain",
    heroTrustStat3: "Built for Everyone",
    heroTrustStat3Sub: "Fast on entry-level Android phones and 3G mobile data",

    // Join Code Box
    joinBoxTitle: "Have an election code",
    joinBoxPlaceholder: "e.g. CR-2024 or 6-character code",
    joinBoxButton: "Open Ballot",
    joinBoxHelper: "Enter the 6-character code or link shared by the organizer.",

    // Pillars
    pillarsTitle: "Why Choose VoteBD",
    pillarsSubtitle: "Three core pillars designed specifically for Bangladeshi institutions and communities.",
    pillar1Title: "Strict Security & Secret Ballot",
    pillar1Desc:
      "Voter identity and cast ballots are stored in separate, unlinked tables. Not even the election administrator can see who voted for whom. Atomic locking enforces one-voter-one-vote.",
    pillar2Title: "Accessible & Mobile-First",
    pillar2Desc:
      "No mandatory account registration or heavy downloads. Loads quickly even on basic mobile devices and fluctuating mobile networks.",
    pillar3Title: "Verifiable Digital Receipts",
    pillar3Desc:
      "Every voter receives an anonymous receipt code after voting. Anyone can independently verify that their ballot was sealed in the tally without exposing their choice.",

    // How it works
    howItWorksTitle: "How It Works",
    howItWorksSubtitle: "Run a complete election in four straightforward steps.",
    step1Title: "1. Create Election",
    step1Desc: "Add candidates, choose voting rules, and set Dhaka time boundaries in 2 minutes.",
    step2Title: "2. Invite Voters",
    step2Desc: "Share via WhatsApp, QR code, or distribute single-use voter codes.",
    step3Title: "3. Cast Secret Ballot",
    step3Desc: "Voters pick their choice on mobile and receive an instant cryptographic receipt.",
    step4Title: "4. Instant Results",
    step4Desc: "Automatic real-time or post-close tally with charts and verifiable audit log.",

    // Use cases
    useCasesTitle: "Who Uses VoteBD",
    useCase1Title: "Schools, Colleges & Universities",
    useCase1Desc: "Class representative (CR), batch coordinator, hall committees, and department councils.",
    useCase2Title: "Clubs & Student Societies",
    useCase2Desc: "Debate clubs, cultural forums, tech chapters, and volunteer executive boards.",
    useCase3Title: "Mosque, Samity & Housing",
    useCase3Desc: "Cooperative societies, mosque management, flat owners associations, and NGO committees.",
    useCase4Title: "Quick Polls & Decisions",
    useCase4Desc: "Deciding tour destinations, picnic dates, event schedules, or group surveys.",

    // FAQ
    faqTitle: "Frequently Asked Questions",
    faqQ1: "Is my vote genuinely secret? Can the teacher or organizer see it?",
    faqA1:
      "Yes, completely secret. The voter registry ('who voted') and the ballot box ('which option received a vote') are strictly disconnected with zero foreign keys. There is no technical way for any admin to trace a ballot back to your identity.",
    faqQ2: "Can anyone vote more than once?",
    faqA2:
      "No. The database uses atomic single-vote locking. As soon as a voter code or device submits a ballot, it is marked as used inside the transaction and cannot vote again.",
    faqQ3: "Can results be altered or manipulated?",
    faqA3:
      "No. Each ballot is chained to the preceding ballot using SHA-256 cryptographic hashing. Modifying or deleting any ballot breaks the mathematical chain immediately.",
    faqQ4: "Is this intended for national or government elections?",
    faqA4:
      "No. VoteBD is built specifically for organizational, academic, and community elections. It is not an official government or national election platform.",

    // Footer
    footerDisclaimer:
      "Commitment to Honesty: VoteBD is an independent organizational and community voting tool, not intended for state or national elections. All ballots are cryptographically sealed and neutrally tallied.",
    footerQuickLinks: "Quick Links",
    footerSecurity: "Security & Audit",
    footerContact: "Support & Docs",
    footerDhakaTime: "Bangladesh Standard Time (BST, UTC+6)",

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
    fieldTitlePlaceholder: "e.g. Class 10 CR Election 2026",
    fieldDesc: "Description or Instructions",
    fieldDescPlaceholder: "Any instructions for voters",
    fieldCategory: "Category",
    catClass: "School / College / University",
    catClub: "Club / Student Organization",
    catCommunity: "Community / Mosque / Society",
    catPoll: "Quick Poll / Survey",
    fieldType: "Election Type",
    typeSingle: "Single Choice (1 winner)",
    typeMultiple: "Multiple Choice (select multiple)",
    typeRanked: "Ranked Choice (preference order)",
    typeYesNo: "Yes / No Referendum",

    // Wizard Step 2
    candidatesTitle: "Candidates & Options",
    candidatesSubtitle: "Add at least 2 candidates or options.",
    btnAddCandidate: "Add Candidate",
    candidateNamePlaceholder: "Candidate name",
    candidateSymbolPlaceholder: "Symbol",
    candidateBioPlaceholder: "Short bio or roll",
    allowNotaToggle: "Add \"None of the above\" (NOTA) option",
    allowNotaDesc: "Allow voters to express dissent if they do not prefer any candidate.",

    // Wizard Step 3
    rulesTitle: "Timing & Privacy Settings",
    rulesSubtitle: "Set Dhaka time window and result visibility rules.",
    fieldStartTime: "Start Time (BST)",
    fieldEndTime: "End Time (BST)",
    fieldResultVisibility: "Result Visibility",
    visAfterClose: "Revealed only after election closes",
    visLive: "Live turnout and tally visible while voting",
    adminPinLabel: "Admin Management PIN *",
    adminPinPlaceholder: "4–8 digit PIN",
    adminPinHelper: "Used to manage your election, close early, or export data. Keep this private.",

    // Wizard Step 4
    accessTitle: "Voter Access & Security Level",
    accessTypeJoinCode: "Open Join Code (1 ballot per device)",
    accessTypeCodeList: "Voter Roll / Code List (unique one-time codes per voter)",
    accessVoterListPlaceholder: "Paste student roll or names (one per line):\n101 - Tanvir Ahmed\n102 - Sadia Jahan\n103 - Maruf Hossain",
    accessCodeCountLabel: "Total one-time voter codes to generate",
    summaryReview: "Election Summary",
    totalCandidatesLabel: "Total Candidates",
    votingWindowLabel: "Voting Window",

    // Created Success Screen
    createdSuccessTitle: "Election Created",
    createdSuccessSubtitle: "Your election is live. Share the join code or link with eligible voters.",
    shareCodeLabel: "Election Join Code",
    shareLinkBtn: "Copy Link",
    shareWhatsappBtn: "Share on WhatsApp",
    downloadQrBtn: "Download QR Code",
    btnGoToAdmin: "Go to Admin Dashboard",
    btnGoToVote: "Open Ballot Page",

    // Voter Experience (Ballot)
    voterHeading: "Official Ballot Paper",
    voterEnterCodeTitle: "Voter Verification",
    voterEnterCodeSubtitle: "Enter the one-time voter code assigned to you by the organizer.",
    voterCodePlaceholder: "e.g. CR-V104",
    btnVerifyCode: "Enter Voting Booth",
    voterAlreadyVoted: "This voter code has already been used. Each voter can only cast one ballot.",
    voterSelectInstructionSingle: "Select one candidate below and click 'Review Selection'",
    voterSelectInstructionMultiple: "Select your preferred candidates below",
    voterSelectInstructionRanked: "Click candidates in order of preference (1st, 2nd, 3rd)",
    btnSelect: "Select",
    btnSelected: "Selected",
    btnReviewSelection: "Review Selection",
    reviewTitle: "Confirm Your Vote",
    reviewSubtitle: "Once submitted, your vote cannot be changed or recalled. Please review carefully.",
    chosenCandidate: "Your Selected Candidate",
    btnConfirmVote: "Confirm and Cast Ballot",
    btnChangeSelection: "Go back to change",
    submittingVote: "Submitting ballot...",

    // Vote Confirmation Receipt
    voteSuccessTitle: "Ballot Cast Successfully",
    voteSuccessSubtitle: "Your vote has been recorded in the secret ballot box. Save your receipt code below.",
    receiptLabel: "Your Ballot Receipt Code",
    receiptProofNote:
      "Save this code. You can use it anytime on the verification page to confirm your ballot is sealed in the final tally, without revealing who you voted for.",
    btnCopyReceipt: "Copy Receipt Code",
    btnGoToResults: "View Live Turnout & Results",
    btnVerifyNow: "Verify Receipt Now",

    // Results Page
    resultsTitle: "Election Results",
    resultsLiveBadge: "Live Turnout",
    resultsClosedBadge: "Election Closed",
    winnerHighlight: "Leading / Winner",
    winnerVotes: "Total votes",
    winnerVoteShare: "Vote share",
    tieTitle: "Tie Detected: Multiple candidates received equal votes",
    totalVotesCast: "Total Ballots Cast",
    totalRegistered: "Eligible Voters",
    turnoutRate: "Voter Turnout",
    timeRemainingLabel: "Time Remaining",
    chartTitle: "Vote Breakdown",
    btnExportCsv: "Export CSV",
    btnPrintResults: "Print / PDF",
    btnAdminDashboard: "Admin Dashboard",

    // Admin Dashboard
    adminTitle: "Election Management Dashboard",
    adminSubtitle: "Live voter participation and administrative controls",
    adminPinPrompt: "Enter Admin PIN to Authenticate",
    adminPinInput: "Admin PIN",
    btnLoginAdmin: "Access Dashboard",
    btnEndNow: "Close Election",
    btnExtend1Hour: "Extend +1 Hour",
    btnExtend1Day: "Extend +1 Day",
    btnDownloadCodes: "Voter Codes (CSV)",
    btnDuplicate: "Duplicate Election",
    btnLockAdmin: "Lock Session",
    duplicateSuccess: "Election cloned for new term",
    confirmCloseTitle: "End election early",
    confirmCloseDesc: "Once closed, voters will no longer be able to cast ballots. Results will become final and locked.",
    confirmExtendTitle: "Extend Voting Deadline",
    confirmDuplicateTitle: "Clone election for next term",
    confirmDuplicateDesc: "This creates a fresh election with the same candidates and configuration, ready for a new voting cohort.",
    auditLogHeading: "Audit Log & System Events",
    liveActivityHeading: "Recent Ballot Activity (Secret Ballot)",
    noActivityYet: "No ballots cast yet.",

    // Verify Page
    verifyHeading: "Digital Ballot Verification",
    verifySubtitle: "Verify your ballot inclusion in the tamper-evident cryptographic hash chain.",
    verifyInputLabel: "Ballot Receipt Code",
    verifyInputPlaceholder: "e.g. VBD-E7A1-420B",
    btnCheckReceipt: "Verify Ballot Status",
    receiptFoundTitle: "Ballot Officially Counted and Sealed",
    receiptBlockNumber: "Block Sequence #",
    receiptTimestamp: "Cast Timestamp (BST)",
    receiptChainIntegrity: "Cryptographic Chain: Intact & Validated",
    receiptNotFound: "No ballot found with this receipt code. Please check and try again.",

    // General
    loading: "Loading...",
    errorGeneric: "An error occurred. Please try again.",
    copiedToast: "Copied to clipboard",
  },
};
