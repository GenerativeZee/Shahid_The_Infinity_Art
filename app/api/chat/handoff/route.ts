import { after, NextResponse } from "next/server";
import { trackWhatsAppHandoff } from "@/lib/chat/chatLogger";

const SESSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

type Body = { sessionId?: unknown; page?: unknown };

function parsePage(raw: unknown): string {
  if (typeof raw === "string" && raw.startsWith("/") && raw.length <= 128) {
    return raw.split(/[?#]/)[0];
  }
  return "/";
}

/**
 * Records that a visitor clicked "Continue on WhatsApp" from the chat.
 * The click still navigates client-side regardless of this response — this
 * only marks the Sessions row. Never returns anything the visitor sees.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";

  if (!SESSION_ID_RE.test(sessionId)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const page = parsePage(body?.page);
  after(() => trackWhatsAppHandoff({ sessionId, page }));

  return NextResponse.json({ ok: true });
}
