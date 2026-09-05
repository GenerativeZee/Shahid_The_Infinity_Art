/**
 * Anonymous per-conversation session id for the studio chat.
 *
 * - Random only — no email, phone, IP, or device/browser fingerprinting.
 * - Held in `sessionStorage`, so it survives a reload in the same tab and
 *   is gone when the tab closes. No cross-device or cross-tab identity.
 * - A module-level fallback keeps it working when storage throws (private
 *   mode, blocked cookies) for the life of the page.
 */
const STORAGE_KEY = "tia:studio-session";

let memoryId: string | null = null;

function uuid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  // Fallback for older / non-secure contexts — not cryptographically
  // strong, but it only needs to be collision-unlikely per visitor.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** The current conversation's id, creating one on first use. */
export function getStudioSessionId(): string {
  if (memoryId) return memoryId;
  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    if (existing) {
      memoryId = existing;
      return existing;
    }
    const fresh = uuid();
    window.sessionStorage.setItem(STORAGE_KEY, fresh);
    memoryId = fresh;
    return fresh;
  } catch {
    memoryId = memoryId ?? uuid();
    return memoryId;
  }
}

/** Start a fresh conversation — used when the visitor picks "New". */
export function resetStudioSessionId(): string {
  const fresh = uuid();
  memoryId = fresh;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, fresh);
  } catch {
    /* memory fallback already set */
  }
  return fresh;
}

/** A per-message id for de-duplicating retried sends. */
export function newMessageId(): string {
  return uuid();
}
