import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1100, height: 800 } });
const p = await ctx.newPage();
await p.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await p.click('text=lalitkofficial@gmail.com');           // chooser -> password
await p.fill('input[type="password"]', 'Lalit@123');      // correct password
await p.click('button:has-text("Next")');
await p.waitForTimeout(2500);
console.log('after correct login URL:', p.url());
const hasInbox = await p.$('.gm-list, .gm-compose');
console.log('inbox rendered:', !!hasInbox);
// now test wrong password in a fresh context
const ctx2 = await b.newContext();
const p2 = await ctx2.newPage();
await p2.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await p2.click('text=ccw@smail.iitm.ac.in');
await p2.fill('input[type="password"]', 'wrongpass');
await p2.click('button:has-text("Next")');
await p2.waitForTimeout(1000);
const err = await p2.textContent('.gm-login-err').catch(() => null);
console.log('wrong-password error shown:', JSON.stringify(err));
await b.close();
