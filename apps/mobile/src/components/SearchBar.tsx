import { Pressable, StyleSheet, Text, View } from 'react-native';
import { c, fontFamily } from '../theme';
import { useAuth } from '../auth';
import { Icon } from './Icon';
import { Avatar } from './Avatar';

export function SearchBar({
  onMenu,
  onSearch,
}: {
  onMenu: () => void;
  onSearch: () => void;
}) {
  const { account } = useAuth();
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <Pressable hitSlop={8} onPress={onMenu} style={styles.menuBtn}>
          <Icon name="menu" size={24} color={c.onSurfaceVariant} />
        </Pressable>
        <Pressable style={styles.searchTap} onPress={onSearch}>
          <Text style={styles.placeholder}>Search in mail</Text>
        </Pressable>
        <Pressable hitSlop={8} onPress={onMenu} style={styles.avatarBtn}>
          <Avatar initial={account.initial} color={account.avatarColor} size={30} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: c.background,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: c.surface,
    borderRadius: 28,
    paddingHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  menuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchTap: { flex: 1, height: 48, justifyContent: 'center' },
  placeholder: { fontSize: 16, color: c.textSecondary, fontFamily: fontFamily.regular },
  avatarBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
