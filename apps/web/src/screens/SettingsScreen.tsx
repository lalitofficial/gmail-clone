import type { ReactNode } from 'react';
import type { Category } from '@gmail-clone/shared';
import { useMailbox } from '../store/MailboxContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSettings, setSettings } from '../settings';
import { hrefSettings, type Route } from '../router';
import { Icon } from '../components/Icon';
import './Settings.css';

const SECTIONS: { id: string; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'labels', label: 'Labels' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'accounts', label: 'Accounts and Import' },
  { id: 'filters', label: 'Filters and Blocked Addresses' },
  { id: 'fwdandpop', label: 'Forwarding and POP/IMAP' },
  { id: 'addon', label: 'Add-ons' },
  { id: 'chat', label: 'Chat and Meet' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'offline', label: 'Offline' },
  { id: 'themes', label: 'Themes' },
];

const DENSITIES = [
  { id: 'default', label: 'Default' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'compact', label: 'Compact' },
] as const;

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'primary', label: 'Primary' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'social', label: 'Social' },
  { id: 'updates', label: 'Updates' },
];

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="gm-set-row">
      <div className="gm-set-label">
        <div>{label}</div>
        {hint && <div className="gm-set-hint">{hint}</div>}
      </div>
      <div className="gm-set-control">{children}</div>
    </div>
  );
}

export function SettingsScreen({ route }: { route: Extract<Route, { view: 'settings' }> }) {
  const { emails, labels } = useMailbox();
  const settings = useSettings();
  useDocumentTitle('Settings');
  const section = route.section;

  return (
    <div className="gm-settings">
      <div className="gm-settings-head">Settings</div>

      <div className="gm-settings-tabs">
        {SECTIONS.map((s) => (
          <a key={s.id} href={hrefSettings(s.id)} className={`gm-settings-tab${section === s.id ? ' gm-settings-tab--active' : ''}`}>
            {s.label}
          </a>
        ))}
      </div>

      <div className="gm-settings-body">
        {section === 'general' && (
          <>
            <SettingRow label="Language" hint="Gmail display language">
              <select className="gm-set-select" defaultValue="en"><option value="en">English (US)</option><option value="hi">Hindi</option></select>
            </SettingRow>
            <SettingRow label="Display density" hint="Applies live across the app">
              {DENSITIES.map((d) => (
                <label key={d.id} className="gm-set-radio">
                  <input type="radio" name="density" checked={settings.density === d.id} onChange={() => setSettings({ density: d.id })} /> {d.label}
                </label>
              ))}
            </SettingRow>
            <SettingRow label="Theme">
              {(['light', 'dark'] as const).map((t) => (
                <label key={t} className="gm-set-radio">
                  <input type="radio" name="theme" checked={settings.theme === t} onChange={() => setSettings({ theme: t })} /> {t === 'light' ? 'Light' : 'Dark'}
                </label>
              ))}
            </SettingRow>
          </>
        )}

        {section === 'themes' && (
          <SettingRow label="Theme" hint="Choose a light or dark appearance">
            {(['light', 'dark'] as const).map((t) => (
              <label key={t} className="gm-set-radio">
                <input type="radio" name="theme2" checked={settings.theme === t} onChange={() => setSettings({ theme: t })} /> {t === 'light' ? 'Light' : 'Dark'}
              </label>
            ))}
          </SettingRow>
        )}

        {section === 'inbox' && (
          <>
            <SettingRow label="Inbox type"><select className="gm-set-select" defaultValue="default"><option value="default">Default</option><option>Important first</option><option>Unread first</option></select></SettingRow>
            <SettingRow label="Categories" hint="Choose which tabs to show in the inbox">
              {CATEGORIES.map((c) => (
                <label key={c.id} className="gm-set-radio">
                  <input
                    type="checkbox"
                    checked={settings.tabs[c.id]}
                    disabled={c.id === 'primary'}
                    onChange={(e) => setSettings({ tabs: { ...settings.tabs, [c.id]: e.target.checked } })}
                  /> {c.label}
                </label>
              ))}
            </SettingRow>
          </>
        )}

        {section === 'labels' && (
          <div className="gm-set-labels">
            <div className="gm-set-subhead">Your labels</div>
            {labels.map((l) => (
              <div className="gm-set-label-row" key={l.id}>
                <span><Icon name="label" size={18} color={l.color} /> {l.name}</span>
                <span className="gm-set-muted">edit · remove</span>
              </div>
            ))}
          </div>
        )}

        {section === 'accounts' && (
          <SettingRow label="Send mail as" hint={`You have ${emails.length} conversations in this account`}>
            <span className="gm-set-muted">This account is managed on your local network.</span>
          </SettingRow>
        )}

        {!['general', 'labels', 'inbox', 'accounts', 'themes'].includes(section) && (
          <div className="gm-settings-placeholder">
            <Icon name="settings" size={40} color="var(--gm-color-outline-variant)" />
            <p>{SECTIONS.find((s) => s.id === section)?.label ?? 'Settings'} — no options to configure in this build yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
