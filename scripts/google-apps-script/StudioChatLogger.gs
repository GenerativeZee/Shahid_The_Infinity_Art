/**
 * The Infinity Art — Ask the Studio conversation logger.
 *
 * Deploy this as a Google Apps Script Web App bound to ONE spreadsheet
 * that has two tabs: "Sessions" and "Messages". It receives POSTs from the
 * site's /api/chat route (never from the browser directly) and writes a
 * per-conversation summary plus the full message history.
 *
 * Full setup steps: docs/google-sheets-logging.md
 *
 * It stores only what conversation intelligence needs. It never receives
 * or stores API keys, the system prompt, IP addresses, or device data.
 */

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

var SESSIONS_SHEET = 'Sessions';
var MESSAGES_SHEET = 'Messages';

// Sessions columns (1-indexed), in sheet order.
var S = {
  sessionId: 1,        // A
  startedAt: 2,        // B
  lastActivity: 3,     // C
  interest: 4,         // D
  userNeed: 5,         // E
  qualification: 6,    // F
  whatsappHandoff: 7,  // G  ("Yes" / "No")
  messageCount: 8,     // H
  page: 9,             // I
  lastUserMessage: 10, // J
  leadNotes: 11,       // K
};

var SESSIONS_HEADERS = [
  'Session ID', 'Started At', 'Last Activity', 'Interest', 'User Need',
  'AI Qualification', 'WhatsApp Handoff', 'Message Count', 'Page',
  'Last User Message', 'Lead Notes',
];

var MESSAGES_HEADERS = ['Time', 'Session ID', 'Role', 'Content', 'Page', 'Message ID'];

var QUAL_RANK = { 'Unknown': 0, 'Low': 1, 'Medium': 2, 'High': 3 };
var MESSAGE_TEXT_CAP = 4000;
var DEDUPE_SCAN_ROWS = 800; // how many recent Messages rows to check for a duplicate id

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json({ ok: false, error: 'busy' });
  }

  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Two shapes are accepted:
    //   { events: [...chat_message], session: {...} }   from logChatExchange
    //   { event: 'whatsapp_handoff', sessionId, ... }    from trackWhatsAppHandoff
    //   { event: 'chat_message', ... }                   a bare single event
    if (body.event === 'whatsapp_handoff') {
      handleHandoff(body);
      return json({ ok: true });
    }

    var events = body.events || (body.event ? [body] : []);
    if (!events.length) return json({ ok: false, error: 'no events' });

    var appended = 0;
    var lastUserContent = '';
    var page = '/';
    var sessionId = body.session && body.session.sessionId;

    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      if (ev.event !== 'chat_message') continue;
      if (!isValidSessionId(ev.sessionId)) continue;
      sessionId = sessionId || ev.sessionId;
      page = ev.page || page;
      if (ev.role === 'user' && ev.content) lastUserContent = ev.content;

      if (appendMessage(ev)) appended++;
    }

    if (!isValidSessionId(sessionId)) return json({ ok: false, error: 'bad session' });

    upsertSession(sessionId, body.session || {}, {
      appended: appended,
      page: page,
      fallbackLastUser: lastUserContent,
    });

    return json({ ok: true, appended: appended });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// A GET is handy for a quick "is it deployed?" check in the browser.
