import http from 'node:http';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { avatarColorFor, type Category, type Email, type Folder } from '@gmail-clone/shared';
import {
  createLabel,
  deleteDraftMsg,
  deliver,
  entriesFor,
  findAccount,
  getAccounts,
  getLabels,
  init,
  saveDraft,
  setThreadLabel,
  threadMessagesFor,
  threadsFor,
  updateEntry,
  updateThread,
} from './db.ts';
import type { MailboxEntry, ServerMessage } from './types.ts';

init();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const PORT = Number(process.env.PORT ?? 4000);

// --- helpers -------------------------------------------------------------

function contactFor(email: string, name?: string) {
  const acc = findAccount(email);
  const displayName = acc?.name ?? name ?? email;
  return {
    name: displayName,
    email,
    initial: displayName.charAt(0).toUpperCase(),
    avatarColor: acc?.avatarColor ?? avatarColorFor(email),
  };
}

/** Merge a mailbox entry + its message into the client-facing Email shape. */
function toClientEmail(entry: MailboxEntry & { message: ServerMessage }): Email {
  const m = entry.message;
  return {
    id: m.id,
    threadId: m.threadId,
    from: contactFor(m.fromEmail, m.fromName),
    to: m.toEmails.map((e) => contactFor(e)),
    cc: (m.cc ?? []).map((e) => contactFor(e)),
    subject: m.subject,
    snippet: m.body.replace(/\n+/g, ' ').slice(0, 140),
    body: m.body,
    date: m.date,
    read: entry.read,
    starred: entry.starred,
    important: entry.important,
    hasAttachment: m.attachments.length > 0,
    attachments: m.attachments,
    labels: entry.labels ?? [],
    category: entry.category,
    folder: entry.folder,
    snoozed: entry.folder === 'snoozed',
  };
}

function authedEmail(req: Request, res: Response): string | null {
  const email = (req.header('x-account-email') ?? '').trim();
  if (!email || !findAccount(email)) {
    res.status(401).json({ error: 'unknown account' });
    return null;
  }
  return email;
}

// --- REST API ------------------------------------------------------------

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/accounts', (_req, res) => {
  res.json(getAccounts().map(({ id, email, name, initial, avatarColor }) => ({ id, email, name, initial, avatarColor })));
});

app.post('/api/login', (req, res) => {
  const acc = findAccount(String(req.body?.email ?? ''));
  if (!acc) return res.status(404).json({ error: 'account_not_found' });
  if (String(req.body?.password ?? '') !== acc.password) {
    return res.status(401).json({ error: 'wrong_password' });
  }
  const { password: _pw, ...safe } = acc;
  res.json(safe);
});

app.get('/api/messages', (req, res) => {
  const email = authedEmail(req, res);
  if (!email) return;
  const folder = req.query.folder as Folder | undefined;
  const category = req.query.category as Category | undefined;

  const label = req.query.label as string | undefined;
  let list = entriesFor(email);
  if (label) list = list.filter((e) => (e.labels ?? []).includes(label) && e.folder !== 'trash');
  else if (folder === 'starred') list = list.filter((e) => e.starred && e.folder !== 'trash');
  else if (folder === 'important') list = list.filter((e) => e.important && e.folder !== 'trash');
  else if (folder === 'allMail') list = list.filter((e) => e.folder !== 'spam' && e.folder !== 'trash');
  else if (folder) list = list.filter((e) => e.folder === folder);
  if (folder === 'inbox' && category) list = list.filter((e) => e.category === category);

  // Collapse to one row per conversation (id = threadId).
  const threads = threadsFor(email, list);
  res.json(
    threads.map((t) => ({
      ...toClientEmail(t),
      id: t.message.threadId,
      messageCount: t.messageCount,
      participants: t.participants,
    })),
  );
});

// All messages in a conversation (oldest → newest), for the thread view.
app.get('/api/thread/:threadId', (req, res) => {
  const email = authedEmail(req, res);
  if (!email) return;
  const msgs = threadMessagesFor(email, req.params.threadId);
  if (msgs.length === 0) return res.status(404).json({ error: 'not found' });
  res.json(msgs.map(toClientEmail));
});

app.get('/api/unread-counts', (req, res) => {
  const email = authedEmail(req, res);
  if (!email) return;
  const list = entriesFor(email);
  const inbox = list.filter((e) => e.folder === 'inbox');
  const byCategory: Record<string, number> = {};
  for (const e of inbox) if (!e.read) byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
  res.json({
    inbox: inbox.filter((e) => !e.read).length,
    drafts: list.filter((e) => e.folder === 'drafts').length,
    byCategory,
  });
});

app.get('/api/messages/:id', (req, res) => {
  const email = authedEmail(req, res);
  if (!email) return;
  const entry = entriesFor(email).find((e) => e.messageId === req.params.id);
  if (!entry) return res.status(404).json({ error: 'not found' });
  res.json(toClientEmail(entry));
});

const parseList = (raw: unknown): string[] =>
  (Array.isArray(raw) ? raw : String(raw ?? '').split(','))
    .map((s: string) => String(s).trim())
    .filter(Boolean);

