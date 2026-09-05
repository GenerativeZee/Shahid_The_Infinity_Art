# Ask the Studio — conversation logging (Google Sheets)

Every meaningful chat with the studio assistant is logged to **one Google
Sheet** with two tabs:

| Tab | What it holds |
| --- | --- |
| **Sessions** | One row per conversation — the lead overview |
| **Messages** | Every visitor question and every assistant reply |

The website does **not** depend on this. If the sheet or the script is
down, the assistant still answers; nothing is logged for that turn and the
visitor sees no error.

There is **no database** — Supabase, Firebase, Airtable etc. are *not*
used. Just a Google Sheet and a small Apps Script.

---

## What you need

- A Google account (the studio's).
- 10 minutes, once.

---

## Step 1 — Create the spreadsheet

1. Go to <https://sheets.new> — a blank spreadsheet opens.
2. Name it something like **Infinity Art — Studio Chat Log**.
3. Rename the first tab (bottom-left) to **`Sessions`** (exact spelling,
   capital S).
4. Add a second tab with the **+** button and name it **`Messages`**.

You can leave both tabs empty — the script writes the header rows itself
the first time it runs. If you prefer to add them by hand:

**Sessions** row 1:

```
Session ID | Started At | Last Activity | Interest | User Need | AI Qualification | WhatsApp Handoff | Message Count | Page | Last User Message | Lead Notes
```

**Messages** row 1:

```
Time | Session ID | Role | Content | Page | Message ID
```

---

## Step 2 — Add the script

1. In the spreadsheet menu: **Extensions → Apps Script**.
2. Delete whatever is in the editor.
3. Open `scripts/google-apps-script/StudioChatLogger.gs` from this repo,
   copy **all** of it, and paste it in.
4. Click the **Save** icon (💾).

---

## Step 3 — Deploy it as a Web App

1. Top-right: **Deploy → New deployment**.
2. Click the gear next to "Select type" → **Web app**.
3. Fill in:
   - **Description:** `Studio chat logger`
   - **Execute as:** **Me** (your Google account)
   - **Who has access:** **Anyone**
     *(The URL is a long random string and is only ever called from our
     server, not the browser. "Anyone" here means "anyone with the URL" —
     it does not make the sheet public.)*
4. Click **Deploy**.
5. Google asks you to **authorise** — approve it (choose your account →
   "Advanced" → "Go to … (unsafe)" → Allow). This is Google warning you
   about your own script; it is expected.
6. Copy the **Web app URL**. It looks like:

   ```
   https://script.google.com/macros/s/AKfy...long.../exec
   ```

> Quick check: paste that URL into a browser tab. You should see
> `{"ok":true,"service":"studio-chat-logger"}`.

---

## Step 4 — Give the URL to the website

**Local development** — add to `.env.local` in the project root:

```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfy.../exec
```

Restart `npm run dev`.

**Production (Vercel)** — Project → **Settings → Environment Variables**:

- **Name:** `GOOGLE_SHEETS_WEBHOOK_URL`
- **Value:** the same URL
- **Environments:** Production and Preview
- Redeploy.

That's it. New conversations start appearing in the sheet.

---

## Updating the script later

If `StudioChatLogger.gs` changes in the repo: paste the new version into
the Apps Script editor, Save, then **Deploy → Manage deployments → (edit,
the pencil) → Version: New version → Deploy**. The URL stays the same —
you do **not** need to touch the env var.

---

## What is (and isn't) stored

**Stored:** an anonymous random session id, timestamps, message text, the
page path (`/`), and a lightweight inferred summary (interest,
qualification, a short lead note).

**Never stored:** names, phone numbers, emails, IP addresses, device or
browser fingerprints, the Gemini API key, or the system prompt.

The session id lives in the visitor's `sessionStorage` — it is gone when
they close the tab, and it is never linked across devices.

---

## Payload contract (for reference)

The site's server posts JSON to the web app. Two shapes:

**A conversation turn** (user message + assistant reply, plus the
refreshed session summary):

```json
{
  "events": [
    { "event": "chat_message", "sessionId": "a82f…", "messageId": "…",
      "timestamp": "2026-09-06T10:31:00.000Z", "role": "user",
      "content": "What is ACP?", "page": "/" },
    { "event": "chat_message", "sessionId": "a82f…", "messageId": "…:a",
      "timestamp": "2026-09-06T10:31:00.000Z", "role": "assistant",
      "content": "ACP is …", "page": "/" }
  ],
  "session": {
    "sessionId": "a82f…", "lastActivity": "2026-09-06T10:31:00.000Z",
    "page": "/", "interest": "ACP", "userNeed": "ACP shop board",
    "qualification": "Low", "leadNotes": "General enquiry",
    "lastUserMessage": "What is ACP?"
  }
}
```

**A WhatsApp handoff click:**

```json
{ "event": "whatsapp_handoff", "sessionId": "a82f…",
  "timestamp": "2026-09-06T10:42:00.000Z", "page": "/" }
```

The script de-duplicates on `messageId`, so an accidental retry does not
double-log. `Message Count` and `AI Qualification` only ever go up.

---

## TODO before production launch

- [ ] **Privacy policy / retention policy.** The chat shows a short line
      ("Conversations may be stored to help us improve the studio
      experience.") but there is no policy page to link it to, and no
      automatic deletion. Add both before launch. The code is structured
      so a retention job (e.g. delete Messages rows older than N days) can
      be added to `StudioChatLogger.gs` as a time-driven trigger without
      touching the site. This document does not constitute legal advice or
      a compliance claim.
- [ ] Decide who on the studio side has edit access to the sheet.
