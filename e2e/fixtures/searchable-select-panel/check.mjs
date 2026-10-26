import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

import { checkBoard, checkBoundaryCases } from './interaction-checks.mjs';

const origin = process.argv[2] || 'http://127.0.0.1:4209';
const output = '.artifacts/searchable-select-panel';
const results = [];
const errors = [];
const backendRequests = [];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const theme of ['light', 'dark']) {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ]) {
      const name = `${theme}-${viewport.width}x${viewport.height}`;
      const page = await browser.newPage({ viewport });
      page.setDefaultTimeout(15000);
      page.on('pageerror', (error) => errors.push({ name, message: error.message }));
      page.on('request', (request) => {
        if (/education-board|\/api\/auth\//.test(request.url()))
          backendRequests.push(request.url());
      });
      try {
        await page.goto(`${origin}/?theme=${theme}`, { waitUntil: 'networkidle' });
        await expect(
          page.getByRole('heading', { name: 'Searchable select panel', exact: true })
        ).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', theme);
        const board = await checkBoard(page, `${output}/${name}-board-open.png`);
        const boundary = await checkBoundaryCases(page);
        results.push({ name, status: 'passed', board, boundary });
        console.log(`PASS ${name}: geometry, filtering, no-results, click, keyboard, empty source`);
      } catch (error) {
        results.push({ name, status: 'failed', error: error.message });
        await page.screenshot({ path: `${output}/${name}-failure.png` });
        console.log(`FAIL ${name}: ${error.message}`);
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ results, errors, backendRequests }, null, 2)
  );
  await writeFile(
    `${output}/check.log`,
    results
      .map((r) => `${r.status.toUpperCase()} ${r.name}${r.error ? `: ${r.error}` : ''}`)
      .join('\n')
  );
}

assert.equal(errors.length, 0, JSON.stringify(errors));
assert.equal(
  backendRequests.length,
  0,
  `Unexpected backend requests: ${backendRequests.join(', ')}`
);
assert.equal(
  results.filter((result) => result.status === 'failed').length,
  0,
  'Supporting browser checks failed'
);
