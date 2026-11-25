import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateBallotHash, createGenesisHash } from "@/lib/hasher";
import { receiptVerificationSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ receiptCode: string }> }
) {
  try {
    const { receiptCode } = await params;
    const cleanCode = decodeURIComponent(receiptCode).trim().toUpperCase();

    const parseResult = receiptVerificationSchema.safeParse({ receiptCode: cleanCode });
    if (!parseResult.success) {
      return NextResponse.json(
        {
          verified: false,
          error: "Invalid receipt code format. Expected format: VBD-XXXX-XXXX",
        },
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
            joinCode: true,
            createdAt: true,
          },
        },
      },
    });

    if (!ballot) {
      return NextResponse.json(
        {
          verified: false,
          error: "Receipt code not found in the cryptographic chain.",
        },
        { status: 404 }
      );
    }

    const allBallots = await prisma.ballot.findMany({
      where: { electionId: ballot.electionId },
      select: {
        sequenceNumber: true,
        receiptCode: true,
        choiceData: true,
        ballotHash: true,
        prevHash: true,
        castAt: true,
      },
      orderBy: { sequenceNumber: "asc" },
    });

    const genesisHash = createGenesisHash(
      ballot.election.id,
      ballot.election.createdAt
    );

    // Full mathematical verification of the cryptographic hash chain from genesis through target
    let expectedPrev = genesisHash;
    let isChainValid = true;
    let isSelfHashValid = false;

    for (const b of allBallots) {
      const expectedSelf = calculateBallotHash(
        b.prevHash,
        b.sequenceNumber,
        b.choiceData,
        b.castAt
      );
      const selfOk = b.ballotHash === expectedSelf;
      const linkOk = b.prevHash === expectedPrev;

      if (b.receiptCode === cleanCode) {
        isSelfHashValid = selfOk;
      }

      if (!selfOk || !linkOk) {
        if (b.sequenceNumber <= ballot.sequenceNumber) {
          isChainValid = false;
        }
      }
      expectedPrev = b.ballotHash;
    }

    // Center a window of up to 12 blocks around the verified ballot so it is always visible
    const targetIdx = allBallots.findIndex((b) => b.receiptCode === cleanCode);
    const windowSize = 12;
    let startIdx = Math.max(0, targetIdx - Math.floor(windowSize / 2));
    if (startIdx + windowSize > allBallots.length) {
      startIdx = Math.max(0, allBallots.length - windowSize);
    }
    const visibleSlice = allBallots.slice(startIdx, startIdx + windowSize);

    const chainBlocks = visibleSlice.map((b) => ({
      sequenceNumber: b.sequenceNumber,
      receiptCode: b.receiptCode,
      shortHash: `${b.ballotHash.slice(0, 6)}...${b.ballotHash.slice(-6)}`,
      castAt: b.castAt,
      isTarget: b.receiptCode === cleanCode,
    }));

    const verified = isSelfHashValid && isChainValid;

    return NextResponse.json(
      {
        verified,
        receiptCode: ballot.receiptCode,
        sequenceNumber: ballot.sequenceNumber,
        totalBallotsInElection: allBallots.length,
        castAt: ballot.castAt,
        electionTitle: ballot.election.title,
        electionTitleBn: ballot.election.titleBn,
        electionSlug: ballot.election.slug,
        electionJoinCode: ballot.election.joinCode,
        isHashValid: isSelfHashValid,
        isChainValid,
        ballotHash: ballot.ballotHash,
        prevHash: ballot.prevHash,
        prevHashTruncated: `${ballot.prevHash.substring(0, 8)}...${ballot.prevHash.substring(ballot.prevHash.length - 8)}`,
        ballotHashTruncated: `${ballot.ballotHash.substring(0, 8)}...${ballot.ballotHash.substring(ballot.ballotHash.length - 8)}`,
        genesisHashTruncated: `${genesisHash.substring(0, 8)}...${genesisHash.substring(genesisHash.length - 8)}`,
        chainBlocks,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { verified: false, error: "Failed to verify receipt." },
      { status: 500 }
    );
  }
}
