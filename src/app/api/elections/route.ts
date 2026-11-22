import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateJoinCode, generateVoterCode, hashAdminPin } from "@/lib/hasher";
import { createElectionSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = createElectionSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      title,
      titleBn,
      description,
      descriptionBn,
      category,
      electionType,
      allowNota,
      maxChoices,
      resultVisibility,
      voterAccessType,
      startTime,
      endTime,
      adminPin,
      candidates,
      voterListRaw,
    } = parseResult.data;

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
    const end = new Date(endTime);

    if (end <= start) {
      return NextResponse.json(
        { error: "End time must be after start time." },
        { status: 400 }
      );
    }

    // Hash admin PIN securely with bcrypt
    const hashedPin = await hashAdminPin(adminPin);

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
        adminKey: hashedPin,
        allowNota: Boolean(allowNota),
        maxChoices: Number(maxChoices) || 1,
        resultVisibility,
        voterAccessType,
        startTime: start,
        endTime: end,
        timezone: "Asia/Dhaka",
        options: {
          create: candidates.map((c, index: number) => ({
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

    // Parse voter list if provided
    let generatedVotersCount = 0;
    if (voterAccessType === "CODE_LIST" && voterListRaw?.trim()) {
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
      // Default set of sample codes for instant testability
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
