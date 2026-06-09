import { useEffect } from 'react';
import { useAuth } from '../auth';

/**
 * Sets the browser tab title in Gmail's format, e.g.
 *   "Inbox (1,190) - lalitkofficial@gmail.com - Gmail"
 *   "Re: Q3 roadmap review - lalitkofficial@gmail.com - Gmail"
 */
export function useDocumentTitle(label: string) {
  const { account } = useAuth();
  useEffect(() => {
    document.title = `${label} - ${account.email} - Gmail`;
  }, [label, account.email]);
}
