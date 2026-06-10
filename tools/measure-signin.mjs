import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
await p.goto('https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn', { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
await p.waitForTimeout(1500);
const m = await p.evaluate(() => {
  const input = document.querySelector('input[type="email"]');
  // climb to the bordered card
  let card = input, found=null;
  for (let i=0;i<15 && card;i++){ const c=getComputedStyle(card); if (c.borderTopWidth!=='0px' && card.getBoundingClientRect().width>380){ found=card; break;} card=card.parentElement; }
  const cs = found && getComputedStyle(found);
  const next = [...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Next');
  const nb = next && getComputedStyle(next);
  return {
    card: cs && { w: found.getBoundingClientRect().width, radius: cs.borderRadius, border: cs.borderColor+' '+cs.borderTopWidth, padding: cs.padding },
    next: nb && { bg: nb.backgroundColor, color: nb.color, radius: nb.borderRadius, h: next.getBoundingClientRect().height, font: nb.fontSize+'/'+nb.fontWeight },
  };
});
console.log(JSON.stringify(m,null,2));
await b.close();
