import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 980, height: 620 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => {
  localStorage.setItem('gm.signedIn', '["lalitkofficial@gmail.com"]');
  localStorage.setItem('gm.settings', JSON.stringify({ density: 'compact', theme: 'dark', tabs: { primary: true, promotions: true, social: true, updates: true } }));
});
const p = await ctx.newPage();
await p.goto('http://localhost:5173/mail/u/0/#inbox', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
await p.screenshot({ path: '/tmp/dark-inbox.png' });
await b.close();
console.log('saved');
