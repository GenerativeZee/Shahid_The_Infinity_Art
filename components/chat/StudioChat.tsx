"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { askStudio } from "@/content/site";
import {
  getStudioSessionId,
  newMessageId,
  resetStudioSessionId,
} from "@/lib/chat/session";
import { usePrefersReducedMotion } from "@/lib/tier";

// The panel loads only when the visitor opens it — the always-present cost
// is just this trigger + orchestrator.
const StudioChatPanel = dynamic(
  () => import("./StudioChatPanel").then((m) => m.StudioChatPanel),
  { ssr: false },
);

export type ChatMsg = { id: number; role: "user" | "assistant"; content: string };

// Bounded session history — cleared when the visitor starts a new one.
const MAX_HISTORY = 18;
let nextId = 0;

/**
 * "Ask the Studio" — a conversation with the studio, not a chatbot. Sits
 * bottom-left so WhatsApp keeps the bottom-right. All state is
 * session-only; the API route (/api/chat) does the Gemini call server-side.
 */
export function StudioChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Integration seam: the Start a Project form's "Ask the Studio →" (and
  // any future entry point) opens the panel by dispatching this event —
  // no shared store, no prop drilling across the page.
  useEffect(() => {
    const openPanel = () => setOpen(true);
    window.addEventListener("studio-chat:open", openPanel);
    return () => window.removeEventListener("studio-chat:open", openPanel);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || pending) return;

      setFailed(false);
      const withUser = [
        ...messages,
        { id: ++nextId, role: "user" as const, content: text },
      ].slice(-MAX_HISTORY);
      setMessages(withUser);
      setPending(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: withUser.map(({ role, content }) => ({ role, content })),
            sessionId: getStudioSessionId(),
            messageId: newMessageId(),
            page: window.location.pathname,
          }),
        });
        const data = (await res.json().catch(() => null)) as { reply?: string } | null;

        if (!res.ok || !data?.reply) {
          setFailed(true);
        } else {
          setMessages((m) =>
            [...m, { id: ++nextId, role: "assistant" as const, content: data.reply! }].slice(
              -MAX_HISTORY,
            ),
          );
        }
      } catch {
        setFailed(true);
      } finally {
        setPending(false);
      }
    },
    [messages, pending],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setFailed(false);
    // "New" starts a fresh conversation — and a fresh Sessions row.
    resetStudioSessionId();
  }, []);

  // Fire-and-forget beacon when the visitor takes the WhatsApp handoff from
  // the panel. Uses keepalive so it survives the navigation; never awaited,
  // never blocks the click.
  const trackHandoff = useCallback(() => {
    try {
      fetch("/api/chat/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getStudioSessionId(),
          page: window.location.pathname,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* handoff link still works regardless */
    }
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="studio-chat-panel"
        onClick={() => setOpen((o) => !o)}
        className="studio-chat__trigger"
      >
        <span aria-hidden="true" className="studio-chat__dot" />
        <span className="studio-chat__trigger-label">{askStudio.triggerLabel}</span>
        <span aria-hidden="true" className="studio-chat__arrow">
          →
        </span>
      </button>

      {open ? (
        <StudioChatPanel
          messages={messages}
          pending={pending}
          failed={failed}
          reduced={reduced}
          onSend={send}
          onClose={close}
          onReset={reset}
          onHandoff={trackHandoff}
        />
      ) : null}
    </>
  );
}
