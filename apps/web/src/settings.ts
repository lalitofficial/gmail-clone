import { useSyncExternalStore } from 'react';
import type { Category } from '@gmail-clone/shared';

export interface Settings {
  density: 'default' | 'comfortable' | 'compact';
  theme: 'light' | 'dark';
  tabs: Record<Category, boolean>;
}

const KEY = 'gm.settings';
const DEFAULT: Settings = {
  density: 'default',
  theme: 'light',
  tabs: { primary: true, promotions: true, social: true, updates: true },
};

function load(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return { ...DEFAULT, ...raw, tabs: { ...DEFAULT.tabs, ...(raw.tabs ?? {}) } };
  } catch {
    return DEFAULT;
  }
}

let current: Settings = load();
const listeners = new Set<() => void>();

/** Apply theme + density via root data-attributes (CSS keys off these). */
export function applySettings(s: Settings = current): void {
  document.documentElement.dataset.theme = s.theme === 'dark' ? 'dark' : '';
  document.documentElement.dataset.density = s.density === 'default' ? '' : s.density;
}

export function getSettings(): Settings {
  return current;
}

export function setSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch, tabs: { ...current.tabs, ...(patch.tabs ?? {}) } };
  localStorage.setItem(KEY, JSON.stringify(current));
  applySettings(current);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings, getSettings);
}
