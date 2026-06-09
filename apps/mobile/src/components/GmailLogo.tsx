import Svg, { Path } from 'react-native-svg';
import { Text, View } from 'react-native';
import { fontFamily } from '../theme';

/** The Gmail envelope "M" icon (official multicolor mark). */
export function GmailIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={(size * 193) / 256} viewBox="0 0 256 193">
      <Path d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455z" fill="#4285F4" />
      <Path d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837-27.026 25.798z" fill="#34A853" />
      <Path d="M58.182 93.14l-4.174-38.647 4.174-36.989L128 69.868l69.818-52.364 4.669 34.992-4.669 40.644L128 145.504z" fill="#EA4335" />
      <Path d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945z" fill="#FBBC04" />
      <Path d="M0 49.504l26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.231z" fill="#C5221F" />
    </Svg>
  );
}

/** Gmail icon + "Gmail" wordmark (drawer header). */
export function GmailLogo() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <GmailIcon size={36} />
      <Text style={{ fontSize: 22, color: '#5f6368', fontFamily: fontFamily.medium, letterSpacing: -0.5 }}>
        Gmail
      </Text>
    </View>
  );
}
