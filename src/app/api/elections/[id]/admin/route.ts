import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminPin, generateJoinCode, generateVoterCode } from "@/lib/hasher";
import { checkRateLimit } from "@/lib/rateLimit";
import { adminActionSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";

    const rawBody = await req.json();
    const parseResult = adminActionSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { adminPin, sessionToken, action } = parseResult.data;

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

    // Rate-limit PIN verification attempts: max 5 attempts per 60 seconds per IP
    const rateCheck = checkRateLimit(`admin_pin:${ip}:${election.id}`, 5, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `Too many invalid attempts. Account temporarily locked for ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    // Check if valid session token or verify PIN
    let isAuthenticated = false;
    const expectedToken = Buffer.from(`${election.id}:${election.adminKey.slice(-12)}`).toString("base64");

    if (sessionToken && sessionToken === expectedToken) {
      isAuthenticated = true;
    } else if (adminPin) {
      isAuthenticated = await verifyAdminPin(adminPin, election.adminKey);
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Incorrect Admin PIN. Please verify and try again." },
        { status: 403 }
      );
    }

    // Handle Actions
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
      return NextResponse.json({ success: true, message: "Election closed successfully." });
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
          details: JSON.stringify({ extendedByHours: 1, newEndTime: newEnd }),
        },
      });
      return NextResponse.json({ success: true, newEndTime: newEnd });
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
          details: JSON.stringify({ extendedByHours: 24, newEndTime: newEnd }),
        },
      });
      return NextResponse.json({ success: true, newEndTime: newEnd });
    }

    if (action === "DUPLICATE") {
      // Duplicate election for another semester/term
      const newJoinCode = generateJoinCode();
      const newSlug = `${election.slug}-copy-${newJoinCode.toLowerCase()}`;
      const now = new Date();
      const newEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const duplicated = await prisma.election.create({
        data: {
          slug: newSlug,
          title: `${election.title} (Clone)`,
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
          voterAccessType: election.voterAccessType,
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

      return NextResponse.json({
        success: true,
        duplicatedJoinCode: duplicated.joinCode,
        message: "Election duplicated successfully.",
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
      return NextResponse.json({ success: true, voters, sessionToken: expectedToken });
    }

    if (action === "GET_AUDIT") {
      const logs = await prisma.auditLog.findMany({
        where: { electionId: election.id },
        orderBy: { timestamp: "desc" },
      });
      return NextResponse.json({ success: true, logs, sessionToken: expectedToken });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      sessionToken: expectedToken,
    });
  } catch (error: any) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute administrative action." },
      { status: 500 }
    );
  }
}
