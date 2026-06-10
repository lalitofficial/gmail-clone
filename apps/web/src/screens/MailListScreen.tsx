import {
  byNewest,
  emailsInFolder,
  folderLabel,
  inboxForCategory,
  unreadCount,
  type Email,
} from '@gmail-clone/shared';
import { useMailbox } from '../store/MailboxContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Route } from '../router';
import { CategoryTabs } from '../components/CategoryTabs';
import { InboxToolbar } from '../components/InboxToolbar';
import { EmailRow } from '../components/EmailRow';
import { Icon } from '../components/Icon';
import '../components/EmailRow.css';
import './MailList.css';

export function MailListScreen({ route }: { route: Extract<Route, { view: 'list' }> }) {
  const { emails } = useMailbox();
  const isInbox = route.folder === 'inbox' && !route.label;
  const category = route.category ?? 'primary';

  let list: Email[];
  if (route.label) list = emails.filter((e) => e.labels.includes(route.label!));
  else if (isInbox) list = inboxForCategory(emails, category);
  else list = emailsInFolder(emails, route.folder);
  list = [...list].sort(byNewest);

  const inboxUnread = unreadCount(emails);
  useDocumentTitle(
    route.label
      ? route.label
      : isInbox && inboxUnread > 0
        ? `Inbox (${inboxUnread.toLocaleString()})`
        : folderLabel(route.folder),
  );

  const listIds = list.map((e) => e.id);

  return (
    <div className="gm-list-screen">
      <InboxToolbar count={list.length} ids={listIds} />
      {isInbox && <CategoryTabs />}

      <div className="gm-list">
        {list.length === 0 ? (
          <div className="gm-list-empty">
            <Icon name="inbox" size={48} color="var(--gm-color-outline-variant)" />
            <p>No conversations</p>
          </div>
        ) : (
          list.map((email) => <EmailRow key={email.id} email={email} orderedIds={listIds} />)
        )}
      </div>
    </div>
  );
}
