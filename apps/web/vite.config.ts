import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `GMAIL_LOCAL=1` serves the app as https://mail.google.com (port 443) for local
// testing against the real hostname. Needs a trusted cert in apps/web/certs/ (see
// `npm run gmail:setup`) and root to bind 443. Default mode is plain localhost:5173.
const gmailLocal = process.env.GMAIL_LOCAL === '1';
const certDir = path.resolve(__dirname, 'certs');
const certFile = path.join(certDir, 'mail.google.com.pem');
const keyFile = path.join(certDir, 'mail.google.com-key.pem');
const haveCerts = fs.existsSync(certFile) && fs.existsSync(keyFile);

export default defineConfig({
  plugins: [react()],
  server: {
    host: gmailLocal ? true : 'localhost',
    port: gmailLocal ? 443 : 5173,
    // Vite blocks unknown Host headers by default; allow the spoofed hostname.
    allowedHosts: ['mail.google.com', 'localhost'],
    https: gmailLocal && haveCerts ? { cert: fs.readFileSync(certFile), key: fs.readFileSync(keyFile) } : undefined,
    // Same-origin proxy to the backend so it works over http, https (mail.google.com),
    // and from other LAN devices without mixed-content/CORS issues.
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/ws': { target: 'ws://localhost:4000', ws: true },
    },
    fs: {
      // Permit serving files from the monorepo root (the shared package).
      allow: ['..', '../..'],
    },
  },
});
