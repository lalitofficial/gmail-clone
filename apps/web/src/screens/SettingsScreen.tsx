import type { ReactNode } from 'react';
import { labels as labelData } from '@gmail-clone/shared';
import { useMailbox } from '../store/MailboxContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
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
  const { emails } = useMailbox();
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
            <SettingRow label="Maximum page size" hint="Conversations per page">
              <select className="gm-set-select" defaultValue="50"><option>25</option><option>50</option><option>100</option></select>
            </SettingRow>
            <SettingRow label="Display density">
              {['Default', 'Comfortable', 'Compact'].map((d, i) => (
                <label key={d} className="gm-set-radio"><input type="radio" name="density" defaultChecked={i === 0} /> {d}</label>
              ))}
            </SettingRow>
            <SettingRow label="Images" hint="Choose whether to show images in messages">
              {['Always display external images', 'Ask before displaying external images'].map((d, i) => (
                <label key={d} className="gm-set-radio"><input type="radio" name="images" defaultChecked={i === 0} /> {d}</label>
              ))}
            </SettingRow>
            <SettingRow label="Default reply behavior">
              {['Reply', 'Reply all'].map((d, i) => (
                <label key={d} className="gm-set-radio"><input type="radio" name="reply" defaultChecked={i === 0} /> {d}</label>
              ))}
            </SettingRow>
          </>
        )}

        {section === 'labels' && (
          <div className="gm-set-labels">
            <div className="gm-set-subhead">Labels</div>
            {['Inbox', 'Starred', 'Snoozed', 'Important', 'Sent', 'Drafts'].map((l) => (
              <div className="gm-set-label-row" key={l}><span>{l}</span><span className="gm-set-muted">show · hide</span></div>
            ))}
            <div className="gm-set-subhead">Your labels</div>
            {labelData.map((l) => (
              <div className="gm-set-label-row" key={l.id}>
                <span><Icon name="label" size={18} color={l.color} /> {l.name}</span>
                <span className="gm-set-muted">edit · remove</span>
              </div>
            ))}
          </div>
        )}

        {section === 'inbox' && (
          <>
            <SettingRow label="Inbox type"><select className="gm-set-select" defaultValue="default"><option value="default">Default</option><option>Important first</option><option>Unread first</option></select></SettingRow>
            <SettingRow label="Categories" hint="Choose which tabs to show">
              {['Primary', 'Promotions', 'Social', 'Updates'].map((c, i) => (
                <label key={c} className="gm-set-radio"><input type="checkbox" defaultChecked={i < 4} /> {c}</label>
              ))}
            </SettingRow>
          </>
        )}

        {section === 'accounts' && (
          <SettingRow label="Send mail as" hint={`You have ${emails.length} messages in this account`}>
            <span className="gm-set-muted">This account is managed on your local network.</span>
          </SettingRow>
        )}

        {!['general', 'labels', 'inbox', 'accounts'].includes(section) && (
          <div className="gm-settings-placeholder">
            <Icon name="settings" size={40} color="var(--gm-color-outline-variant)" />
            <p>{SECTIONS.find((s) => s.id === section)?.label ?? 'Settings'} — no options to configure in this build yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
