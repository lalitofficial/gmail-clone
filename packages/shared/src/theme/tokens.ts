/**
 * Material Design 3 (Material You) tokens, tuned to current Gmail.
 *
 * This is the single source of truth for both apps:
 *  - Web imports `cssVariables()` and injects them on :root, then CSS uses var(--gm-*).
 *  - Mobile imports the `tokens` object directly into StyleSheet.
 *
 * Values are Gmail-faithful defaults; exact hexes/metrics get calibrated against the
 * user's screenshots in the pixel-exact pass.
 */

export const tokens = {
  color: {
    // Google blue — Gmail's primary action color (Send, focus, active).
    primary: '#0b57d0',
    onPrimary: '#ffffff',
    // Compose button + selected/active light-blue container.
    primaryContainer: '#c2e7ff',
    onPrimaryContainer: '#001d35',
    // Selected nav pill (Inbox highlight).
    secondaryContainer: '#d3e3fd',
    onSecondaryContainer: '#001d35',

    // Surfaces
    background: '#f6f8fc', // app backdrop (top bar + gutter share this)
    surface: '#ffffff', // white mail-list / card surface
    surfaceContainerLow: '#f6f8fc',
    surfaceContainer: '#f0f4f9', // sidebar / panels
    surfaceContainerHigh: '#eaf1fb', // search field resting bg

    // Text + icons
    onSurface: '#1f1f1f', // primary text (unread sender/subject)
    onSurfaceVariant: '#444746', // secondary text + default icon color
    textSecondary: '#5f6368', // read rows, snippet, timestamps

    // Lines
    outline: '#747775',
    outlineVariant: '#c4c7c5',
    divider: '#e0e3e7',

    // States (overlay colors)
    hover: 'rgba(31,31,31,0.04)',
    pressed: 'rgba(31,31,31,0.08)',

    // Accents
    star: '#e8a800', // starred (amber)
    starIdle: '#5f6368', // unstarred outline
    error: '#d93025', // delete / important red
    success: '#188038',

    // Category accents (tab icons + indicators)
    categoryPrimary: '#1a73e8',
    categoryPromotions: '#188038',
    categorySocial: '#1a73e8',
  },

  /** Avatar circle background palette (deterministic by sender). */
  avatarPalette: [
    '#1a73e8',
    '#d93025',
    '#188038',
    '#e37400',
    '#9334e6',
    '#129eaf',
    '#a8a116',
    '#e52592',
    '#1967d2',
    '#7b5800',
  ],

  font: {
    // Current Gmail renders most UI in Google Sans (proprietary, not bundleable);
    // listed first so it's used where available, with Roboto as the faithful fallback.
    family:
      "'Google Sans', 'Google Sans Text', Roboto, 'Helvetica Neue', Arial, sans-serif",
    // Roboto-derived type scale (px sizes, rn-friendly numbers).
    size: {
      xs: 11,
      sm: 12,
      base: 14, // list rows + body
      md: 16, // search field
      lg: 18,
      xl: 22, // thread subject
      xxl: 28,
    },
    weight: {
      regular: '400' as const,
      medium: '500' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 18,
      base: 20,
      relaxed: 24,
    },
  },

  /** Corner radii. */
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 28,
    full: 9999,
  },

  /** 4px base spacing scale. */
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  /** Gmail layout metrics (web desktop). */
  metric: {
    topBarHeight: 64,
    sidebarWidth: 256,
    sidebarCollapsedWidth: 72,
    rowHeight: 40, // dense Gmail row
    rowHeightComfortable: 56,
    avatarSize: 40,
    searchMaxWidth: 720,
  },

  /** Material elevation shadows. */
  elevation: {
    1: '0 1px 2px rgba(0,0,0,0.18), 0 1px 3px 1px rgba(0,0,0,0.04)',
    2: '0 1px 2px rgba(0,0,0,0.18), 0 2px 6px 2px rgba(0,0,0,0.08)',
    3: '0 4px 8px 3px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.18)',
  },
} as const;

export type Tokens = typeof tokens;

/** Deterministically pick an avatar color for a name/email. */
export function avatarColorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return tokens.avatarPalette[hash % tokens.avatarPalette.length];
}

/** Build the `:root` CSS custom-property declarations for the web app. */
export function cssVariables(): string {
  const c = tokens.color;
  const lines: string[] = [
    `--gm-color-primary: ${c.primary};`,
    `--gm-color-on-primary: ${c.onPrimary};`,
    `--gm-color-primary-container: ${c.primaryContainer};`,
    `--gm-color-on-primary-container: ${c.onPrimaryContainer};`,
    `--gm-color-secondary-container: ${c.secondaryContainer};`,
    `--gm-color-on-secondary-container: ${c.onSecondaryContainer};`,
    `--gm-color-background: ${c.background};`,
    `--gm-color-surface: ${c.surface};`,
    `--gm-color-surface-container-low: ${c.surfaceContainerLow};`,
    `--gm-color-surface-container: ${c.surfaceContainer};`,
    `--gm-color-surface-container-high: ${c.surfaceContainerHigh};`,
    `--gm-color-on-surface: ${c.onSurface};`,
    `--gm-color-on-surface-variant: ${c.onSurfaceVariant};`,
    `--gm-color-text-secondary: ${c.textSecondary};`,
    `--gm-color-outline: ${c.outline};`,
    `--gm-color-outline-variant: ${c.outlineVariant};`,
    `--gm-color-divider: ${c.divider};`,
    `--gm-color-hover: ${c.hover};`,
    `--gm-color-pressed: ${c.pressed};`,
    `--gm-color-star: ${c.star};`,
    `--gm-color-star-idle: ${c.starIdle};`,
    `--gm-color-error: ${c.error};`,
    `--gm-color-success: ${c.success};`,
    `--gm-color-category-primary: ${c.categoryPrimary};`,
    `--gm-color-category-promotions: ${c.categoryPromotions};`,
    `--gm-color-category-social: ${c.categorySocial};`,
    `--gm-font-family: ${tokens.font.family};`,
    `--gm-radius-sm: ${tokens.radius.sm}px;`,
    `--gm-radius-md: ${tokens.radius.md}px;`,
    `--gm-radius-lg: ${tokens.radius.lg}px;`,
    `--gm-radius-xl: ${tokens.radius.xl}px;`,
    `--gm-radius-full: ${tokens.radius.full}px;`,
    `--gm-top-bar-height: ${tokens.metric.topBarHeight}px;`,
    `--gm-sidebar-width: ${tokens.metric.sidebarWidth}px;`,
    `--gm-sidebar-collapsed-width: ${tokens.metric.sidebarCollapsedWidth}px;`,
    `--gm-search-max-width: ${tokens.metric.searchMaxWidth}px;`,
    `--gm-elevation-1: ${tokens.elevation[1]};`,
    `--gm-elevation-2: ${tokens.elevation[2]};`,
    `--gm-elevation-3: ${tokens.elevation[3]};`,
  ];
  return lines.join('\n  ');
}
