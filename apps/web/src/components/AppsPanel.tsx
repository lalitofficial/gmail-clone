import { useState } from 'react';
import { Icon } from './Icon';
import './AppsPanel.css';

/** Google Calendar mini-logo (shows today's date number). */
function CalendarIcon() {
  const today = new Date().getDate();
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" stroke="#dadce0" strokeWidth="1" />
      <rect x="3" y="4" width="18" height="4" rx="2" fill="#4285F4" />
      <text x="12" y="18" textAnchor="middle" fontSize="9" fontWeight="700" fill="#4285F4" fontFamily="Roboto, sans-serif">
        {today}
      </text>
    </svg>
  );
}

/** Right-edge Google side panel (Calendar, Keep, Tasks, Contacts, add-ons). */
const APPS = [
  { id: 'calendar', label: 'Calendar', icon: <CalendarIcon /> },
  { id: 'keep', label: 'Keep', icon: <Icon name="lightbulb" size={20} fill color="#fbbc04" /> },
  { id: 'tasks', label: 'Tasks', icon: <Icon name="check_circle" size={20} fill color="#1a73e8" /> },
  { id: 'contacts', label: 'Contacts', icon: <Icon name="account_circle" size={20} fill color="#1a73e8" /> },
];

export function AppsPanel({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [active, setActive] = useState<string | null>(null);

  if (!open) {
    return (
      <aside className="gm-apps-panel gm-apps-panel--closed">
        <button className="gm-apps-btn" aria-label="Show side panel" onClick={onToggle}><Icon name="chevron_left" size={20} /></button>
      </aside>
    );
  }

  return (
    <div className={`gm-apps-wrap${active ? ' gm-apps-wrap--active' : ''}`}>
      {active && (
        <section className="gm-side-drawer">
          <div className="gm-side-drawer-head">
            <strong>{APPS.find((app) => app.id === active)?.label}</strong>
            <button className="gm-icon-btn" aria-label={`Close ${active}`} onClick={() => setActive(null)}><Icon name="close" size={20} /></button>
          </div>
          <div className="gm-side-drawer-empty">
            <Icon name={active === 'calendar' ? 'event' : active === 'keep' ? 'lightbulb' : active === 'tasks' ? 'task_alt' : 'contacts'} size={36} />
            <span>{active === 'calendar' ? 'No events today' : active === 'keep' ? 'Create a note' : active === 'tasks' ? 'Add a task' : 'Search contacts'}</span>
            <button>{active === 'contacts' ? 'Open Contacts' : 'Get started'}</button>
          </div>
        </section>
      )}
      <aside className="gm-apps-panel">
        {APPS.map((app) => (
          <button
            key={app.id}
            className={`gm-apps-btn${active === app.id ? ' gm-apps-btn--active' : ''}`}
            aria-label={app.label}
            aria-pressed={active === app.id}
            onClick={() => setActive((current) => current === app.id ? null : app.id)}
          >
            {app.icon}
          </button>
        ))}
        <div className="gm-apps-divider" />
        <button className="gm-apps-btn" aria-label="Get add-ons" onClick={() => window.open('https://workspace.google.com/marketplace/', '_blank', 'noopener,noreferrer')}><Icon name="add" size={20} /></button>
        <div className="gm-apps-spacer" />
        <button className="gm-apps-btn" aria-label="Hide side panel" onClick={onToggle}><Icon name="chevron_right" size={20} /></button>
      </aside>
    </div>
  );
}
