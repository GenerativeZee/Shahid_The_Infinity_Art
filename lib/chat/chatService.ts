/**
 * Provider abstraction for the studio assistant. The route calls
 * `generateStudioResponse`; only this file knows it's Gemini. Swapping
 * provider (or moving to the Vercel AI Gateway) is a change here alone.
 *
 * Deliberately a raw REST call — no SDK — so nothing provider-specific
 * ships to the browser and there's no dependency to maintain for Phase 1.
 * The API key is read from the server environment and never returned.
 */
export type ChatMessage = { role: "user" | "assistant"; content: string };

export type StudioReply =
  | { ok: true; reply: string }
  | { ok: false; reason: "unconfigured" | "unavailable" };

// `gemini-flash-latest` is Google's maintained alias for the current
// Flash model — pinning an exact version (e.g. gemini-2.5-flash) breaks
// when Google retires it for new API projects, which is exactly what
// happened. The alias tracks forward on its own.
const MODEL = "gemini-flash-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 20_000;

export async function generateStudioResponse(
  messages: ChatMessage[],
  systemInstruction: string,
): Promise<StudioReply> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, reason: "unconfigured" };

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.6,
          topP: 0.9,
          maxOutputTokens: 512,
          // Current Flash models reason before answering; left on, the
          // thinking tokens can consume the whole budget and return an
          // empty reply. The studio assistant only needs short, direct
          // answers, so thinking is disabled for speed and reliability.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!res.ok) return { ok: false, reason: "unavailable" };

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const reply = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();

    if (!reply) return { ok: false, reason: "unavailable" };
    return { ok: true, reply };
  } catch {
    return { ok: false, reason: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}
