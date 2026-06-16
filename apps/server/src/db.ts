import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { avatarColorFor } from '@gmail-clone/shared';
import type { Label } from '@gmail-clone/shared';
import type { ApiAccount, Database, MailboxEntry, ServerMessage } from './types.ts';

const SEED_LABELS: Label[] = [
  { id: 'work', name: 'Work', color: '#1a73e8' },
  { id: 'personal', name: 'Personal', color: '#188038' },
  { id: 'travel', name: 'Travel', color: '#e37400' },
  { id: 'finance', name: 'Finance', color: '#9334e6' },
];

const B62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
/** Gmail-style opaque message/thread id, e.g. "FMfcgzQgMMDsHLRDNZXWjPNZwpLhbHJD". */
function genId(): string {
  let s = 'FMfcgz';
  for (const b of randomBytes(22)) s += B62[b % 62];
  return s;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

/** The five accounts on this network (with demo passwords for this clone's backend). */
const ACCOUNT_SEED: { email: string; name: string; password: string }[] = [
  { email: 'lalitkofficial@gmail.com', name: 'Lalit Kumar', password: 'Lalit@123' },
  { email: 'me24b124@smail.iitm.ac.in', name: 'ME24B124', password: 'Me24b124@' },
  { email: 'aiforkidsofficial@gmail.com', name: 'Aiforkids', password: 'Aiforkids@123' },
  { email: 'ccw@smail.iitm.ac.in', name: 'CCW', password: 'Ccw@12345' },
  { email: 'gsmandakb@smail.iitm.ac.in', name: 'GS Mandak', password: 'Gsmandak@123' },
  { email: 'nandini.tyagi@pw.live', name: 'Nandini Tyagi', password: 'Nandini@123' },
];

function makeAccount(email: string, name: string, password: string): ApiAccount {
  return {
    id: email,
    email,
    name,
    initial: name.charAt(0).toUpperCase(),
    avatarColor: avatarColorFor(email),
    password,
  };
}

/** A welcome message + inbox entry so a freshly-seeded account isn't empty. */
function welcomeFor(acc: ApiAccount, date: string): { message: ServerMessage; entry: MailboxEntry } {
  const id = genId();
  return {
    message: {
      id,
      threadId: id,
      fromEmail: 'team@gmail-clone.local',
      fromName: 'Gmail Clone',
      toEmails: [acc.email],
      subject: 'Welcome to your inbox',
      body: `Hi ${acc.name},\n\nThis inbox is live on your local network. Compose a message to any of the other accounts and it will be delivered in real time.\n\n— The Gmail Clone team`,
      date,
      attachments: [],
    },
    entry: {
      id: `mb-${id}-${acc.email}`,
      email: acc.email,
      messageId: id,
      folder: 'inbox',
      category: 'primary',
      read: false,
      starred: false,
      important: false,
      labels: [],
    },
  };
}

function seed(): Database {
  const accounts = ACCOUNT_SEED.map((a) => makeAccount(a.email, a.name, a.password));
  const messages: ServerMessage[] = [];
  const mailbox: MailboxEntry[] = [];

  const now = Date.now();
  accounts.forEach((acc, i) => {
    const { message, entry } = welcomeFor(acc, new Date(now - (i + 1) * 3600_000).toISOString());
    if (i === 0) entry.labels = ['Personal']; // one labeled message so a label view isn't empty
    messages.push(message);
    mailbox.push(entry);
  });

  return { accounts, messages, mailbox, labels: SEED_LABELS };
}

/** Add any seed accounts missing from a persisted store (e.g. accounts added after first run). */
function reconcileAccounts(database: Database): boolean {
  const now = Date.now();
  let changed = false;
  for (const a of ACCOUNT_SEED) {
    if (database.accounts.some((acc) => acc.email === a.email)) continue;
    const acc = makeAccount(a.email, a.name, a.password);
    const { message, entry } = welcomeFor(acc, new Date(now).toISOString());
    database.accounts.push(acc);
    database.messages.push(message);
    database.mailbox.push(entry);
    changed = true;
  }
  return changed;
}

let db: Database;

function load(): Database {
  if (fs.existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as Database;
      if (!parsed.labels) parsed.labels = SEED_LABELS; // backfill older stores
      if (reconcileAccounts(parsed)) save(parsed); // add any newly-seeded accounts
      return parsed;
    } catch {
      // fall through to reseed on a corrupt file
    }
  }
  const fresh = seed();
  save(fresh);
  return fresh;
}

