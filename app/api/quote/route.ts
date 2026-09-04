import { NextResponse } from "next/server";
import { business } from "@/content/site";

type QuoteBody = {
  name?: string;
  phone?: string;
  size?: string;
  material?: string;
  note?: string;
  hasPhoto?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as QuoteBody | null;

  if (!body || !body.name?.trim() || !body.phone?.trim() || !body.size?.trim() || !body.material?.trim()) {
    return NextResponse.json(
      { error: "Name, phone, size and material are required." },
      { status: 400 },
    );
  }

  // Seam for the ops app: this is where a real submission would be persisted
  // (see DECISIONS.md — no database is provisioned yet, this just logs to
  // the function's runtime logs for now).
  console.log("[quote] new request", {
    name: body.name,
    phone: body.phone,
    size: body.size,
    material: body.material,
    note: body.note ?? "",
    hasPhoto: Boolean(body.hasPhoto),
    at: new Date().toISOString(),
  });

  const lines = [
    `Hi, I'd like a quote.`,
    `Name: ${body.name}`,
    `Phone: ${body.phone}`,
    `Size: ${body.size} ft`,
    `Material: ${body.material}`,
  ];
  if (body.note?.trim()) lines.push(`Note: ${body.note.trim()}`);
  if (body.hasPhoto) lines.push(`(I'll share a photo of the wall here on WhatsApp.)`);

  const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;

  return NextResponse.json({ whatsappUrl });
}
