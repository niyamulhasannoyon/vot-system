import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminPin } from "@/lib/hasher";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { adminPin, action } = body;

    if (!adminPin) {
      return NextResponse.json({ error: "Admin PIN required" }, { status: 401 });
    }

    const election = await prisma.election.findFirst({
      where: {
        OR: [{ id }, { joinCode: id.toUpperCase() }, { slug: id.toLowerCase() }],
      },
    });

    if (!election) {
      return NextResponse.json({ error: "Election not found" }, { status: 404 });
    }

    // Verify PIN
    const isValid = verifyAdminPin(adminPin, election.adminKey);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid Admin PIN" }, { status: 403 });
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
      return NextResponse.json({ success: true, message: "Election closed" });
    }

    if (action === "EXTEND_HOUR") {
      const newEnd = new Date(new Date(election.endTime).getTime() + 60 * 60 * 1000);
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
      const newEnd = new Date(new Date(election.endTime).getTime() + 24 * 60 * 60 * 1000);
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
      return NextResponse.json({ success: true, voters });
    }

    if (action === "GET_AUDIT") {
      const logs = await prisma.auditLog.findMany({
        where: { electionId: election.id },
        orderBy: { timestamp: "desc" },
      });
      return NextResponse.json({ success: true, logs });
    }

    return NextResponse.json({ success: true, authenticated: true });
  } catch (error: any) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute admin action" },
      { status: 500 }
    );
  }
}
