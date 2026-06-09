import type { ApiAccount } from '../api/client';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import './Login.css';

function GoogleG({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

export function Login({
  allAccounts,
  onPick,
}: {
  allAccounts: ApiAccount[];
  signedIn: ApiAccount[];
  onPick: (email: string) => void;
}) {
  return (
    <div className="gm-login">
      <div className="gm-login-card">
        <div className="gm-login-head">
          <GoogleG size={26} />
          <h1 className="gm-login-title">Choose an account</h1>
          <p className="gm-login-sub">to continue to Gmail</p>
        </div>

        <div className="gm-login-list">
          {allAccounts.map((a) => (
            <button key={a.email} className="gm-login-row" onClick={() => onPick(a.email)}>
              <Avatar initial={a.initial} color={a.avatarColor} size={36} />
              <div className="gm-login-meta">
                <span className="gm-login-name">{a.name}</span>
                <span className="gm-login-email">{a.email}</span>
              </div>
            </button>
          ))}

          <button className="gm-login-row gm-login-another">
            <div className="gm-login-another-icon">
              <Icon name="person_add" size={20} />
            </div>
            <span className="gm-login-name">Use another account</span>
          </button>
        </div>
      </div>

      <div className="gm-login-footer">
        <span>English (United States)</span>
        <div className="gm-login-footer-links">
          <span>Help</span>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>
    </div>
  );
}
