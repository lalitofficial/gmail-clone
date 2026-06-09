import type { Category, Folder } from '@gmail-clone/shared';

export interface ApiAccount {
  id: string;
  email: string;
  name: string;
  initial: string;
  avatarColor: string;
}

export interface ServerAttachment {
  id: string;
  name: string;
  kind: string;
  size: string;
}

/** A single message (one per send), shared across sender + recipients. */
export interface ServerMessage {
  id: string;
  threadId: string;
  fromEmail: string;
  fromName: string;
  toEmails: string[];
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
}

export interface Database {
  accounts: ApiAccount[];
  messages: ServerMessage[];
  mailbox: MailboxEntry[];
}
