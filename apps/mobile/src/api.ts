import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { Category, Email, Folder } from '@gmail-clone/shared';

export interface ApiAccount {
  id: string;
  email: string;
  name: string;
  initial: string;
  avatarColor: string;
}

/** Derive the backend host from the Expo dev host (LAN IP) so real devices work. */
function host(): string {
  if (Platform.OS === 'web' && typeof location !== 'undefined') return location.hostname;
  const h = Constants.expoConfig?.hostUri ?? (Constants as any).expoGoConfig?.hostUri;
  return h ? String(h).split(':')[0] : 'localhost';
}

export const API_BASE = `http://${host()}:4000`;
const WS_BASE = `ws://${host()}:4000`;

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}
const auth = (email: string) => ({ 'x-account-email': email });

export const api = {
  accounts: () => fetch(`${API_BASE}/api/accounts`).then(json<ApiAccount[]>),

  messages: (email: string, opts: { folder?: Folder; category?: Category } = {}) => {
    const p = new URLSearchParams();
    if (opts.folder) p.set('folder', opts.folder);
    if (opts.category) p.set('category', opts.category);
    return fetch(`${API_BASE}/api/messages?${p}`, { headers: auth(email) }).then(json<Email[]>);
  },

  send: (email: string, body: { to: string; subject: string; body: string }) =>
    fetch(`${API_BASE}/api/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth(email) },
      body: JSON.stringify(body),
    }).then(json<{ ok: boolean }>),

  action: (email: string, id: string, action: string) =>
    fetch(`${API_BASE}/api/messages/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth(email) },
      body: JSON.stringify({ action }),
    }).then(json<{ ok: boolean }>),
};

export function connectWs(email: string, onEvent: (ev: { type: string; email?: Email }) => void): () => void {
  let ws: WebSocket | null = null;
  try {
    ws = new WebSocket(`${WS_BASE}/ws?email=${encodeURIComponent(email)}`);
    ws.onmessage = (e) => {
      try {
        onEvent(JSON.parse(e.data as string));
      } catch {
        /* ignore */
      }
    };
  } catch {
    /* ignore */
  }
  return () => ws?.close();
}
