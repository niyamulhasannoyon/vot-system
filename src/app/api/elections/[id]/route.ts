import { NextRequest, NextResponse } from "next/server";
import { buildElectionPayload, findElectionByIdentifier } from "@/lib/electionLookup";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const election = await findElectionByIdentifier(id);

    if (!election) {
      return NextResponse.json({ error: "Election not found" }, { status: 404 });
    }

    const payload = await buildElectionPayload(election, { revealResults: false });

    return NextResponse.json(
      { election: payload },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Error fetching election:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch election";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
