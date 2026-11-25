import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeEffectiveStatus, findElectionByIdentifier } from "@/lib/electionLookup";
import {
  calculateBallotHash,
  createGenesisHash,
  generateGuestVoterCode,
  generateReceiptCode,
  sha256,
} from "@/lib/hasher";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { voteSubmissionSchema } from "@/lib/validations";

function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = getClientIp(req);

    // Rate limit: max 15 vote attempts per minute per IP
    const rateCheck = checkRateLimit(`vote:${ip}:${id}`, 15, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: `Too many vote attempts. Please wait ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const parseResult = voteSubmissionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { voterCode, choices, deviceId } = parseResult.data;

    const election = await findElectionByIdentifier(id);
    if (!election) {
      return NextResponse.json({ error: "Election not found." }, { status: 404 });
    }

    const now = new Date();
    const effectiveStatus = computeEffectiveStatus(election);
    if (effectiveStatus !== "ACTIVE") {
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

    // Deduplication check
    if (new Set(choices).size !== choices.length) {
      return NextResponse.json(
        { error: "Duplicate candidate selections are not allowed." },
        { status: 400 }
      );
    }

    // Validate NOTA & option IDs
    const validOptionIds = new Set(election.options.map((o) => o.id));
    const includesNota = choices.includes("nota");

    if (includesNota && !election.allowNota) {
      return NextResponse.json(
        { error: "NOTA is not enabled for this election." },
        { status: 400 }
      );
    }

    if (includesNota && choices.length > 1) {
      return NextResponse.json(
        { error: "NOTA cannot be combined with candidate selections." },
        { status: 400 }
      );
    }

    for (const c of choices) {
      if (c !== "nota" && !validOptionIds.has(c)) {
        return NextResponse.json(
          { error: "Invalid candidate selected." },
          { status: 400 }
        );
      }
    }

    // Enforce choice cardinality by election type
    if (
      (election.electionType === "SINGLE" || election.electionType === "YES_NO") &&
      choices.length !== 1
    ) {
      return NextResponse.json(
        { error: "Only one candidate can be chosen for this election." },
        { status: 400 }
      );
    }

    if (
      election.electionType === "MULTIPLE" &&
      !includesNota &&
      choices.length > election.maxChoices
    ) {
      return NextResponse.json(
        {
          error: `You can select up to ${election.maxChoices} candidates for this election.`,
        },
        { status: 400 }
      );
    }

    if (
      election.electionType === "RANKED" &&
      !includesNota &&
      choices.length > election.options.length
    ) {
      return NextResponse.json(
        { error: "Ranked choices exceed available candidates." },
        { status: 400 }
      );
    }

    const cleanCode = voterCode ? voterCode.trim().toUpperCase() : null;
    const isOpenJoinElection =
      election.voterAccessType === "JOIN_CODE" || election.voterAccessType === "OPEN_POLL";

    const cookieName = `votebd_voted_${election.id}`;
    const existingCookieToken = req.cookies.get(cookieName)?.value;
    const freshDeviceToken =
      existingCookieToken || deviceId || crypto.randomBytes(16).toString("hex");
    const deviceHash = isOpenJoinElection
      ? sha256(`${election.id}:${freshDeviceToken}`)
      : null;

    let attempts = 0;
    const maxRetries = 4;

    while (attempts < maxRetries) {
      attempts++;
      try {
        const fuzzyTime = new Date(
          Math.floor(now.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000)
        );

        const result = await prisma.$transaction(async (tx) => {
          if (election.voterAccessType === "CODE_LIST") {
            if (!cleanCode) {
              throw new Error("VOTER_CODE_REQUIRED: A voter code is required.");
            }

            const matchedVoter = await tx.voter.findUnique({
              where: {
                electionId_voterCode: {
                  electionId: election.id,
                  voterCode: cleanCode,
                },
              },
            });

            if (!matchedVoter) {
              throw new Error("INVALID_CODE: Invalid voter code.");
            }

            if (matchedVoter.hasVoted) {
              throw new Error("ALREADY_VOTED: This code has already cast a ballot.");
            }

            // Atomic compare-and-set on hasVoted=false prevents race conditions
            const updated = await tx.voter.updateMany({
              where: {
                id: matchedVoter.id,
                hasVoted: false,
              },
              data: {
                hasVoted: true,
                votedAt: fuzzyTime,
              },
            });

            if (updated.count !== 1) {
              throw new Error("ALREADY_VOTED: This code has already cast a ballot.");
            }
          } else if (isOpenJoinElection) {
            if (existingCookieToken || deviceId) {
              const existingCookieHash = existingCookieToken
                ? sha256(`${election.id}:${existingCookieToken}`)
                : null;
              const existingDeviceHash = deviceId
                ? sha256(`${election.id}:${deviceId}`)
                : null;
              const fingerprints = [existingCookieHash, existingDeviceHash].filter(
                (v): v is string => Boolean(v)
              );

              if (fingerprints.length > 0) {
                const priorVote = await tx.voter.findFirst({
                  where: {
                    electionId: election.id,
                    deviceFingerprint: { in: fingerprints },
                  },
                  select: { id: true },
                });
                if (priorVote) {
                  throw new Error(
                    "DEVICE_ALREADY_VOTED: This device has already cast a ballot in this election."
                  );
                }
              }
            }

            await tx.voter.create({
              data: {
                electionId: election.id,
                voterCode: generateGuestVoterCode(),
                hasVoted: true,
                votedAt: fuzzyTime,
                deviceFingerprint: deviceHash,
              },
            });
          } else {
            throw new Error("VOTER_CODE_REQUIRED: A voter code is required.");
          }

          // --- SECRET BALLOT INSERTION (NO VOTER LINK) ---
          const lastBallot = await tx.ballot.findFirst({
            where: { electionId: election.id },
            orderBy: { sequenceNumber: "desc" },
          });

          const nextSequence = lastBallot ? lastBallot.sequenceNumber + 1 : 1;
          const prevHash = lastBallot
            ? lastBallot.ballotHash
            : createGenesisHash(election.id, election.createdAt);

          const choiceDataString = JSON.stringify(choices);
          const castTime = new Date(Date.now() + attempts - 1);
          const ballotHash = calculateBallotHash(
            prevHash,
            nextSequence,
            choiceDataString,
            castTime
          );
          const receiptCode = generateReceiptCode(ballotHash);

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

        const response = NextResponse.json({
          success: true,
          receiptCode: result.receiptCode,
          sequenceNumber: result.sequenceNumber,
          castAt: result.castAt,
        });

        if (isOpenJoinElection) {
          response.cookies.set({
            name: cookieName,
            value: freshDeviceToken,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
          });
        }

        return response;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("DEVICE_ALREADY_VOTED")) {
          return NextResponse.json(
            {
              error:
                "This device has already cast a ballot in this election. Only one vote per device is allowed.",
            },
            { status: 409 }
          );
        }
        if (msg.includes("ALREADY_VOTED")) {
          return NextResponse.json(
            {
              error:
                "This voter code has already been used. Each voter can only cast one ballot.",
            },
            { status: 409 }
          );
        }
        if (msg.includes("INVALID_CODE")) {
          return NextResponse.json(
            { error: "The entered voter code is invalid. Please double check." },
            { status: 400 }
          );
        }
        if (msg.includes("VOTER_CODE_REQUIRED")) {
          return NextResponse.json(
            { error: "A valid voter code is required for this election." },
            { status: 400 }
          );
        }
        if (isUniqueConstraintError(err) && attempts < maxRetries) {
          continue;
        }
        throw err;
      }
    }

    return NextResponse.json(
      { error: "System is experiencing high traffic. Please try submitting again." },
      { status: 503 }
    );
  } catch (error: unknown) {
    console.error("Voting submission error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit ballot.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
