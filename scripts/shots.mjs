/**
 * Headless screenshots for docs/shots/ — `node scripts/shots.mjs`.
 *
 * Serves the static files with python3's stdlib server (same as the e2e
 * config), drives Chromium through the same UI a reader sees, and writes the
 * two images the README links. No extra dependency: chromium comes from the
 * dev-only @playwright/test install.
 */

import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'shots');
const PORT = Number(process.env.SHOTS_PORT || 6183);
const BASE = `http://127.0.0.1:${PORT}`;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function open(page, hash) {
  await page.goto(`${BASE}/${hash}`);
  await page.locator('body[data-ready="true"]').waitFor();
}

async function shoot() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1320, height: 980 } });

  await open(page, '');
  await page.screenshot({ path: join(OUT, 'home.png') });

  // L3 mid-scenario: PreToolUse + exit 2, stepped to the blocked outcome
  await open(page, '#/lesson/l3-hooks');
  await page.locator('[data-widget="hook"][data-value="PreToolUse"]').click();
  await page.locator('[data-widget="exit"][data-value="2"]').click();
  for (let i = 0; i < 3; i += 1) await page.locator('[data-next]').click();
  await page.locator('.badge[data-tone="blocked"]').waitFor();
  await wait(400);
  await page.screenshot({ path: join(OUT, 'l3-hooks.png') });

  await browser.close();
}

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
  cwd: ROOT,
  stdio: 'ignore',
});

try {
  await wait(900);
  await shoot();
  console.log(`wrote ${join(OUT, 'home.png')} and ${join(OUT, 'l3-hooks.png')}`);
} finally {
  server.kill();
}
