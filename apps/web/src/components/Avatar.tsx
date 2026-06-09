interface AvatarProps {
  initial: string;
  color: string;
  size?: number;
}

/** Colored circle with the sender's first initial — Gmail's list/thread avatar. */
export function Avatar({ initial, color, size = 40 }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        fontWeight: 400,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initial}
    </div>
  );
}
