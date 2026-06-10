import type { Category, Folder, Label } from '@gmail-clone/shared';

export interface ApiAccount {
  id: string;
  email: string;
  name: string;
  initial: string;
  avatarColor: string;
  /** Demo password for this clone's backend (never sent to clients via /api/accounts). */
  password: string;
}

export interface ServerAttachment {
  id: string;
  name: string;
  kind: string;
  size: string;
  /** Optional base64 data URL for small files (e.g. images) so they can be previewed. */
  dataUrl?: string;
}

/** A single message (one per send), shared across sender + recipients. */
export interface ServerMessage {
  id: string;
  threadId: string;
  fromEmail: string;
  fromName: string;
  toEmails: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  date: string;
  attachments: ServerAttachment[];
}

/** Per-user view of a message (folder + read/star state differ per account). */
export interface MailboxEntry {
  id: string;
  email: string; // owner account
  messageId: string;
  folder: Folder;
  category: Category;
  read: boolean;
  starred: boolean;
  important: boolean;
  /** Labels applied by this account. */
  labels?: string[];
}

export interface Database {
  accounts: ApiAccount[];
  messages: ServerMessage[];
  mailbox: MailboxEntry[];
  labels: Label[];
}
