import { useState } from 'react';
import { Icon } from './Icon';
import { useMailbox } from '../store/MailboxContext';
import './InboxToolbar.css';

export function InboxToolbar({ count, ids }: { count: number; ids: string[] }) {
  const [menu, setMenu] = useState<'select' | 'more' | 'input' | null>(null);
  const { refresh, selected, selectMany, clearSelected, bulk } = useMailbox();
  const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));
  const someSelected = selected.length > 0;

  const toggleAll = () => (allSelected ? clearSelected() : selectMany(ids));

  return (
    <div className="gm-toolbar">
      <div className="gm-toolbar-left">
        <div className="gm-toolbar-menu-wrap">
        <button className="gm-toolbar-check gm-icon-btn" aria-label="Select" onClick={toggleAll}>
          <Icon
            name={allSelected ? 'check_box' : someSelected ? 'indeterminate_check_box' : 'check_box_outline_blank'}
            size={18}
            color={someSelected ? 'var(--gm-color-primary)' : undefined}
          />
          <span
            className="gm-toolbar-caret"
            role="button"
            aria-label="Select options"
            onClick={(event) => {
              event.stopPropagation();
              setMenu((current) => current === 'select' ? null : 'select');
            }}
          ><Icon name="arrow_drop_down" size={18} /></span>
        </button>
        {menu === 'select' && (
          <div className="gm-toolbar-menu">
            <button onClick={() => { selectMany(ids); setMenu(null); }}>All</button>
            <button onClick={() => { clearSelected(); setMenu(null); }}>None</button>
            <button onClick={() => { selectMany(ids.filter((id) => !selected.includes(id))); setMenu(null); }}>Invert selection</button>
          </div>
        )}
        </div>

        {someSelected ? (
          <>
            <button className="gm-icon-btn" aria-label="Archive" title="Archive" onClick={() => bulk('archive')}>
              <Icon name="archive" size={20} />
            </button>
            <button className="gm-icon-btn" aria-label="Report spam" title="Report spam" onClick={() => bulk('spam')}>
              <Icon name="report" size={20} />
            </button>
            <button className="gm-icon-btn" aria-label="Delete" title="Delete" onClick={() => bulk('trash')}>
              <Icon name="delete" size={20} />
            </button>
            <button className="gm-icon-btn" aria-label="Mark as read" title="Mark as read" onClick={() => bulk('read')}>
              <Icon name="mark_email_read" size={20} />
            </button>
            <button className="gm-icon-btn" aria-label="Mark as unread" title="Mark as unread" onClick={() => bulk('unread')}>
              <Icon name="mark_email_unread" size={20} />
            </button>
          </>
        ) : (
          <>
            <button className="gm-icon-btn" aria-label="Refresh" title="Refresh" onClick={refresh}>
              <Icon name="refresh" size={20} />
            </button>
            <div className="gm-toolbar-menu-wrap">
            <button className="gm-icon-btn" aria-label="More" title="More" onClick={() => setMenu((current) => current === 'more' ? null : 'more')}>
              <Icon name="more_vert" size={20} />
            </button>
            {menu === 'more' && (
              <div className="gm-toolbar-menu">
                <button onClick={() => { selectMany(ids); setMenu(null); }}>Select all conversations</button>
                <button onClick={() => { refresh(); setMenu(null); }}>Refresh inbox</button>
                <button onClick={() => setMenu(null)}>Filter messages like these</button>
              </div>
            )}
            </div>
          </>
        )}
      </div>

      <div className="gm-toolbar-right">
        <span className="gm-toolbar-range">1–{count} of {count}</span>
        <button className="gm-icon-btn" aria-label="Newer" title="Newer" disabled>
          <Icon name="chevron_left" size={20} />
        </button>
        <button className="gm-icon-btn" aria-label="Older" title="Older">
          <Icon name="chevron_right" size={20} />
        </button>
        <div className="gm-toolbar-menu-wrap">
        <button className="gm-toolbar-kbd gm-icon-btn" aria-label="Input tools" onClick={() => setMenu((current) => current === 'input' ? null : 'input')}>
          <Icon name="keyboard" size={20} />
          <Icon name="arrow_drop_down" size={18} />
        </button>
        {menu === 'input' && (
          <div className="gm-toolbar-menu gm-toolbar-menu--right">
            <button onClick={() => setMenu(null)}>English</button>
            <button onClick={() => setMenu(null)}>Hindi transliteration</button>
            <button onClick={() => setMenu(null)}>Input tools settings</button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
