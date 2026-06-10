import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import './AccountMenu.css';

export function AccountMenu() {
  const { account, signedIn, switchTo, addAccount, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const others = signedIn.filter((a) => a.email !== account.email);

  return (
    <div className="gm-acct" ref={ref}>
      <button className="gm-topbar-avatar" aria-label="Google Account" onClick={() => setOpen((v) => !v)}>
        <Avatar initial={account.initial} color={account.avatarColor} size={32} />
      </button>

      {open && (
        <div className="gm-acct-menu">
          <div className="gm-acct-head">
            <Avatar initial={account.initial} color={account.avatarColor} size={64} />
            <div className="gm-acct-name">{account.name}</div>
            <div className="gm-acct-email">{account.email}</div>
            <a className="gm-acct-manage" href="https://myaccount.google.com/" target="_blank" rel="noreferrer">
              Manage your Google Account
            </a>
          </div>

          {others.length > 0 && (
            <div className="gm-acct-others">
              {others.map((a) => (
                <button
                  key={a.email}
                  className="gm-acct-row"
                  onClick={() => switchTo(signedIn.findIndex((s) => s.email === a.email))}
                >
                  <Avatar initial={a.initial} color={a.avatarColor} size={32} />
                  <div className="gm-acct-row-meta">
                    <span className="gm-acct-row-name">{a.name}</span>
                    <span className="gm-acct-row-email">{a.email}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button className="gm-acct-row" onClick={addAccount}>
            <span className="gm-acct-icon"><Icon name="person_add" size={20} /></span>
            Add another account
          </button>
          <button className="gm-acct-row" onClick={signOut}>
            <span className="gm-acct-icon"><Icon name="logout" size={20} /></span>
            Sign out
          </button>
          <div className="gm-acct-footer"><span>Privacy Policy</span><span>•</span><span>Terms of Service</span></div>
        </div>
      )}
    </div>
  );
}