export function getLabels(): Label[] {
  return db.labels;
}

export function createLabel(name: string): Label {
  const existing = db.labels.find((l) => l.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  const palette = ['#1a73e8', '#188038', '#e37400', '#9334e6', '#d93025', '#129eaf'];
  const label: Label = { id: name.toLowerCase().replace(/\s+/g, '-'), name, color: palette[db.labels.length % palette.length] };
  db.labels.push(label);
  save();
  return label;
}

/** Add/remove a label across all of a user's messages in a thread. */
export function setThreadLabel(email: string, threadId: string, label: string, on: boolean): boolean {
  return updateThread(email, threadId, (entry) => {
    const set = new Set(entry.labels ?? []);
    if (on) set.add(label);
    else set.delete(label);
    return { labels: [...set] };
  });
}

export function save(next: Database = db): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(next, null, 2));
}

export function init(): void {
  db = load();
}

export function getAccounts(): ApiAccount[] {
  return db.accounts;
}

export function findAccount(email: string): ApiAccount | undefined {
  return db.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
}

export function getMessage(id: string): ServerMessage | undefined {
  return db.messages.find((m) => m.id === id);
}

/** All mailbox entries for an account, joined with their message, newest first. */
export function entriesFor(email: string): (MailboxEntry & { message: ServerMessage })[] {
  return db.mailbox
    .filter((e) => e.email.toLowerCase() === email.toLowerCase())
    .map((e) => ({ ...e, message: getMessage(e.messageId)! }))
    .filter((e) => e.message)
    .sort((a, b) => new Date(b.message.date).getTime() - new Date(a.message.date).getTime());
}

export function findEntry(email: string, messageId: string): MailboxEntry | undefined {
  return db.mailbox.find(
    (e) => e.email.toLowerCase() === email.toLowerCase() && e.messageId === messageId,
  );
}

export function updateEntry(email: string, messageId: string, patch: Partial<MailboxEntry>): MailboxEntry | undefined {
  const entry = findEntry(email, messageId);
  if (!entry) return undefined;
  Object.assign(entry, patch);
  save();
  return entry;
}

/** Deliver a new message: store it, add a Sent entry for the sender and an Inbox
 *  entry for each recipient that has an account. Returns the recipients reached. */
export function deliver(input: {
  fromEmail: string;
  toEmails: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  threadId?: string;
  attachments?: ServerMessage['attachments'];
}): { message: ServerMessage; recipients: string[] } {
  const from = findAccount(input.fromEmail);
  const id = genId();
  const message: ServerMessage = {
    id,
    threadId: input.threadId || id, // reply joins the existing conversation
    fromEmail: input.fromEmail,
    fromName: from?.name ?? input.fromEmail,
    toEmails: input.toEmails,
    cc: input.cc ?? [],
    bcc: input.bcc ?? [],
    subject: input.subject || '(no subject)',
    body: input.body,
    date: new Date().toISOString(),
    attachments: input.attachments ?? [],
  };
  db.messages.push(message);

  // Sender's Sent copy.
  db.mailbox.push({
    id: `mb-${id}-${input.fromEmail}`,
    email: input.fromEmail,
    messageId: id,
    folder: 'sent',
    category: 'primary',
    read: true,
    starred: false,
    important: false,
  });

  // Recipient inbox copies — To + Cc + Bcc, deduped, known accounts only.
  const recipients: string[] = [];
  const allTo = [...input.toEmails, ...(input.cc ?? []), ...(input.bcc ?? [])];
  for (const to of allTo) {
    if (to.toLowerCase() === input.fromEmail.toLowerCase()) continue;
    if (recipients.some((r) => r.toLowerCase() === to.toLowerCase())) continue;
    if (findAccount(to)) {
      db.mailbox.push({
        id: `mb-${id}-${to}-inbox`,
        email: to,
        messageId: id,
        folder: 'inbox',
        category: 'primary',
        read: false,
        starred: false,
        important: false,
      });
      recipients.push(to);
    }
  }

  save();
  return { message, recipients };
}

