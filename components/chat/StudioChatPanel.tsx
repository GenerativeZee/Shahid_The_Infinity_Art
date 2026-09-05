"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { askStudio, business } from "@/content/site";
import type { ChatMsg } from "./StudioChat";

/** Prefill a concise context for the WhatsApp handoff — reuses the site's
 *  existing wa.me pattern, nothing new. */
function whatsappHandoff(messages: ChatMsg[]): string {
  const firstQuestion = messages.find((m) => m.role === "user")?.content;
  const text = firstQuestion
    ? `Hi Shahid — I was chatting with the studio assistant about: ${firstQuestion}`
    : business.whatsappMessage;
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text.slice(0, 500))}`;
}

export function StudioChatPanel({
  messages,
  pending,
  failed,
  reduced,
  onSend,
  onClose,
  onReset,
  onHandoff,
}: {
  messages: ChatMsg[];
  pending: boolean;
  failed: boolean;
  reduced: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
  onReset: () => void;
  onHandoff: () => void;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending, failed]);

  const handoff = useMemo(() => whatsappHandoff(messages), [messages]);
  const showSuggestions = messages.length === 0 && !pending;

  function autoGrow() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }

  function submit() {
    if (!draft.trim() || pending) return;
    onSend(draft);
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div
      id="studio-chat-panel"
      role="dialog"
      aria-label="Ask the Studio"
      data-reduced={reduced ? "" : undefined}
      className="studio-chat__panel"
    >
      <div className="studio-chat__scrim" aria-hidden="true" onClick={onClose} />

      <div className="studio-chat__frame">
        <header className="studio-chat__header">
          <div>
            <p className="studio-chat__title">
              <span aria-hidden="true" className="studio-chat__dot" />
              {askStudio.title}
            </p>
            <p className="studio-chat__subtitle">{askStudio.subtitle}</p>
          </div>
          <div className="studio-chat__header-actions">
            {messages.length > 0 ? (
              <button type="button" onClick={onReset} className="studio-chat__reset">
                New
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="studio-chat__close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="studio-chat__scroll" aria-live="polite">
          {messages.length === 0 && !pending && !failed ? (
            <p className="studio-chat__intro">{askStudio.intro}</p>
          ) : null}

          {messages.map((m) =>
            m.role === "user" ? (
              <p key={m.id} className="studio-chat__msg studio-chat__msg--user">
                {m.content}
              </p>
            ) : (
              <div key={m.id} className="studio-chat__msg studio-chat__msg--studio">
                <span className="studio-chat__msg-label">Studio</span>
                <p>{m.content}</p>
              </div>
            ),
          )}

          {pending ? (
            <div className="studio-chat__thinking">
              <span className="studio-chat__msg-label">Studio</span>
              <span className="studio-chat__thinking-line" aria-hidden="true" />
              <span className="sr-only">The studio is thinking</span>
            </div>
          ) : null}

          {failed ? (
            <div className="studio-chat__msg studio-chat__msg--studio" role="alert">
              <p>{askStudio.errorText}</p>
            </div>
          ) : null}
        </div>

        {showSuggestions ? (
          <div className="studio-chat__suggestions">
            {askStudio.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSend(s)}
                className="studio-chat__chip"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        <div className="studio-chat__input">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              autoGrow();
            }}
            onKeyDown={onKeyDown}
            placeholder={askStudio.inputPlaceholder}
            aria-label="Ask the studio something"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || pending}
            aria-label="Send"
            className="studio-chat__send"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <a
          href={handoff}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onHandoff}
          className="studio-chat__handoff"
        >
          {askStudio.handoffLabel} →
        </a>

        <p className="studio-chat__privacy">{askStudio.privacyNote}</p>
      </div>
    </div>
  );
}
