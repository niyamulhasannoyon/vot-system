import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sha256 } from "@/lib/hasher";
import { receiptVerificationSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ receiptCode: string }> }
) {
  try {
    const { receiptCode } = await params;
    const cleanCode = receiptCode.trim().toUpperCase();

    const parseResult = receiptVerificationSchema.safeParse({ receiptCode: cleanCode });
    if (!parseResult.success) {
      return NextResponse.json(
        { verified: false, error: "Invalid receipt code format. Expected format: VBD-XXXX-XXXX" },
        { status: 400 }
      );
    }

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
        { verified: false, error: "Receipt code not found in the cryptographic chain." },
        { status: 404 }
      );
    }

    // Mathematical verification of ballot hash seal
    const expectedHash = sha256(
      `${ballot.prevHash}|${ballot.sequenceNumber}|${ballot.choiceData}|${ballot.castAt.toISOString()}`
    );
    const isSelfHashValid = ballot.ballotHash === expectedHash;

    const totalBallots = await prisma.ballot.count({
      where: { electionId: ballot.electionId },
    });

    // Fetch chain overview for visual block explorer
    const allBallots = await prisma.ballot.findMany({
      where: { electionId: ballot.electionId },
      select: {
        sequenceNumber: true,
        receiptCode: true,
        ballotHash: true,
        prevHash: true,
        castAt: true,
      },
      orderBy: { sequenceNumber: "asc" },
      take: 12,
    });

    const genesisHash = sha256(`GENESIS:${ballot.election.id}:${ballot.election.createdAt.toISOString()}`);

    const chainBlocks = allBallots.map((b) => ({
      sequenceNumber: b.sequenceNumber,
      receiptCode: b.receiptCode,
      shortHash: `${b.ballotHash.slice(0, 6)}...${b.ballotHash.slice(-6)}`,
      castAt: b.castAt,
      isTarget: b.receiptCode === cleanCode,
    }));

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
      ballotHash: ballot.ballotHash,
      prevHash: ballot.prevHash,
      prevHashTruncated: `${ballot.prevHash.substring(0, 8)}...${ballot.prevHash.substring(ballot.prevHash.length - 8)}`,
      ballotHashTruncated: `${ballot.ballotHash.substring(0, 8)}...${ballot.ballotHash.substring(ballot.ballotHash.length - 8)}`,
      genesisHashTruncated: `${genesisHash.substring(0, 8)}...${genesisHash.substring(genesisHash.length - 8)}`,
      chainBlocks,
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { verified: false, error: "Failed to verify receipt." },
      { status: 500 }
    );
  }
}