/** All of a user's messages in a thread, oldest → newest. */
export function threadMessagesFor(
  email: string,
  threadId: string,
): (MailboxEntry & { message: ServerMessage })[] {
  return entriesFor(email)
    .filter((e) => e.message.threadId === threadId)
    .sort((a, b) => new Date(a.message.date).getTime() - new Date(b.message.date).getTime());
}

/** Gmail-style participant summary for a thread, e.g. ["Rai", "me"]. */
function participantsForThread(email: string, threadId: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of threadMessagesFor(email, threadId)) {
    const label =
      e.message.fromEmail.toLowerCase() === email.toLowerCase()
        ? 'me'
        : e.message.fromName.split(' ')[0] || e.message.fromEmail;
    if (!seen.has(label)) {
      seen.add(label);
      out.push(label);
    }
  }
  return out;
}

/** Collapse folder-filtered entries into one summary per thread (latest message). */
export function threadsFor(
  email: string,
  filteredEntries: (MailboxEntry & { message: ServerMessage })[],
): (MailboxEntry & { message: ServerMessage; messageCount: number; participants: string[] })[] {
  const ids = new Set(filteredEntries.map((e) => e.message.threadId));
  const out = [...ids].map((tid) => {
    const msgs = threadMessagesFor(email, tid);
    const latest = msgs[msgs.length - 1];
    return { ...latest, messageCount: msgs.length, participants: participantsForThread(email, tid) };
  });
  out.sort((a, b) => new Date(b.message.date).getTime() - new Date(a.message.date).getTime());
  return out;
}

/** Create or update a draft (a message in the sender's Drafts folder, no recipients yet). */
export function saveDraft(
  email: string,
  input: { id?: string; toEmails: string[]; cc: string[]; bcc: string[]; subject: string; body: string; attachments?: ServerMessage['attachments'] },
): string {
  const from = findAccount(email);
  const existing = input.id ? db.messages.find((m) => m.id === input.id && m.fromEmail === email) : undefined;
  if (existing) {
    existing.toEmails = input.toEmails;
    existing.cc = input.cc;
    existing.bcc = input.bcc;
    existing.subject = input.subject;
    existing.body = input.body;
    existing.attachments = input.attachments ?? [];
    existing.date = new Date().toISOString();
    save();
    return existing.id;
  }
  const id = genId();
  db.messages.push({
    id,
    threadId: id,
    fromEmail: email,
    fromName: from?.name ?? email,
    toEmails: input.toEmails,
    cc: input.cc,
    bcc: input.bcc,
    subject: input.subject,
    body: input.body,
    date: new Date().toISOString(),
    attachments: input.attachments ?? [],
  });
  db.mailbox.push({
    id: `mb-${id}-${email}`,
    email,
    messageId: id,
    folder: 'drafts',
    category: 'primary',
    read: true,
    starred: false,
    important: false,
  });
  save();
  return id;
}

/** Delete a draft message + the owner's entry. */
export function deleteDraftMsg(email: string, id: string): boolean {
  db.mailbox = db.mailbox.filter((e) => !(e.messageId === id && e.email.toLowerCase() === email.toLowerCase()));
  const idx = db.messages.findIndex((m) => m.id === id && m.fromEmail.toLowerCase() === email.toLowerCase());
  if (idx >= 0) db.messages.splice(idx, 1);
  save();
  return true;
}

/** Apply a patch to every one of a user's entries in a thread (conversation-level action). */
export function updateThread(
  email: string,
  threadId: string,
  patch: Partial<MailboxEntry> | ((e: MailboxEntry) => Partial<MailboxEntry>),
): boolean {
  const msgs = threadMessagesFor(email, threadId);
  if (msgs.length === 0) return false;
  for (const e of msgs) {
    const entry = findEntry(email, e.messageId);
    if (entry) Object.assign(entry, typeof patch === 'function' ? patch(entry) : patch);
  }
  save();
  return true;
}
