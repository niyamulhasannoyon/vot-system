import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateJoinCode, generateVoterCode, hashAdminPin } from "@/lib/hasher";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createElectionSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`create_election:${ip}`, 10, 10 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: `Too many elections created recently. Please wait ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

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

    const start = startTime ? new Date(startTime) : new Date();
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid start or end timestamp." },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { error: "End time must be after start time." },
        { status: 400 }
      );
    }

    if (end <= new Date()) {
      return NextResponse.json(
        { error: "End time must be in the future." },
        { status: 400 }
      );
    }

    const voterLines =
      voterAccessType === "CODE_LIST"
        ? (voterListRaw || "")
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean)
        : [];

    if (voterAccessType === "CODE_LIST" && voterLines.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least 1 voter in the roster for Code List elections." },
        { status: 400 }
      );
    }

    const normalizedMaxChoices =
      electionType === "MULTIPLE"
        ? Math.min(Math.max(1, Number(maxChoices) || 2), candidates.length)
        : 1;

    // Generate unique Join Code
    let joinCode = generateJoinCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.election.findUnique({ where: { joinCode } });
      if (!existing) isUnique = true;
      else joinCode = generateJoinCode();
    }

    const slugBase =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "election";
    const slug = `${slugBase}-${joinCode.toLowerCase()}`;

    const hashedPin = await hashAdminPin(adminPin);

    const created = await prisma.$transaction(async (tx) => {
      const election = await tx.election.create({
        data: {
          slug,
          title,
          titleBn: titleBn || title,
          description: description || null,
          descriptionBn: descriptionBn || description || null,
          category,
          electionType,
          status: "ACTIVE",
          joinCode,
          adminKey: hashedPin,
          allowNota: Boolean(allowNota),
          maxChoices: normalizedMaxChoices,
          resultVisibility,
          voterAccessType,
          startTime: start,
          endTime: end,
          timezone: "Asia/Dhaka",
          options: {
            create: candidates.map((c, index) => ({
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
      });

      let generatedVotersCount = 0;
      if (voterAccessType === "CODE_LIST") {
        const usedCodes = new Set<string>();
        const votersToCreate = voterLines.map((line, i) => {
          let code = generateVoterCode(`V${i + 1}`);
          while (usedCodes.has(code)) {
            code = generateVoterCode(`V${i + 1}`);
          }
          usedCodes.add(code);
          return {
            electionId: election.id,
            voterCode: code,
            identifier: line,
            hasVoted: false,
          };
        });

        await tx.voter.createMany({ data: votersToCreate });
        generatedVotersCount = votersToCreate.length;
      }

      await tx.auditLog.create({
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

      return { election, generatedVotersCount };
    });

    return NextResponse.json({
      success: true,
      electionId: created.election.id,
      joinCode: created.election.joinCode,
      slug: created.election.slug,
      votersCount: created.generatedVotersCount,
    });
  } catch (error: unknown) {
    console.error("Error creating election:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create election";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
