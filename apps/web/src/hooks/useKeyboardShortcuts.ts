import { useEffect } from 'react';
import { useMailbox } from '../store/MailboxContext';

const isTyping = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  );
};

/**
 * Gmail keyboard shortcuts:
 *   c — compose, / — search, e — archive selection, # — delete selection,
 *   Shift+I / Shift+U — mark read/unread, Esc — clear selection.
 */
export function useKeyboardShortcuts() {
  const { openCompose, selected, clearSelected, bulk } = useMailbox();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;

      switch (e.key) {
        case 'c':
          e.preventDefault();
          openCompose();
          break;
        case '/': {
          e.preventDefault();
          document.querySelector<HTMLInputElement>('.gm-search-input')?.focus();
          break;
        }
        case 'e':
          if (selected.length > 0) {
            e.preventDefault();
            bulk('archive');
          }
          break;
        case '#':
          if (selected.length > 0) {
            e.preventDefault();
            bulk('trash');
          }
          break;
        case 'I':
          if (selected.length > 0) {
            e.preventDefault();
            bulk('read');
          }
          break;
        case 'U':
          if (selected.length > 0) {
            e.preventDefault();
            bulk('unread');
          }
          break;
        case 'Escape':
          if (selected.length > 0) clearSelected();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openCompose, selected, clearSelected, bulk]);
}
