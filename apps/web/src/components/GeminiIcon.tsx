/** Google Gemini "spark" — 4-point star with the blue→magenta gradient. */
export function GeminiIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="gm-gemini" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="45%" stopColor="#9168F0" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path
        d="M12 1c.5 5.5 5.5 10.5 11 11-5.5.5-10.5 5.5-11 11-.5-5.5-5.5-10.5-11-11C6.5 11.5 11.5 6.5 12 1z"
        fill="url(#gm-gemini)"
      />
    </svg>
  );
}
