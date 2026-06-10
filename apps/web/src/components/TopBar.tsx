import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { GmailLogo } from './GmailLogo';
import { GeminiIcon } from './GeminiIcon';
import { SearchField } from './SearchField';
import { AccountMenu } from './AccountMenu';
import { GoogleAppsMenu } from './GoogleAppsMenu';
import { hrefSettings, navigate } from '../router';
import './TopBar.css';

export function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [menu, setMenu] = useState<'support' | 'settings' | 'apps' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenu(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggle = (next: typeof menu) => setMenu((current) => (current === next ? null : next));
  const openExternal = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

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

      <div className="gm-topbar-right" ref={menuRef}>
        <button className="gm-icon-btn" aria-label="Support" aria-expanded={menu === 'support'} onClick={() => toggle('support')}>
          <Icon name="help" size={24} />
        </button>
        <button className="gm-icon-btn" aria-label="Settings" aria-expanded={menu === 'settings'} onClick={() => toggle('settings')}>
          <Icon name="settings" size={24} />
        </button>
        <button className="gm-upgrade" onClick={() => window.open('https://one.google.com/', '_blank', 'noopener,noreferrer')}>
          <Icon name="workspace_premium" size={18} color="#0b57d0" />
          <span>Upgrade</span>
        </button>
        <button className="gm-icon-btn" aria-label="Gemini" onClick={() => window.open('https://gemini.google.com/', '_blank', 'noopener,noreferrer')}>
          <GeminiIcon size={24} />
        </button>
        <button className="gm-icon-btn" aria-label="Google apps" aria-expanded={menu === 'apps'} onClick={() => toggle('apps')}>
          <Icon name="apps" size={24} />
        </button>
        <AccountMenu />

        {menu === 'support' && (
          <div className="gm-topbar-menu gm-support-menu">
            <button onClick={() => openExternal('https://support.google.com/mail/')}><Icon name="help" size={20} />Help</button>
            <button onClick={() => openExternal('https://support.google.com/a/users/answer/9259748')}><Icon name="school" size={20} />Training</button>
            <button onClick={() => openExternal('https://workspaceupdates.googleblog.com/search/label/Gmail')}><Icon name="new_releases" size={20} />Updates</button>
            <div className="gm-menu-divider" />
            <button onClick={() => openExternal('https://support.google.com/mail/answer/9212652')}><Icon name="feedback" size={20} />Send feedback to Google</button>
          </div>
        )}

        {menu === 'settings' && (
          <div className="gm-topbar-menu gm-quick-settings">
            <div className="gm-quick-settings-head">
              <strong>Quick settings</strong>
              <button className="gm-icon-btn" aria-label="Close settings" onClick={() => setMenu(null)}><Icon name="close" size={20} /></button>
            </div>
            <button className="gm-see-all-settings" onClick={() => { setMenu(null); navigate(hrefSettings()); }}>
              See all settings
            </button>
            <div className="gm-quick-section">
              <strong>Density</strong>
              <label><input type="radio" name="quick-density" defaultChecked onChange={() => { document.documentElement.dataset.density = 'default'; }} /> Default</label>
              <label><input type="radio" name="quick-density" onChange={() => { document.documentElement.dataset.density = 'comfortable'; }} /> Comfortable</label>
              <label><input type="radio" name="quick-density" onChange={() => { document.documentElement.dataset.density = 'compact'; }} /> Compact</label>
            </div>
            <div className="gm-quick-section">
              <strong>Theme</strong>
              <button className="gm-theme-preview" onClick={() => navigate(hrefSettings('themes'))}>View all</button>
            </div>
          </div>
        )}

        {menu === 'apps' && <GoogleAppsMenu onClose={() => setMenu(null)} />}
      </div>
    </header>
  );
}
