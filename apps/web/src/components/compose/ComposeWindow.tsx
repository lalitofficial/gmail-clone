import { Icon } from '../Icon';
import { useMailbox, type ComposeWindow as ComposeState } from '../../store/MailboxContext';

export function ComposeWindow({ window: w, index }: { window: ComposeState; index: number }) {
  const { updateCompose, closeCompose, toggleMinimize, sendCompose } = useMailbox();
  const right = 24 + index * 80; // stack minimized headers; full windows overlap toward the right

  return (
    <div
      className={`gm-compose-win${w.minimized ? ' gm-compose-win--min' : ''}`}
      style={{ right: w.minimized ? right : 72 }}
    >
      <div className="gm-compose-header" onClick={() => w.minimized && toggleMinimize(w.id)}>
        <span className="gm-compose-title">{w.subject || 'New Message'}</span>
        <div className="gm-compose-header-actions">
          <button className="gm-compose-hbtn" onClick={(e) => { e.stopPropagation(); toggleMinimize(w.id); }} aria-label="Minimize">
            <Icon name={w.minimized ? 'open_in_full' : 'remove'} size={18} />
          </button>
          <button className="gm-compose-hbtn" aria-label="Full screen">
            <Icon name="open_in_full" size={16} />
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
              <input
                className="gm-compose-input"
                placeholder="To"
                value={w.to}
                onChange={(e) => updateCompose(w.id, { to: e.target.value })}
              />
              <span className="gm-compose-ccbcc">Cc Bcc</span>
            </div>
            <div className="gm-compose-field">
              <input
                className="gm-compose-input"
                placeholder="Subject"
                value={w.subject}
                onChange={(e) => updateCompose(w.id, { subject: e.target.value })}
              />
            </div>
          </div>

          <textarea
            className="gm-compose-body"
            value={w.body}
            onChange={(e) => updateCompose(w.id, { body: e.target.value })}
          />

          <div className="gm-compose-format">
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
          </div>

          <div className="gm-compose-footer">
            <div className="gm-compose-send-group">
              <button className="gm-compose-send" onClick={() => sendCompose(w.id)}>
                Send
              </button>
              <button className="gm-compose-send-caret" aria-label="Send options">
                <Icon name="arrow_drop_down" size={20} color="#fff" />
              </button>
            </div>
            <div className="gm-compose-tools">
              {['format_size', 'attach_file', 'link', 'mood', 'add_to_drive', 'image', 'lock', 'edit', 'more_vert'].map((ic) => (
                <button key={ic} className="gm-icon-btn" style={{ width: 32, height: 32 }} aria-label={ic}>
                  <Icon name={ic} size={18} />
                </button>
              ))}
            </div>
            <button className="gm-icon-btn gm-compose-trash" onClick={() => closeCompose(w.id)} aria-label="Discard draft">
              <Icon name="delete" size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
