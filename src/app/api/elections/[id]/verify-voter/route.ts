import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeEffectiveStatus, findElectionByIdentifier } from "@/lib/electionLookup";
import { sha256 } from "@/lib/hasher";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { voterVerifySchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = getClientIp(req);

    const rateCheck = checkRateLimit(`verify_voter:${ip}:${id}`, 20, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: `Too many verification attempts. Please wait ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const election = await findElectionByIdentifier(id);
    if (!election) {
      return NextResponse.json({ error: "Election not found." }, { status: 404 });
    }

    const effectiveStatus = computeEffectiveStatus(election);
    if (effectiveStatus !== "ACTIVE") {
      return NextResponse.json(
        { error: "This election is currently closed." },
        { status: 400 }
      );
    }

    if (new Date() < new Date(election.startTime)) {
      return NextResponse.json(
        { error: "Voting for this election has not started yet." },
        { status: 400 }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (election.voterAccessType === "JOIN_CODE" || election.voterAccessType === "OPEN_POLL") {
      const deviceCookie = req.cookies.get(`votebd_voted_${election.id}`)?.value;
      const bodyObj = rawBody as { deviceId?: string };
      const rawFingerprint = deviceCookie || bodyObj?.deviceId;
      if (rawFingerprint) {
        const hashedFingerprint = sha256(`${election.id}:${rawFingerprint}`);
        const existing = await prisma.voter.findFirst({
          where: { electionId: election.id, deviceFingerprint: hashedFingerprint },
          select: { id: true },
        });
        if (existing) {
          return NextResponse.json(
            { error: "This device has already cast a ballot in this election." },
            { status: 409 }
          );
        }
      }
      return NextResponse.json({ valid: true });
    }

    const parseResult = voterVerifySchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid voter code.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const cleanCode = parseResult.data.voterCode.trim().toUpperCase();
    const voter = await prisma.voter.findUnique({
      where: {
        electionId_voterCode: {
          electionId: election.id,
          voterCode: cleanCode,
        },
      },
      select: {
        hasVoted: true,
      },
    });

    if (!voter) {
      return NextResponse.json(
        { error: "Invalid voter code. Please check with the organizer." },
        { status: 404 }
      );
    }

    if (voter.hasVoted) {
      return NextResponse.json(
        { error: "This voter code has already been used. Each voter can only cast one ballot." },
        { status: 409 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error: unknown) {
    console.error("Voter verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify voter eligibility." },
      { status: 500 }
    );
  }
}
