import { after, NextResponse } from "next/server";
import { generateStudioResponse, type ChatMessage } from "@/lib/chat/chatService";
import { logChatExchange } from "@/lib/chat/chatLogger";
import { buildSystemPrompt } from "@/lib/chat/systemPrompt";

// Bounds — cheap server-side protection against oversized / abusive payloads.
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;
const MAX_TOTAL_CHARS = 14_000;

const SESSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;
const MESSAGE_ID_RE = /^[A-Za-z0-9:_-]{8,80}$/;

type Body = {
  messages?: unknown;
  sessionId?: unknown;
  messageId?: unknown;
  page?: unknown;
};

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

/** Normalise an in-site path; anything unexpected becomes "/". */
function parsePage(raw: unknown): string {
  if (typeof raw === "string" && raw.startsWith("/") && raw.length <= 128) {
    return raw.split(/[?#]/)[0];
  }
  return "/";
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

  const reply = result.reply;

  // Conversation logging — strictly after the reply is returned, and only
  // when the client sent a well-formed session id. Never blocks or fails
  // the response (see lib/chat/chatLogger.ts).
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
  const messageId = typeof body?.messageId === "string" ? body.messageId : "";
  if (SESSION_ID_RE.test(sessionId) && MESSAGE_ID_RE.test(messageId)) {
    const page = parsePage(body?.page);
    const userText = messages[messages.length - 1].content;
    after(() =>
      logChatExchange({
        sessionId,
        page,
        userMessageId: messageId,
        userText,
        assistantText: reply,
        transcript: [...messages, { role: "assistant", content: reply }],
      }),
    );
  }

  return NextResponse.json({ reply });
}
