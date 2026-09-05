"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { getLenis } from "@/lib/scroll";
import { startProject } from "@/content/site";
import type { ProjectField } from "@/content/types";

type Status = "idle" | "submitting" | "error" | "done";

/** Human, category-aware messages for the few genuinely required fields —
 *  mirrors the /api/quote route so the wording matches on both sides. */
const REQUIRED_MESSAGE: Record<string, string> = {
  quantity: "Add a quantity so we can understand the requirement.",
  brief: "Tell us what you're looking for.",
  name: "Let us know who to reply to.",
  phone: "Add a phone number so Shahid can reach you.",
};

/** Pair two consecutive `half` fields into one two-column row on ≥sm. */
function toRows(fields: readonly ProjectField[]): ProjectField[][] {
  const rows: ProjectField[][] = [];
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const next = fields[i + 1];
    if (field.half && next?.half) {
      rows.push([field, next]);
      i++;
    } else {
      rows.push([field]);
    }
  }
  return rows;
}

/**
 * "Start a Project" (Quote 02) — an adaptive enquiry, not a fixed form.
 * The visitor picks what they're making; only that category's questions
 * appear. "Not sure" is always valid and links across to Ask the Studio.
 * Everything is local state; the /api/quote route builds the WhatsApp
 * handoff from the same `startProject` config this reads.
 */
