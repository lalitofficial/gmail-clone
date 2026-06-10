import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext();
await ctx.addInitScript(() => localStorage.setItem('gm.signedIn', '["lalitkofficial@gmail.com"]'));
const p = await ctx.newPage();
await p.goto('http://localhost:5173/mail/u/0/#inbox', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
const r = await p.evaluate(() => {
  const body = getComputedStyle(document.body);
  const search = document.querySelector('.gm-search');
  const sc = search && getComputedStyle(search);
  return {
    bodyFont: body.fontFamily,
    bodyBg: body.backgroundColor,
    bodyColor: body.color,
    searchRadius: sc?.borderRadius,
    searchBg: sc?.backgroundColor,
  };
});
console.log(JSON.stringify(r, null, 2));
await b.close();
