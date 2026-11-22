import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Search by joinCode, id, or slug
    const election = await prisma.election.findFirst({
      where: {
        OR: [
          { id },
          { joinCode: id.toUpperCase() },
          { slug: id.toLowerCase() },
        ],
      },
      include: {
        options: {
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: {
            voters: true,
            ballots: true,
          },
        },
      },
    });

    if (!election) {
      return NextResponse.json({ error: "Election not found" }, { status: 404 });
    }

    // Check if election is ended by time
    const now = new Date();
    const isPastDeadline = now > new Date(election.endTime);
    const effectiveStatus =
      election.status === "CLOSED" || isPastDeadline ? "CLOSED" : election.status;

    // Count votes per option
    // In VoteBD, `ballot.choiceData` contains JSON array of option IDs e.g. ["opt1"]
    const ballots = await prisma.ballot.findMany({
      where: { electionId: election.id },
      select: {
        choiceData: true,
        sequenceNumber: true,
        castAt: true,
        receiptCode: true,
      },
      orderBy: { sequenceNumber: "desc" },
    });

    const voteCounts: Record<string, number> = {};
    for (const opt of election.options) {
      voteCounts[opt.id] = 0;
    }
    voteCounts["nota"] = 0;

    for (const b of ballots) {
      try {
        const parsed = JSON.parse(b.choiceData);
        if (Array.isArray(parsed)) {
          for (const optId of parsed) {
            voteCounts[optId] = (voteCounts[optId] || 0) + 1;
          }
        }
      } catch {}
    }

    // Options with tallies
    const optionsWithVotes = election.options.map((opt) => ({
      ...opt,
      votes: voteCounts[opt.id] || 0,
      percentage:
        ballots.length > 0
          ? Math.round(((voteCounts[opt.id] || 0) / ballots.length) * 100)
          : 0,
    }));

    return NextResponse.json({
      election: {
        id: election.id,
        slug: election.slug,
        title: election.title,
        titleBn: election.titleBn,
        description: election.description,
        descriptionBn: election.descriptionBn,
        category: election.category,
        electionType: election.electionType,
        status: effectiveStatus,
        joinCode: election.joinCode,
        allowNota: election.allowNota,
        notaVotes: voteCounts["nota"] || 0,
        maxChoices: election.maxChoices,
        resultVisibility: election.resultVisibility,
        voterAccessType: election.voterAccessType,
        startTime: election.startTime,
        endTime: election.endTime,
        totalEligibleVoters: election._count.voters,
        totalBallotsCast: ballots.length,
        turnoutPercentage:
          election._count.voters > 0
            ? Math.round((ballots.length / election._count.voters) * 100)
            : 0,
        options: optionsWithVotes,
        recentBallotActivity: ballots.slice(0, 10).map((b) => ({
          sequenceNumber: b.sequenceNumber,
          castAt: b.castAt,
          receiptCode: b.receiptCode,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching election:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch election" },
      { status: 500 }
    );
  }
}
