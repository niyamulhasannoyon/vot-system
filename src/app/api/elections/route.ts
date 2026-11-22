import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateJoinCode, generateVoterCode, hashAdminPin } from "@/lib/hasher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      titleBn,
      description,
      descriptionBn,
      category = "class",
      electionType = "SINGLE",
      allowNota = false,
      maxChoices = 1,
      resultVisibility = "LIVE",
      voterAccessType = "JOIN_CODE",
      startTime,
      endTime,
      adminPin,
      candidates = [],
      voterListRaw = "",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!adminPin || adminPin.trim().length < 4) {
      return NextResponse.json(
        { error: "Admin PIN must be at least 4 digits" },
        { status: 400 }
      );
    }

    if (!candidates || candidates.length < 2) {
      return NextResponse.json(
        { error: "At least 2 candidates or options are required" },
        { status: 400 }
      );
    }

    // Generate unique Join Code
    let joinCode = generateJoinCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.election.findUnique({ where: { joinCode } });
      if (!existing) isUnique = true;
      else joinCode = generateJoinCode();
    }

    // Slug
    const slugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "election";
    const slug = `${slugBase}-${joinCode.toLowerCase()}`;

    const start = startTime ? new Date(startTime) : new Date();
    // Default end time: 24 hours from start if not provided
    const end = endTime
      ? new Date(endTime)
      : new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const election = await prisma.election.create({
      data: {
        slug,
        title,
        titleBn: titleBn || title,
        description,
        descriptionBn: descriptionBn || description,
        category,
        electionType,
        status: "ACTIVE",
        joinCode,
        adminKey: hashAdminPin(adminPin),
        allowNota: Boolean(allowNota),
        maxChoices: Number(maxChoices) || 1,
        resultVisibility,
        voterAccessType,
        startTime: start,
        endTime: end,
        timezone: "Asia/Dhaka",
        options: {
          create: candidates.map((c: any, index: number) => ({
            name: c.name,
            nameBn: c.nameBn || c.name,
            symbolEmoji: c.symbolEmoji || "🗳️",
            symbolName: c.symbolName || "",
            bio: c.bio || "",
            bioBn: c.bioBn || c.bio || "",
            orderIndex: index + 1,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    // Parse voter list if provided or create open pool
    let generatedVotersCount = 0;
    if (voterAccessType === "CODE_LIST" && voterListRaw.trim()) {
      const lines = voterListRaw
        .split("\n")
        .map((l: string) => l.trim())
        .filter(Boolean);

      const votersToCreate = lines.map((line: string, i: number) => ({
        electionId: election.id,
        voterCode: generateVoterCode(`V${i + 1}`),
        identifier: line,
        hasVoted: false,
      }));

      await prisma.voter.createMany({ data: votersToCreate });
      generatedVotersCount = votersToCreate.length;
    } else {
      // Default set of sample codes for test
      const sampleCodes = Array.from({ length: 5 }, (_, i) => ({
        electionId: election.id,
        voterCode: generateVoterCode(`V${i + 1}`),
        identifier: `General Voter ${i + 1}`,
        hasVoted: false,
      }));
      await prisma.voter.createMany({ data: sampleCodes });
      generatedVotersCount = sampleCodes.length;
    }

    // Log Creation in Audit
    await prisma.auditLog.create({
      data: {
        electionId: election.id,
        eventType: "ELECTION_CREATED",
        details: JSON.stringify({
          title,
          candidatesCount: candidates.length,
          votersCount: generatedVotersCount,
          voterAccessType,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      electionId: election.id,
      joinCode: election.joinCode,
      slug: election.slug,
      votersCount: generatedVotersCount,
    });
  } catch (error: any) {
    console.error("Error creating election:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create election" },
      { status: 500 }
    );
  }
}
