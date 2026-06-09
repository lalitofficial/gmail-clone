import { Icon } from './Icon';
import './AppsPanel.css';

/** Google Calendar mini-logo (shows today's date number). */
function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" stroke="#dadce0" strokeWidth="1" />
      <rect x="3" y="4" width="18" height="4" rx="2" fill="#4285F4" />
      <text x="12" y="18" textAnchor="middle" fontSize="9" fontWeight="700" fill="#4285F4" fontFamily="Roboto, sans-serif">
        31
      </text>
    </svg>
  );
}

/** Right-edge Google side panel (Calendar, Keep, Tasks, Contacts, add-ons). */
export function AppsPanel() {
  return (
    <aside className="gm-apps-panel">
      <button className="gm-apps-btn" aria-label="Calendar"><CalendarIcon /></button>
      <button className="gm-apps-btn" aria-label="Keep"><Icon name="lightbulb" size={20} fill color="#fbbc04" /></button>
      <button className="gm-apps-btn" aria-label="Tasks"><Icon name="check_circle" size={20} fill color="#1a73e8" /></button>
      <button className="gm-apps-btn" aria-label="Contacts"><Icon name="account_circle" size={20} fill color="#1a73e8" /></button>
      <div className="gm-apps-divider" />
      <button className="gm-apps-btn" aria-label="Get add-ons"><Icon name="add" size={20} /></button>
      <div className="gm-apps-spacer" />
      <button className="gm-apps-btn" aria-label="Hide side panel"><Icon name="chevron_left" size={20} /></button>
    </aside>
  );
}
