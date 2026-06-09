import { Icon } from './Icon';
import { GmailLogo } from './GmailLogo';
import { GeminiIcon } from './GeminiIcon';
import { SearchField } from './SearchField';
import { AccountMenu } from './AccountMenu';
import { hrefSettings, navigate } from '../router';
import './TopBar.css';

export function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className="gm-topbar">
      <div className="gm-topbar-left">
        <button className="gm-icon-btn" onClick={onToggleSidebar} aria-label="Main menu">
          <Icon name="menu" size={24} />
        </button>
        <GmailLogo />
      </div>

      <div className="gm-topbar-search">
        <SearchField />
      </div>

      <div className="gm-topbar-right">
        <button className="gm-icon-btn" aria-label="Support">
          <Icon name="help" size={24} />
        </button>
        <button className="gm-icon-btn" aria-label="Settings" onClick={() => navigate(hrefSettings())}>
          <Icon name="settings" size={24} />
        </button>
        <button className="gm-upgrade">
          <GeminiIcon size={16} />
          <span>Upgrade</span>
        </button>
        <button className="gm-icon-btn" aria-label="Gemini">
          <GeminiIcon size={24} />
        </button>
        <button className="gm-icon-btn" aria-label="Google apps">
          <Icon name="apps" size={24} />
        </button>
        <AccountMenu />
      </div>
    </header>
  );
}
