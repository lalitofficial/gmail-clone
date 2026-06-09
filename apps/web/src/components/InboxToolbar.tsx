import { Icon } from './Icon';
import './InboxToolbar.css';

export function InboxToolbar({ count }: { count: number }) {
  return (
    <div className="gm-toolbar">
      <div className="gm-toolbar-left">
        <button className="gm-toolbar-check gm-icon-btn" aria-label="Select">
          <Icon name="check_box_outline_blank" size={18} />
          <Icon name="arrow_drop_down" size={18} />
        </button>
        <button className="gm-icon-btn" aria-label="Refresh" title="Refresh">
          <Icon name="refresh" size={20} />
        </button>
        <button className="gm-icon-btn" aria-label="More" title="More">
          <Icon name="more_vert" size={20} />
        </button>
      </div>

      <div className="gm-toolbar-right">
        <span className="gm-toolbar-range">1–{count} of {count}</span>
        <button className="gm-icon-btn" aria-label="Newer" title="Newer" disabled>
          <Icon name="chevron_left" size={20} />
        </button>
        <button className="gm-icon-btn" aria-label="Older" title="Older">
          <Icon name="chevron_right" size={20} />
        </button>
        <button className="gm-toolbar-kbd gm-icon-btn" aria-label="Input tools">
          <Icon name="keyboard" size={20} />
          <Icon name="arrow_drop_down" size={18} />
        </button>
      </div>
    </div>
  );
}
