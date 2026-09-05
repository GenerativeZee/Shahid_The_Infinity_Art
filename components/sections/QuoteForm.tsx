"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { materials, quote } from "@/content/site";

type Status = "idle" | "submitting" | "error";

export function QuoteForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      size: String(form.get("size") ?? ""),
      material: String(form.get("material") ?? ""),
      note: String(form.get("note") ?? ""),
      hasPhoto,
    };

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong — please try again.");
        setStatus("error");
        return;
      }

      window.location.href = data.whatsappUrl;
    } catch {
      setError("Couldn't reach the server — check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <section id="quote" className="bg-surface px-6 py-section md:px-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <Reveal className="flex flex-col gap-3">
          <p className="font-mono text-step--1 uppercase tracking-label text-accent">
            Get a Quote
          </p>
          <h2 className="text-heading">{quote.headline}</h2>
          <p className="measure text-step-0 text-text-muted">{quote.body}</p>
        </Reveal>

        <Reveal index={1}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <Field label="Name" htmlFor="name">
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full rounded border border-border bg-ground px-4 py-3 text-step-0 text-text outline-none focus-visible:border-accent"
              />
            </Field>

            <Field label="Phone" htmlFor="phone">
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                className="w-full rounded border border-border bg-ground px-4 py-3 text-step-0 text-text outline-none focus-visible:border-accent"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Size (feet)" htmlFor="size">
                <input
                  id="size"
                  name="size"
                  type="text"
                  required
                  placeholder="e.g. 6 x 3"
                  className="w-full rounded border border-border bg-ground px-4 py-3 text-step-0 text-text outline-none placeholder:text-text-muted focus-visible:border-accent"
                />
              </Field>

              <Field label="Material" htmlFor="material">
                <select
                  id="material"
                  name="material"
                  required
                  defaultValue=""
                  className="w-full rounded border border-border bg-ground px-4 py-3 text-step-0 text-text outline-none focus-visible:border-accent"
                >
                  <option value="" disabled>
                    Choose one
                  </option>
                  {materials.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Photo of the wall (optional)" htmlFor="photo">
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setHasPhoto(Boolean(e.target.files?.length))}
                className="w-full rounded border border-border bg-ground px-4 py-3 text-step--1 text-text-muted file:mr-4 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1.5 file:font-mono file:text-[0.7rem] file:uppercase file:tracking-label file:text-ground"
              />
              <p className="font-mono text-[0.7rem] text-text-muted">
                We&apos;ll ask you to share it again on WhatsApp — nothing is uploaded here yet.
              </p>
            </Field>

            <Field label="Anything else? (optional)" htmlFor="note">
              <textarea
                id="note"
                name="note"
                rows={3}
                className="w-full rounded border border-border bg-ground px-4 py-3 text-step-0 text-text outline-none focus-visible:border-accent"
              />
            </Field>

            {error ? (
              <p role="alert" className="font-mono text-step--1 text-red-400">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-fit rounded bg-accent px-6 py-3 font-mono text-step--1 uppercase tracking-label text-ground disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Send on WhatsApp"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="font-mono text-step--1 uppercase tracking-label text-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
