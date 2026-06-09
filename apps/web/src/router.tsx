import { useSyncExternalStore } from 'react';
import type { Category, Folder } from '@gmail-clone/shared';

export type Route =
  | { view: 'list'; folder: Folder; category?: Category; label?: string }
  | { view: 'thread'; folder: Folder; id: string }
  | { view: 'search'; query: string }
  | { view: 'settings'; section: string };

// Gmail hash token <-> folder
const TOKEN_TO_FOLDER: Record<string, Folder> = {
  inbox: 'inbox', sent: 'sent', drafts: 'drafts', spam: 'spam', trash: 'trash',
  starred: 'starred', snoozed: 'snoozed', scheduled: 'scheduled', imp: 'important', all: 'allMail',
};
const FOLDER_TO_TOKEN: Record<Folder, string> = {
  inbox: 'inbox', sent: 'sent', drafts: 'drafts', spam: 'spam', trash: 'trash',
  starred: 'starred', snoozed: 'snoozed', scheduled: 'scheduled', important: 'imp', allMail: 'all', archive: 'all',
};

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#/, '').split('/').filter(Boolean);
  if (parts.length === 0) return { view: 'list', folder: 'inbox', category: 'primary' };
  const [a] = parts;
  if (a === 'category') return { view: 'list', folder: 'inbox', category: (parts[1] as Category) ?? 'primary' };
  if (a === 'search') return { view: 'search', query: decodeURIComponent(parts.slice(1).join('/')) };
  if (a === 'settings') return { view: 'settings', section: parts[1] ?? 'general' };
  if (a === 'label') return { view: 'list', folder: 'allMail', label: decodeURIComponent(parts.slice(1).join('/')) };
  const folder = TOKEN_TO_FOLDER[a] ?? 'inbox';
  if (parts[1]) return { view: 'thread', folder, id: parts[1] };
  return { view: 'list', folder };
}

// --- hrefs (exact Gmail hashes) -----------------------------------------
export const hrefFolder = (f: Folder) => `#${FOLDER_TO_TOKEN[f]}`;
export const hrefCategory = (c: Category) => (c === 'primary' ? '#inbox' : `#category/${c}`);
export const hrefThread = (f: Folder, id: string) => `#${FOLDER_TO_TOKEN[f]}/${id}`;
export const hrefSearch = (q: string) => `#search/${encodeURIComponent(q)}`;
export const hrefSettings = (section = 'general') => `#settings/${section}`;
export const hrefLabel = (name: string) => `#label/${encodeURIComponent(name)}`;

export function navigate(hash: string) {
  if (location.hash !== hash) location.hash = hash;
}

// --- reactive hash subscription -----------------------------------------
function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}
const getSnapshot = () => location.hash || '#inbox';

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getSnapshot);
  return parseHash(hash);
}

/** The /mail/u/<N>/ account index from the path (defaults to 0). */
export function getUserIndex(): number {
  const m = location.pathname.match(/\/mail\/u\/(\d+)/);
  return m ? Number(m[1]) : 0;
}

/** Build the /mail/u/<N>/ base path for a given account index. */
export function userBasePath(index: number): string {
  return `/mail/u/${index}/`;
}
