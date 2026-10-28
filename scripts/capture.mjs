// With dev servers running: PLAYWRIGHT_CHANNEL=chrome node scripts/capture.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'frontend/package.json'));
const { chromium } = require('@playwright/test');
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  args: ['--disable-gpu'],
});
const origin = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const errors = [];
await mkdir(path.join(root, '.impeccable/review'), { recursive: true });

async function capture(name, route, width, height, action) {
  // Fresh pages avoid stale compositor tiles when crossing responsive breakpoints.
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin + route);
  await page.getByRole('heading', {
    name: route.includes('students') ? 'All students' : 'Big futures.',
    exact: route.includes('students'),
  }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  if (action) await action(page);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) {
    throw new Error(`${name}: document overflows viewport`);
  }
  await page.screenshot({
    path: path.join(root, `.impeccable/review/${name}.png`),
    fullPage: name !== 'form-mobile',
  });
  await page.close();
}

try {
  await capture('desktop', '/#overview', 1440, 1000);
  await capture('students-desktop', '/#students', 1440, 1000);
  await capture('mobile', '/#overview', 390, 844);
  await capture('form-mobile', '/#students', 390, 844, page => page.getByRole('button', { name: 'Add student', exact: true }).click());
  await capture('students-mobile', '/#students', 390, 844);
  console.log(JSON.stringify({ captures: 5, browserErrors: errors }));
} finally {
  await browser.close();
}
