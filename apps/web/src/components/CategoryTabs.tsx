import { byNewest, inboxForCategory, unreadCount, type Category } from '@gmail-clone/shared';
import { Icon } from './Icon';
import { useMailbox } from '../store/MailboxContext';
import { useSettings } from '../settings';
import { hrefCategory, navigate, useRoute } from '../router';
import './CategoryTabs.css';

const TABS: { id: Category; label: string; icon: string; colorVar: string }[] = [
  { id: 'primary', label: 'Primary', icon: 'inbox', colorVar: 'var(--gm-color-category-primary)' },
  { id: 'promotions', label: 'Promotions', icon: 'sell', colorVar: 'var(--gm-color-category-promotions)' },
  { id: 'social', label: 'Social', icon: 'group', colorVar: 'var(--gm-color-category-social)' },
  { id: 'updates', label: 'Updates', icon: 'info', colorVar: 'var(--gm-color-category-primary)' },
];

export function CategoryTabs() {
  const { emails } = useMailbox();
  const settings = useSettings();
  const route = useRoute();
  const category: Category = route.view === 'list' ? route.category ?? 'primary' : 'primary';
  const visibleTabs = TABS.filter((t) => settings.tabs[t.id]);

  return (
    <div className="gm-tabs">
      {visibleTabs.map((tab) => {
        const active = tab.id === category;
        const count = unreadCount(emails, tab.id);
        const latest = inboxForCategory(emails, tab.id)
          .filter((e) => !e.read)
          .sort(byNewest)[0];
        const showMeta = !active && tab.id !== 'primary' && count > 0;

        return (
          <button
            key={tab.id}
            className={`gm-tab${active ? ' gm-tab--active' : ''}`}
            style={active ? { ['--tab-color' as string]: tab.colorVar } : undefined}
            onClick={() => navigate(hrefCategory(tab.id))}
          >
            <Icon
              name={tab.icon}
              size={20}
              fill={active}
              color={active ? tab.colorVar : 'var(--gm-color-text-secondary)'}
              className="gm-tab-icon"
            />
            <div className="gm-tab-text">
              <div className="gm-tab-line1">
                <span className="gm-tab-label">{tab.label}</span>
                {showMeta && (
                  <span className="gm-tab-badge" style={{ color: tab.colorVar }}>
                    {count} new
                  </span>
                )}
              </div>
              {showMeta && latest && (
                <span className="gm-tab-preview">
                  {latest.from.name} — {latest.subject}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