function doGet() {
  return json({ ok: true, service: 'studio-chat-logger' });
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

function appendMessage(ev) {
  var sheet = getSheet(MESSAGES_SHEET, MESSAGES_HEADERS);
  var messageId = String(ev.messageId || '');

  if (messageId && messageIdExists(sheet, messageId)) return false; // duplicate retry

  sheet.appendRow([
    formatWhen(ev.timestamp),
    ev.sessionId,
    ev.role === 'assistant' ? 'assistant' : 'user',
    cap(String(ev.content || ''), MESSAGE_TEXT_CAP),
    ev.page || '/',
    messageId,
  ]);
  return true;
}

function messageIdExists(sheet, messageId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  var startRow = Math.max(2, lastRow - DEDUPE_SCAN_ROWS + 1);
  var count = lastRow - startRow + 1;
  var ids = sheet.getRange(startRow, 6, count, 1).getValues(); // column F
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === messageId) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

function upsertSession(sessionId, summary, meta) {
  var sheet = getSheet(SESSIONS_SHEET, SESSIONS_HEADERS);
  var rowIndex = findSessionRow(sheet, sessionId);
  var now = summary.lastActivity ? new Date(summary.lastActivity) : new Date();
  var nowStr = formatWhen(now);

  var interest = summary.interest || 'Unknown';
  var userNeed = summary.userNeed || '';
  var qualification = summary.qualification || 'Unknown';
  var leadNotes = summary.leadNotes || '';
  var lastUser = cap(summary.lastUserMessage || meta.fallbackLastUser || '', 500);
  var page = summary.page || meta.page || '/';

  if (rowIndex === -1) {
    sheet.appendRow([
      sessionId, nowStr, nowStr, interest, userNeed, qualification,
      'No', meta.appended || 0, page, lastUser, leadNotes,
    ]);
    return;
  }

  var row = sheet.getRange(rowIndex, 1, 1, SESSIONS_HEADERS.length).getValues()[0];

  row[S.lastActivity - 1] = nowStr;
  // Interest is sticky — keep a known value rather than let a later vague
  // message blank it out.
  if (interest !== 'Unknown') row[S.interest - 1] = interest;
  if (userNeed) row[S.userNeed - 1] = userNeed;
  // Qualification only ratchets up.
  row[S.qualification - 1] = higherQual(row[S.qualification - 1], qualification);
  if (lastUser) row[S.lastUserMessage - 1] = lastUser;
  if (leadNotes) row[S.leadNotes - 1] = leadNotes;
  if (page) row[S.page - 1] = page;
  row[S.messageCount - 1] = (Number(row[S.messageCount - 1]) || 0) + (meta.appended || 0);

  sheet.getRange(rowIndex, 1, 1, SESSIONS_HEADERS.length).setValues([row]);
}

function handleHandoff(body) {
  if (!isValidSessionId(body.sessionId)) return;
  var sheet = getSheet(SESSIONS_SHEET, SESSIONS_HEADERS);
  var rowIndex = findSessionRow(sheet, body.sessionId);
  var nowStr = formatWhen(body.timestamp);

  if (rowIndex === -1) {
    // Rare — a handoff with no prior logged message. Record a minimal row.
    sheet.appendRow([
      body.sessionId, nowStr, nowStr, 'Unknown', '', 'High',
      'Yes', 0, body.page || '/', '', 'Clicked WhatsApp handoff',
    ]);
    return;
  }

  var row = sheet.getRange(rowIndex, 1, 1, SESSIONS_HEADERS.length).getValues()[0];
  row[S.lastActivity - 1] = nowStr;
  row[S.whatsappHandoff - 1] = 'Yes';
  // Clicking through to WhatsApp is a strong intent signal.
  row[S.qualification - 1] = higherQual(row[S.qualification - 1], 'High');
  if (!row[S.leadNotes - 1]) row[S.leadNotes - 1] = 'Clicked WhatsApp handoff';
  sheet.getRange(rowIndex, 1, 1, SESSIONS_HEADERS.length).setValues([row]);
}

function findSessionRow(sheet, sessionId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var ids = sheet.getRange(2, S.sessionId, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === sessionId) return i + 2;
  }
  return -1;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function isValidSessionId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(id);
}

function higherQual(a, b) {
  var ra = QUAL_RANK[a] || 0;
  var rb = QUAL_RANK[b] || 0;
  return ra >= rb ? (a || 'Unknown') : b;
}

function formatWhen(value) {
  var d = value ? new Date(value) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd MMM yyyy HH:mm');
}

function cap(str, n) {
  return str.length > n ? str.slice(0, n) : str;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
