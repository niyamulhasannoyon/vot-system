import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sha256 } from "@/lib/hasher";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ receiptCode: string }> }
) {
  try {
    const { receiptCode } = await params;
    const cleanCode = receiptCode.trim().toUpperCase();

    const ballot = await prisma.ballot.findUnique({
      where: { receiptCode: cleanCode },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            titleBn: true,
            slug: true,
            createdAt: true,
          },
        },
      },
    });

    if (!ballot) {
      return NextResponse.json(
        { verified: false, error: "Receipt code not found." },
        { status: 404 }
      );
    }

    // Verify hash integrity of the ballot
    const expectedHash = sha256(
      `${ballot.prevHash}|${ballot.sequenceNumber}|${ballot.choiceData}|${ballot.castAt.toISOString()}`
    );
    const isSelfHashValid = ballot.ballotHash === expectedHash;

    // Check count of total ballots in this election
    const totalBallots = await prisma.ballot.count({
      where: { electionId: ballot.electionId },
    });

    return NextResponse.json({
      verified: true,
      receiptCode: ballot.receiptCode,
      sequenceNumber: ballot.sequenceNumber,
      totalBallotsInElection: totalBallots,
      castAt: ballot.castAt,
      electionTitle: ballot.election.title,
      electionTitleBn: ballot.election.titleBn,
      electionSlug: ballot.election.slug,
      isHashValid: isSelfHashValid,
      prevHashTruncated: `${ballot.prevHash.substring(0, 8)}...${ballot.prevHash.substring(ballot.prevHash.length - 8)}`,
      ballotHashTruncated: `${ballot.ballotHash.substring(0, 8)}...${ballot.ballotHash.substring(ballot.ballotHash.length - 8)}`,
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { verified: false, error: "Failed to verify receipt." },
      { status: 500 }
    );
  }
}
