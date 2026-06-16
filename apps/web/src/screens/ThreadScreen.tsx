import { useEffect, useState } from 'react';
import { formatListDate, formatThreadDateRelative, type Email } from '@gmail-clone/shared';
import { useMailbox } from '../store/MailboxContext';
import { useAuth } from '../auth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { api } from '../api/client';
import { hrefFolder, navigate, type Route } from '../router';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { AttachmentCard } from '../components/AttachmentCard';
import { printEmails } from '../printing/printEmail';
import './Thread.css';

export function ThreadScreen({ route }: { route: Extract<Route, { view: 'thread' }> }) {
  const { account } = useAuth();
  const { toggleStar, toggleRead, archive, trash, spam, openCompose, labels, setLabel } = useMailbox();
  const [messages, setMessages] = useState<Email[] | null>(null);
  const [openMenu, setOpenMenu] = useState<'move' | 'more' | 'label' | null>(null);
  const [showTrimmed, setShowTrimmed] = useState(false);
  const printAccount = { name: account.name, email: account.email };

  const toggleThreadLabel = (name: string, on: boolean) => {
    setLabel(route.id, name, on);
    setMessages((ms) =>
      ms?.map((m) => ({
        ...m,
        labels: on ? [...new Set([...m.labels, name])] : m.labels.filter((x) => x !== name),
      })) ?? ms,
    );
  };

  const threadId = route.id;
  const back = () => navigate(hrefFolder(route.folder));

  useEffect(() => {
    let alive = true;
    api.thread(account.email, threadId).then((m) => alive && setMessages(m)).catch(() => alive && setMessages([]));
    return () => {
      alive = false;
    };
  }, [account.email, threadId]);

  const subject = messages?.[0]?.subject ?? '';
  useDocumentTitle(subject || 'Gmail');

  if (!messages) return <div className="gm-thread" />;
  if (messages.length === 0) {
    return (
      <div className="gm-thread">
        <div className="gm-thread-toolbar">
          <button className="gm-icon-btn" onClick={back} aria-label="Back"><Icon name="arrow_back" size={20} /></button>
        </div>
        <div className="gm-thread-missing">Conversation not found.</div>
      </div>
    );
  }

  const last = messages[messages.length - 1];
  const anyStarred = messages.some((m) => m.starred);
  const replyPrefix = subject.startsWith('Re:') ? '' : 'Re: ';
  const lastFromMe = last.from.email.toLowerCase() === account.email.toLowerCase();
  const replyTo = lastFromMe ? last.to[0]?.email ?? '' : last.from.email;
  const reply = () => openCompose({ to: replyTo, subject: `${replyPrefix}${subject}`, threadId });
  const forward = () =>
    openCompose({
      subject: `Fwd: ${subject}`,
      threadId,
      body: `\n\n---------- Forwarded message ----------\nFrom: ${last.from.name} <${last.from.email}>\n\n${last.body}`,
    });
  const smartReplies = ['Thanks!', 'Sounds good.', 'Got it, thank you.'];

  return (
    <div className="gm-thread">
      <div className="gm-thread-toolbar">
        <button className="gm-icon-btn" onClick={back} aria-label="Back" title="Back"><Icon name="arrow_back" size={20} /></button>
        <div className="gm-thread-toolbar-divider" />
        <button className="gm-icon-btn" onClick={() => { archive(threadId); back(); }} aria-label="Archive" title="Archive"><Icon name="archive" size={20} /></button>
        <button className="gm-icon-btn" aria-label="Report spam" title="Report spam" onClick={() => { spam(threadId); back(); }}><Icon name="report" size={20} /></button>
        <button className="gm-icon-btn" onClick={() => { trash(threadId); back(); }} aria-label="Delete" title="Delete"><Icon name="delete" size={20} /></button>
        <button className="gm-icon-btn" onClick={() => { toggleRead(threadId); back(); }} aria-label="Mark unread" title="Mark as unread"><Icon name="mark_email_unread" size={20} /></button>
        <div className="gm-thread-menu-wrap">
          <button className="gm-icon-btn" aria-label="Labels" title="Labels" onClick={() => setOpenMenu((v) => (v === 'label' ? null : 'label'))}><Icon name="label" size={20} /></button>
          {openMenu === 'label' && (
            <div className="gm-thread-menu">
              <div className="gm-thread-menu-title">Label as:</div>
              {labels.map((l) => {
                const on = last.labels.includes(l.name);
                return (
                  <button key={l.id} onClick={() => toggleThreadLabel(l.name, !on)}>
                    <Icon name={on ? 'check_box' : 'check_box_outline_blank'} size={18} color={on ? 'var(--gm-color-primary)' : undefined} />
                    {l.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="gm-thread-menu-wrap">
          <button className="gm-icon-btn" aria-label="Move" title="Move to" onClick={() => setOpenMenu((v) => (v === 'move' ? null : 'move'))}><Icon name="drive_file_move" size={20} /></button>
          {openMenu === 'move' && (
            <div className="gm-thread-menu">
              <div className="gm-thread-menu-title">Move to:</div>
              <button onClick={() => { archive(threadId); back(); }}><Icon name="archive" size={18} />Archive</button>
              <button onClick={() => { spam(threadId); back(); }}><Icon name="report" size={18} />Spam</button>
              <button onClick={() => { trash(threadId); back(); }}><Icon name="delete" size={18} />Trash</button>
            </div>
          )}
        </div>
        <div className="gm-thread-menu-wrap">
          <button className="gm-icon-btn" aria-label="More" title="More" onClick={() => setOpenMenu((v) => (v === 'more' ? null : 'more'))}><Icon name="more_vert" size={20} /></button>
          {openMenu === 'more' && (
            <div className="gm-thread-menu">
              <button onClick={() => { toggleRead(threadId); back(); }}>Mark as unread</button>
              <button onClick={() => printEmails(subject, messages, printAccount)}>Print all</button>
              <button onClick={() => navigator.clipboard?.writeText(location.href)}>Copy link</button>
            </div>
          )}
        </div>
      </div>

      <div className="gm-thread-body">
        <div className="gm-thread-subject-row">
          <div className="gm-thread-subject-main">
            <h1 className="gm-thread-subject">{subject}</h1>
            {messages.length > 1 && <span className="gm-thread-count-chip">{messages.length}</span>}
            {last.folder === 'inbox' && (
              <span className="gm-thread-label-chip">
                Inbox
                <button className="gm-chip-x" aria-label="Remove label" onClick={() => { archive(threadId); back(); }}><Icon name="close" size={14} /></button>
              </span>
            )}
          </div>
          <div className="gm-thread-subject-actions">
            <button className="gm-icon-btn" aria-label="Star" onClick={() => toggleStar(threadId)}>
              <Icon name="star" size={20} fill={anyStarred} color={anyStarred ? 'var(--gm-color-star)' : undefined} />
            </button>
            <button className="gm-icon-btn" aria-label="Print all" title="Print all" onClick={() => printEmails(subject, messages, printAccount)}><Icon name="print" size={20} /></button>
            <button className="gm-icon-btn" aria-label="In new window" title="In new window" onClick={() => window.open(location.href, '_blank', 'noopener,noreferrer')}><Icon name="open_in_new" size={20} /></button>
          </div>
        </div>

        {(() => {
          const renderMessage = (m: Email, i: number) => (
            <ThreadMessage
              key={m.id}
              email={m}
              me={account.email}
              defaultExpanded={i === messages.length - 1}
              onReply={() => openCompose({ to: m.from.email.toLowerCase() === account.email.toLowerCase() ? m.to[0]?.email ?? '' : m.from.email, subject: `${replyPrefix}${subject}`, threadId })}
              onToggleStar={() => toggleStar(threadId)}
              onPrint={() => printEmails(subject, [m], printAccount)}
            />
          );

          // Gmail trims long threads: first message, a "N hidden" band, then the last two.
          const TRIM_FROM = 5;
          const hidden = messages.length - 3;
          if (messages.length < TRIM_FROM || showTrimmed) {
            return messages.map((m, i) => renderMessage(m, i));
          }
          return (
            <>
              {renderMessage(messages[0], 0)}
              <button
                className="gm-thread-trim"
                onClick={() => setShowTrimmed(true)}
                title={`Show ${hidden} more message${hidden === 1 ? '' : 's'}`}
              >
                <span className="gm-thread-trim-badge">{hidden}</span>
                <span className="gm-thread-trim-line" />
              </button>
              {renderMessage(messages[messages.length - 2], messages.length - 2)}
              {renderMessage(messages[messages.length - 1], messages.length - 1)}
            </>
          );
        })()}

        <div className="gm-smart-replies">
          {smartReplies.map((r) => (
            <button key={r} className="gm-smart-chip" onClick={() => openCompose({ to: replyTo, subject: `${replyPrefix}${subject}`, body: r, threadId })}>
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
  );
}

function ThreadMessage({
  email,
  me,
  defaultExpanded,
  onReply,
  onToggleStar,
  onPrint,
}: {
  email: Email;
  me: string;
  defaultExpanded: boolean;
  onReply: () => void;
  onToggleStar: () => void;
  onPrint: () => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [menuOpen, setMenuOpen] = useState(false);
  const fromMe = email.from.email.toLowerCase() === me.toLowerCase();
  const toLabel = fromMe ? `to ${email.to.map((c) => c.name || c.email).join(', ')}` : 'to me';

  if (!expanded) {
    return (
      <button className="gm-msg-collapsed" onClick={() => setExpanded(true)}>
        <Avatar initial={email.from.initial} color={email.from.avatarColor} size={36} />
        <div className="gm-msg-collapsed-text">
          <span className="gm-msg-collapsed-sender">{fromMe ? 'me' : email.from.name}</span>
          <span className="gm-msg-collapsed-snippet">{email.snippet}</span>
        </div>
        <span className="gm-msg-collapsed-date">{formatListDate(email.date)}</span>
      </button>
    );
  }

  return (
    <div className="gm-message">
      <Avatar initial={email.from.initial} color={email.from.avatarColor} size={40} />
      <div className="gm-message-content">
        <div className="gm-message-head">
          <div className="gm-message-meta">
            <span className="gm-message-sender">{fromMe ? 'me' : email.from.name}</span>
            <span className="gm-message-email">&lt;{email.from.email}&gt;</span>
            <div className="gm-message-to">{toLabel}<Icon name="arrow_drop_down" size={18} /></div>
          </div>
          <div className="gm-message-actions">
            <span className="gm-message-date">{formatThreadDateRelative(email.date)}</span>
            <button className="gm-icon-btn" onClick={onToggleStar} aria-label="Star">
              <Icon name="star" size={20} fill={email.starred} color={email.starred ? 'var(--gm-color-star)' : undefined} />
            </button>
            <button className="gm-icon-btn" aria-label="Reply" onClick={onReply}><Icon name="reply" size={20} /></button>
            <div className="gm-message-menu-wrap">
              <button className="gm-icon-btn" aria-label="More" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><Icon name="more_vert" size={20} /></button>
              {menuOpen && (
                <div className="gm-message-menu">
                  <button onClick={() => { setMenuOpen(false); onReply(); }}>Reply</button>
                  <button onClick={() => { setMenuOpen(false); onPrint(); }}>Print</button>
                </div>
              )}
            </div>
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
      </div>
    </div>
  );
}
