// Smoke test: undo snackbar, range select, and the `c` compose shortcut.
import { chromium } from 'playwright-core';

const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext();
await ctx.addInitScript(() => localStorage.setItem('gm.signedIn', '["lalitkofficial@gmail.com"]'));
const p = await ctx.newPage();
await p.goto('http://localhost:5173/mail/u/0/#inbox', { waitUntil: 'networkidle' });
await p.waitForSelector('.gm-row');

const out = {};
const rowCount = await p.locator('.gm-row').count();

// 1. Hover-archive the first row → snackbar with Undo → row restored on Undo.
const firstSubject = await p.locator('.gm-row .gm-row-subject').first().innerText();
await p.locator('.gm-row').first().hover();
await p.locator('.gm-row').first().locator('[aria-label="Archive"]').click();
await p.waitForSelector('.gm-snackbar');
out.snackbarText = await p.locator('.gm-snackbar-text').innerText();
out.rowsAfterArchive = await p.locator('.gm-row').count();
await p.locator('.gm-snackbar-undo').click();
await p.waitForTimeout(300);
out.rowsAfterUndo = await p.locator('.gm-row').count();
out.firstSubjectRestored = (await p.locator('.gm-row .gm-row-subject').first().innerText()) === firstSubject;
out.snackbarGoneAfterUndo = (await p.locator('.gm-snackbar').count()) === 0;

// 2. Shift-click range selection: click the first checkbox, shift-click the last → all in between selected.
const checks = p.locator('.gm-row .gm-row-check');
const n = await checks.count();
const last = Math.min(n - 1, 3);
await checks.nth(0).click();
await checks.nth(last).click({ modifiers: ['Shift'] });
out.rangeExpected = last + 1;
out.rangeSelected = await p.locator('.gm-row--selected').count();

// 3. `e` archives the selection, snackbar offers bulk undo.
await p.keyboard.press('Escape');
out.selectedAfterEsc = await p.locator('.gm-row--selected').count();

// 4. `c` opens compose.
await p.keyboard.press('c');
out.composeOpen = (await p.locator('.gm-compose-win').count()) === 1;

console.log(JSON.stringify({ rowCount, ...out }, null, 2));
await b.close();
