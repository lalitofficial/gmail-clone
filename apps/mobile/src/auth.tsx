import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, type ApiAccount } from './api';
import { c } from './theme';
import { LoginScreen } from './screens/LoginScreen';

interface AuthValue {
  account: ApiAccount;
  allAccounts: ApiAccount[];
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);
const KEY = 'gm.account';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [allAccounts, setAllAccounts] = useState<ApiAccount[]>([]);
  const [account, setAccount] = useState<ApiAccount | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      let accs: ApiAccount[] = [];
      try {
        accs = await api.accounts();
      } catch {
        /* server unreachable */
      }
      setAllAccounts(accs);
      const saved = await AsyncStorage.getItem(KEY);
      if (saved) {
        const a = accs.find((x) => x.email === saved);
        if (a) setAccount(a);
      }
      setReady(true);
    })();
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: c.background }} />;

  if (!account) {
    return (
      <LoginScreen
        accounts={allAccounts}
        onPick={(email) => {
          const a = allAccounts.find((x) => x.email === email);
          if (a) {
            setAccount(a);
            AsyncStorage.setItem(KEY, email);
          }
        }}
      />
    );
  }

  const value: AuthValue = {
    account,
    allAccounts,
    signOut: () => {
      AsyncStorage.removeItem(KEY);
      setAccount(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
