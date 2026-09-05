import type { ChatMessage } from "./chatService";

/**
 * Lightweight, deterministic reading of a conversation for the Sessions
 * sheet — no extra Gemini call (see the iteration brief, "SESSION SUMMARY
 * GENERATION"). Keyword rules only, grounded in the studio's own
 * vocabulary. Everything here is a best-effort hint for Shahid, never a
 * claim: unclear conversations stay "Unknown" / blank rather than guess.
 */
export type LeadSummary = {
  interest: string;
  userNeed: string;
  qualification: "High" | "Medium" | "Low" | "Unknown";
  leadNotes: string;
  lastUserMessage: string;
};

type Signal = { interest: string; need: string; pattern: RegExp };

// Most specific first — the first hit (scanning newest message first) wins.
const SIGNALS: Signal[] = [
  { interest: "LED", need: "illuminated sign", pattern: /\bled\b|glow sign|back ?lit|front ?lit|illuminat|lit sign|light ?up/i },
  { interest: "Acrylic", need: "acrylic letters", pattern: /acrylic|3d letter|cast letter|raised letter/i },
  { interest: "ACP", need: "ACP shop board", pattern: /\bacp\b|alumin(i)?um|composite panel/i },
  { interest: "Flex / Banner", need: "flex banner", pattern: /\bflex\b|\bbanner\b|hoarding|star ?flex/i },
  { interest: "Visiting Cards", need: "visiting cards", pattern: /visiting card|business card|calling card/i },
  { interest: "Wedding", need: "wedding invitations", pattern: /wedding|invitation card|invite card|shaadi|nik(k)?ah|marriage card/i },
  { interest: "Branding", need: "brand identity", pattern: /\bbrand(ing)?\b|\blogos?\b|visual identity|stationery|letterhead/i },
  { interest: "Website", need: "business website", pattern: /web ?site|landing page|web ?apps?|\bapps?\b|online store|e-?commerce/i },
  { interest: "Printing", need: "printing", pattern: /\bprint(s|ing)?\b|brochure|flyer|pamphlet|standee|\bposters?\b|catalog/i },
  { interest: "Signage", need: "signage", pattern: /\bsign(s|age|board)?\b|name ?board|name ?plate|glow board|shop ?front|hoarding board/i },
];

const BUYING_INTENT =
  /\b(quot(e|ation)?|pric(e|ing)|cost|charge|rate|how much|budget|order|buy|purchase|install(ation)?|delivery|deliver|timeline|how long|when can|lead time|advance|book|proceed|go ahead|finali[sz]e|confirm|site visit|measure)\b/i;

const READY_TO_TALK =
  /\b(whats ?app|talk on whatsapp|contact (you|shahid)|call me|discuss this|move forward|let'?s do it|want to proceed|take it from here)\b/i;

const EXPRESSES_NEED =
  /\b(i (need|want|am looking for)|we (need|want|are looking for)|looking for|planning (a|to)|require|would like|interested in)\b/i;

const ASKS_ADVICE =
  /\b(which|what|should i)\b.{0,28}\b(material|use|suggest|recommend|better|option|best|go (for|with))\b/i;

const cap = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);

export function deriveLeadSummary(messages: ChatMessage[]): LeadSummary {
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content.trim());
  const lastUserMessage = cap(userMessages[userMessages.length - 1] ?? "", 300);

  if (userMessages.length === 0) {
    return { interest: "Unknown", userNeed: "", qualification: "Unknown", leadNotes: "", lastUserMessage: "" };
  }

  const joined = userMessages.join("  •  ").toLowerCase();

  // Newest message first, most-specific signal first.
  let matched: Signal | undefined;
  for (let i = userMessages.length - 1; i >= 0 && !matched; i--) {
    const text = userMessages[i];
    matched = SIGNALS.find((s) => s.pattern.test(text));
  }

  const interest = matched?.interest ?? "Unknown";

  const hasIntent = BUYING_INTENT.test(joined);
  const hasReady = READY_TO_TALK.test(joined);
  const hasNeed = EXPRESSES_NEED.test(joined);
  const asksAdvice = ASKS_ADVICE.test(joined);
  const turns = userMessages.length;

  let userNeed = "";
  if (asksAdvice) userNeed = "material advice";
  else if (matched) userNeed = matched.need;
  else if (/\b(quot|pric|cost|how much)\b/i.test(joined)) userNeed = "quotation";

  let qualification: LeadSummary["qualification"];
  if (hasReady || (hasIntent && turns >= 2)) {
    qualification = "High";
  } else if (interest !== "Unknown" && (hasIntent || hasNeed || turns >= 3)) {
    qualification = "Medium";
  } else if (interest !== "Unknown" || userNeed !== "" || hasIntent) {
    qualification = "Low";
  } else {
    qualification = "Unknown";
  }

  let leadNotes = "";
  if (qualification === "High") {
    if (/\b(quot|pric|cost|how much)\b/i.test(joined)) leadNotes = "Wants a quotation";
    else if (READY_TO_TALK.test(joined)) leadNotes = "Wants to talk on WhatsApp";
    else if (/install/i.test(joined)) leadNotes = "Wants supply & installation";
    else leadNotes = "Ready to proceed";
  } else if (qualification === "Medium") {
    leadNotes = "Exploring a specific service";
  } else if (qualification === "Low") {
    leadNotes = "General enquiry";
  }

  return { interest, userNeed, qualification, leadNotes, lastUserMessage };
}
