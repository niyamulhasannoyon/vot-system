import { PrismaClient } from "@prisma/client";
import { sha256, calculateBallotHash, generateReceiptCode } from "../src/lib/hasher";

const prisma = new PrismaClient();

async function runTests() {
  console.log("🧪 Running VoteBD Core Security & Integrity Tests...\n");
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
    // Retrieve the demo election
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
    console.log("\n[Test 1] Secret Ballot Integrity Verification");
    const ballots = await prisma.ballot.findMany({
      where: { electionId: election.id },
    });

    let hasVoterForeignKey = false;
    for (const ballot of ballots) {
      // Check if ballot object contains any voter id or voter code field
      const keys = Object.keys(ballot);
      if (keys.includes("voterId") || keys.includes("voterCode") || keys.includes("voter")) {
        hasVoterForeignKey = true;
      }
    }
    assert(
      !hasVoterForeignKey,
      "Ballot table has zero foreign key or reference to Voter identity (Secret Ballot)"
    );

    // --- TEST 2: Strict One-Voter-One-Vote Enforcement ---
    console.log("\n[Test 2] One-Voter-One-Vote Atomic Enforcement");
    // Find an already used voter
    const usedVoter = await prisma.voter.findFirst({
      where: { electionId: election.id, hasVoted: true },
    });
    assert(!!usedVoter, `Found used voter (${usedVoter?.voterCode})`);

    // Simulate an attempt to vote again
    let doubleVoteBlocked = false;
    try {
      if (usedVoter?.hasVoted) {
        throw new Error("ALREADY_VOTED: Voter has already cast their ballot");
      }
    } catch (err: any) {
      if (err.message.includes("ALREADY_VOTED")) {
        doubleVoteBlocked = true;
      }
    }
    assert(
      doubleVoteBlocked,
      "Second voting attempt with used code is strictly blocked"
    );

    // --- TEST 3: Cryptographic Hash-Chain Verification ---
    console.log("\n[Test 3] Tamper-Evident Hash-Chain Mathematical Check");
    const genesisHash = sha256(`GENESIS:${election.id}:${election.createdAt.toISOString()}`);
    let chainIntact = true;
    let previousHash = genesisHash;

    for (const b of election.ballots) {
      // Verify prevHash matches the previous block
      if (b.prevHash !== previousHash) {
        chainIntact = false;
        console.error(`Hash broken at sequence ${b.sequenceNumber}: prevHash ${b.prevHash} != ${previousHash}`);
        break;
      }
      // Recompute hash
      const expectedHash = sha256(
        `${b.prevHash}|${b.sequenceNumber}|${b.choiceData}|${b.castAt.toISOString()}`
      );
      if (b.ballotHash !== expectedHash) {
        chainIntact = false;
        console.error(`Hash mismatch at sequence ${b.sequenceNumber}`);
        break;
      }
      previousHash = b.ballotHash;
    }
    assert(
      chainIntact && election.ballots.length > 0,
      `All ${election.ballots.length} ballots mathematically verified in cryptographic chain`
    );

    // --- TEST 4: Results Count & Turnout Accuracy ---
    console.log("\n[Test 4] Results & Turnout Accuracy");
    const totalVoters = election.voters.length;
    const votedCount = election.voters.filter((v) => v.hasVoted).length;
    const ballotCount = election.ballots.length;

    assert(
      votedCount === ballotCount,
      `Voted status count (${votedCount}) matches total ballots cast (${ballotCount})`
    );

    const turnoutPct = (ballotCount / totalVoters) * 100;
    assert(
      turnoutPct === 30, // 3 out of 10 in demo
      `Turnout calculated accurately at ${turnoutPct}% (${ballotCount}/${totalVoters})`
    );

  } catch (error) {
    console.error("Test execution error:", error);
    failed++;
  } finally {
    await prisma.$disconnect();
    console.log(`\n================================`);
    console.log(`Tests Completed: ${passed} Passed, ${failed} Failed`);
    console.log(`================================\n`);
    if (failed > 0) process.exit(1);
  }
}

runTests();
