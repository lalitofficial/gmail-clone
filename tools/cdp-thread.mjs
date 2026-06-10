import { chromium } from 'playwright-core';

const b = await chromium.connectOverCDP('http://localhost:9222');
const page = b.contexts()[0].pages()[0];
await page.bringToFront();

// Open an already-READ row (no unread-state change to the real account).
const readRow = await page.$('tr.zA.yO');
if (readRow) {
  await readRow.click();
  await page.waitForSelector('h2.hP', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

const data = await page.evaluate(() => {
  const props = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'letterSpacing'];
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = cs[p];
    return o;
  };
  const q = (s) => pick(document.querySelector(s));
  return {
    subject: q('h2.hP'),
    senderName: q('.gD'),
    senderEmail: q('.go'),
    toMe: q('.hb') || q('.g3'),
    date: q('.gK .g3') || q('.g3'),
    body: q('.a3s') || q('.ii'),
  };
});
console.log(JSON.stringify(data, null, 2));
await page.screenshot({ path: '/tmp/real-thread.png' });
await b.close();
