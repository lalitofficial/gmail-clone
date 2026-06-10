import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatListDate, type Email } from '@gmail-clone/shared';
import type { RootStackParamList } from '../navigation/types';
import { c, fontFamily } from '../theme';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function EmailRow({
  email,
  onToggleStar,
  onOpen,
}: {
  email: Email;
  onToggleStar: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const navigation = useNavigation<Nav>();
  const unread = !email.read;

  return (
    <Pressable
      android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => {
        onOpen(email.id);
        navigation.navigate('Thread', { id: email.id });
      }}
    >
      <Avatar initial={email.from.initial} color={email.from.avatarColor} size={40} />

      <View style={styles.text}>
        <View style={styles.line1}>
          <Text style={[styles.sender, unread && styles.bold]} numberOfLines={1}>
            {email.participants && email.participants.length > 0 ? email.participants.join(', ') : email.from.name}
            {email.messageCount && email.messageCount > 1 ? `  ${email.messageCount}` : ''}
          </Text>
          <Text style={[styles.time, unread && styles.timeUnread]} numberOfLines={1}>
            {formatListDate(email.date)}
          </Text>
        </View>
        <Text style={[styles.subject, unread && styles.bold]} numberOfLines={1}>
          {email.subject}
        </Text>
        <View style={styles.line3}>
          <Text style={styles.snippet} numberOfLines={1}>
            {email.snippet}
          </Text>
          <Pressable hitSlop={8} onPress={() => onToggleStar(email.id)} style={styles.star}>
            <Icon
              name={email.starred ? 'star' : 'star-border'}
              size={20}
              color={email.starred ? c.star : c.starIdle}
            />
          </Pressable>
        </View>
        {email.hasAttachment && (
          <View style={styles.attachment}>
            <Icon name="attachment" size={14} color={c.textSecondary} />
            <Text style={styles.attachmentName} numberOfLines={1}>
              {email.attachments[0]?.name}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 16,
    alignItems: 'flex-start',
  },
  rowPressed: { backgroundColor: 'rgba(0,0,0,0.04)' },
  text: { flex: 1, paddingTop: 2 },
  line1: { flexDirection: 'row', alignItems: 'center', marginBottom: 1 },
  sender: { flex: 1, fontSize: 14, color: c.onSurface, fontFamily: fontFamily.regular },
  time: { fontSize: 12, color: c.textSecondary, marginLeft: 8, fontFamily: fontFamily.regular },
  timeUnread: { color: c.onSurface, fontFamily: fontFamily.bold },
  subject: { fontSize: 14, color: c.onSurface, marginBottom: 1, fontFamily: fontFamily.regular },
  bold: { fontFamily: fontFamily.bold, color: c.onSurface },
  line3: { flexDirection: 'row', alignItems: 'center' },
  snippet: { flex: 1, fontSize: 13, color: c.textSecondary, fontFamily: fontFamily.regular },
  star: { marginLeft: 8 },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    borderWidth: 1,
    borderColor: c.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    maxWidth: 200,
  },
  attachmentName: { fontSize: 12, color: c.textSecondary, fontFamily: fontFamily.regular },
});
