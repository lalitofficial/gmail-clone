import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Category, Email, Folder } from '@gmail-clone/shared';
import { api, connectWs } from '../api';
import { useAuth } from '../auth';

interface MailboxValue {
  emails: Email[];
  category: Category;
  folder: Folder;
  loading: boolean;
  setCategory: (c: Category) => void;
  setFolder: (f: Folder) => void;
  getEmail: (id: string) => Email | undefined;
  refresh: () => void;
  toggleStar: (id: string) => void;
  toggleRead: (id: string) => void;
  markRead: (id: string, read: boolean) => void;
  archive: (id: string) => void;
  trash: (id: string) => void;
  sendEmail: (draft: { to: string; subject: string; body: string }) => void;
}

const MailboxContext = createContext<MailboxValue | null>(null);

export function MailboxProvider({ children }: { children: ReactNode }) {
  const { account } = useAuth();
  const email = account.email;

  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('primary');
  const [folder, setFolder] = useState<Folder>('inbox');

  const refresh = useCallback(() => {
    api
      .messages(email)
      .then(setEmails)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [email]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  useEffect(() => {
    return connectWs(email, (ev) => {
      if (ev.type === 'new-mail' && ev.email) {
        setEmails((prev) => (prev.some((e) => e.id === ev.email!.id) ? prev : [ev.email!, ...prev]));
      }
    });
  }, [email]);

  const patch = useCallback((id: string, p: Partial<Email>) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, ...p } : e)));
  }, []);

  const getEmail = useCallback((id: string) => emails.find((e) => e.id === id), [emails]);

  const toggleStar = useCallback(
    (id: string) => {
      const cur = emails.find((e) => e.id === id);
      patch(id, { starred: !cur?.starred });
      api.action(email, id, 'toggle-star').catch(refresh);
    },
    [emails, email, patch, refresh],
  );
  const markRead = useCallback(
    (id: string, read: boolean) => {
      patch(id, { read });
      api.action(email, id, read ? 'read' : 'unread').catch(refresh);
    },
    [email, patch, refresh],
  );
  const toggleRead = useCallback(
    (id: string) => {
      const cur = emails.find((e) => e.id === id);
      markRead(id, !cur?.read);
    },
    [emails, markRead],
  );
  const archive = useCallback(
    (id: string) => {
      patch(id, { folder: 'archive' });
      api.action(email, id, 'archive').catch(refresh);
    },
    [email, patch, refresh],
  );
  const trash = useCallback(
    (id: string) => {
      patch(id, { folder: 'trash' });
      api.action(email, id, 'trash').catch(refresh);
    },
    [email, patch, refresh],
  );

  const sendEmail = useCallback(
    (draft: { to: string; subject: string; body: string }) => {
      api.send(email, draft).then(refresh).catch(() => {});
    },
    [email, refresh],
  );

  const value = useMemo<MailboxValue>(
    () => ({
      emails, category, folder, loading,
      setCategory, setFolder, getEmail, refresh,
      toggleStar, toggleRead, markRead, archive, trash, sendEmail,
    }),
    [emails, category, folder, loading, getEmail, refresh, toggleStar, toggleRead, markRead, archive, trash, sendEmail],
  );

  return <MailboxContext.Provider value={value}>{children}</MailboxContext.Provider>;
}

export function useMailbox(): MailboxValue {
  const ctx = useContext(MailboxContext);
  if (!ctx) throw new Error('useMailbox must be used within MailboxProvider');
  return ctx;
}
