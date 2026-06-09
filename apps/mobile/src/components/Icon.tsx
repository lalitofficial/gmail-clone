import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

interface IconProps {
  name: MaterialIconName;
  size?: number;
  color?: string;
}

/** Material icon wrapper (Gmail's icon set). */
export function Icon({ name, size = 24, color = '#444746' }: IconProps) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

export type { MaterialIconName };
