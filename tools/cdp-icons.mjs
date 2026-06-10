import { chromium } from 'playwright-core';
const b = await chromium.connectOverCDP('http://localhost:9222');
const page = b.contexts()[0].pages()[0];
await page.bringToFront();

const out = await page.evaluate(() => {
  const res = {};
  // Upgrade button
  const up = [...document.querySelectorAll('a,div,span,button')].find(
    (e) => e.textContent.trim() === 'Upgrade' && e.querySelector('svg,img,*[style*="background"]') || (e.textContent.trim() === 'Upgrade' && e.children.length <= 4),
  );
  if (up) {
    let n = up;
    for (let i = 0; i < 5 && n; i++) {
      if (n.matches?.('a,button,[role="button"]')) break;
      n = n.parentElement;
    }
    res.upgradeHTML = (n || up).outerHTML.slice(0, 1200);
  }
  // Gemini icon button (aria-label contains Gemini/Ask)
  const gem = document.querySelector('[aria-label*="Gemini" i], [aria-label*="Ask" i]');
  res.geminiHTML = gem ? gem.outerHTML.slice(0, 800) : 'not found';
  return res;
});
console.log('UPGRADE:\n', out.upgradeHTML, '\n');
console.log('GEMINI:\n', out.geminiHTML);
await b.close();
