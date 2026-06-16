// Verify thread stacking (trim band + two-line collapsed) and the print popup layout.
import { chromium } from 'playwright-core';

const TID = 'FMfcgzerJEw4yAapBQP7AMqGIiq6';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => localStorage.setItem('gm.signedIn', '["lalitkofficial@gmail.com"]'));
const p = await ctx.newPage();
await p.goto(`http://localhost:5173/mail/u/0/#inbox/${TID}`, { waitUntil: 'networkidle' });
await p.waitForSelector('.gm-message', { timeout: 8000 });

const out = {};
out.trimBandVisible = (await p.locator('.gm-thread-trim').count()) === 1;
out.trimCount = out.trimBandVisible ? await p.locator('.gm-thread-trim-badge').innerText() : null;
out.collapsedRows = await p.locator('.gm-msg-collapsed').count();
// Two-line check: collapsed text container holds sender + snippet stacked.
out.twoLine = (await p.locator('.gm-msg-collapsed-text').count()) > 0;
await p.screenshot({ path: '/tmp/gm-thread-stack.png' });

// Expand the trim band.
if (out.trimBandVisible) {
  await p.locator('.gm-thread-trim').click();
  await p.waitForTimeout(200);
  out.afterExpandTrimGone = (await p.locator('.gm-thread-trim').count()) === 0;
}

// Print popup.
const [popup] = await Promise.all([
  p.waitForEvent('popup'),
  p.locator('[aria-label="Print all"]').first().click(),
]);
await popup.waitForLoadState('domcontentloaded');
await popup.waitForTimeout(300);
out.printSubject = await popup.locator('.subject').innerText();
out.printMessageCount = await popup.locator('.message-count').innerText();
out.printAccountId = await popup.locator('.account-id').innerText();
out.printHasGmailLogo = (await popup.locator('.brand svg').count()) === 1;
out.printMessageBlocks = await popup.locator('.message').count();
await popup.emulateMedia({ media: 'print' });
await popup.screenshot({ path: '/tmp/gm-print.png', fullPage: true });

console.log(JSON.stringify(out, null, 2));
await b.close();
