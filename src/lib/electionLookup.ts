import { prisma } from "@/lib/db";
import type { ElectionDetail } from "@/types/election";

export async function findElectionByIdentifier(idOrCode: string) {
  const clean = decodeURIComponent(idOrCode).trim();
  if (!clean) return null;

  return prisma.election.findFirst({
    where: {
      OR: [
        { id: clean },
        { joinCode: clean.toUpperCase() },
        { slug: clean.toLowerCase() },
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
}

type ElectionWithRelations = NonNullable<
  Awaited<ReturnType<typeof findElectionByIdentifier>>
>;

export function computeEffectiveStatus(election: {
  status: string;
  endTime: Date;
}): string {
  const now = new Date();
  const isPastDeadline = now > new Date(election.endTime);
  if (election.status === "CLOSED" || isPastDeadline) {
    return "CLOSED";
  }
  return election.status;
}

export async function buildElectionPayload(
  election: ElectionWithRelations,
  options: { revealResults?: boolean } = {}
): Promise<ElectionDetail> {
  const now = new Date();
  const effectiveStatus = computeEffectiveStatus(election);
  const hasStarted = now >= new Date(election.startTime);
  const resultsHidden =
    election.resultVisibility === "AFTER_CLOSE" &&
    effectiveStatus !== "CLOSED" &&
    !options.revealResults;

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
  const bordaScores: Record<string, number> = {};
  for (const opt of election.options) {
    voteCounts[opt.id] = 0;
    bordaScores[opt.id] = 0;
  }
  voteCounts["nota"] = 0;

  if (!resultsHidden) {
    const optionCount = election.options.length;
    for (const b of ballots) {
      try {
        const parsed = JSON.parse(b.choiceData);
        if (!Array.isArray(parsed)) continue;

        if (election.electionType === "RANKED") {
          const firstChoice = parsed[0];
          if (typeof firstChoice === "string") {
            voteCounts[firstChoice] = (voteCounts[firstChoice] || 0) + 1;
          }
          parsed.forEach((optId: unknown, idx: number) => {
            if (typeof optId === "string" && optId !== "nota") {
              const weight = Math.max(1, optionCount - idx);
              bordaScores[optId] = (bordaScores[optId] || 0) + weight;
            }
          });
        } else {
          // Deduplicate defensively per ballot
          const unique = new Set(
            parsed.filter((item): item is string => typeof item === "string")
          );
          for (const optId of unique) {
            voteCounts[optId] = (voteCounts[optId] || 0) + 1;
          }
        }
      } catch {
        // Ignore malformed legacy ballot payloads
      }
    }
  }

  const optionsWithVotes = election.options.map((opt) => {
    if (resultsHidden) {
      return {
        ...opt,
        votes: null,
        percentage: null,
        bordaScore: null,
      };
    }
    const count = voteCounts[opt.id] || 0;
    return {
      ...opt,
      votes: count,
      percentage:
        ballots.length > 0 ? Math.round((count / ballots.length) * 100) : 0,
      bordaScore:
        election.electionType === "RANKED" ? bordaScores[opt.id] || 0 : null,
    };
  });

  const isCodeList = election.voterAccessType === "CODE_LIST";
  const turnoutPercentage =
    isCodeList && election._count.voters > 0
      ? Math.round((ballots.length / election._count.voters) * 100)
      : null;

  return {
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
    notaVotes: resultsHidden ? null : voteCounts["nota"] || 0,
    maxChoices: election.maxChoices,
    resultVisibility: election.resultVisibility,
    resultsHidden,
    voterAccessType: election.voterAccessType,
    startTime: election.startTime.toISOString(),
    endTime: election.endTime.toISOString(),
    hasStarted,
    totalEligibleVoters: isCodeList ? election._count.voters : ballots.length,
    totalBallotsCast: ballots.length,
    turnoutPercentage,
    options: optionsWithVotes,
    recentBallotActivity: ballots.slice(0, 10).map((b) => ({
      sequenceNumber: b.sequenceNumber,
      castAt: b.castAt.toISOString(),
      receiptCode: b.receiptCode,
    })),
  };
}
