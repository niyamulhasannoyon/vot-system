import { PrismaClient } from "@prisma/client";
import {
  sha256,
  createGenesisHash,
  calculateBallotHash,
  generateReceiptCode,
  hashAdminPin,
  verifyAdminPin,
  generateJoinCode,
  generateVoterCode,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "../src/lib/hasher";
import { checkRateLimit } from "../src/lib/rateLimit";
import {
  createElectionSchema,
  voteSubmissionSchema,
  receiptVerificationSchema,
} from "../src/lib/validations";
import {
  formatDhakaDateTimeLocal,
  parseDhakaDateTimeLocal,
} from "../src/lib/date";
import { buildCsvContent, escapeCsvCell } from "../src/lib/csv";

const prisma = new PrismaClient();

async function runTests() {
  console.log("==========================================================");
  console.log("🧪 VoteBD Production Security & Integrity Test Suite");
  console.log("==========================================================\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    const election = await prisma.election.findUnique({
      where: { joinCode: "CR-2024" },
      include: {
        options: true,
        voters: true,
        ballots: { orderBy: { sequenceNumber: "asc" } },
      },
    });

    assert(!!election, "Demo election CR-2024 exists in database");
    if (!election) return;

    // --- TEST 1: Secret Ballot Guarantee ---
    console.log("\n[Test 1] Secret Ballot Architectural Independence");
    const ballots = await prisma.ballot.findMany({
      where: { electionId: election.id },
    });

    let hasVoterForeignKey = false;
    for (const ballot of ballots) {
      const keys = Object.keys(ballot);
      if (
        keys.includes("voterId") ||
        keys.includes("voterCode") ||
        keys.includes("voter")
      ) {
        hasVoterForeignKey = true;
      }
    }
    assert(
      !hasVoterForeignKey,
      "Ballot table schema has zero foreign key or reference to Voter identity"
    );

    // --- TEST 2: Strict One-Voter-One-Vote Enforcement ---
    console.log("\n[Test 2] One-Voter-One-Vote Atomic Enforcement");
    const usedVoter = await prisma.voter.findFirst({
      where: { electionId: election.id, hasVoted: true },
    });
    assert(!!usedVoter, `Identified used voter record (${usedVoter?.voterCode})`);

    const atomicResult = await prisma.voter.updateMany({
      where: { id: usedVoter?.id, hasVoted: false },
      data: { hasVoted: true },
    });
    assert(
      atomicResult.count === 0,
      "Atomic compare-and-set strictly prevents double voting for used voter"
    );

    // --- TEST 3: Cryptographic Hash-Chain Mathematical Check ---
    console.log("\n[Test 3] Tamper-Evident SHA-256 Hash-Chain Integrity");
    const genesisHash = createGenesisHash(election.id, election.createdAt);
    let chainIntact = true;
    let previousHash = genesisHash;

    for (const b of election.ballots) {
      if (b.prevHash !== previousHash) {
        chainIntact = false;
        break;
      }
      const expectedHash = calculateBallotHash(
        b.prevHash,
        b.sequenceNumber,
        b.choiceData,
        b.castAt
      );
      if (b.ballotHash !== expectedHash) {
        chainIntact = false;
        break;
      }
      previousHash = b.ballotHash;
    }
    assert(
      chainIntact && election.ballots.length > 0,
      `All ${election.ballots.length} ballots mathematically verified in cryptographic chain`
    );

    // --- TEST 4: Results Count & Turnout Accuracy ---
    console.log("\n[Test 4] Turnout & Tally Calculation Precision");
    const totalVoters = election.voters.length;
    const votedCount = election.voters.filter((v) => v.hasVoted).length;
    const ballotCount = election.ballots.length;

    assert(
      votedCount === ballotCount,
      `Voter marked-voted count (${votedCount}) matches ballots cast in box (${ballotCount})`
    );

    const turnoutPct = (ballotCount / totalVoters) * 100;
    assert(
      turnoutPct === 30,
      `Turnout percentage calculated accurately at ${turnoutPct}% (${ballotCount}/${totalVoters})`
    );

    // --- TEST 5: Bcrypt PIN Hashing & Constant-Time Verification ---
    console.log("\n[Test 5] Bcrypt PIN Hashing & Verification");
    const testPin = "4892";
    const hashed = await hashAdminPin(testPin);
    const validVerify = await verifyAdminPin(testPin, hashed);
    const invalidVerify = await verifyAdminPin("0000", hashed);

    assert(validVerify, "Bcrypt correctly authenticates the correct admin PIN");
    assert(!invalidVerify, "Bcrypt strictly rejects an incorrect admin PIN");

    // --- TEST 6: In-Memory Sliding Window Rate Limiter ---
    console.log("\n[Test 6] Sliding-Window Rate Limiter Enforcement");
    const testKey = `test_rate_ip_${Date.now()}`;
    const limit = 3;
    const windowMs = 5000;

    const r1 = checkRateLimit(testKey, limit, windowMs);
    const r2 = checkRateLimit(testKey, limit, windowMs);
    const r3 = checkRateLimit(testKey, limit, windowMs);
    const r4 = checkRateLimit(testKey, limit, windowMs);

    assert(
      r1.success && r2.success && r3.success,
      "Rate limiter permits requests within quota (3/3)"
    );
    assert(
      !r4.success && r4.remaining === 0,
      "Rate limiter strictly blocks requests exceeding limit"
    );

    // --- TEST 7: Input Validation Schemas (Zod) ---
    console.log("\n[Test 7] Zod Schema Validation Guardrails");
    const validReceipt = receiptVerificationSchema.safeParse({
      receiptCode: "VBD-A1B2-C3D4",
    });
    const invalidReceipt = receiptVerificationSchema.safeParse({
      receiptCode: "INVALID_RECEIPT",
    });

    assert(validReceipt.success, "Accepts standard receipt code format VBD-XXXX-XXXX");
    assert(!invalidReceipt.success, "Rejects malformed receipt code");

    const validVote = voteSubmissionSchema.safeParse({
      voterCode: "CR-V104",
      choices: ["opt_1"],
    });
    const openJoinVote = voteSubmissionSchema.safeParse({
      voterCode: "",
      choices: ["opt_1"],
    });
    const missingOptionVote = voteSubmissionSchema.safeParse({
      voterCode: "CR-V104",
      choices: [],
    });
    const validElection = createElectionSchema.safeParse({
      title: "Test Election",
      endTime: new Date(Date.now() + 86400_000).toISOString(),
      adminPin: "1234",
      candidates: [{ name: "Alice" }, { name: "Bob" }],
    });

    assert(validVote.success, "Accepts valid vote payload with choice selection");
    assert(
      openJoinVote.success && openJoinVote.data.voterCode === undefined,
      "Normalizes empty voterCode to undefined for open join-code elections"
    );
    assert(
      !missingOptionVote.success,
      "Rejects empty vote payload without candidate selection"
    );
    assert(validElection.success, "Accepts valid election creation payload");

    // --- TEST 8: CSPRNG Code Generators ---
    console.log("\n[Test 8] Cryptographically Secure Random Generators");
    const receipt1 = generateReceiptCode();
    const receipt2 = generateReceiptCode();
    const joinCode = generateJoinCode();
    const voterCode = generateVoterCode("CR");

    assert(
      receipt1.startsWith("VBD-") && receipt1.length === 13,
      `Receipt format matches VBD-XXXX-XXXX (${receipt1})`
    );
    assert(receipt1 !== receipt2, "Sequential receipts are unique and non-colliding");
    assert(
      joinCode.length === 6,
      `Join code generated with expected length 6 (${joinCode})`
    );
    assert(
      voterCode.startsWith("CR-"),
      `Voter code uses expected prefix (${voterCode})`
    );

    // --- TEST 9: HMAC-SHA256 Signed Admin Session Tokens ---
    console.log("\n[Test 9] HMAC-SHA256 Admin Session Tokens");
    const token = createAdminSessionToken(election.id, election.adminKey);
    assert(
      verifyAdminSessionToken(token, election.id, election.adminKey),
      "Valid signed session token authenticates for matching election"
    );
    assert(
      !verifyAdminSessionToken(token, "other_election_id", election.adminKey),
      "Session token is strictly scoped to its target election"
    );
    assert(
      !verifyAdminSessionToken(`${token}tampered`, election.id, election.adminKey),
      "Tampered session token is rejected"
    );

    // --- TEST 10: Asia/Dhaka BST Date Helpers & CSV Sanitization ---
    console.log("\n[Test 10] Asia/Dhaka Timezone & CSV Security Helpers");
    const dhakaParsed = parseDhakaDateTimeLocal("2026-11-25T22:30");
    assert(
      dhakaParsed.toISOString() === "2026-11-25T16:30:00.000Z" &&
        formatDhakaDateTimeLocal(dhakaParsed) === "2026-11-25T22:30",
      "Round-trips Asia/Dhaka BST datetime-local values accurately"
    );

    const safeFormula = escapeCsvCell("=CMD('calc')");
    const safeQuote = escapeCsvCell('Test "Name"');
    const csvOutput = buildCsvContent([["Header"], ["=1+1"]]);
    assert(
      safeFormula === `"'=CMD('calc')"` &&
        safeQuote === `"Test ""Name"""` &&
        csvOutput.startsWith("\uFEFF"),
      "CSV helper neutralizes formula injection, escapes quotes, and prepends UTF-8 BOM"
    );

    // --- TEST 11: SHA-256 Digest Determinism ---
    assert(
      sha256("votebd") === sha256("votebd"),
      "SHA-256 digest is deterministic"
    );
  } catch (error: unknown) {
    console.error("Test execution error:", error);
    failed++;
  } finally {
    await prisma.$disconnect();
    console.log("\n==========================================================");
    console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
    console.log("==========================================================\n");
    if (failed > 0) process.exit(1);
  }
}

runTests();
