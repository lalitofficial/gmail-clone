import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Category, Email } from '@gmail-clone/shared';
import { api, connectWs } from '../api/client';
import { useAuth } from '../auth';

export interface ComposeWindow {
  id: string;
  to: string;
  subject: string;
  body: string;
  minimized: boolean;
}

interface MailboxValue {
  emails: Email[];
  category: Category;
  composeWindows: ComposeWindow[];
  loading: boolean;
  setCategory: (c: Category) => void;
  getEmail: (id: string) => Email | undefined;
  refresh: () => void;
  toggleStar: (id: string) => void;
  toggleRead: (id: string) => void;
  markRead: (id: string, read: boolean) => void;
  archive: (id: string) => void;
  trash: (id: string) => void;
  snooze: (id: string) => void;
  openCompose: (initial?: Partial<ComposeWindow>) => void;
  updateCompose: (id: string, patch: Partial<ComposeWindow>) => void;
  closeCompose: (id: string) => void;
  toggleMinimize: (id: string) => void;
  sendCompose: (id: string) => void;
}

const MailboxContext = createContext<MailboxValue | null>(null);
let composeSeq = 0;

export function MailboxProvider({ children }: { children: ReactNode }) {
  const { account } = useAuth();
  const email = account.email;

  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('primary');
  const [composeWindows, setComposeWindows] = useState<ComposeWindow[]>([]);

  const refresh = useCallback(() => {
    api
      .messages(email)
      .then((all) => setEmails(all))
      .finally(() => setLoading(false));
  }, [email]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  // Live delivery: prepend new mail as it arrives.
  useEffect(() => {
    return connectWs(email, (ev) => {
      if (ev.type === 'new-mail' && ev.email) {
        setEmails((prev) => (prev.some((e) => e.id === ev.email!.id) ? prev : [ev.email!, ...prev]));
      }
    });
  }, [email]);

  const patchEmail = useCallback((id: string, patch: Partial<Email>) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const getEmail = useCallback((id: string) => emails.find((e) => e.id === id), [emails]);

  const toggleStar = useCallback(
    (id: string) => {
      const cur = emails.find((e) => e.id === id);
      patchEmail(id, { starred: !cur?.starred });
      api.action(email, id, 'toggle-star').catch(refresh);
    },
    [emails, email, patchEmail, refresh],
  );

  const setRead = useCallback(
    (id: string, read: boolean) => {
      patchEmail(id, { read });
      api.action(email, id, read ? 'read' : 'unread').catch(refresh);
    },
    [email, patchEmail, refresh],
  );
  const toggleRead = useCallback(
    (id: string) => {
      const cur = emails.find((e) => e.id === id);
      setRead(id, !cur?.read);
    },
    [emails, setRead],
  );

  const archive = useCallback(
    (id: string) => {
      patchEmail(id, { folder: 'archive' });
      api.action(email, id, 'archive').catch(refresh);
    },
    [email, patchEmail, refresh],
  );
  const trash = useCallback(
    (id: string) => {
      patchEmail(id, { folder: 'trash' });
      api.action(email, id, 'trash').catch(refresh);
    },
    [email, patchEmail, refresh],
  );
  const snooze = useCallback(() => {}, []);

  const openCompose = useCallback((initial?: Partial<ComposeWindow>) => {
    const id = `c${++composeSeq}`;
    setComposeWindows((prev) => [...prev, { id, to: '', subject: '', body: '', minimized: false, ...initial }]);
  }, []);
  const updateCompose = useCallback((id: string, patch: Partial<ComposeWindow>) => {
    setComposeWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);
  const closeCompose = useCallback((id: string) => {
    setComposeWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);
  const toggleMinimize = useCallback((id: string) => {
    setComposeWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
  }, []);

  const sendCompose = useCallback(
    (id: string) => {
      const w = composeWindows.find((x) => x.id === id);
      if (w) api.send(email, { to: w.to, subject: w.subject, body: w.body }).then(refresh);
      setComposeWindows((prev) => prev.filter((x) => x.id !== id));
    },
    [composeWindows, email, refresh],
  );

  const value = useMemo<MailboxValue>(
    () => ({
      emails, category, composeWindows, loading,
      setCategory, getEmail, refresh,
      toggleStar, toggleRead, markRead: setRead, archive, trash, snooze,
      openCompose, updateCompose, closeCompose, toggleMinimize, sendCompose,
    }),
    [emails, category, composeWindows, loading, getEmail, refresh, toggleStar, toggleRead, setRead, archive, trash, snooze, openCompose, updateCompose, closeCompose, toggleMinimize, sendCompose],
  );

  return <MailboxContext.Provider value={value}>{children}</MailboxContext.Provider>;
}

export function useMailbox(): MailboxValue {
  const ctx = useContext(MailboxContext);
  if (!ctx) throw new Error('useMailbox must be used within MailboxProvider');
  return ctx;
}
