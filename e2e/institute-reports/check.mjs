import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../../.artifacts/institute-reports/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(30000);
page.setDefaultNavigationTimeout(120000);
const errors = [];
const checks = [];
page.on('pageerror', (error) => errors.push(error.message));
const base = process.argv[2] ?? 'http://127.0.0.1:4331/';
const check = async (name, action) => { await action(); checks.push(name); console.log(`PASS ${name}`); };
const choose = async (label, option) => {
  await page.getByRole('combobox', { name: new RegExp(`^${label}`) }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
};
try {
  await page.request.post(base + 'fixture/reset');
  await page.goto(base);
  await expect(page.getByRole('heading', { name: 'Reports', exact: true })).toBeVisible({ timeout: 120000 });
  await check('empty history and exact page actions', async () => {
    await expect(page.getByText('No reports have been generated yet.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Report', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Generate report using ShikshaMitra AI' })).toBeVisible();
  });
  await check('manual hierarchy preview, pagination, failure recovery and complete generation', async () => {
    await page.getByRole('button', { name: 'Report', exact: true }).click();
    await page.getByText('Academic hierarchy', { exact: true }).first().click();
    await expect(page.getByRole('combobox', { name: /^Academic year/ })).toContainText('2026-2027');
    await page.getByRole('button', { name: 'Fail Next Preview' }).click();
    await page.getByRole('button', { name: 'Preview report', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Report Preview' });
    await expect(drawer.getByText('Synthetic preview failure. Please retry.')).toBeVisible();
    await drawer.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(drawer.getByText(/31 matching rows/)).toBeVisible();
    await drawer.getByRole('button', { name: 'Go to next page' }).click();
    await expect(drawer.getByText('26–31 of 31')).toBeVisible();
    await drawer.getByRole('button', { name: 'Generate PDF report' }).click();
    await expect(page.getByRole('row').filter({ hasText: 'Academic hierarchy' })).toContainText('Completed', { timeout: 30000 });
  });
  await check('history download, search and table utilities', async () => {
    const row = page.getByRole('row').filter({ hasText: 'Academic hierarchy' });
    const download = page.waitForEvent('download');
    await row.getByRole('button', { name: 'Download report', exact: true }).click();
    expect((await download).suggestedFilename()).toMatch(/\.pdf$/);
    await page.request.post(base + 'fixture/fail-download');
    await row.getByRole('button', { name: 'Download report', exact: true }).click();
    await expect(page.getByText('Synthetic download failure. Please retry.')).toBeVisible();
    await expect(row).toBeVisible();
    const search = page.getByPlaceholder('Search...').first();
    await search.fill('no-such-report');
    await expect(row).toHaveCount(0);
    await search.fill('');
    await expect(row).toBeVisible();
    await page.getByRole('button', { name: 'Columns', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.screenshot({ path: fileURLToPath(new URL('history-desktop.png', output)) });
  });
  await check('AI clarification, review, explicit approval and history', async () => {
    await page.getByRole('button', { name: 'Generate report using ShikshaMitra AI' }).click();
    await page.getByRole('textbox', { name: /^What report would you like/ }).fill('An ambiguous report about setup in PDF');
    await page.getByRole('button', { name: 'Prepare report plan' }).click();
    await expect(page.getByText('Which setup data do you need?')).toBeVisible();
    await page.getByRole('button', { name: 'Continue planning' }).click();
    await expect(page.getByText('Review Report Plan')).toBeVisible();
    await page.getByRole('button', { name: 'Approve and generate report' }).click();
    await expect(page.getByRole('heading', { name: 'Reports', exact: true })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'Rooms and buildings inventory' })).toContainText('Completed', { timeout: 30000 });
  });
  await check('empty AI response identifies Institute Setup and preserves the request for correction', async () => {
    await page.getByRole('button', { name: 'Generate report using ShikshaMitra AI' }).click();
    await page.getByRole('textbox', { name: /^What report would you like/ }).fill('synthetic empty AI response');
    await page.getByRole('button', { name: 'Prepare report plan' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'did not return a usable Institute Setup report plan' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /^What report would you like/ })).toHaveValue('synthetic empty AI response');
    await expect(page.getByText(/valid Curriculum report plan/)).toHaveCount(0);
    await page.getByRole('textbox', { name: /^What report would you like/ }).fill('can you tell me which class has only one division');
    await page.getByRole('button', { name: 'Prepare report plan' }).click();
    await expect(page.getByText('Classes with exactly one permitted division.')).toBeVisible();
    await expect(page.getByText('Class 2', { exact: true })).toBeVisible();
    await expect(page.getByText('Permitted division count', { exact: true })).toBeVisible();
    await expect(page.getByText(/1 matching rows/)).toBeVisible();
    await page.screenshot({ path: fileURLToPath(new URL('fixed-ai-division-summary.png', output)), fullPage: true });
    await page.getByRole('button', { name: 'Close', exact: true }).click();
  });
  await check('manual class summary counts classes without a division prefilter', async () => {
    await page.getByRole('button', { name: 'Report', exact: true }).click();
    await page.getByText('Class division summary', { exact: true }).first().click();
    await expect(page.getByRole('combobox', { name: /^Division/ })).toHaveCount(0);
    await expect(page.getByText('Division counts include only divisions you are permitted to view.')).toBeVisible();
    await page.getByRole('button', { name: 'Preview report', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Report Preview' }).getByText('Class 2', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.goto(base);
  });
  await check('AI shift report shows the extra calculated hours column before approval', async () => {
    await page.getByRole('button', { name: 'Generate report using ShikshaMitra AI' }).click();
    await page.getByRole('textbox', { name: /^What report would you like/ }).fill('List all shifts with start time, end time and one extra total hours column');
    await page.getByRole('button', { name: 'Prepare report plan' }).click();
    await expect(page.getByText('List shifts with start time, end time and calculated total hours.')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total hours', exact: true })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'Morning' })).toHaveText(/Morning.*07:00.*12:00.*5/);
    await expect(page.getByRole('row').filter({ hasText: 'Night' })).toHaveText(/Night.*22:00.*06:00.*8/);
    await page.screenshot({ path: fileURLToPath(new URL('calculated-shift-hours.png', output)), fullPage: true });
    await page.getByRole('button', { name: 'Approve and generate report' }).click();
    await expect(page.getByRole('row').filter({ hasText: 'Shift register' })).toContainText('Completed', { timeout: 30000 });
  });
  await check('School Documents manual category filters and AI document counts work without academic context', async () => {
    await page.getByRole('button', { name: 'Report', exact: true }).click();
    await page.getByText('School document counts', { exact: true }).first().click();
    await expect(page.getByRole('combobox', { name: /^Academic year/ })).toHaveCount(0);
    await choose('Document category', 'Government approval');
    await page.getByRole('button', { name: 'Preview report', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('row').filter({ hasText: 'All categories' })).toHaveText(/All categories.*1.*2/);
    await page.keyboard.press('Escape');
    await page.goto(base);
    await page.getByRole('button', { name: 'Generate report using ShikshaMitra AI' }).click();
    await page.getByRole('textbox', { name: /^What report would you like/ }).fill('How many school documents are available by category?');
    await page.getByRole('button', { name: 'Prepare report plan' }).click();
    await expect(page.getByRole('columnheader', { name: 'Document count', exact: true })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'All categories' })).toHaveText(/All categories.*2.*3.*30/);
    await page.screenshot({ path: fileURLToPath(new URL('school-document-counts.png', output)), fullPage: true });
    await page.getByRole('button', { name: 'Approve and generate report' }).click();
    await expect(page.getByRole('row').filter({ hasText: 'School document counts' })).toContainText('Completed', { timeout: 30000 });
  });
  await check('School Identity reports expose configuration and counts with optional context', async () => {
    await page.getByRole('button', { name: 'Report', exact: true }).click();
    await page.getByText('School identity configuration', { exact: true }).first().click();
    await expect(page.getByRole('combobox', { name: /^Identity scope/ })).toBeVisible();
    await page.getByRole('combobox', { name: /^Academic year/ }).click();
    await expect(page.getByRole('option', { name: 'All', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Preview report', exact: true }).click();
    await expect(page.getByRole('columnheader', { name: 'Logo selection', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Principal name', exact: true })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.goto(base);
    await page.getByRole('button', { name: 'Generate report using ShikshaMitra AI' }).click();
    await page.getByRole('textbox', { name: /^What report would you like/ }).fill('Count school identity profiles by scope');
    await page.getByRole('button', { name: 'Prepare report plan' }).click();
    await expect(page.getByRole('columnheader', { name: 'Configured profiles', exact: true })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'All scopes' })).toHaveText(/All scopes.*2.*1.*0/);
    await page.screenshot({ path: fileURLToPath(new URL('school-identity-counts.png', output)), fullPage: true });
    await page.getByRole('button', { name: 'Close', exact: true }).click();
  });
  for (const width of [390, 768, 1440]) {
    await check(`responsive manual chooser and keyboard close at ${width}px`, async () => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.getByRole('button', { name: 'Report', exact: true }).click();
      if (width < 1200) await choose('Report type', 'Shift register');
      else await page.getByText('Shift register', { exact: true }).first().click();
      await expect(page.getByRole('combobox', { name: /^Shift/ })).toBeVisible();
      await page.getByRole('button', { name: 'Preview report', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'Report Preview' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      if (width < 1200) await choose('Report type', 'School document counts');
      else await page.getByText('School document counts', { exact: true }).first().click();
      await expect(page.getByRole('combobox', { name: /^Document category/ })).toBeVisible();
      await page.getByRole('button', { name: 'Preview report', exact: true }).click();
      await expect(page.getByRole('dialog').getByRole('columnheader', { name: 'Document count', exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.getByRole('button', { name: 'Switch Theme' }).click();
      await page.screenshot({ path: fileURLToPath(new URL(`manual-${width}.png`, output)) });
      await page.goto(base);
    });
  }
  await check('view-only and denied users cannot start generation', async () => {
    await page.goto(base + '?access=view');
    await expect(page.getByRole('heading', { name: 'Reports', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Report', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Generate report using ShikshaMitra AI' })).toHaveCount(0);
    await page.goto(base + '?access=none');
    await expect(page.getByText('You do not have permission to view Institute Setup reports.')).toBeVisible();
  });
  await check('source-denied users cannot see document, identity or protected signature report choices', async () => {
    for (const [access, absent, present] of [
      ['no-documents', 'School document counts', 'School identity configuration'],
      ['no-identity', 'School identity configuration', 'School document counts'],
      ['no-signatures', 'School identity signature configuration', 'School identity configuration'],
    ]) {
      await page.goto(base + '?access=' + access);
      if (access === 'no-documents') await expect(page.getByRole('row').filter({ hasText: 'School document counts' })).toHaveCount(0);
      await page.getByRole('button', { name: 'Report', exact: true }).click();
      await expect(page.getByText(absent, { exact: true })).toHaveCount(0);
      await expect(page.getByText(present, { exact: true }).first()).toBeVisible();
    }
  });
  expect(errors).toEqual([]);
  await writeFile(new URL('checks.json', output), JSON.stringify({ checks, errors }, null, 2));
} catch (error) {
  await page.screenshot({ path: fileURLToPath(new URL('failure.png', output)), fullPage: true });
  await writeFile(new URL('failure.txt', output), `${error.stack}\n${errors.join('\n')}\n${await page.locator('body').innerText()}`);
  throw error;
} finally { await browser.close(); }
