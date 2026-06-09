import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatThreadDate } from '@gmail-clone/shared';
import type { RootStackParamList } from '../navigation/types';
import { useMailbox } from '../store/MailboxContext';
import { c, fontFamily } from '../theme';
import { Avatar } from '../components/Avatar';
import { Icon, type MaterialIconName } from '../components/Icon';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ATTACH_ICON: Record<string, { icon: MaterialIconName; color: string }> = {
  pdf: { icon: 'picture-as-pdf', color: '#d93025' },
  docx: { icon: 'description', color: '#1a73e8' },
  doc: { icon: 'description', color: '#1a73e8' },
  xlsx: { icon: 'table-chart', color: '#188038' },
  png: { icon: 'image', color: '#e37400' },
  jpg: { icon: 'image', color: '#e37400' },
};

export function ThreadScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Thread'>>();
  const { getEmail, toggleStar, archive, trash } = useMailbox();
  const email = getEmail(params.id);

  if (!email) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.missing}>Conversation not found.</Text>
      </SafeAreaView>
    );
  }

  const replyPrefix = email.subject.startsWith('Re:') ? '' : 'Re: ';
  const reply = () => navigation.navigate('Compose', { to: email.from.email, subject: `${replyPrefix}${email.subject}` });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => navigation.goBack()} style={styles.hbtn}>
          <Icon name="arrow-back" size={24} color={c.onSurfaceVariant} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable hitSlop={8} onPress={() => { archive(email.id); navigation.goBack(); }} style={styles.hbtn}>
          <Icon name="archive" size={22} color={c.onSurfaceVariant} />
        </Pressable>
        <Pressable hitSlop={8} onPress={() => { trash(email.id); navigation.goBack(); }} style={styles.hbtn}>
          <Icon name="delete" size={22} color={c.onSurfaceVariant} />
        </Pressable>
        <Pressable hitSlop={8} style={styles.hbtn}>
          <Icon name="mark-email-unread" size={22} color={c.onSurfaceVariant} />
        </Pressable>
        <Pressable hitSlop={8} style={styles.hbtn}>
          <Icon name="more-vert" size={22} color={c.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.subjectRow}>
          <Text style={styles.subject}>{email.subject}</Text>
          <Pressable hitSlop={8} onPress={() => toggleStar(email.id)}>
            <Icon name={email.starred ? 'star' : 'star-border'} size={22} color={email.starred ? c.star : c.starIdle} />
          </Pressable>
        </View>

        <View style={styles.senderRow}>
          <Avatar initial={email.from.initial} color={email.from.avatarColor} size={40} />
          <View style={styles.senderMeta}>
            <View style={styles.senderTop}>
              <Text style={styles.senderName} numberOfLines={1}>{email.from.name}</Text>
              <Text style={styles.date}>{formatThreadDate(email.date)}</Text>
            </View>
            <View style={styles.senderBottom}>
              <Text style={styles.toMe}>to me</Text>
              <Icon name="arrow-drop-down" size={18} color={c.textSecondary} />
            </View>
          </View>
          <Pressable hitSlop={8} onPress={reply} style={styles.replyIcon}>
            <Icon name="reply" size={22} color={c.onSurfaceVariant} />
          </Pressable>
        </View>

        <Text style={styles.text}>{email.body}</Text>

        {email.attachments.length > 0 && (
          <View style={styles.attachments}>
            <Text style={styles.attachHead}>
              {email.attachments.length} Attachment{email.attachments.length > 1 ? 's' : ''}
            </Text>
            <View style={styles.attachList}>
              {email.attachments.map((a) => {
                const meta = ATTACH_ICON[a.kind] ?? { icon: 'insert-drive-file' as MaterialIconName, color: '#5f6368' };
                return (
                  <View key={a.id} style={styles.attachCard}>
                    <Icon name={meta.icon} size={26} color={meta.color} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.attachName} numberOfLines={1}>{a.name}</Text>
                      <Text style={styles.attachSize}>{a.size}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.replyBar}>
        <Pressable style={styles.replyBtn} onPress={reply}>
          <Icon name="reply" size={18} color={c.primary} />
          <Text style={styles.replyBtnText}>Reply</Text>
        </Pressable>
        <Pressable style={styles.replyBtn} onPress={() => navigation.navigate('Compose', { subject: `${replyPrefix}${email.subject}` })}>
          <Icon name="reply-all" size={18} color={c.primary} />
          <Text style={styles.replyBtnText}>Reply all</Text>
        </Pressable>
        <Pressable style={styles.replyBtn} onPress={() => navigation.navigate('Compose', { subject: `Fwd: ${email.subject}`, body: `\n\n---------- Forwarded message ----------\nFrom: ${email.from.name}\n\n${email.body}` })}>
          <Icon name="forward" size={18} color={c.primary} />
          <Text style={styles.replyBtnText}>Forward</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.surface },
  missing: { padding: 40, color: c.textSecondary, fontFamily: fontFamily.regular },
  header: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 8 },
  hbtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 16, paddingBottom: 24 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  subject: { flex: 1, fontSize: 22, color: c.onSurface, fontFamily: fontFamily.regular, lineHeight: 28 },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  senderMeta: { flex: 1 },
  senderTop: { flexDirection: 'row', alignItems: 'center' },
  senderName: { flex: 1, fontSize: 14, color: c.onSurface, fontFamily: fontFamily.bold },
  date: { fontSize: 12, color: c.textSecondary, fontFamily: fontFamily.regular, marginLeft: 8 },
  senderBottom: { flexDirection: 'row', alignItems: 'center' },
  toMe: { fontSize: 12, color: c.textSecondary, fontFamily: fontFamily.regular },
  replyIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 14, color: c.onSurface, fontFamily: fontFamily.regular, lineHeight: 22, marginTop: 24 },
  attachments: { marginTop: 24 },
  attachHead: { fontSize: 14, color: c.onSurface, fontFamily: fontFamily.medium, marginBottom: 8 },
  attachList: { gap: 8 },
  attachCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 12,
    borderWidth: 1, borderColor: c.outlineVariant, borderRadius: 8,
  },
  attachName: { fontSize: 13, color: c.onSurface, fontFamily: fontFamily.medium },
  attachSize: { fontSize: 12, color: c.textSecondary, fontFamily: fontFamily.regular },
  replyBar: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: c.divider,
  },
  replyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 40, borderRadius: 20, borderWidth: 1, borderColor: c.outlineVariant,
  },
  replyBtnText: { fontSize: 13, color: c.primary, fontFamily: fontFamily.medium },
});
