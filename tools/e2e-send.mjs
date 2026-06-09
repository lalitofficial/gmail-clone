// End-to-end: drive the web compose UI as Lalit, then verify delivery via the API.
import { chromium } from 'playwright-core';

const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addInitScript(() => localStorage.setItem('gm.signedIn', '["lalitkofficial@gmail.com"]'));
const p = await ctx.newPage();

await p.goto('http://localhost:5173/mail/u/0/#inbox', { waitUntil: 'networkidle' });
console.log('URL after login:', p.url());

await p.click('.gm-compose');
await p.fill('input[placeholder="To"]', 'aiforkidsofficial@gmail.com');
await p.fill('input[placeholder="Subject"]', 'Hello from the web compose');
await p.fill('.gm-compose-body', 'This was sent end-to-end through the compose window.');
await p.click('.gm-compose-send');
await p.waitForTimeout(1000);

const res = await fetch('http://localhost:4000/api/messages?folder=inbox', {
  headers: { 'x-account-email': 'aiforkidsofficial@gmail.com' },
});
const msgs = await res.json();
console.log('aiforkids INBOX subjects:', msgs.map((m) => `${m.from.email} | ${m.subject}`));

await b.close();
