import { useState } from 'react';
import { labels as labelData, unreadCount, emailsInFolder, type Folder } from '@gmail-clone/shared';
import { Icon } from './Icon';
import { useMailbox } from '../store/MailboxContext';
import { hrefFolder, hrefLabel, useRoute } from '../router';
import './Sidebar.css';

interface NavItem {
  icon: string;
  label: string;
  folder: Folder;
  count?: number;
}

export function Sidebar({ open }: { open: boolean }) {
  const { emails, openCompose } = useMailbox();
  const route = useRoute();
  const [showMore, setShowMore] = useState(false);

  const draftCount = emailsInFolder(emails, 'drafts').length;
  const inboxUnread = unreadCount(emails);

  const primary: NavItem[] = [
    { icon: 'inbox', label: 'Inbox', folder: 'inbox', count: inboxUnread },
    { icon: 'star', label: 'Starred', folder: 'starred' },
    { icon: 'schedule', label: 'Snoozed', folder: 'snoozed' },
    { icon: 'send', label: 'Sent', folder: 'sent' },
    { icon: 'description', label: 'Drafts', folder: 'drafts', count: draftCount || undefined },
  ];
  const more: NavItem[] = [
    { icon: 'label_important', label: 'Important', folder: 'important' },
    { icon: 'mark_email_unread', label: 'All Mail', folder: 'allMail' },
    { icon: 'report', label: 'Spam', folder: 'spam' },
    { icon: 'delete', label: 'Trash', folder: 'trash' },
  ];

  const activeFolder = route.view === 'list' && !route.label ? route.folder : undefined;

  return (
    <nav className={`gm-sidebar${open ? '' : ' gm-sidebar--rail'}`}>
      <div className="gm-compose-wrap">
        <button className="gm-compose" onClick={() => openCompose()}>
          <Icon name="edit" size={24} />
          {open && <span className="gm-compose-label">Compose</span>}
        </button>
      </div>

      <div className="gm-nav">
        {primary.map((item) => (
          <NavRow key={item.folder} item={item} open={open} active={activeFolder === item.folder} />
        ))}

        <button className="gm-nav-item gm-nav-more" onClick={() => setShowMore((v) => !v)}>
          <Icon name={showMore ? 'expand_less' : 'expand_more'} size={20} className="gm-nav-icon" />
          {open && <span className="gm-nav-label">{showMore ? 'Less' : 'More'}</span>}
        </button>

        {showMore && more.map((item) => (
          <NavRow key={item.folder} item={item} open={open} active={activeFolder === item.folder} />
        ))}

        {open && (
          <div className="gm-labels">
            <div className="gm-labels-header">
              <span>Labels</span>
              <button className="gm-icon-btn" aria-label="Create label" style={{ width: 28, height: 28 }}>
                <Icon name="add" size={18} />
              </button>
            </div>
            {labelData.map((l) => (
              <a className={`gm-nav-item${route.view === 'list' && route.label === l.name ? ' gm-nav-item--active' : ''}`} key={l.id} href={hrefLabel(l.name)}>
                <Icon name="label" size={20} className="gm-nav-icon" color={l.color} />
                <span className="gm-nav-label">{l.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavRow({ item, open, active }: { item: NavItem; open: boolean; active: boolean }) {
  return (
    <a href={hrefFolder(item.folder)} className={`gm-nav-item${active ? ' gm-nav-item--active' : ''}`} title={item.label}>
      <Icon name={item.icon} size={20} className="gm-nav-icon" />
      {open && <span className="gm-nav-label">{item.label}</span>}
      {open && item.count ? <span className="gm-nav-count">{item.count}</span> : null}
    </a>
  );
}
