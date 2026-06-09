import type { Category, Email, Folder } from '@gmail-clone/shared';

export interface ApiAccount {
  id: string;
  email: string;
  name: string;
  initial: string;
  avatarColor: string;
}

export interface UnreadCounts {
  inbox: number;
  drafts: number;
  byCategory: Partial<Record<Category, number>>;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

const auth = (email: string) => ({ 'x-account-email': email });

export const api = {
  accounts: () => fetch('/api/accounts').then(json<ApiAccount[]>),

  login: (email: string) =>
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then(json<ApiAccount>),

  messages: (email: string, opts: { folder?: Folder; category?: Category } = {}) => {
    const p = new URLSearchParams();
    if (opts.folder) p.set('folder', opts.folder);
    if (opts.category) p.set('category', opts.category);
    return fetch(`/api/messages?${p}`, { headers: auth(email) }).then(json<Email[]>);
  },

  message: (email: string, id: string) =>
    fetch(`/api/messages/${id}`, { headers: auth(email) }).then(json<Email>),

  send: (email: string, body: { to: string; subject: string; body: string }) =>
    fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth(email) },
      body: JSON.stringify(body),
    }).then(json<{ ok: boolean; id: string; delivered: string[] }>),

  action: (email: string, id: string, action: string) =>
    fetch(`/api/messages/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth(email) },
      body: JSON.stringify({ action }),
    }).then(json<{ ok: boolean }>),

  search: (email: string, q: string) =>
    fetch(`/api/search?q=${encodeURIComponent(q)}`, { headers: auth(email) }).then(json<Email[]>),

  unreadCounts: (email: string) =>
    fetch('/api/unread-counts', { headers: auth(email) }).then(json<UnreadCounts>),
};

/** Live updates: fires `onEvent` when new mail arrives for this account. */
export function connectWs(email: string, onEvent: (ev: { type: string; email?: Email }) => void): () => void {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${proto}://${location.host}/ws?email=${encodeURIComponent(email)}`);
  ws.onmessage = (e) => {
    try {
      onEvent(JSON.parse(e.data));
    } catch {
      /* ignore */
    }
  };
  return () => ws.close();
}
