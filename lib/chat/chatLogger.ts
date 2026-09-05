/**
 * Conversation logging for the studio chat — a thin, replaceable seam
 * between the API route and a Google Apps Script web app that writes to a
 * Google Sheet (Sessions + Messages tabs). See docs/google-sheets-logging.md.
 *
 * Design rules (from the iteration brief):
 * - The AI chat NEVER depends on this. Every function swallows its own
 *   errors and returns; the caller runs it via `after()` so the visitor
 *   already has their reply.
 * - No Google SDK, no new dependency — one `fetch` to a URL held in the
 *   `GOOGLE_SHEETS_WEBHOOK_URL` server env var. Unset → silently disabled.
 * - Nothing sensitive is sent: no API keys, no system prompt, no IP or
 *   device data. Only the structured payload below.
 */
import { deriveLeadSummary } from "./leadSignals";
import type { ChatMessage } from "./chatService";

const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const TIMEOUT_MS = 4000;

let warnedMissing = false;

type ChatMessageEvent = {
  event: "chat_message";
  sessionId: string;
  messageId: string;
  timestamp: string;
  role: "user" | "assistant";
  content: string;
  page: string;
};

type HandoffEvent = {
  event: "whatsapp_handoff";
  sessionId: string;
  timestamp: string;
  page: string;
};

async function postToSheet(body: unknown): Promise<void> {
  if (!WEBHOOK_URL) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.warn("[chatLogger] GOOGLE_SHEETS_WEBHOOK_URL is not set — conversation logging is disabled.");
    }
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      redirect: "follow", // Apps Script web apps answer via a 302 to script.googleusercontent.com
    });
    if (!res.ok) {
      console.error(`[chatLogger] sheet webhook responded ${res.status}`);
    }
  } catch (err) {
    // Timeouts, DNS, offline, Apps Script quota — all non-fatal here.
    console.error("[chatLogger] sheet webhook failed:", err instanceof Error ? err.message : err);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Log one user turn and the assistant's reply, plus a refreshed
 * session-level summary derived (cheaply, no extra AI call) from the
 * whole transcript so far.
 */
export async function logChatExchange(input: {
  sessionId: string;
  page: string;
  userMessageId: string;
  userText: string;
  assistantText: string;
  /** Full transcript including the assistant reply, for the summary. */
  transcript: ChatMessage[];
}): Promise<void> {
  const now = new Date().toISOString();
  const summary = deriveLeadSummary(input.transcript);

  const events: ChatMessageEvent[] = [
    {
      event: "chat_message",
      sessionId: input.sessionId,
      messageId: input.userMessageId,
      timestamp: now,
      role: "user",
      content: input.userText,
      page: input.page,
    },
    {
      event: "chat_message",
      sessionId: input.sessionId,
      messageId: `${input.userMessageId}:a`,
      timestamp: now,
      role: "assistant",
      content: input.assistantText,
      page: input.page,
    },
  ];

  await postToSheet({
    events,
    session: {
      sessionId: input.sessionId,
      lastActivity: now,
      page: input.page,
      interest: summary.interest,
      userNeed: summary.userNeed,
      qualification: summary.qualification,
      leadNotes: summary.leadNotes,
      lastUserMessage: summary.lastUserMessage,
    },
  });
}

/** Record that the visitor clicked the WhatsApp handoff from the chat. */
export async function trackWhatsAppHandoff(input: {
  sessionId: string;
  page: string;
}): Promise<void> {
  const payload: HandoffEvent = {
    event: "whatsapp_handoff",
    sessionId: input.sessionId,
    timestamp: new Date().toISOString(),
    page: input.page,
  };
  await postToSheet(payload);
}
