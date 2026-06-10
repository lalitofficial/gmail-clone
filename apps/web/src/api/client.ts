import type { Attachment, Category, Email, Folder, Label } from '@gmail-clone/shared';

export interface ApiAccount {
  id: string;
  email: string;
  name: string;
  initial: string;
  avatarColor: string;
}

export interface SendBody {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  threadId?: string;
  attachments?: Attachment[];
}

export interface DraftBody extends SendBody {
  id?: string;
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

  login: async (email: string, password: string): Promise<ApiAccount> => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.status === 404) throw new Error('account_not_found');
    if (res.status === 401) throw new Error('wrong_password');
    if (!res.ok) throw new Error('error');
    return res.json() as Promise<ApiAccount>;
  },

  messages: (email: string, opts: { folder?: Folder; category?: Category; label?: string } = {}) => {
    const p = new URLSearchParams();
    if (opts.folder) p.set('folder', opts.folder);
    if (opts.category) p.set('category', opts.category);
    if (opts.label) p.set('label', opts.label);
    return fetch(`/api/messages?${p}`, { headers: auth(email) }).then(json<Email[]>);
  },

  /** All messages in a conversation, oldest → newest. */
  thread: (email: string, threadId: string) =>
    fetch(`/api/thread/${threadId}`, { headers: auth(email) }).then(json<Email[]>),

  send: (email: string, body: SendBody) =>
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

  label: (email: string, id: string, labelName: string, on: boolean) =>
    fetch(`/api/messages/${id}/label`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth(email) },
      body: JSON.stringify({ label: labelName, on }),
    }).then(json<{ ok: boolean }>),

  labels: (email: string) => fetch('/api/labels', { headers: auth(email) }).then(json<Label[]>),

  createLabel: (email: string, name: string) =>
    fetch('/api/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth(email) },
      body: JSON.stringify({ name }),
    }).then(json<Label>),

  saveDraft: (email: string, draft: DraftBody) =>
    fetch('/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth(email) },
      body: JSON.stringify(draft),
    }).then(json<{ ok: boolean; id: string }>),

  deleteDraft: (email: string, id: string) =>
    fetch(`/api/draft/${id}`, { method: 'DELETE', headers: auth(email) }).then(json<{ ok: boolean }>),

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
