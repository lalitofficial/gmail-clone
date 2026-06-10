import { chromium } from 'playwright-core';
const b = await chromium.connectOverCDP('http://localhost:9222');
const page = b.contexts()[0].pages()[0];
await page.goto('https://mail.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch((e)=>console.log('nav note:', e.message));
await page.waitForTimeout(2000);
console.log('URL  :', page.url());
console.log('TITLE:', await page.title());
await b.close();
