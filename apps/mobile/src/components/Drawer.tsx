import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { labels as labelData, type Category, type Folder } from '@gmail-clone/shared';
import { c, fontFamily } from '../theme';
import { Icon, type MaterialIconName } from './Icon';
import { GmailLogo } from './GmailLogo';

type CategoryItem = { kind: 'category'; key: Category; label: string; icon: MaterialIconName };
type FolderItem = { kind: 'folder'; key: Folder; label: string; icon: MaterialIconName };
type ActionItem = { kind: 'action'; key: string; label: string; icon: MaterialIconName };
type Item = CategoryItem | FolderItem | ActionItem;

const CATEGORIES: CategoryItem[] = [
  { kind: 'category', key: 'primary', label: 'Primary', icon: 'inbox' },
  { kind: 'category', key: 'promotions', label: 'Promotions', icon: 'local-offer' },
  { kind: 'category', key: 'social', label: 'Social', icon: 'group' },
];

const FOLDERS: FolderItem[] = [
  { kind: 'folder', key: 'starred', label: 'Starred', icon: 'star-border' },
  { kind: 'folder', key: 'snoozed', label: 'Snoozed', icon: 'schedule' },
  { kind: 'folder', key: 'important', label: 'Important', icon: 'label-important' },
  { kind: 'folder', key: 'sent', label: 'Sent', icon: 'send' },
  { kind: 'folder', key: 'scheduled', label: 'Scheduled', icon: 'schedule-send' },
  { kind: 'folder', key: 'drafts', label: 'Drafts', icon: 'drafts' },
  { kind: 'folder', key: 'allMail', label: 'All mail', icon: 'mail' },
  { kind: 'folder', key: 'spam', label: 'Spam', icon: 'report' },
  { kind: 'folder', key: 'trash', label: 'Trash', icon: 'delete' },
];

const ACTIONS: ActionItem[] = [
  { kind: 'action', key: 'settings', label: 'Settings', icon: 'settings' },
  { kind: 'action', key: 'help', label: 'Help & feedback', icon: 'help-outline' },
];

export function Drawer({
  open,
  onClose,
  folder,
  category,
  onSelectCategory,
  onSelectFolder,
}: {
  open: boolean;
  onClose: () => void;
  folder: Folder;
  category: Category;
  onSelectCategory: (cat: Category) => void;
  onSelectFolder: (folder: Folder) => void;
}) {
  const insets = useSafeAreaInsets();

  const isActive = (item: Item) =>
    (item.kind === 'category' && folder === 'inbox' && category === item.key) ||
    (item.kind === 'folder' && folder === item.key);

  const select = (item: Item) => {
    if (item.kind === 'category') onSelectCategory(item.key);
    else if (item.kind === 'folder') onSelectFolder(item.key);
    onClose();
  };

  const renderItem = (item: Item) => {
    const active = isActive(item);
    return (
      <Pressable
        key={item.key}
        style={[styles.item, active && styles.itemActive]}
        onPress={() => select(item)}
      >
        <Icon name={item.icon} size={20} color={active ? c.onSecondaryContainer : c.onSurfaceVariant} />
        <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{item.label}</Text>
      </Pressable>
    );
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} />
      <View style={[styles.panel, { paddingTop: insets.top + 12 }]}>
        <View style={styles.header}>
          <GmailLogo />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {CATEGORIES.map(renderItem)}
          <View style={styles.divider} />
          {FOLDERS.map(renderItem)}
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Labels</Text>
          {labelData.map((l) => (
            <Pressable key={l.id} style={styles.item}>
              <Icon name="label" size={20} color={l.color} />
              <Text style={styles.itemLabel}>{l.name}</Text>
            </Pressable>
          ))}
          <View style={styles.divider} />
          {ACTIONS.map(renderItem)}
          <View style={{ height: insets.bottom + 16 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: c.surface,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    height: 48,
    paddingLeft: 24,
    paddingRight: 16,
    marginRight: 12,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  itemActive: { backgroundColor: c.secondaryContainer },
  itemLabel: { fontSize: 14, color: c.onSurface, fontFamily: fontFamily.medium },
  itemLabelActive: { color: c.onSecondaryContainer, fontFamily: fontFamily.bold },
  divider: { height: 1, backgroundColor: c.divider, marginVertical: 8, marginHorizontal: 16 },
  sectionLabel: {
    fontSize: 14,
    color: c.onSurfaceVariant,
    fontFamily: fontFamily.medium,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
});
