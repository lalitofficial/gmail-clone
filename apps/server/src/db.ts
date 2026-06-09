import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { avatarColorFor } from '@gmail-clone/shared';
import type { ApiAccount, Database, MailboxEntry, ServerMessage } from './types.ts';

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

/** The five accounts on this network. */
const ACCOUNT_SEED: { email: string; name: string }[] = [
  { email: 'lalitkofficial@gmail.com', name: 'Lalit Kumar' },
  { email: 'me24b124@smail.iitm.ac.in', name: 'ME24B124' },
  { email: 'aiforkidsofficial@gmail.com', name: 'Aiforkids' },
  { email: 'ccw@smail.iitm.ac.in', name: 'CCW' },
  { email: 'gsmandakb@smail.iitm.ac.in', name: 'GS Mandak' },
];

function makeAccount(email: string, name: string): ApiAccount {
  return {
    id: email,
    email,
    name,
    initial: name.charAt(0).toUpperCase(),
    avatarColor: avatarColorFor(email),
  };
}

function seed(): Database {
  const accounts = ACCOUNT_SEED.map((a) => makeAccount(a.email, a.name));
  const messages: ServerMessage[] = [];
  const mailbox: MailboxEntry[] = [];

  // A welcome message in each account's inbox so it isn't empty on first login.
  const now = Date.now();
  accounts.forEach((acc, i) => {
    const id = genId();
    messages.push({
      id,
      threadId: id,
      fromEmail: 'team@gmail-clone.local',
      fromName: 'Gmail Clone',
      toEmails: [acc.email],
      subject: 'Welcome to your inbox',
      body: `Hi ${acc.name},\n\nThis inbox is live on your local network. Compose a message to any of the other accounts and it will be delivered in real time.\n\n— The Gmail Clone team`,
      date: new Date(now - (i + 1) * 3600_000).toISOString(),
      attachments: [],
    });
    mailbox.push({
      id: `mb-${id}-${acc.email}`,
      email: acc.email,
      messageId: id,
      folder: 'inbox',
      category: 'primary',
      read: false,
      starred: false,
      important: false,
    });
  });

  return { accounts, messages, mailbox };
}

let db: Database;

function load(): Database {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as Database;
    } catch {
      // fall through to reseed on a corrupt file
    }
  }
  const fresh = seed();
  save(fresh);
  return fresh;
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
  subject: string;
  body: string;
}): { message: ServerMessage; recipients: string[] } {
  const from = findAccount(input.fromEmail);
  const id = genId();
  const message: ServerMessage = {
    id,
    threadId: id,
    fromEmail: input.fromEmail,
    fromName: from?.name ?? input.fromEmail,
    toEmails: input.toEmails,
    subject: input.subject || '(no subject)',
    body: input.body,
    date: new Date().toISOString(),
    attachments: [],
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

  // Recipient inbox copies (only for known accounts on this network).
  const recipients: string[] = [];
  for (const to of input.toEmails) {
    if (findAccount(to)) {
      db.mailbox.push({
        id: `mb-${id}-${to}`,
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
