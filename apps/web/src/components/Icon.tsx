import type { CSSProperties } from 'react';

interface IconProps {
  name: string;
  size?: number;
  fill?: boolean;
  weight?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

/** Material Symbols (Outlined) icon — the set Gmail ships. */
export function Icon({
  name,
  size = 20,
  fill = false,
  weight = 400,
  color,
  className,
  style,
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined${className ? ` ${className}` : ''}`}
      style={{
        fontSize: size,
        color,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
