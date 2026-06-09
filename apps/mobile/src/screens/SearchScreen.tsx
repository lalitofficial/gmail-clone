import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { byNewest, searchEmails } from '@gmail-clone/shared';
import type { RootStackParamList } from '../navigation/types';
import { useMailbox } from '../store/MailboxContext';
import { c, fontFamily } from '../theme';
import { Icon } from '../components/Icon';
import { EmailRow } from '../components/EmailRow';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const { emails, toggleStar, markRead } = useMailbox();
  const [query, setQuery] = useState('');

  const results = searchEmails(emails, query).sort(byNewest);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchHeader}>
        <View style={styles.bar}>
          <Pressable hitSlop={8} onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Icon name="arrow-back" size={24} color={c.onSurfaceVariant} />
          </Pressable>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search in mail"
            placeholderTextColor={c.textSecondary}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable hitSlop={8} onPress={() => setQuery('')} style={styles.iconBtn}>
              <Icon name="close" size={22} color={c.onSurfaceVariant} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <EmailRow email={item} onToggleStar={toggleStar} onOpen={(id) => markRead(id, true)} />
        )}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          query.trim() ? <Text style={styles.empty}>No results for “{query}”</Text> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.surface },
  searchHeader: { paddingHorizontal: 8, paddingVertical: 8, backgroundColor: c.background },
  bar: {
    flexDirection: 'row', alignItems: 'center', height: 48, backgroundColor: c.surface,
    borderRadius: 28, paddingHorizontal: 4, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontSize: 16, color: c.onSurface, fontFamily: fontFamily.regular },
  empty: { textAlign: 'center', marginTop: 40, color: c.textSecondary, fontFamily: fontFamily.regular },
});
