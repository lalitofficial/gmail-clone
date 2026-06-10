import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatThreadDate, type Email } from '@gmail-clone/shared';
import type { RootStackParamList } from '../navigation/types';
import { useMailbox } from '../store/MailboxContext';
import { useAuth } from '../auth';
import { api } from '../api';
import { c, fontFamily } from '../theme';
import { Avatar } from '../components/Avatar';
import { Icon, type MaterialIconName } from '../components/Icon';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ATTACH_ICON: Record<string, { icon: MaterialIconName; color: string }> = {
  pdf: { icon: 'picture-as-pdf', color: '#d93025' },
  docx: { icon: 'description', color: '#1a73e8' },
  xlsx: { icon: 'table-chart', color: '#188038' },
  png: { icon: 'image', color: '#e37400' },
};

export function ThreadScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Thread'>>();
  const { account } = useAuth();
  const { toggleStar, archive, trash } = useMailbox();
  const [messages, setMessages] = useState<Email[] | null>(null);
  const threadId = params.id;

  useEffect(() => {
    let alive = true;
    api.thread(account.email, threadId).then((m) => alive && setMessages(m)).catch(() => alive && setMessages([]));
    return () => { alive = false; };
  }, [account.email, threadId]);

  if (!messages || messages.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => navigation.goBack()} style={styles.hbtn}><Icon name="arrow-back" size={24} color={c.onSurfaceVariant} /></Pressable>
        </View>
        {messages && <Text style={styles.missing}>Conversation not found.</Text>}
      </SafeAreaView>
    );
  }

  const subject = messages[0].subject;
  const last = messages[messages.length - 1];
  const anyStarred = messages.some((m) => m.starred);
  const replyPrefix = subject.startsWith('Re:') ? '' : 'Re: ';
  const lastFromMe = last.from.email.toLowerCase() === account.email.toLowerCase();
  const replyTo = lastFromMe ? last.to[0]?.email ?? '' : last.from.email;
  const reply = () => navigation.navigate('Compose', { to: replyTo, subject: `${replyPrefix}${subject}`, threadId });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => navigation.goBack()} style={styles.hbtn}><Icon name="arrow-back" size={24} color={c.onSurfaceVariant} /></Pressable>
        <View style={{ flex: 1 }} />
        <Pressable hitSlop={8} onPress={() => { archive(threadId); navigation.goBack(); }} style={styles.hbtn}><Icon name="archive" size={22} color={c.onSurfaceVariant} /></Pressable>
        <Pressable hitSlop={8} onPress={() => { trash(threadId); navigation.goBack(); }} style={styles.hbtn}><Icon name="delete" size={22} color={c.onSurfaceVariant} /></Pressable>
        <Pressable hitSlop={8} style={styles.hbtn}><Icon name="more-vert" size={22} color={c.onSurfaceVariant} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.subjectRow}>
          <Text style={styles.subject}>{subject}{messages.length > 1 ? `  ${messages.length}` : ''}</Text>
          <Pressable hitSlop={8} onPress={() => toggleStar(threadId)}>
            <Icon name={anyStarred ? 'star' : 'star-border'} size={22} color={anyStarred ? c.star : c.starIdle} />
          </Pressable>
        </View>

        {messages.map((m) => {
          const fromMe = m.from.email.toLowerCase() === account.email.toLowerCase();
          return (
            <View key={m.id} style={styles.message}>
              <View style={styles.senderRow}>
                <Avatar initial={m.from.initial} color={m.from.avatarColor} size={40} />
                <View style={styles.senderMeta}>
                  <View style={styles.senderTop}>
                    <Text style={styles.senderName} numberOfLines={1}>{fromMe ? 'me' : m.from.name}</Text>
                    <Text style={styles.date}>{formatThreadDate(m.date)}</Text>
                  </View>
                  <Text style={styles.toMe}>{fromMe ? `to ${m.to.map((x) => x.name || x.email).join(', ')}` : 'to me'}</Text>
                </View>
              </View>
              <Text style={styles.text}>{m.body}</Text>
              {m.attachments.length > 0 && (
                <View style={styles.attachList}>
                  {m.attachments.map((a) => {
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
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.replyBar}>
        <Pressable style={styles.replyBtn} onPress={reply}>
          <Icon name="reply" size={18} color={c.primary} />
          <Text style={styles.replyBtnText}>Reply</Text>
        </Pressable>
        <Pressable style={styles.replyBtn} onPress={() => navigation.navigate('Compose', { subject: `Fwd: ${subject}`, threadId, body: `\n\n---------- Forwarded message ----------\nFrom: ${last.from.name}\n\n${last.body}` })}>
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
  message: { marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.divider, paddingTop: 12 },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  senderMeta: { flex: 1 },
  senderTop: { flexDirection: 'row', alignItems: 'center' },
  senderName: { flex: 1, fontSize: 14, color: c.onSurface, fontFamily: fontFamily.bold },
  date: { fontSize: 12, color: c.textSecondary, fontFamily: fontFamily.regular, marginLeft: 8 },
  toMe: { fontSize: 12, color: c.textSecondary, fontFamily: fontFamily.regular },
  text: { fontSize: 14, color: c.onSurface, fontFamily: fontFamily.regular, lineHeight: 22, marginTop: 12 },
  attachList: { gap: 8, marginTop: 12 },
  attachCard: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 12, borderWidth: 1, borderColor: c.outlineVariant, borderRadius: 8 },
  attachName: { fontSize: 13, color: c.onSurface, fontFamily: fontFamily.medium },
  attachSize: { fontSize: 12, color: c.textSecondary, fontFamily: fontFamily.regular },
  replyBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.divider },
  replyBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 20, borderWidth: 1, borderColor: c.outlineVariant },
  replyBtnText: { fontSize: 13, color: c.primary, fontFamily: fontFamily.medium },
});
