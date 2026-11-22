import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  calculateBallotHash,
  createGenesisHash,
  generateReceiptCode,
} from "@/lib/hasher";
import { checkRateLimit } from "@/lib/rateLimit";
import { voteSubmissionSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";

    // Rate limit: max 15 vote attempts per minute per IP
    const rateCheck = checkRateLimit(`vote:${ip}:${id}`, 15, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `Too many vote attempts. Please wait ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const rawBody = await req.json();
    const parseResult = voteSubmissionSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { voterCode, choices } = parseResult.data;

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
      return NextResponse.json({ error: "Election not found." }, { status: 404 });
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

    const cleanCode = voterCode ? voterCode.trim().toUpperCase() : null;

    // Retry loop for concurrency safety (in case 2 ballots attempt to claim nextSequence simultaneously)
    let attempts = 0;
    const maxRetries = 3;

    while (attempts < maxRetries) {
      attempts++;
      try {
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

            // TIMING DE-ANONYMIZATION FIX:
            // Do NOT record the exact millisecond as the ballot.
            // Fuzzy date rounded to nearest 5 minutes or null prevents correlation attacks.
            const fuzzyTime = new Date(Math.floor(now.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000));
            await tx.voter.update({
              where: { id: matchedVoter.id },
              data: {
                hasVoted: true,
                votedAt: fuzzyTime,
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

          // Save Ballot — STRICT SECRET BALLOT: ZERO relation to matchedVoter.id!
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
      } catch (err: any) {
        if (err.message?.includes("ALREADY_VOTED")) {
          return NextResponse.json(
            { error: "This voter code has already been used. Each voter can only cast one ballot." },
            { status: 409 }
          );
        }
        if (err.message?.includes("INVALID_CODE")) {
          return NextResponse.json(
            { error: "The entered voter code is invalid. Please double check." },
            { status: 400 }
          );
        }
        // Unique sequence collision retry
        if (err.code === "P2002" && attempts < maxRetries) {
          continue;
        }
        throw err;
      }
    }

    return NextResponse.json(
      { error: "System is experiencing high traffic. Please try submitting again." },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Voting submission error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to submit ballot." },
      { status: 500 }
    );
  }
}
