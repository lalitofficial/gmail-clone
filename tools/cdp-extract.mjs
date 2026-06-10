import { chromium } from 'playwright-core';

const b = await chromium.connectOverCDP('http://localhost:9222');
const page = b.contexts()[0].pages()[0];
await page.bringToFront();
await page.waitForSelector('tr.zA', { timeout: 30000 }).catch(() => console.log('no rows found'));

const data = await page.evaluate(() => {
  const props = [
    'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor',
    'height', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderRadius', 'letterSpacing',
  ];
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = cs[p];
    return o;
  };
  const q = (sel) => pick(document.querySelector(sel));
  const byText = (sel, text) => pick([...document.querySelectorAll(sel)].find((e) => e.textContent.trim() === text));

  return {
    body: pick(document.body),
    searchInput: q('input[aria-label="Search mail"]') || q('input[name="q"]'),
    searchBar: pick((document.querySelector('input[aria-label="Search mail"]') || {}).closest?.('form')),
    composeBtn: byText('div[role="button"]', 'Compose'),
    rowUnread: q('tr.zA.zE'),
    rowRead: q('tr.zA.yO'),
    senderUnread: q('tr.zA.zE .yW span'),
    senderRead: q('tr.zA.yO .yW span'),
    subjectUnread: q('tr.zA.zE .bog'),
    subjectRead: q('tr.zA.yO .bog'),
    snippet: q('tr.zA .y2'),
    date: q('tr.zA .xW span') || q('tr.zA td.xW'),
    navItem: q('.TO'),
    navItemActive: q('.TO.nZ'),
    pageBg: pick(document.querySelector('.bkK') || document.querySelector('[role="main"]')),
  };
});

console.log(JSON.stringify(data, null, 2));
await page.screenshot({ path: '/tmp/real-inbox.png' });
await b.close();
