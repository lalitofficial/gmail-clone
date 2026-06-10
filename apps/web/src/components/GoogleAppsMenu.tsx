import { Icon } from './Icon';

const GOOGLE_APPS = [
  { name: 'Account', icon: 'account_circle', color: '#4285f4', href: 'https://myaccount.google.com/' },
  { name: 'Search', icon: 'search', color: '#4285f4', href: 'https://www.google.com/' },
  { name: 'Maps', icon: 'location_on', color: '#34a853', href: 'https://maps.google.com/' },
  { name: 'YouTube', icon: 'smart_display', color: '#ea4335', href: 'https://www.youtube.com/' },
  { name: 'Play', icon: 'play_arrow', color: '#34a853', href: 'https://play.google.com/' },
  { name: 'News', icon: 'newspaper', color: '#4285f4', href: 'https://news.google.com/' },
  { name: 'Gmail', icon: 'mail', color: '#ea4335', href: '#inbox' },
  { name: 'Meet', icon: 'videocam', color: '#00ac47', href: 'https://meet.google.com/' },
  { name: 'Chat', icon: 'chat', color: '#00ac47', href: 'https://chat.google.com/' },
  { name: 'Contacts', icon: 'contacts', color: '#4285f4', href: 'https://contacts.google.com/' },
  { name: 'Drive', icon: 'add_to_drive', color: '#fbbc04', href: 'https://drive.google.com/' },
  { name: 'Calendar', icon: 'calendar_month', color: '#4285f4', href: 'https://calendar.google.com/' },
  { name: 'Translate', icon: 'translate', color: '#4285f4', href: 'https://translate.google.com/' },
  { name: 'Photos', icon: 'photo_library', color: '#ea4335', href: 'https://photos.google.com/' },
];

export function GoogleAppsMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="gm-google-apps-menu" role="menu" aria-label="Google apps">
      <div className="gm-google-apps-grid">
        {GOOGLE_APPS.map((app) => {
          const external = app.href.startsWith('http');
          return (
            <a
              key={app.name}
              className="gm-google-app"
              href={app.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer' : undefined}
              onClick={onClose}
              role="menuitem"
            >
              <span className="gm-google-app-icon">
                <Icon name={app.icon} size={30} fill color={app.color} />
              </span>
              <span>{app.name}</span>
            </a>
          );
        })}
      </div>
      <a className="gm-google-apps-more" href="https://about.google/products/" target="_blank" rel="noreferrer">
        More from Google
      </a>
    </div>
  );
}
