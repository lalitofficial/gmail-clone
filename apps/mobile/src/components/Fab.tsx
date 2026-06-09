import { Pressable, StyleSheet, Text } from 'react-native';
import { c, fontFamily } from '../theme';
import { Icon } from './Icon';

/** Gmail "Compose" floating action button (extended pill). */
export function Fab({ onPress, extended = true }: { onPress: () => void; extended?: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.fab, extended && styles.fabExtended, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Icon name="edit" size={22} color={c.onPrimaryContainer} />
      {extended && <Text style={styles.label}>Compose</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    height: 56,
    minWidth: 56,
    borderRadius: 16,
    backgroundColor: c.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabExtended: { paddingHorizontal: 20 },
  pressed: { backgroundColor: '#b3dbfb' },
  label: { fontSize: 14, color: c.onPrimaryContainer, fontFamily: fontFamily.medium },
});
