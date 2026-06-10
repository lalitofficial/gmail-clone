import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { Attachment } from '@gmail-clone/shared';
import { Icon } from '../Icon';
import { useMailbox, type ComposeWindow as ComposeState } from '../../store/MailboxContext';
import { useAuth } from '../../auth';
import { api } from '../../api/client';

const humanSize = (bytes: number) =>
  bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

export function ComposeWindow({ window: w, index }: { window: ComposeState; index: number }) {
  const { updateCompose, closeCompose, toggleMinimize, sendCompose } = useMailbox();
  const { account } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const [sendOptions, setSendOptions] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const right = 24 + index * 80;

  const send = () => {
    if (!w.to.trim()) {
      setError('Please specify at least one recipient.');
      return;
    }
    setError('');
    sendCompose(w.id);
  };

  const discard = () => {
    if (w.draftId) api.deleteDraft(account.email, w.draftId).catch(() => {});
    closeCompose(w.id);
  };

  // Autosave to Drafts (debounced) whenever there's content.
  useEffect(() => {
    if (w.minimized) return;
    const hasContent = w.to || w.cc || w.bcc || w.subject || w.body || w.attachments.length > 0;
    if (!hasContent) return;
    const t = setTimeout(() => {
      api
        .saveDraft(account.email, { id: w.draftId, to: w.to, cc: w.cc, bcc: w.bcc, subject: w.subject, body: w.body, attachments: w.attachments })
        .then((r) => { if (!w.draftId) updateCompose(w.id, { draftId: r.id }); })
        .catch(() => {});
    }, 900);
    return () => clearTimeout(t);
  }, [w.to, w.cc, w.bcc, w.subject, w.body, w.attachments, w.draftId, w.id, w.minimized, account.email, updateCompose]);

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])];
    const atts: Attachment[] = files.map((f, i) => ({
      id: `${w.id}-att-${Date.now()}-${i}`,
      name: f.name,
      kind: (f.name.split('.').pop() ?? 'file').toLowerCase(),
      size: humanSize(f.size),
    }));
    updateCompose(w.id, { attachments: [...w.attachments, ...atts] });
    e.target.value = '';
  };

  return (
    <div
      className={`gm-compose-win${w.minimized ? ' gm-compose-win--min' : ''}${expanded ? ' gm-compose-win--expanded' : ''}`}
      style={{ right: w.minimized ? right : 72 }}
    >
      <div className="gm-compose-header" onClick={() => w.minimized && toggleMinimize(w.id)}>
        <span className="gm-compose-title">{w.subject || 'New Message'}</span>
        <div className="gm-compose-header-actions">
          <button className="gm-compose-hbtn" onClick={(e) => { e.stopPropagation(); toggleMinimize(w.id); }} aria-label="Minimize">
            <Icon name={w.minimized ? 'open_in_full' : 'remove'} size={18} />
          </button>
          <button className="gm-compose-hbtn" aria-label={expanded ? 'Exit full screen' : 'Full screen'} onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}>
            <Icon name={expanded ? 'close_fullscreen' : 'open_in_full'} size={16} />
          </button>
          <button className="gm-compose-hbtn" onClick={(e) => { e.stopPropagation(); closeCompose(w.id); }} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>
      </div>

      {!w.minimized && (
        <>
          <div className="gm-compose-fields">
            <div className="gm-compose-field">
              <input className="gm-compose-input" placeholder="To" value={w.to} onChange={(e) => updateCompose(w.id, { to: e.target.value })} />
              <span className="gm-compose-ccbcc">
                <button onClick={() => setShowCc((v) => !v)}>Cc</button>
                <button onClick={() => setShowBcc((v) => !v)}>Bcc</button>
              </span>
            </div>
            {showCc && <div className="gm-compose-field"><input className="gm-compose-input" placeholder="Cc" value={w.cc} onChange={(e) => updateCompose(w.id, { cc: e.target.value })} /></div>}
            {showBcc && <div className="gm-compose-field"><input className="gm-compose-input" placeholder="Bcc" value={w.bcc} onChange={(e) => updateCompose(w.id, { bcc: e.target.value })} /></div>}
            <div className="gm-compose-field">
              <input className="gm-compose-input" placeholder="Subject" value={w.subject} onChange={(e) => updateCompose(w.id, { subject: e.target.value })} />
            </div>
          </div>

          <textarea className="gm-compose-body" value={w.body} onChange={(e) => updateCompose(w.id, { body: e.target.value })} />

          {w.attachments.length > 0 && (
            <div className="gm-compose-attachments">
              {w.attachments.map((a) => (
                <span key={a.id} className="gm-compose-att-chip">
                  <Icon name="description" size={16} />
                  <span className="gm-compose-att-name">{a.name}</span>
                  <span className="gm-compose-att-size">({a.size})</span>
                  <button aria-label="Remove" onClick={() => updateCompose(w.id, { attachments: w.attachments.filter((x) => x.id !== a.id) })}>
                    <Icon name="close" size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {error && <div className="gm-compose-error"><Icon name="error" size={16} />{error}</div>}

          {showFormat && <div className="gm-compose-format">
            <button className="gm-fmt-btn" aria-label="Undo"><Icon name="undo" size={18} /></button>
            <button className="gm-fmt-btn" aria-label="Redo"><Icon name="redo" size={18} /></button>
            <button className="gm-fmt-font">Sans Serif<Icon name="arrow_drop_down" size={18} /></button>
            <span className="gm-fmt-sep" />
            <button className="gm-fmt-btn" aria-label="Bold"><Icon name="format_bold" size={18} /></button>
            <button className="gm-fmt-btn" aria-label="Italic"><Icon name="format_italic" size={18} /></button>
            <button className="gm-fmt-btn" aria-label="Underline"><Icon name="format_underlined" size={18} /></button>
            <button className="gm-fmt-btn" aria-label="Text color"><Icon name="format_color_text" size={18} /></button>
            <span className="gm-fmt-sep" />
            <button className="gm-fmt-btn" aria-label="Align"><Icon name="format_align_left" size={18} /></button>
            <button className="gm-fmt-btn" aria-label="Numbered list"><Icon name="format_list_numbered" size={18} /></button>
            <button className="gm-fmt-btn" aria-label="Bulleted list"><Icon name="format_list_bulleted" size={18} /></button>
            <button className="gm-fmt-btn" aria-label="More formatting"><Icon name="more_vert" size={18} /></button>
          </div>}

          <div className="gm-compose-footer">
            <div className="gm-compose-send-group">
              <button className="gm-compose-send" onClick={send}>Send</button>
              <button className="gm-compose-send-caret" aria-label="Send options" onClick={() => setSendOptions((v) => !v)}>
                <Icon name="arrow_drop_down" size={20} color="#fff" />
              </button>
              {sendOptions && (
                <div className="gm-compose-send-menu">
                  <button onClick={send}><Icon name="schedule_send" size={18} />Schedule send</button>
                </div>
              )}
            </div>
            <div className="gm-compose-tools">
              <button className={`gm-icon-btn${showFormat ? ' gm-compose-tool--active' : ''}`} style={{ width: 32, height: 32 }} aria-label="Formatting" onClick={() => setShowFormat((v) => !v)}><Icon name="format_size" size={18} /></button>
              <button className="gm-icon-btn" style={{ width: 32, height: 32 }} aria-label="Attach files" onClick={() => fileRef.current?.click()}><Icon name="attach_file" size={18} /></button>
              {['link', 'mood', 'add_to_drive', 'image', 'lock', 'edit', 'more_vert'].map((ic) => (
                <button key={ic} className="gm-icon-btn" style={{ width: 32, height: 32 }} aria-label={ic}><Icon name={ic} size={18} /></button>
              ))}
              <input ref={fileRef} type="file" multiple hidden onChange={onFiles} />
            </div>
            <button className="gm-icon-btn gm-compose-trash" onClick={discard} aria-label="Discard draft"><Icon name="delete" size={18} /></button>
          </div>
        </>
      )}
    </div>
  );
}
