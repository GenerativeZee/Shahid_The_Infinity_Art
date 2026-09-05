import { NextResponse } from "next/server";
import { business, startProject } from "@/content/site";

// Cheap server-side bounds — the client sends a small, structured payload.
const MAX_ANSWER_CHARS = 300;
const MAX_NOTE_CHARS = 1200;
const MAX_CONTACT_CHARS = 120;

type QuoteBody = {
  category?: unknown;
  answers?: unknown;
  name?: unknown;
  phone?: unknown;
  note?: unknown;
  hasPhoto?: unknown;
};

const str = (v: unknown, cap: number) =>
  typeof v === "string" ? v.trim().slice(0, cap) : "";

/**
 * Human, category-aware required-field messages — mirrors the client so a
 * visitor who bypasses the browser still gets a sentence, not "INVALID".
 */
const REQUIRED_MESSAGE: Record<string, string> = {
  quantity: "Add a quantity so we can understand the requirement.",
  brief: "Tell us what you're looking for.",
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as QuoteBody | null;

  const categoryId = str(body?.category, 40);
  const category = startProject.categories.find((c) => c.id === categoryId);
  if (!category) {
    return NextResponse.json(
      { error: "Please choose what you're looking for." },
      { status: 400 },
    );
  }

  const rawAnswers =
    body?.answers && typeof body.answers === "object"
      ? (body.answers as Record<string, unknown>)
      : {};

  // Keep only answers that belong to this category, sanitised and in the
  // order the form shows them — never trust arbitrary keys.
  const answered: { label: string; value: string }[] = [];
  const missing: string[] = [];
  for (const field of category.fields) {
    if (field.type === "photo") continue;
    const value = str(rawAnswers[field.name], MAX_ANSWER_CHARS);
    if (value) {
      answered.push({ label: field.label, value });
    } else if (field.required) {
      missing.push(REQUIRED_MESSAGE[field.name] ?? `Please add ${field.label.toLowerCase()}.`);
    }
  }
  if (missing.length > 0) {
    return NextResponse.json({ error: missing[0] }, { status: 400 });
  }

  const name = str(body?.name, MAX_CONTACT_CHARS);
  const phone = str(body?.phone, MAX_CONTACT_CHARS);
  if (!name) {
    return NextResponse.json({ error: "Let us know who to reply to." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json(
      { error: "Add a phone number so Shahid can reach you." },
      { status: 400 },
    );
  }

  const note = str(body?.note, MAX_NOTE_CHARS);
  const hasPhoto =
    body?.hasPhoto === true && category.fields.some((f) => f.type === "photo");

  // Seam for the ops app: where a real submission would be persisted (see
  // DECISIONS.md — no database is provisioned yet, this logs to the
  // function's runtime logs for now).
  console.log("[quote] new request", {
    category: category.id,
    answers: answered,
    name,
    phone,
    note,
    hasPhoto,
    at: new Date().toISOString(),
  });

  const lines = [`Hi Shahid, I'm looking for: ${category.label}`];
  for (const { label, value } of answered) lines.push(`${label}: ${value}`);
  if (note) lines.push(`Anything else: ${note}`);
  if (hasPhoto) lines.push("(I'll share a photo of the wall here on WhatsApp.)");
  lines.push("", `Name: ${name}`, `Phone: ${phone}`);

  const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
    lines.join("\n"),
  )}`;

  return NextResponse.json({ whatsappUrl });
}
