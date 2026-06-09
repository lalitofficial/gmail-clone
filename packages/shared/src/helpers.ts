import type { Category, Email, Folder } from './types';

/** Gmail-style relative date: "10:32 AM", "Jun 7", "Jun 7, 2025". */
export function formatListDate(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d
      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      .replace(' ', ' ');
  }
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/** Full date shown in the thread header: "Fri, Jun 6, 10:32 AM". */
export function formatThreadDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Thread header with Gmail's relative hint: "Fri, Jun 5, 5:54 PM (4 days ago)". */
export function formatThreadDateRelative(iso: string, now: Date = new Date()): string {
  const base = formatThreadDate(iso);
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  let rel = '';
  if (days <= 0) rel = '';
  else if (days === 1) rel = ' (1 day ago)';
  else if (days < 30) rel = ` (${days} days ago)`;
  return `${base}${rel}`;
}

/** Emails belonging to a folder (inbox respects category tabs separately). */
export function emailsInFolder(emails: Email[], folder: Folder): Email[] {
  if (folder === 'starred') return emails.filter((e) => e.starred && e.folder !== 'trash');
  if (folder === 'important') return emails.filter((e) => e.important && e.folder !== 'trash');
  if (folder === 'allMail')
    return emails.filter((e) => e.folder !== 'spam' && e.folder !== 'trash');
  return emails.filter((e) => e.folder === folder);
}

/** Inbox emails for a given category tab. */
export function inboxForCategory(emails: Email[], category: Category): Email[] {
  return emails.filter((e) => e.folder === 'inbox' && e.category === category);
}

/** Count of unread inbox messages in a category (for the tab badge). */
export function unreadCount(emails: Email[], category?: Category): number {
  return emails.filter(
    (e) => e.folder === 'inbox' && !e.read && (!category || e.category === category),
  ).length;
}

/** Case-insensitive search across sender, subject, snippet, body. */
export function searchEmails(emails: Email[], query: string): Email[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return emails.filter((e) => {
    if (e.folder === 'trash' || e.folder === 'spam') return false;
    return (
      e.from.name.toLowerCase().includes(q) ||
      e.from.email.toLowerCase().includes(q) ||
      e.subject.toLowerCase().includes(q) ||
      e.snippet.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q)
    );
  });
}

/** Sort newest first. */
export function byNewest(a: Email, b: Email): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

/** Human-readable folder name (sidebar + document title). */
export function folderLabel(folder: Folder): string {
  const map: Record<Folder, string> = {
    inbox: 'Inbox',
    starred: 'Starred',
    snoozed: 'Snoozed',
    sent: 'Sent',
    drafts: 'Drafts',
    spam: 'Spam',
    trash: 'Trash',
    archive: 'Archive',
    important: 'Important',
    scheduled: 'Scheduled',
    allMail: 'All Mail',
  };
  return map[folder] ?? 'Inbox';
}
