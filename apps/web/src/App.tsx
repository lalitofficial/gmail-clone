import { useRoute } from './router';
import { AppShell } from './components/AppShell';
import { MailListScreen } from './screens/MailListScreen';
import { ThreadScreen } from './screens/ThreadScreen';
import { SearchScreen } from './screens/SearchScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export function App() {
  const route = useRoute();
  return (
    <AppShell>
      {route.view === 'list' && <MailListScreen route={route} />}
      {route.view === 'thread' && <ThreadScreen route={route} />}
      {route.view === 'search' && <SearchScreen route={route} />}
      {route.view === 'settings' && <SettingsScreen route={route} />}
    </AppShell>
  );
}
