import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function hashAdminPin(pin: string): string {
  return sha256(`votebd-secure-admin-salt:${pin.trim()}`);
}

async function main() {
  console.log("🌱 Seeding VoteBD database with demo class election...");

  // Clean existing demo data if any
  await prisma.ballot.deleteMany({}).catch(() => {});
  await prisma.voter.deleteMany({}).catch(() => {});
  await prisma.option.deleteMany({}).catch(() => {});
  await prisma.auditLog.deleteMany({}).catch(() => {});
  await prisma.election.deleteMany({ where: { joinCode: "CR-2024" } }).catch(() => {});

  const now = new Date();
  const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // Started 2 hours ago
  const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Ends in 24 hours

  const election = await prisma.election.create({
    data: {
      slug: "class-10-cr-election-2024",
      title: "Class 10 CR Election 2024",
      titleBn: "দশম শ্রেণি সিআর নির্বাচন ২০২৪",
      description: "Annual Class Representative (CR) Election for Section A. Please vote for one candidate.",
      descriptionBn: "সেকশন এ-এর বার্ষিক ক্লাস রিপ্রেজেন্টেটিভ নির্বাচন। প্রত্যেকে গোপন ব্যালটে একটি ভোট দিন।",
      category: "class",
      electionType: "SINGLE",
      status: "ACTIVE",
      joinCode: "CR-2024",
      adminKey: hashAdminPin("1234"), // Default demo PIN
      allowNota: true,
      maxChoices: 1,
      resultVisibility: "LIVE",
      voterAccessType: "CODE_LIST",
      startTime,
      endTime,
      timezone: "Asia/Dhaka",
    },
  });

  console.log(`Created election: ${election.titleBn} (Code: ${election.joinCode})`);

  // Add Candidates
  const cand1 = await prisma.option.create({
    data: {
      electionId: election.id,
      name: "Tanvir Ahmed",
      nameBn: "তানভীর আহমেদ",
      symbolEmoji: "⚽",
      symbolName: "ফুটবল",
      bio: "Roll 01 • Focused on sports activities & student discipline.",
      bioBn: "রোল ০১ • ক্লাস শৃঙ্খলা ও বার্ষিক ক্রীড়া প্রতিযোগিতা আয়োজনে সক্রিয়।",
      orderIndex: 1,
    },
  });

  const cand2 = await prisma.option.create({
    data: {
      electionId: election.id,
      name: "Sadia Jahan",
      nameBn: "সাদিয়া জাহান",
      symbolEmoji: "📚",
      symbolName: "বই",
      bio: "Roll 03 • Daily class notes sharing & academic support coordinator.",
      bioBn: "রোল ০৩ • ক্লাসের গ্রুপ স্টাডি ও নিয়মিত ক্লাস নোট সমন্বয়কারী।",
      orderIndex: 2,
    },
  });

  const cand3 = await prisma.option.create({
    data: {
      electionId: election.id,
      name: "Maruf Hossain",
      nameBn: "মারুফ হোসেন",
      symbolEmoji: "🕊️",
      symbolName: "কবুতর",
      bio: "Roll 07 • Unity, class trip coordination & student welfare.",
      bioBn: "রোল ০৭ • বার্ষিক শিক্ষা সফর আয়োজন ও শিক্ষার্থীদের পারস্পরিক সম্প্রীতি।",
      orderIndex: 3,
    },
  });

  // Pre-register voters with unique codes
  const votersData = [
    { code: "CR-V101", identifier: "Roll 101 - Rafiqul Islam (রফিকুল)" },
    { code: "CR-V102", identifier: "Roll 102 - Nusrat Sharmin (নুসরাত)" },
    { code: "CR-V103", identifier: "Roll 103 - Fahim Muntasir (ফাহিম)" },
    { code: "CR-V104", identifier: "Roll 104 - Meherun Nesa (মেহেরুন)" },
    { code: "CR-V105", identifier: "Roll 105 - Abrar Hasan (আবরার)" },
    { code: "CR-V106", identifier: "Roll 106 - Farhana Akter (ফারহানা)" },
    { code: "CR-V107", identifier: "Roll 107 - Salman Farsi (সালমান)" },
    { code: "CR-V108", identifier: "Roll 108 - Tahmina Anjum (তাহমিনা)" },
    { code: "CR-V109", identifier: "Roll 109 - Zubayer Hossain (জুবায়ের)" },
    { code: "CR-V110", identifier: "Roll 110 - Sumaiya Haque (সুমাইয়া)" },
  ];

  for (const v of votersData) {
    await prisma.voter.create({
      data: {
        electionId: election.id,
        voterCode: v.code,
        identifier: v.identifier,
        hasVoted: false,
      },
    });
  }

  // Cast 3 initial demo ballots to establish the cryptographic hash chain
  // Remember: In VoteBD, Voter is marked hasVoted, while Ballot is strictly anonymous!
  const genesisHash = sha256(`GENESIS:${election.id}:${election.createdAt.toISOString()}`);

  // Ballot 1 (voted for Sadia Jahan)
  const castAt1 = new Date(now.getTime() - 60 * 60 * 1000);
  const choiceData1 = JSON.stringify([cand2.id]);
  const hash1 = sha256(`${genesisHash}|1|${choiceData1}|${castAt1.toISOString()}`);
  await prisma.ballot.create({
    data: {
      electionId: election.id,
      receiptCode: "VBD-E7A1-420B",
      choiceData: choiceData1,
      sequenceNumber: 1,
      prevHash: genesisHash,
      ballotHash: hash1,
      castAt: castAt1,
    },
  });
  await prisma.voter.update({
    where: { electionId_voterCode: { electionId: election.id, voterCode: "CR-V101" } },
    data: { hasVoted: true, votedAt: castAt1 },
  });

  // Ballot 2 (voted for Tanvir Ahmed)
  const castAt2 = new Date(now.getTime() - 40 * 60 * 1000);
  const choiceData2 = JSON.stringify([cand1.id]);
  const hash2 = sha256(`${hash1}|2|${choiceData2}|${castAt2.toISOString()}`);
  await prisma.ballot.create({
    data: {
      electionId: election.id,
      receiptCode: "VBD-89B3-91CF",
      choiceData: choiceData2,
      sequenceNumber: 2,
      prevHash: hash1,
      ballotHash: hash2,
      castAt: castAt2,
    },
  });
  await prisma.voter.update({
    where: { electionId_voterCode: { electionId: election.id, voterCode: "CR-V102" } },
    data: { hasVoted: true, votedAt: castAt2 },
  });

  // Ballot 3 (voted for Sadia Jahan)
  const castAt3 = new Date(now.getTime() - 20 * 60 * 1000);
  const choiceData3 = JSON.stringify([cand2.id]);
  const hash3 = sha256(`${hash2}|3|${choiceData3}|${castAt3.toISOString()}`);
  await prisma.ballot.create({
    data: {
      electionId: election.id,
      receiptCode: "VBD-34D8-672A",
      choiceData: choiceData3,
      sequenceNumber: 3,
      prevHash: hash2,
      ballotHash: hash3,
      castAt: castAt3,
    },
  });
  await prisma.voter.update({
    where: { electionId_voterCode: { electionId: election.id, voterCode: "CR-V103" } },
    data: { hasVoted: true, votedAt: castAt3 },
  });

  // Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        electionId: election.id,
        eventType: "ELECTION_CREATED",
        details: JSON.stringify({ message: "Election created and candidates registered" }),
        timestamp: startTime,
      },
      {
        electionId: election.id,
        eventType: "VOTER_LIST_UPLOADED",
        details: JSON.stringify({ count: 10, format: "CODE_LIST" }),
        timestamp: startTime,
      },
      {
        electionId: election.id,
        eventType: "BALLOT_CAST",
        details: JSON.stringify({ sequenceNumber: 1 }),
        timestamp: castAt1,
      },
      {
        electionId: election.id,
        eventType: "BALLOT_CAST",
        details: JSON.stringify({ sequenceNumber: 2 }),
        timestamp: castAt2,
      },
      {
        electionId: election.id,
        eventType: "BALLOT_CAST",
        details: JSON.stringify({ sequenceNumber: 3 }),
        timestamp: castAt3,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
  console.log("   - Join Code: CR-2024");
  console.log("   - Admin PIN: 1234");
  console.log("   - Active Unused Voter Codes: CR-V104, CR-V105, CR-V106, CR-V107, CR-V108");
  console.log("   - Used Voter Codes: CR-V101, CR-V102, CR-V103");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