export function QuoteForm() {
  const [category, setCategory] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasPhoto, setHasPhoto] = useState(false);
  const [contact, setContact] = useState({ name: "", phone: "" });
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const selected = startProject.categories.find((c) => c.id === category);

  // Picking a category / submitting / resetting changes the form's height
  // without firing a window resize, so Lenis (smooth scroll) keeps its old,
  // shorter scroll limit and the wheel can't reach the page bottom — only
  // the native scrollbar can. Nudge Lenis to recalculate after the new
  // layout paints. Harmless when Lenis isn't running (getLenis returns null).
  useEffect(() => {
    const id = requestAnimationFrame(() => getLenis()?.resize());
    return () => cancelAnimationFrame(id);
  }, [category, status, formError, errors]);

  function selectCategory(id: string) {
    setCategory(id);
    setAnswers({});
    setHasPhoto(false);
    setErrors({});
    setFormError("");
    setStatus("idle");
  }

  function setAnswer(name: string, value: string) {
    setAnswers((a) => ({ ...a, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: "" } : e));
  }

  function setContactField(key: "name" | "phone", value: string) {
    setContact((c) => ({ ...c, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  }

  function askStudio() {
    window.dispatchEvent(new Event("studio-chat:open"));
  }

  function reset() {
    setCategory("");
    setAnswers({});
    setHasPhoto(false);
    setContact({ name: "", phone: "" });
    setNote("");
    setErrors({});
    setFormError("");
    setWhatsappUrl("");
    setStatus("idle");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    const nextErrors: Record<string, string> = {};
    for (const field of selected.fields) {
      if (field.required && field.type !== "photo" && !answers[field.name]?.trim()) {
        nextErrors[field.name] =
          REQUIRED_MESSAGE[field.name] ?? `Please add ${field.label.toLowerCase()}.`;
      }
    }
    if (!contact.name.trim()) nextErrors.name = REQUIRED_MESSAGE.name;
    if (!contact.phone.trim()) nextErrors.phone = REQUIRED_MESSAGE.phone;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const first = Object.keys(nextErrors)[0];
      requestAnimationFrame(() => document.getElementById(`sp-${first}`)?.focus());
      return;
    }

    setStatus("submitting");
    setFormError("");

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selected.id,
          answers,
          name: contact.name,
          phone: contact.phone,
          note: selected.id === "other" ? "" : note,
          hasPhoto,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { whatsappUrl?: string; error?: string }
        | null;

      if (!res.ok || !data?.whatsappUrl) {
        setFormError(data?.error ?? startProject.errorGeneric);
        setStatus("error");
        return;
      }

      setWhatsappUrl(data.whatsappUrl);
      setStatus("done");
    } catch {
      setFormError(startProject.errorNetwork);
      setStatus("error");
    }
  }

  function renderField(field: ProjectField) {
    if (field.type === "photo") {
      return (
        <div key={field.name} className="flex flex-col gap-2">
          <label
            htmlFor="sp-photo"
            className="font-mono text-step--1 uppercase tracking-label text-text-muted"
          >
            {field.label}
          </label>
          <input
            id="sp-photo"
            name="sp-photo"
            type="file"
            accept="image/*"
            onChange={(e) => setHasPhoto(Boolean(e.target.files?.length))}
            className="w-full rounded border border-border bg-ground px-4 py-3 text-step--1 text-text-muted file:mr-4 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1.5 file:font-mono file:text-[0.7rem] file:uppercase file:tracking-label file:text-ground"
          />
          {field.hint ? (
            <p className="font-mono text-[0.7rem] text-text-muted">{field.hint}</p>
          ) : null}
        </div>
      );
    }

    if (field.type === "segmented") {
      return (
        <SegmentedControl
          key={field.name}
          field={field}
          value={answers[field.name] ?? ""}
          onChange={(v) => setAnswer(field.name, v)}
          error={errors[field.name]}
        />
      );
    }

    return (
      <TextControl
        key={field.name}
        id={`sp-${field.name}`}
        label={field.label}
        type={field.type === "textarea" ? "textarea" : "text"}
        placeholder={field.placeholder}
        hint={field.hint}
        value={answers[field.name] ?? ""}
        onChange={(v) => setAnswer(field.name, v)}
        error={errors[field.name]}
      />
    );
  }

  return (
    <section id="quote" className="bg-surface px-6 py-section md:px-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        {status === "done" ? (
          <Completion url={whatsappUrl} onReset={reset} />
        ) : (
          <>
            <Reveal className="flex flex-col gap-3">
              <p className="font-mono text-step--1 uppercase tracking-label text-accent">
                {startProject.eyebrow}
              </p>
              <h2 className="text-heading">{startProject.headline}</h2>
              <p className="measure text-step-0 text-text-muted">{startProject.body}</p>
            </Reveal>

            <Reveal index={1}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
                <fieldset className="flex min-w-0 flex-col gap-3">
                  <legend className="mb-1 font-mono text-step--1 uppercase tracking-label text-text-muted">
                    {startProject.categoryHeading}
                  </legend>
                  <div className="overflow-hidden rounded border border-border">
                    {startProject.categories.map((c, i) => (
                      <label
                        key={c.id}
                        className={`group relative flex cursor-pointer items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-surface-raised/50 has-[:checked]:bg-surface-raised has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent has-[:focus-visible]:-outline-offset-2 motion-reduce:transition-none ${
                          i > 0 ? "border-t border-border" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="sp-category"
                          value={c.id}
                          checked={c.id === category}
                          onChange={() => selectCategory(c.id)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-0.5 bg-accent opacity-0 transition-opacity group-has-[:checked]:opacity-100 motion-reduce:transition-none"
                        />
                        <span className="font-mono text-step--1 uppercase tracking-label text-text-muted transition-colors group-has-[:checked]:text-text motion-reduce:transition-none">
                          {c.label}
                        </span>
                        <span
                          aria-hidden
                          className="h-2 w-2 shrink-0 rounded-full border border-text-muted transition-colors group-has-[:checked]:border-accent group-has-[:checked]:bg-accent motion-reduce:transition-none"
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>

                {selected ? (
                  <Reveal key={selected.id} className="flex flex-col gap-8">
                    <p className="sr-only" aria-live="polite">
                      Showing questions for {selected.label}.
                    </p>

                    <div className="flex flex-col gap-5">
                      {toRows(selected.fields).map((row, ri) =>
                        row.length === 2 ? (
                          <div key={ri} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {row.map((f) => renderField(f))}
                          </div>
                        ) : (
                          renderField(row[0])
                        ),
                      )}
                    </div>

                    <div className="flex flex-col items-start gap-1 border-l border-border pl-4">
                      <p className="text-step--1 text-text-muted">{startProject.notSureLead}</p>
                      <button
                        type="button"
                        onClick={askStudio}
                        className="font-mono text-step--1 uppercase tracking-label text-accent transition-opacity hover:opacity-80 motion-reduce:transition-none"
                      >
                        {startProject.notSureCta} →
                      </button>
                    </div>

                    <fieldset className="flex min-w-0 flex-col gap-5">
                      <legend className="font-mono text-step--1 uppercase tracking-label text-text-muted">
                        {startProject.contactHeading}
                      </legend>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <TextControl
                          id="sp-name"
                          label={startProject.nameLabel}
                          type="text"
                          autoComplete="name"
                          value={contact.name}
                          onChange={(v) => setContactField("name", v)}
                          error={errors.name}
                        />
                        <TextControl
                          id="sp-phone"
                          label={startProject.phoneLabel}
                          type="tel"
                          autoComplete="tel"
                          value={contact.phone}
                          onChange={(v) => setContactField("phone", v)}
                          error={errors.phone}
                        />
                      </div>
                    </fieldset>

                    {selected.id !== "other" ? (
                      <TextControl
                        id="sp-note"
                        label={startProject.noteLabel}
                        type="textarea"
                        placeholder={startProject.notePlaceholder}
                        value={note}
                        onChange={setNote}
                      />
                    ) : null}

                    {formError ? (
                      <p role="alert" className="font-mono text-step--1 text-red-400">
                        {formError}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-fit rounded bg-accent px-6 py-3 font-mono text-step--1 uppercase tracking-label text-ground transition-opacity hover:opacity-90 disabled:opacity-60 motion-reduce:transition-none"
                    >
                      {status === "submitting"
                        ? startProject.submitPendingLabel
                        : `${startProject.submitLabel} →`}
                    </button>
                  </Reveal>
                ) : null}
              </form>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
}

function SegmentedControl({
  field,
  value,
  onChange,
  error,
}: {
  field: ProjectField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const hintId = field.hint ? `sp-${field.name}-hint` : undefined;
  const errId = error ? `sp-${field.name}-err` : undefined;

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="font-mono text-step--1 uppercase tracking-label text-text-muted">
        {field.label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {field.options?.map((opt) => (
          <label
            key={opt}
            className="cursor-pointer select-none rounded border border-border px-4 py-3.5 font-mono text-step--1 uppercase tracking-label text-text-muted transition-colors hover:border-text-muted hover:text-text has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-ground has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent has-[:focus-visible]:-outline-offset-2 motion-reduce:transition-none"
          >
            <input
              type="radio"
              name={`sp-${field.name}`}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            {opt}
          </label>
        ))}
      </div>
      {field.hint ? (
        <p id={hintId} className="font-mono text-[0.7rem] text-text-muted">
          {field.hint}
        </p>
      ) : null}
      {error ? (
        <p id={errId} role="alert" className="font-mono text-step--1 text-red-400">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function TextControl({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  hint,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  type: "text" | "tel" | "textarea";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  autoComplete?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  const className = `w-full rounded border bg-ground px-4 py-3 text-step-0 text-text outline-none placeholder:text-text-muted focus-visible:border-accent ${
    error ? "border-red-400/60" : "border-border"
  }`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label
        htmlFor={id}
        className="font-mono text-step--1 uppercase tracking-label text-text-muted"
      >
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          id={id}
          name={id}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={className}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={className}
        />
      )}
      {hint ? (
        <p id={hintId} className="font-mono text-[0.7rem] text-text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errId} role="alert" className="font-mono text-step--1 text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Completion({ url, onReset }: { url: string; onReset: () => void }) {
  const c = startProject.completion;
  return (
    <Reveal className="flex flex-col gap-5">
      <p className="font-mono text-step--1 uppercase tracking-label text-accent">{c.eyebrow}</p>
      <h2 className="text-heading">{c.headline}</h2>
      <p className="measure text-step-0 text-text-muted">{c.body}</p>
      <div className="mt-2 flex flex-wrap items-center gap-5">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-accent px-6 py-3 font-mono text-step--1 uppercase tracking-label text-ground transition-opacity hover:opacity-90 motion-reduce:transition-none"
        >
          {c.whatsappLabel} →
        </a>
        <button
          type="button"
          onClick={onReset}
          className="font-mono text-step--1 uppercase tracking-label text-text-muted transition-colors hover:text-text motion-reduce:transition-none"
        >
          {c.resetLabel}
        </button>
      </div>
    </Reveal>
  );
}
