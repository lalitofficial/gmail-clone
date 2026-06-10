import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn', { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => console.log('nav:', e.message));
await p.waitForTimeout(1500);
console.log('URL:', p.url());
await p.screenshot({ path: '/tmp/google-signin.png' });
// measure the card + input
const m = await p.evaluate(() => {
  const pick = (el) => { if(!el) return null; const c=getComputedStyle(el); return {w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height, bg:c.backgroundColor, radius:c.borderRadius, border:c.border, font:c.fontFamily}; };
  return { bodyBg: getComputedStyle(document.body).backgroundColor, input: pick(document.querySelector('input[type="email"]')) };
});
console.log(JSON.stringify(m,null,2));
await b.close();
