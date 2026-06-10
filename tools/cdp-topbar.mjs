import { chromium } from 'playwright-core';
const b = await chromium.connectOverCDP('http://localhost:9222');
const page = b.contexts()[0].pages()[0];
await page.bringToFront();
const dim = await page.evaluate(() => ({ w: window.innerWidth }));
await page.screenshot({ path: '/tmp/real-topbar-full.png', clip: { x: dim.w - 620, y: 0, width: 600, height: 80 } });
console.log('captured, innerWidth', dim.w);
await b.close();
