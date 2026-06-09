import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { ApiAccount } from '../api';
import { c, fontFamily } from '../theme';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icon';

function GoogleG({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <Path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <Path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <Path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </Svg>
  );
}

export function LoginScreen({ accounts, onPick }: { accounts: ApiAccount[]; onPick: (email: string) => void }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.head}>
          <GoogleG size={28} />
          <Text style={styles.title}>Choose an account</Text>
          <Text style={styles.sub}>to continue to Gmail</Text>
        </View>

        <View style={styles.list}>
          {accounts.map((a) => (
            <Pressable key={a.email} style={styles.row} onPress={() => onPick(a.email)}>
              <Avatar initial={a.initial} color={a.avatarColor} size={36} />
              <View>
                <Text style={styles.name}>{a.name}</Text>
                <Text style={styles.email}>{a.email}</Text>
              </View>
            </Pressable>
          ))}
          <Pressable style={styles.row}>
            <View style={styles.anotherIcon}><Icon name="person-add" size={20} color={c.onSurfaceVariant} /></View>
            <Text style={styles.name}>Use another account</Text>
          </Pressable>
        </View>

        {accounts.length === 0 && (
          <Text style={styles.error}>Can’t reach the server. Make sure it’s running and you’re on the same network.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.surface },
  scroll: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  head: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, color: c.onSurface, fontFamily: fontFamily.regular, marginTop: 16 },
  sub: { fontSize: 14, color: c.onSurface, fontFamily: fontFamily.regular, marginTop: 6 },
  list: { borderTopWidth: 1, borderTopColor: c.divider },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: c.divider,
  },
  name: { fontSize: 15, color: c.onSurface, fontFamily: fontFamily.medium },
  email: { fontSize: 13, color: c.textSecondary, fontFamily: fontFamily.regular },
  anotherIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  error: { marginTop: 24, color: c.error, fontFamily: fontFamily.regular, textAlign: 'center' },
});
