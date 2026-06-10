import { useState } from 'react';
import { api, type ApiAccount } from '../api/client';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';
import './Login.css';

/** Full multicolor "Google" wordmark (Product Sans / app-font fallback). */
function GoogleWordmark() {
  const colors = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'];
  return (
    <div className="gm-google-wordmark" aria-label="Google">
      {'Google'.split('').map((ch, i) => (
        <span key={i} style={{ color: colors[i] }}>{ch}</span>
      ))}
    </div>
  );
}

type Step = 'chooser' | 'email' | 'password';

export function Login({
  allAccounts,
  onPick,
}: {
  allAccounts: ApiAccount[];
  signedIn: ApiAccount[];
  onPick: (email: string) => void;
}) {
  const [step, setStep] = useState<Step>('chooser');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const account = allAccounts.find((a) => a.email === email);

  const goPassword = (e: string) => {
    setEmail(e);
    setPassword('');
    setError('');
    setStep('password');
  };

  const submitEmail = () => {
    if (!email.trim()) return setError('Enter an email or phone number');
    if (!allAccounts.some((a) => a.email === email.trim())) {
      return setError('Couldn’t find your Google Account');
    }
    goPassword(email.trim());
  };

  const submitPassword = async () => {
    setBusy(true);
    setError('');
    try {
      await api.login(email, password);
      onPick(email); // success → register + redirect
    } catch (err) {
      setError((err as Error).message === 'wrong_password' ? 'Wrong password. Try again.' : 'Couldn’t sign you in');
      setBusy(false);
    }
  };

  return (
    <div className="gm-login">
      <div className="gm-login-card">
        {step === 'chooser' && (
          <>
            <div className="gm-login-head">
              <GoogleWordmark />
              <h1 className="gm-login-title">Choose an account</h1>
              <p className="gm-login-sub">to continue to Gmail</p>
            </div>
            <div className="gm-login-list">
              {allAccounts.map((a) => (
                <button key={a.email} className="gm-login-row" onClick={() => goPassword(a.email)}>
                  <Avatar initial={a.initial} color={a.avatarColor} size={36} />
                  <div className="gm-login-meta">
                    <span className="gm-login-name">{a.name}</span>
                    <span className="gm-login-email">{a.email}</span>
                  </div>
                </button>
              ))}
              <button className="gm-login-row" onClick={() => { setEmail(''); setError(''); setStep('email'); }}>
                <div className="gm-login-another-icon"><Icon name="person_add" size={20} /></div>
                <span className="gm-login-name">Use another account</span>
              </button>
            </div>
          </>
        )}

        {step === 'email' && (
          <div className="gm-login-form">
            <div className="gm-login-form-head">
              <GoogleWordmark />
              <h1 className="gm-login-title">Sign in</h1>
              <p className="gm-login-sub">Use your Google Account</p>
            </div>
            <div className="gm-tf">
              <input
                className={`gm-tf-input${error ? ' gm-tf-input--err' : ''}`}
                placeholder=" "
                value={email}
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitEmail()}
              />
              <label className="gm-tf-label">Email or phone</label>
            </div>
            {error && <div className="gm-login-err">{error}</div>}
            <a className="gm-login-link" href="#" onClick={(e) => e.preventDefault()}>Forgot email?</a>
            <p className="gm-login-helper">
              Not your computer? Use a private browsing window to sign in.{' '}
              <a className="gm-login-link" href="#" onClick={(e) => e.preventDefault()}>Learn more about using Guest mode</a>
            </p>
            <div className="gm-login-actions">
              <button className="gm-login-text-btn" onClick={() => setStep('chooser')}>Create account</button>
              <button className="gm-login-next" onClick={submitEmail}>Next</button>
            </div>
          </div>
        )}

        {step === 'password' && (
          <div className="gm-login-form">
            <div className="gm-login-form-head">
              <GoogleWordmark />
              <h1 className="gm-login-title">Welcome</h1>
              <div className="gm-login-chip">
                {account && <Avatar initial={account.initial} color={account.avatarColor} size={20} />}
                <span>{email}</span>
                <Icon name="arrow_drop_down" size={18} />
              </div>
            </div>
            <div className="gm-tf">
              <input
                className={`gm-tf-input${error ? ' gm-tf-input--err' : ''}`}
                type={showPw ? 'text' : 'password'}
                placeholder=" "
                value={password}
                autoFocus
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitPassword()}
              />
              <label className="gm-tf-label">Enter your password</label>
            </div>
            {error && <div className="gm-login-err">{error}</div>}
            <label className="gm-login-showpw">
              <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} /> Show password
            </label>
            <div className="gm-login-actions">
              <button className="gm-login-text-btn" onClick={() => setStep('chooser')}>Back</button>
              <button className="gm-login-next" onClick={submitPassword} disabled={busy}>{busy ? 'Signing in…' : 'Next'}</button>
            </div>
          </div>
        )}
      </div>

      <div className="gm-login-footer">
        <span>English (United States)</span>
        <div className="gm-login-footer-links"><span>Help</span><span>Privacy</span><span>Terms</span></div>
      </div>
    </div>
  );
}
