import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildElectionPayload, findElectionByIdentifier } from "@/lib/electionLookup";
import {
  createAdminSessionToken,
  generateJoinCode,
  verifyAdminPin,
  verifyAdminSessionToken,
} from "@/lib/hasher";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rateLimit";
import { adminActionSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = getClientIp(req);

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const parseResult = adminActionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { adminPin, sessionToken, action } = parseResult.data;

    const election = await findElectionByIdentifier(id);
    if (!election) {
      return NextResponse.json({ error: "Election not found." }, { status: 404 });
    }

    // Authenticate via signed HMAC session token first (does NOT consume PIN brute-force quota)
    let isAuthenticated = false;
    let issuedToken = sessionToken;

    if (sessionToken && verifyAdminSessionToken(sessionToken, election.id, election.adminKey)) {
      isAuthenticated = true;
    } else if (adminPin) {
      // Rate limit PIN verification attempts: max 5 attempts per 60 seconds per IP+election
      const rateKey = `admin_pin:${ip}:${election.id}`;
      const rateCheck = checkRateLimit(rateKey, 5, 60 * 1000);
      if (!rateCheck.success) {
        return NextResponse.json(
          {
            error: `Too many invalid attempts. Account temporarily locked for ${rateCheck.retryAfterSeconds} seconds.`,
          },
          { status: 429 }
        );
      }

      isAuthenticated = await verifyAdminPin(adminPin, election.adminKey);
      if (isAuthenticated) {
        resetRateLimit(rateKey);
        issuedToken = createAdminSessionToken(election.id, election.adminKey);
      }
    }

    if (!isAuthenticated || !issuedToken) {
      return NextResponse.json(
        { error: "Incorrect Admin PIN or expired session. Please verify and try again." },
        { status: 403 }
      );
    }

    if (action === "CLOSE") {
      await prisma.election.update({
        where: { id: election.id },
        data: { status: "CLOSED", endTime: new Date() },
      });
      await prisma.auditLog.create({
        data: {
          electionId: election.id,
          eventType: "ELECTION_CLOSED",
          details: JSON.stringify({ reason: "Closed early by organizer" }),
        },
      });
      return NextResponse.json({
        success: true,
        message: "Election closed successfully.",
        sessionToken: issuedToken,
      });
    }

    if (action === "EXTEND_HOUR") {
      const currentEnd = new Date(election.endTime);
      const baseTime = currentEnd > new Date() ? currentEnd : new Date();
      const newEnd = new Date(baseTime.getTime() + 60 * 60 * 1000);

      await prisma.election.update({
        where: { id: election.id },
        data: { endTime: newEnd, status: "ACTIVE" },
      });
      await prisma.auditLog.create({
        data: {
          electionId: election.id,
          eventType: "DEADLINE_EXTENDED",
          details: JSON.stringify({ extendedByHours: 1, newEndTime: newEnd.toISOString() }),
        },
      });
      return NextResponse.json({
        success: true,
        newEndTime: newEnd,
        sessionToken: issuedToken,
      });
    }

    if (action === "EXTEND_DAY") {
      const currentEnd = new Date(election.endTime);
      const baseTime = currentEnd > new Date() ? currentEnd : new Date();
      const newEnd = new Date(baseTime.getTime() + 24 * 60 * 60 * 1000);

      await prisma.election.update({
        where: { id: election.id },
        data: { endTime: newEnd, status: "ACTIVE" },
      });
      await prisma.auditLog.create({
        data: {
          electionId: election.id,
          eventType: "DEADLINE_EXTENDED",
          details: JSON.stringify({ extendedByHours: 24, newEndTime: newEnd.toISOString() }),
        },
      });
      return NextResponse.json({
        success: true,
        newEndTime: newEnd,
        sessionToken: issuedToken,
      });
    }

    if (action === "DUPLICATE") {
      let newJoinCode = generateJoinCode();
      let isUnique = false;
      while (!isUnique) {
        const existing = await prisma.election.findUnique({
          where: { joinCode: newJoinCode },
          select: { id: true },
        });
        if (!existing) isUnique = true;
        else newJoinCode = generateJoinCode();
      }

      const cleanSlugRoot = election.slug.replace(/-[a-z0-9]{4,8}$/, "");
      const newSlug = `${cleanSlugRoot}-${newJoinCode.toLowerCase()}`;
      const now = new Date();
      const newEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const duplicated = await prisma.election.create({
        data: {
          slug: newSlug,
          title: `${election.title} (Copy)`,
          titleBn: election.titleBn ? `${election.titleBn} (অনুলিপি)` : undefined,
          description: election.description,
          descriptionBn: election.descriptionBn,
          category: election.category,
          electionType: election.electionType,
          status: "ACTIVE",
          joinCode: newJoinCode,
          adminKey: election.adminKey,
          allowNota: election.allowNota,
          maxChoices: election.maxChoices,
          resultVisibility: election.resultVisibility,
          voterAccessType: election.voterAccessType === "CODE_LIST" ? "JOIN_CODE" : election.voterAccessType,
          startTime: now,
          endTime: newEnd,
          timezone: election.timezone,
          options: {
            create: election.options.map((opt, i) => ({
              name: opt.name,
              nameBn: opt.nameBn,
              symbolEmoji: opt.symbolEmoji,
              symbolName: opt.symbolName,
              bio: opt.bio,
              bioBn: opt.bioBn,
              orderIndex: i + 1,
            })),
          },
        },
      });

      await prisma.auditLog.create({
        data: {
          electionId: duplicated.id,
          eventType: "ELECTION_CREATED",
          details: JSON.stringify({
            title: duplicated.title,
            clonedFrom: election.joinCode,
            candidatesCount: election.options.length,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        duplicatedJoinCode: duplicated.joinCode,
        message: "Election duplicated successfully.",
        sessionToken: issuedToken,
      });
    }

    if (action === "GET_DASHBOARD") {
      const [voters, logs, electionDetail] = await Promise.all([
        prisma.voter.findMany({
          where: { electionId: election.id },
          select: {
            voterCode: true,
            identifier: true,
            hasVoted: true,
            votedAt: true,
          },
          orderBy: { voterCode: "asc" },
        }),
        prisma.auditLog.findMany({
          where: { electionId: election.id },
          orderBy: { timestamp: "desc" },
        }),
        buildElectionPayload(election, { revealResults: true }),
      ]);

      return NextResponse.json({
        success: true,
        voters,
        logs,
        election: electionDetail,
        sessionToken: issuedToken,
      });
    }

    if (action === "GET_CODES") {
      const voters = await prisma.voter.findMany({
        where: { electionId: election.id },
        select: {
          voterCode: true,
          identifier: true,
          hasVoted: true,
          votedAt: true,
        },
        orderBy: { voterCode: "asc" },
      });
      return NextResponse.json({ success: true, voters, sessionToken: issuedToken });
    }

    if (action === "GET_AUDIT") {
      const logs = await prisma.auditLog.findMany({
        where: { electionId: election.id },
        orderBy: { timestamp: "desc" },
      });
      return NextResponse.json({ success: true, logs, sessionToken: issuedToken });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      sessionToken: issuedToken,
    });
  } catch (error: unknown) {
    console.error("Admin action error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to execute administrative action.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
