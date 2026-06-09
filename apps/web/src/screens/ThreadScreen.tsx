import { formatThreadDateRelative } from '@gmail-clone/shared';
import { useMailbox } from '../store/MailboxContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { hrefFolder, navigate, type Route } from '../router';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { AttachmentCard } from '../components/AttachmentCard';
import './Thread.css';

export function ThreadScreen({ route }: { route: Extract<Route, { view: 'thread' }> }) {
  const { getEmail, toggleStar, toggleRead, archive, trash, openCompose } = useMailbox();
  const email = getEmail(route.id);
  const back = () => navigate(hrefFolder(route.folder));
  useDocumentTitle(email ? email.subject : 'Gmail');

  if (!email) {
    return (
      <div className="gm-thread">
        <div className="gm-thread-toolbar">
          <button className="gm-icon-btn" onClick={back} aria-label="Back">
            <Icon name="arrow_back" size={20} />
          </button>
        </div>
        <div className="gm-thread-missing">Conversation not found.</div>
      </div>
    );
  }

  const replyPrefix = email.subject.startsWith('Re:') ? '' : 'Re: ';
  const reply = () => openCompose({ to: email.from.email, subject: `${replyPrefix}${email.subject}` });
  const forward = () =>
    openCompose({
      subject: `Fwd: ${email.subject}`,
      body: `\n\n---------- Forwarded message ----------\nFrom: ${email.from.name} <${email.from.email}>\n\n${email.body}`,
    });
  const smartReplies = ['Thanks!', 'Sounds good.', 'Got it, thank you.'];

  return (
    <div className="gm-thread">
      <div className="gm-thread-toolbar">
        <button className="gm-icon-btn" onClick={back} aria-label="Back" title="Back"><Icon name="arrow_back" size={20} /></button>
        <div className="gm-thread-toolbar-divider" />
        <button className="gm-icon-btn" onClick={() => { archive(email.id); back(); }} aria-label="Archive" title="Archive"><Icon name="archive" size={20} /></button>
        <button className="gm-icon-btn" aria-label="Report spam" title="Report spam"><Icon name="report" size={20} /></button>
        <button className="gm-icon-btn" onClick={() => { trash(email.id); back(); }} aria-label="Delete" title="Delete"><Icon name="delete" size={20} /></button>
        <button className="gm-icon-btn" onClick={() => { toggleRead(email.id); back(); }} aria-label="Mark unread" title="Mark as unread"><Icon name="mark_email_unread" size={20} /></button>
        <button className="gm-icon-btn" aria-label="Move" title="Move to"><Icon name="drive_file_move" size={20} /></button>
        <button className="gm-icon-btn" aria-label="More" title="More"><Icon name="more_vert" size={20} /></button>
      </div>

      <div className="gm-thread-body">
        <div className="gm-thread-subject-row">
          <div className="gm-thread-subject-main">
            <h1 className="gm-thread-subject">{email.subject}</h1>
            {email.folder === 'inbox' && (
              <span className="gm-thread-label-chip">
                Inbox
                <button className="gm-chip-x" aria-label="Remove label"><Icon name="close" size={14} /></button>
              </span>
            )}
          </div>
          <div className="gm-thread-subject-actions">
            <button className="gm-icon-btn" aria-label="Expand all"><Icon name="unfold_more" size={20} /></button>
            <button className="gm-icon-btn" aria-label="Print all"><Icon name="print" size={20} /></button>
            <button className="gm-icon-btn" aria-label="In new window"><Icon name="open_in_new" size={20} /></button>
          </div>
        </div>

        <div className="gm-message">
          <Avatar initial={email.from.initial} color={email.from.avatarColor} size={40} />
          <div className="gm-message-content">
            <div className="gm-message-head">
              <div className="gm-message-meta">
                <span className="gm-message-sender">{email.from.name}</span>
                <span className="gm-message-email">&lt;{email.from.email}&gt;</span>
                <div className="gm-message-to">to me<Icon name="arrow_drop_down" size={18} /></div>
              </div>
              <div className="gm-message-actions">
                <span className="gm-message-date">{formatThreadDateRelative(email.date)}</span>
                <button className="gm-icon-btn" onClick={() => toggleStar(email.id)} aria-label="Star">
                  <Icon name="star" size={20} fill={email.starred} color={email.starred ? 'var(--gm-color-star)' : undefined} />
                </button>
                <button className="gm-icon-btn" aria-label="Add reaction"><Icon name="add_reaction" size={20} /></button>
                <button className="gm-icon-btn" aria-label="Reply" onClick={reply}><Icon name="reply" size={20} /></button>
                <button className="gm-icon-btn" aria-label="More"><Icon name="more_vert" size={20} /></button>
              </div>
            </div>

            <div className="gm-message-text">
              {email.body.split('\n').map((line, i) => (
                <p key={i} className={line === '' ? 'gm-message-gap' : undefined}>{line}</p>
              ))}
            </div>

            {email.attachments.length > 0 && (
              <div className="gm-thread-attachments">
                <div className="gm-thread-attachments-head">
                  {email.attachments.length} Attachment{email.attachments.length > 1 ? 's' : ''}
                </div>
                <div className="gm-thread-attachments-list">
                  {email.attachments.map((a) => <AttachmentCard key={a.id} attachment={a} />)}
                </div>
              </div>
            )}

            <div className="gm-smart-replies">
              {smartReplies.map((r) => (
                <button key={r} className="gm-smart-chip" onClick={() => openCompose({ to: email.from.email, subject: `${replyPrefix}${email.subject}`, body: r })}>
                  {r}
                </button>
              ))}
            </div>

            <div className="gm-thread-reply-actions">
              <button className="gm-reply-btn" onClick={reply}><Icon name="reply" size={18} />Reply</button>
              <button className="gm-reply-btn" onClick={forward}><Icon name="forward" size={18} />Forward</button>
              <button className="gm-reply-btn gm-reply-btn--icon" aria-label="React"><Icon name="add_reaction" size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