app.post('/api/send', (req, res) => {
  const email = authedEmail(req, res);
  if (!email) return;

  const { message, recipients } = deliver({
    fromEmail: email,
    toEmails: parseList(req.body?.to),
    cc: parseList(req.body?.cc),
    bcc: parseList(req.body?.bcc),
    subject: String(req.body?.subject ?? ''),
    body: String(req.body?.body ?? ''),
    threadId: req.body?.threadId ? String(req.body.threadId) : undefined,
    attachments: Array.isArray(req.body?.attachments) ? req.body.attachments : [],
  });

  // Live-push to every recipient currently connected.
  for (const to of recipients) {
    const entry = entriesFor(to).find((e) => e.messageId === message.id);
    if (entry) pushTo(to, { type: 'new-mail', email: toClientEmail(entry) });
  }
  res.json({ ok: true, id: message.id, delivered: recipients });
});

app.get('/api/labels', (req, res) => {
  if (!authedEmail(req, res)) return;
  res.json(getLabels());
});

app.post('/api/labels', (req, res) => {
  if (!authedEmail(req, res)) return;
  const name = String(req.body?.name ?? '').trim();
  if (!name) return res.status(400).json({ error: 'name required' });
  res.json(createLabel(name));
});

app.post('/api/messages/:id/label', (req, res) => {
  const email = authedEmail(req, res);
  if (!email) return;
  const ok = setThreadLabel(email, req.params.id, String(req.body?.label ?? ''), !!req.body?.on);
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

app.post('/api/draft', (req, res) => {
  const email = authedEmail(req, res);
  if (!email) return;
  const id = saveDraft(email, {
    id: req.body?.id ? String(req.body.id) : undefined,
    toEmails: parseList(req.body?.to),
    cc: parseList(req.body?.cc),
    bcc: parseList(req.body?.bcc),
    subject: String(req.body?.subject ?? ''),
    body: String(req.body?.body ?? ''),
    attachments: Array.isArray(req.body?.attachments) ? req.body.attachments : [],
  });
  res.json({ ok: true, id });
});

app.delete('/api/draft/:id', (req, res) => {
  const email = authedEmail(req, res);
  if (!email) return;
  deleteDraftMsg(email, req.params.id);
  res.json({ ok: true });
});

app.post('/api/messages/:id/action', (req, res) => {
  const email = authedEmail(req, res);
  if (!email) return;
  const action = String(req.body?.action ?? '');
  const id = req.params.id;
  // :id is a threadId for conversation rows; fall back to a single message id.
  const threadEntries = threadMessagesFor(email, id);
  const isThread = threadEntries.length > 0;

  const patch: Partial<MailboxEntry> = {};
  switch (action) {
    case 'read': patch.read = true; break;
    case 'unread': patch.read = false; break;
    case 'star': patch.starred = true; break;
    case 'unstar': patch.starred = false; break;
    case 'toggle-star': {
      const anyStarred = isThread
        ? threadEntries.some((e) => e.starred)
        : !!entriesFor(email).find((e) => e.messageId === id)?.starred;
      patch.starred = !anyStarred;
      break;
    }
    case 'archive': patch.folder = 'archive'; break;
    case 'trash': patch.folder = 'trash'; break;
    case 'inbox': patch.folder = 'inbox'; break;
    case 'spam': patch.folder = 'spam'; break;
    case 'snooze': patch.folder = 'snoozed'; break;
    case 'important': patch.important = true; break;
    case 'not-important': patch.important = false; break;
    default: {
      // Generic restore used by client-side Undo: "move:<folder>".
      const move = /^move:(inbox|starred|snoozed|sent|drafts|spam|trash|archive)$/.exec(action);
      if (!move) return res.status(400).json({ error: 'bad action' });
      patch.folder = move[1] as MailboxEntry['folder'];
      break;
    }
  }

  const ok = isThread ? updateThread(email, id, patch) : !!updateEntry(email, id, patch);
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

app.get('/api/search', (req, res) => {
  const email = authedEmail(req, res);
  if (!email) return;
  const q = String(req.query.q ?? '').trim().toLowerCase();
  if (!q) return res.json([]);
  const results = entriesFor(email)
    .filter((e) => e.folder !== 'trash' && e.folder !== 'spam')
    .filter((e) => {
      const m = e.message;
      return (
        m.fromName.toLowerCase().includes(q) ||
        m.fromEmail.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q)
      );
    });
  res.json(results.map((e) => ({ ...toClientEmail(e), id: e.message.threadId })));
});

// --- WebSocket (live delivery) ------------------------------------------

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const sockets = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url ?? '', 'http://localhost');
  const email = (url.searchParams.get('email') ?? '').toLowerCase();
  if (!email || !findAccount(email)) {
    ws.close();
    return;
  }
  if (!sockets.has(email)) sockets.set(email, new Set());
  sockets.get(email)!.add(ws);
  ws.on('close', () => sockets.get(email)?.delete(ws));
});

function pushTo(email: string, payload: unknown) {
  const set = sockets.get(email.toLowerCase());
  if (!set) return;
  const data = JSON.stringify(payload);
  for (const ws of set) if (ws.readyState === WebSocket.OPEN) ws.send(data);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Gmail-clone server on http://0.0.0.0:${PORT}  (LAN: http://<your-ip>:${PORT})`);
});
