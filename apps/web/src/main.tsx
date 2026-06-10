import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Fonts (self-hosted, no CDN).
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
// Material Symbols icon font (Outlined — the set Gmail ships).
import 'material-symbols/outlined.css';

import { cssVariables, tokens } from '@gmail-clone/shared';
import { AuthProvider } from './auth';
import { MailboxProvider } from './store/MailboxContext';
import { applySettings } from './settings';
import { App } from './App';
import './index.css';

// Inject Gmail's Material 3 tokens as CSS variables (light + dark) before first paint.
const styleEl = document.createElement('style');
styleEl.textContent =
  `:root {\n  ${cssVariables(tokens.color)}\n}\n` +
  `:root[data-theme="dark"] {\n  ${cssVariables(tokens.colorDark)}\n}`;
document.head.appendChild(styleEl);

// Apply saved theme + density.
applySettings();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MailboxProvider>
        <App />
      </MailboxProvider>
    </AuthProvider>
  </StrictMode>,
);
