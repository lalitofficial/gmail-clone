import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type ApiAccount } from './api/client';
import { getUserIndex } from './router';
import { Login } from './screens/Login';

interface AuthValue {
  account: ApiAccount;
  allAccounts: ApiAccount[];
  signedIn: ApiAccount[];
  switchTo: (index: number) => void;
  addAccount: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);
const KEY = 'gm.signedIn';

const readSignedIn = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
};
const writeSignedIn = (emails: string[]) => localStorage.setItem(KEY, JSON.stringify(emails));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [allAccounts, setAllAccounts] = useState<ApiAccount[] | null>(null);

  useEffect(() => {
    api.accounts().then(setAllAccounts).catch(() => setAllAccounts([]));
  }, []);

  if (!allAccounts) return null; // brief load

  const signedInEmails = readSignedIn();
  const signedIn = signedInEmails
    .map((e) => allAccounts.find((a) => a.email === e))
    .filter((a): a is ApiAccount => !!a);

  const isAppPath = /\/mail\/u\/\d+/.test(location.pathname);
  const account = isAppPath ? signedIn[getUserIndex()] : undefined;

  const signIn = (email: string) => {
    const emails = readSignedIn();
    if (!emails.includes(email)) {
      emails.push(email);
      writeSignedIn(emails);
    }
    location.href = `/mail/u/${emails.indexOf(email)}/#inbox`;
  };

  if (!isAppPath || !account) {
    return <Login allAccounts={allAccounts} signedIn={signedIn} onPick={signIn} />;
  }

  const value: AuthValue = {
    account,
    allAccounts,
    signedIn,
    switchTo: (index) => (location.href = `/mail/u/${index}/#inbox`),
    addAccount: () => (location.href = `/login`),
    signOut: () => {
      const emails = readSignedIn().filter((e) => e !== account.email);
      writeSignedIn(emails);
      location.href = emails.length ? `/mail/u/0/#inbox` : `/login`;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
