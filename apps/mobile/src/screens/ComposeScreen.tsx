import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useMailbox } from '../store/MailboxContext';
import { useAuth } from '../auth';
import { c, fontFamily } from '../theme';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ComposeScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Compose'>>();
  const { sendEmail } = useMailbox();
  const { account } = useAuth();

  const [to, setTo] = useState(params?.to ?? '');
  const [subject, setSubject] = useState(params?.subject ?? '');
  const [body, setBody] = useState(params?.body ?? '');

  const send = () => {
    sendEmail({ to, subject, body, threadId: params?.threadId });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => navigation.goBack()} style={styles.hbtn}>
          <Icon name="close" size={24} color={c.onSurfaceVariant} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable hitSlop={8} style={styles.hbtn}>
          <Icon name="attach-file" size={22} color={c.onSurfaceVariant} />
        </Pressable>
        <Pressable hitSlop={8} onPress={send} style={styles.hbtn}>
          <Icon name="send" size={22} color={c.primary} />
        </Pressable>
        <Pressable hitSlop={8} style={styles.hbtn}>
          <Icon name="more-vert" size={22} color={c.onSurfaceVariant} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>From</Text>
          <Text style={styles.fieldValue}>{account.email}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>To</Text>
          <TextInput
            style={styles.input}
            value={to}
            onChangeText={setTo}
            placeholder=""
            placeholderTextColor={c.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.field}>
          <TextInput
            style={[styles.input, styles.subjectInput]}
            value={subject}
            onChangeText={setSubject}
            placeholder="Subject"
            placeholderTextColor={c.textSecondary}
          />
        </View>
        <TextInput
          style={styles.bodyInput}
          value={body}
          onChangeText={setBody}
          placeholder="Compose email"
          placeholderTextColor={c.textSecondary}
          multiline
          textAlignVertical="top"
        />
      </KeyboardAvoidingView>

      <View style={styles.accountBar}>
        <Avatar initial={account.initial} color={account.avatarColor} size={28} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.surface },
  header: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 8 },
  hbtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  field: {
    flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: c.divider,
  },
  fieldLabel: { width: 48, fontSize: 14, color: c.textSecondary, fontFamily: fontFamily.regular },
  fieldValue: { flex: 1, fontSize: 14, color: c.onSurface, fontFamily: fontFamily.regular },
  input: { flex: 1, fontSize: 14, color: c.onSurface, fontFamily: fontFamily.regular, paddingVertical: 12 },
  subjectInput: { marginLeft: 0 },
  bodyInput: {
    flex: 1, fontSize: 14, color: c.onSurface, fontFamily: fontFamily.regular,
    paddingHorizontal: 16, paddingTop: 16, lineHeight: 22,
  },
  accountBar: { paddingHorizontal: 16, paddingVertical: 8 },
});
