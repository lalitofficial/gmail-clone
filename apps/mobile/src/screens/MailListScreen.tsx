import { useState } from 'react';
import { FlatList, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { byNewest, emailsInFolder, inboxForCategory } from '@gmail-clone/shared';
import type { RootStackParamList } from '../navigation/types';
import { useMailbox } from '../store/MailboxContext';
import { c, fontFamily } from '../theme';
import { SearchBar } from '../components/SearchBar';
import { EmailRow } from '../components/EmailRow';
import { Fab } from '../components/Fab';
import { Drawer } from '../components/Drawer';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FOLDER_TITLES: Record<string, string> = {
  starred: 'Starred', snoozed: 'Snoozed', important: 'Important', sent: 'Sent',
  scheduled: 'Scheduled', drafts: 'Drafts', allMail: 'All mail', spam: 'Spam', trash: 'Trash',
};

export function MailListScreen() {
  const navigation = useNavigation<Nav>();
  const { emails, category, folder, setCategory, setFolder, toggleStar, markRead } = useMailbox();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fabExtended, setFabExtended] = useState(true);

  const isInbox = folder === 'inbox';
  const list = (isInbox ? inboxForCategory(emails, category) : emailsInFolder(emails, folder)).sort(byNewest);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setFabExtended(e.nativeEvent.contentOffset.y < 12);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SearchBar onMenu={() => setDrawerOpen(true)} onSearch={() => navigation.navigate('Search')} />

      {!isInbox && (
        <Text style={styles.folderTitle}>{FOLDER_TITLES[folder] ?? 'Inbox'}</Text>
      )}

      <FlatList
        data={list}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <EmailRow email={item} onToggleStar={toggleStar} onOpen={(id) => markRead(id, true)} />
        )}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={list.length === 0 && styles.emptyWrap}
        ListEmptyComponent={<Text style={styles.empty}>No conversations</Text>}
      />

      <Fab extended={fabExtended} onPress={() => navigation.navigate('Compose')} />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        folder={folder}
        category={category}
        onSelectCategory={(cat) => { setCategory(cat); setFolder('inbox'); }}
        onSelectFolder={setFolder}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  folderTitle: {
    fontSize: 14,
    color: c.onSurfaceVariant,
    fontFamily: fontFamily.medium,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  emptyWrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: c.textSecondary, fontFamily: fontFamily.regular },
});
