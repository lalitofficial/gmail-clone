/** Domain types shared by the web and mobile Gmail clones. */

export type Category = 'primary' | 'promotions' | 'social' | 'updates';

export type Folder =
  | 'inbox'
  | 'starred'
  | 'snoozed'
  | 'sent'
  | 'drafts'
  | 'spam'
  | 'trash'
  | 'archive'
  | 'important'
  | 'scheduled'
  | 'allMail';

export interface Contact {
  name: string;
  email: string;
  /** Single uppercase letter shown in the avatar circle. */
  initial: string;
  /** Background color for the avatar circle (hex). */
  avatarColor: string;
}

export interface Attachment {
  id: string;
  name: string;
  /** e.g. "pdf", "docx", "png", "xlsx" — drives the icon shown. */
  kind: string;
  size: string;
}

export interface Email {
  id: string;
  threadId: string;
  from: Contact;
  to: Contact[];
  subject: string;
  /** Short preview line shown in the list. */
  snippet: string;
  /** Full plain-text/markdown-ish body shown in the thread view. */
  body: string;
  /** ISO 8601 timestamp. */
  date: string;
  read: boolean;
  starred: boolean;
  important: boolean;
  hasAttachment: boolean;
  attachments: Attachment[];
  /** Label ids attached to this message. */
  labels: string[];
  category: Category;
  folder: Folder;
  snoozed: boolean;
}

export interface Label {
  id: string;
  name: string;
  /** Hex color used for the label chip / dot. */
  color: string;
}

export interface Account {
  name: string;
  email: string;
  initial: string;
  avatarColor: string;
}
