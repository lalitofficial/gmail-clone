import { chromium } from 'playwright-core';
const b = await chromium.connectOverCDP('http://localhost:9222');
for (const ctx of b.contexts()) {
  for (const p of ctx.pages()) {
    console.log('URL  :', p.url());
    console.log('TITLE:', await p.title());
  }
}
await b.close();
