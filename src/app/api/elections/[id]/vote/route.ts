import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  calculateBallotHash,
  createGenesisHash,
  generateReceiptCode,
} from "@/lib/hasher";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { voterCode, choices } = body;

    if (!choices || !Array.isArray(choices) || choices.length === 0) {
      return NextResponse.json(
        { error: "No candidate choice provided." },
        { status: 400 }
      );
    }

    // Find election
    const election = await prisma.election.findFirst({
      where: {
        OR: [{ id }, { joinCode: id.toUpperCase() }, { slug: id.toLowerCase() }],
      },
      include: {
        options: true,
      },
    });

    if (!election) {
      return NextResponse.json({ error: "Election not found" }, { status: 404 });
    }

    // Check election status & time boundaries
    const now = new Date();
    if (election.status !== "ACTIVE" || now > new Date(election.endTime)) {
      return NextResponse.json(
        { error: "This election is currently closed." },
        { status: 400 }
      );
    }

    if (now < new Date(election.startTime)) {
      return NextResponse.json(
        { error: "Voting for this election has not started yet." },
        { status: 400 }
      );
    }

    // Validate choices against election options or NOTA
    const validOptionIds = new Set(election.options.map((o) => o.id));
    for (const c of choices) {
      if (c !== "nota" && !validOptionIds.has(c)) {
        return NextResponse.json(
          { error: "Invalid candidate selected." },
          { status: 400 }
        );
      }
    }

    // Single choice enforcement
    if (election.electionType === "SINGLE" && choices.length !== 1) {
      return NextResponse.json(
        { error: "Only one candidate can be chosen for this election." },
        { status: 400 }
      );
    }

    // Check and verify voter eligibility
    let cleanCode = voterCode ? voterCode.trim().toUpperCase() : null;

    // Execute atomic transaction for 1-voter-1-vote and secret ballot chain
    const result = await prisma.$transaction(async (tx) => {
      let matchedVoter = null;

      if (cleanCode) {
        matchedVoter = await tx.voter.findFirst({
          where: {
            electionId: election.id,
            voterCode: cleanCode,
          },
        });

        if (!matchedVoter) {
          throw new Error("INVALID_CODE: Invalid voter code.");
        }

        if (matchedVoter.hasVoted) {
          throw new Error("ALREADY_VOTED: This code has already cast a ballot.");
        }

        // Mark voter as hasVoted
        await tx.voter.update({
          where: { id: matchedVoter.id },
          data: {
            hasVoted: true,
            votedAt: now,
          },
        });
      } else if (election.voterAccessType === "JOIN_CODE") {
        // For open join code without pre-assigned codes, create and immediately mark a voter ticket
        matchedVoter = await tx.voter.create({
          data: {
            electionId: election.id,
            voterCode: `GUEST-${Date.now().toString(36).toUpperCase()}`,
            hasVoted: true,
            votedAt: now,
          },
        });
      } else {
        throw new Error("VOTER_CODE_REQUIRED: A voter code is required.");
      }

      // --- SECRET BALLOT INSERTION ---
      // Get the last ballot in the election's chain to link hashes
      const lastBallot = await tx.ballot.findFirst({
        where: { electionId: election.id },
        orderBy: { sequenceNumber: "desc" },
      });

      const nextSequence = lastBallot ? lastBallot.sequenceNumber + 1 : 1;
      const prevHash = lastBallot
        ? lastBallot.ballotHash
        : createGenesisHash(election.id, election.createdAt);

      const choiceDataString = JSON.stringify(choices);
      const castTime = new Date();
      const ballotHash = calculateBallotHash(
        prevHash,
        nextSequence,
        choiceDataString,
        castTime
      );
      const receiptCode = generateReceiptCode(ballotHash, nextSequence);

      // Save Ballot — NOTICE: ZERO reference to matchedVoter.id or voter identity!
      const newBallot = await tx.ballot.create({
        data: {
          electionId: election.id,
          receiptCode,
          choiceData: choiceDataString,
          sequenceNumber: nextSequence,
          prevHash,
          ballotHash,
          castAt: castTime,
        },
      });

      // Audit log (only sequence number recorded, never choice or voter link)
      await tx.auditLog.create({
        data: {
          electionId: election.id,
          eventType: "BALLOT_CAST",
          details: JSON.stringify({
            sequenceNumber: nextSequence,
            receiptCode,
          }),
        },
      });

      return {
        receiptCode: newBallot.receiptCode,
        sequenceNumber: newBallot.sequenceNumber,
        castAt: newBallot.castAt,
      };
    });

    return NextResponse.json({
      success: true,
      receiptCode: result.receiptCode,
      sequenceNumber: result.sequenceNumber,
      castAt: result.castAt,
    });
  } catch (error: any) {
    console.error("Voting submission error:", error.message);
    if (error.message?.includes("ALREADY_VOTED")) {
      return NextResponse.json(
        { error: "এই কোড দিয়ে ইতোমধ্যে ভোট দেওয়া হয়েছে। এক ভোটার একবারই ভোট দিতে পারেন।" },
        { status: 409 }
      );
    }
    if (error.message?.includes("INVALID_CODE")) {
      return NextResponse.json(
        { error: "ভোট কোডটি সঠিক নয়। অনুগ্রহ করে পুনরায় পরীক্ষা করুন।" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to submit ballot." },
      { status: 500 }
    );
  }
}
