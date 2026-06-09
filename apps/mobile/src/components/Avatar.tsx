import { Text, View } from 'react-native';
import { fontFamily } from '../theme';

interface AvatarProps {
  initial: string;
  color: string;
  size?: number;
}

/** Colored circle with the sender's initial — Gmail's list/thread avatar. */
export function Avatar({ initial, color, size = 40 }: AvatarProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: size * 0.45, fontFamily: fontFamily.regular }}>
        {initial}
      </Text>
    </View>
  );
}
