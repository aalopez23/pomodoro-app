import { NextResponse } from "next/server";
import { addSession, listSessions } from "@/server/sessionStore";
// GET /api/sessions -> returns a stub list for now
export async function GET() {
  //no authorization yet
  return NextResponse.json({ sessions: listSessions() });
}

// POST /api/sessions -> accepts JSON and echoes it back (you'll persist later)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // Basic validation example
  if (typeof body?.durationMin !== "number") {
    return NextResponse.json({ error: "durationMin (number) required" }, { status: 400 });
  }
  const item = {
    id: crypto.randomUUID(),
    userId: null, //no auth yet
    startedAt: Date.now(),
    durationMin: body.durationMin,
  };
  addSession(item);
  return NextResponse.json({ session: item }, { status: 201 });
}
