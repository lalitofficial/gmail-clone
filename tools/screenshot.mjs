// Reusable screenshot helper for the visual-calibration loop.
// Uses the system Google Chrome via playwright-core (no browser download).
//
// Usage:
//   node tools/screenshot.mjs --url http://localhost:5173/inbox --out /tmp/a.png \
//     [--click "selector"] [--wait 600] [--size 1440x900]
import { chromium } from 'playwright-core';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, []),
);

const [w, h] = (args.size ?? '1440x900').split('x').map(Number);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
// Seed localStorage before any page script runs (e.g. --ls 'gm.signedIn=["a@b.com"]').
if (args.ls) {
  const eq = args.ls.indexOf('=');
  const key = args.ls.slice(0, eq);
  const value = args.ls.slice(eq + 1);
  await context.addInitScript(([k, v]) => localStorage.setItem(k, v), [key, value]);
}
const page = await context.newPage();
page.setDefaultNavigationTimeout(Number(args.timeout ?? 120000));
await page.goto(args.url, { waitUntil: 'networkidle' });
if (args.click) {
  await page.click(args.click);
}
if (args.tap) {
  const [x, y] = args.tap.split(',').map(Number);
  await page.mouse.click(x, y);
}
await page.waitForTimeout(Number(args.wait ?? 500));
await page.screenshot({ path: args.out });
await browser.close();
console.log('saved', args.out);
