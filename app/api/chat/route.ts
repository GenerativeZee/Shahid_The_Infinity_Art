import { NextResponse } from "next/server";
import { generateStudioResponse, type ChatMessage } from "@/lib/chat/chatService";
import { buildSystemPrompt } from "@/lib/chat/systemPrompt";

// Bounds — cheap server-side protection against oversized / abusive payloads.
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;
const MAX_TOTAL_CHARS = 14_000;

type Body = { messages?: unknown };

function parseMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null;

  const out: ChatMessage[] = [];
  let total = 0;

  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;

    const trimmed = content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!trimmed) return null;

    total += trimmed.length;
    out.push({ role, content: trimmed });
  }

  if (total > MAX_TOTAL_CHARS) return null;
  if (out[out.length - 1].role !== "user") return null;
  return out;
}

const UNAVAILABLE = {
  error: "unavailable",
  message:
    "The studio assistant is taking a moment. You can continue directly with Shahid on WhatsApp.",
} as const;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const messages = parseMessages(body?.messages);

  if (!messages) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const result = await generateStudioResponse(messages, buildSystemPrompt());

  if (!result.ok) {
    // Same friendly response whether the key is missing or the provider
    // failed — the visitor never learns which, and no internals leak.
    return NextResponse.json(UNAVAILABLE, { status: 503 });
  }

  return NextResponse.json({ reply: result.reply });
}
