import { useState, type MouseEvent } from 'react';
import { formatListDate, type Email } from '@gmail-clone/shared';
import { Icon } from './Icon';
import { useMailbox } from '../store/MailboxContext';
import { hrefThread, navigate } from '../router';

export function EmailRow({ email }: { email: Email }) {
  const { toggleStar, toggleRead, archive, trash, snooze, markRead } = useMailbox();
  const [selected, setSelected] = useState(false);

  const stop = (e: MouseEvent) => e.stopPropagation();

  const open = () => {
    markRead(email.id, true);
    navigate(hrefThread(email.folder, email.id));
  };

  return (
    <div
      className={`gm-row${email.read ? ' gm-row--read' : ' gm-row--unread'}${
        selected ? ' gm-row--selected' : ''
      }`}
      onClick={open}
      role="row"
    >
      <button
        className="gm-row-check"
        onClick={(e) => {
          stop(e);
          setSelected((v) => !v);
        }}
        aria-label="Select"
      >
        <Icon name={selected ? 'check_box' : 'check_box_outline_blank'} size={18} color={selected ? 'var(--gm-color-primary)' : undefined} />
      </button>

      <button
        className="gm-row-star"
        onClick={(e) => {
          stop(e);
          toggleStar(email.id);
        }}
        aria-label={email.starred ? 'Starred' : 'Not starred'}
      >
        <Icon name="star" size={18} fill={email.starred} color={email.starred ? 'var(--gm-color-star)' : 'var(--gm-color-star-idle)'} />
      </button>

      <span className="gm-row-sender">{email.from.name}</span>

      <div className="gm-row-main">
        <span className="gm-row-subject">{email.subject}</span>
        <span className="gm-row-snippet"> - {email.snippet}</span>
      </div>

      {email.hasAttachment && (
        <span className="gm-row-attachment">
          <Icon name="attach_file" size={16} />
          <span className="gm-row-attachment-name">{email.attachments[0]?.name}</span>
        </span>
      )}

      <span className="gm-row-date">{formatListDate(email.date)}</span>

      <div className="gm-row-actions" onClick={stop}>
        <button className="gm-icon-btn" onClick={() => archive(email.id)} aria-label="Archive" title="Archive">
          <Icon name="archive" size={20} />
        </button>
        <button className="gm-icon-btn" onClick={() => trash(email.id)} aria-label="Delete" title="Delete">
          <Icon name="delete" size={20} />
        </button>
        <button
          className="gm-icon-btn"
          onClick={() => toggleRead(email.id)}
          aria-label="Mark read"
          title={email.read ? 'Mark as unread' : 'Mark as read'}
        >
          <Icon name={email.read ? 'mark_email_unread' : 'mark_email_read'} size={20} />
        </button>
        <button className="gm-icon-btn" onClick={() => snooze(email.id)} aria-label="Snooze" title="Snooze">
          <Icon name="schedule" size={20} />
        </button>
      </div>
    </div>
  );
}
