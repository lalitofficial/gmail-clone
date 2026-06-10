import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Attachment, Category, Email, Label } from '@gmail-clone/shared';
import { api, connectWs } from '../api/client';
import { useAuth } from '../auth';

export interface Toast {
  id: number;
  message: string;
  /** When present the snackbar shows an "Undo" action. */
  undo?: () => void;
}

export interface ComposeWindow {
  id: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  minimized: boolean;
  threadId?: string;
  attachments: Attachment[];
  draftId?: string;
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
  toggleImportant: (id: string) => void;
  toggleRead: (id: string) => void;
  markRead: (id: string, read: boolean) => void;
  archive: (id: string) => void;
  trash: (id: string) => void;
  spam: (id: string) => void;
  snooze: (id: string) => void;
  // Labels
  labels: Label[];
  setLabel: (id: string, label: string, on: boolean) => void;
  createLabel: (name: string) => void;
  // Bulk selection
  selected: string[];
  toggleSelected: (id: string) => void;
  /** Shift-click: select the contiguous range between the last toggled row and `id`. */
  rangeSelect: (id: string, orderedIds: string[]) => void;
  selectMany: (ids: string[]) => void;
  clearSelected: () => void;
  bulk: (action: 'archive' | 'trash' | 'spam' | 'read' | 'unread') => void;
  // Snackbar
  toast: Toast | null;
  showToast: (message: string, undo?: () => void) => void;
  hideToast: () => void;
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
  const [selected, setSelected] = useState<string[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectionAnchor = useRef<string | null>(null);

  const refresh = useCallback(() => {
    api
      .messages(email)
      .then((all) => setEmails(all))
      .finally(() => setLoading(false));
  }, [email]);

  const refreshLabels = useCallback(() => {
    api.labels(email).then(setLabels).catch(() => {});
  }, [email]);

  useEffect(() => {
    setLoading(true);
    refresh();
    refreshLabels();
  }, [refresh, refreshLabels]);

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

  const hideToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = null;
    setToast(null);
  }, []);
  const showToast = useCallback((message: string, undo?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, undo });
    // Gmail keeps the snackbar up ~5s, longer when an Undo action is offered.
    toastTimer.current = setTimeout(() => setToast(null), undo ? 8000 : 5000);
  }, []);

  const toggleStar = useCallback(
    (id: string) => {
      const cur = emails.find((e) => e.id === id);
      patchEmail(id, { starred: !cur?.starred });
      api.action(email, id, 'toggle-star').catch(refresh);
    },
    [emails, email, patchEmail, refresh],
  );
  const toggleImportant = useCallback(
    (id: string) => {
      const cur = emails.find((item) => item.id === id);
      const important = !cur?.important;
      patchEmail(id, { important });
      api.action(email, id, important ? 'important' : 'not-important').catch(refresh);
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

  /** Move a conversation, show the Gmail snackbar, and let Undo restore the previous folder. */
  const moveWithUndo = useCallback(
    (id: string, action: 'archive' | 'trash' | 'spam' | 'snooze', message: string) => {
      const cur = emails.find((e) => e.id === id);
      if (!cur) return;
      const prev = { folder: cur.folder, snoozed: cur.snoozed };
      patchEmail(id, { folder: action === 'snooze' ? 'snoozed' : action, snoozed: action === 'snooze' ? true : cur.snoozed });
      api.action(email, id, action).catch(refresh);
      showToast(message, () => {
        patchEmail(id, prev);
        api.action(email, id, `move:${prev.folder}`).catch(refresh);
      });
    },
    [emails, email, patchEmail, refresh, showToast],
  );

  const archive = useCallback((id: string) => moveWithUndo(id, 'archive', 'Conversation archived.'), [moveWithUndo]);
  const trash = useCallback((id: string) => moveWithUndo(id, 'trash', 'Conversation moved to Trash.'), [moveWithUndo]);
  const spam = useCallback((id: string) => moveWithUndo(id, 'spam', 'Conversation marked as spam.'), [moveWithUndo]);
  const snooze = useCallback((id: string) => moveWithUndo(id, 'snooze', 'Conversation snoozed.'), [moveWithUndo]);

  const setLabel = useCallback(
    (id: string, label: string, on: boolean) => {
      const cur = emails.find((e) => e.id === id);
      const next = new Set(cur?.labels ?? []);
      if (on) next.add(label);
      else next.delete(label);
      patchEmail(id, { labels: [...next] });
      api.label(email, id, label, on).catch(refresh);
    },
    [emails, email, patchEmail, refresh],
  );
  const createLabel = useCallback(
    (name: string) => {
      api.createLabel(email, name).then(refreshLabels).catch(() => {});
    },
    [email, refreshLabels],
  );

  const toggleSelected = useCallback((id: string) => {
    selectionAnchor.current = id;
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }, []);
  const rangeSelect = useCallback((id: string, orderedIds: string[]) => {
    const anchor = selectionAnchor.current;
    const from = anchor ? orderedIds.indexOf(anchor) : -1;
    const to = orderedIds.indexOf(id);
    if (from === -1 || to === -1) {
      selectionAnchor.current = id;
      setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
      return;
    }
    const range = orderedIds.slice(Math.min(from, to), Math.max(from, to) + 1);
    setSelected((p) => [...new Set([...p, ...range])]);
  }, []);
  const selectMany = useCallback((ids: string[]) => setSelected(ids), []);
  const clearSelected = useCallback(() => setSelected([]), []);
  const bulk = useCallback(
    (action: 'archive' | 'trash' | 'spam' | 'read' | 'unread') => {
      const ids = [...selected];
      const isMove = action === 'archive' || action === 'trash' || action === 'spam';
      const prev = isMove
        ? ids.flatMap((id) => {
            const cur = emails.find((e) => e.id === id);
            return cur ? [{ id, folder: cur.folder }] : [];
          })
        : [];
      for (const id of ids) {
        if (action === 'read' || action === 'unread') patchEmail(id, { read: action === 'read' });
        else patchEmail(id, { folder: action });
        api.action(email, id, action).catch(() => {});
      }
      setSelected([]);
      if (isMove && prev.length > 0) {
        const noun = prev.length === 1 ? 'conversation' : 'conversations';
        const verb =
          action === 'archive' ? 'archived' : action === 'trash' ? 'moved to Trash' : 'marked as spam';
        showToast(`${prev.length} ${noun} ${verb}.`, () => {
          for (const { id, folder } of prev) {
            patchEmail(id, { folder });
            api.action(email, id, `move:${folder}`).catch(() => {});
          }
        });
      }
    },
    [selected, emails, email, patchEmail, showToast],
  );

  const openCompose = useCallback((initial?: Partial<ComposeWindow>) => {
    const id = `c${++composeSeq}`;
    setComposeWindows((prev) => [
      ...prev,
      { id, to: '', cc: '', bcc: '', subject: '', body: '', minimized: false, attachments: [], ...initial },
    ]);
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
      setComposeWindows((prev) => prev.filter((x) => x.id !== id));
      if (!w) return;
      // Gmail-style undo send: the message only leaves after the snackbar window passes.
      const timer = setTimeout(() => {
        api
          .send(email, {
            to: w.to, cc: w.cc, bcc: w.bcc, subject: w.subject, body: w.body,
            threadId: w.threadId, attachments: w.attachments,
          })
          .then(() => {
            if (w.draftId) api.deleteDraft(email, w.draftId).catch(() => {});
            refresh();
          });
      }, 5000);
      showToast('Message sent.', () => {
        clearTimeout(timer);
        setComposeWindows((prev) => [...prev, { ...w, minimized: false }]);
      });
    },
    [composeWindows, email, refresh, showToast],
  );

  const value = useMemo<MailboxValue>(
    () => ({
      emails, category, composeWindows, loading,
      setCategory, getEmail, refresh,
      toggleStar, toggleImportant, toggleRead, markRead: setRead, archive, trash, spam, snooze,
      labels, setLabel, createLabel,
      selected, toggleSelected, rangeSelect, selectMany, clearSelected, bulk,
      toast, showToast, hideToast,
      openCompose, updateCompose, closeCompose, toggleMinimize, sendCompose,
    }),
    [emails, category, composeWindows, loading, getEmail, refresh, toggleStar, toggleImportant, toggleRead, setRead, archive, trash, spam, snooze, labels, setLabel, createLabel, selected, toggleSelected, rangeSelect, selectMany, clearSelected, bulk, toast, showToast, hideToast, openCompose, updateCompose, closeCompose, toggleMinimize, sendCompose],
  );

  return <MailboxContext.Provider value={value}>{children}</MailboxContext.Provider>;
}

export function useMailbox(): MailboxValue {
  const ctx = useContext(MailboxContext);
  if (!ctx) throw new Error('useMailbox must be used within MailboxProvider');
  return ctx;
}
