import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const output = '.artifacts/academic-context';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
const results = [];
const themeColors = [];
page.on('pageerror', (error) => errors.push(error.message));
const target = '2025-2026 / GSEB / Gujarati';
const source = '2025-2026 / CBSE / English';
const setMessage = `Are you sure you want to set academic year, board and medium to ${target}?`;
const changeMessage = `Are you sure you want to change academic year, board and medium from ${source} to ${target}?`;
const selector = () => page.getByRole('combobox', { name: 'Academic Year, Board and Medium' });
async function choose(label = target) {
  await selector().click();
  await page.getByRole('option', { name: label, exact: true }).click();
  await page.getByRole('dialog').waitFor();
}
async function verifyMessage(expected) {
  await expect(page.locator('.MuiDialog-container')).toHaveCSS('opacity', '1');
  assert.ok((await page.getByRole('dialog').innerText()).includes(expected));
  assert.ok(!(await page.getByRole('dialog').innerText()).includes(' ?'));
  assert.ok(!(await page.getByRole('dialog').innerText()).match(/\/\s*\//));
}
try {
  await page.goto('http://127.0.0.1:4324/academic/curriculumSubjects');
  await selector().waitFor();
  assert.equal(await selector().inputValue(), '');
  await choose();
  await verifyMessage(setMessage);
  await page.screenshot({ path: `${output}/partial-context-confirmation.png` });
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.equal(await selector().inputValue(), '');
  results.push(
    'Partial current context: set prompt, no empty separators, cancel preserves empty selector'
  );
  await choose();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForFunction(
    (label) => document.querySelector('input[role="combobox"]')?.value === label,
    target
  );
  await page.reload();
  await selector().waitFor();
  await page.waitForFunction(
    (label) => document.querySelector('input[role="combobox"]')?.value === label,
    target
  );
  results.push('Confirmation saves all three fields and reload restores the complete context');
  await page.getByRole('button', { name: 'Complete context', exact: true }).click();
  assert.equal(await selector().inputValue(), source);
  await choose();
  await verifyMessage(changeMessage);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.equal(await selector().inputValue(), source);
  results.push('Complete current context: from/to match selector; cancel preserves all fields');
  for (const scenario of ['Empty context', 'Stale context']) {
    await page.getByRole('button', { name: scenario, exact: true }).click();
    await choose();
    await verifyMessage(setMessage);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    assert.equal(await selector().inputValue(), '');
    results.push(`${scenario}: no fabricated current context`);
  }
  await page.getByRole('button', { name: 'Partial context', exact: true }).click();
  await page.getByRole('button', { name: 'Student year selector', exact: true }).click();
  const yearSelector = page.getByRole('combobox', { name: 'Academic Year', exact: true });
  await yearSelector.click();
  await page.getByRole('option', { name: '2025-2026', exact: true }).click();
  await verifyMessage('Are you sure you want to change academic year from 2026-2027 to 2025-2026?');
  await page.getByRole('button', { name: 'Change year', exact: true }).click();
  await page.getByRole('button', { name: 'Academic context selector', exact: true }).click();
  assert.equal(await selector().inputValue(), target);
  results.push(
    'Student year confirmation remains year-only and carries a complete option to Academics'
  );
  for (const dark of [false, true]) {
    if (dark) await page.getByRole('button', { name: 'Switch theme', exact: true }).click();
    for (const [width, height] of [
      [390, 844],
      [768, 1024],
      [1440, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await page.getByRole('button', { name: 'Partial context', exact: true }).click();
      await selector().press('ArrowDown');
      await page.getByRole('option', { name: target, exact: true }).waitFor();
      await selector().press('Home');
      await selector().press('Enter');
      await page.getByRole('dialog').waitFor();
      await verifyMessage(setMessage);
      const colors = await page.locator('.MuiDialog-paper').evaluate((element) => ({
        foreground: getComputedStyle(element).color,
        background: getComputedStyle(element).backgroundColor,
      }));
      assert.equal(colors.background, dark ? 'rgb(28, 37, 46)' : 'rgb(255, 255, 255)');
      themeColors.push({ dark, width, ...colors });
      const bounds = await page.getByRole('dialog').boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `${output}/${dark ? 'dark' : 'light'}-${width}.png` });
      await page.getByRole('button', { name: 'Cancel', exact: true }).press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      results.push(
        `${dark ? 'Dark' : 'Light'} ${width}: keyboard selection/Escape and no overflow`
      );
    }
  }
  await page.getByRole('button', { name: 'Complete context', exact: true }).click();
  await page.getByRole('button', { name: 'Restrict scope', exact: true }).click();
  await selector().waitFor();
  assert.equal(await selector().inputValue(), '');
  await selector().click();
  await page.getByRole('option', { name: target, exact: true }).waitFor();
  assert.equal(await page.getByRole('option', { name: source, exact: true }).count(), 0);
  await page.getByRole('option', { name: target, exact: true }).click();
  await verifyMessage(setMessage);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  results.push(
    'Removed scope clears the selected combination, hides forbidden options and omits stale from text'
  );
  await page.getByRole('button', { name: 'Fail scope', exact: true }).click();
  await selector().waitFor();
  await selector().click();
  assert.equal(await page.getByRole('option').count(), 0);
  results.push('Scope API failure leaves no selectable unauthorized option');
  assert.deepEqual(errors, []);
  const requests = await page.evaluate(() => window.fixtureAcademicRequests);
  assert.ok(requests.length >= 3);
  assert.ok(requests.every((request) => request.startsWith('GET ')));
  await writeFile(
    `${output}/automated-results.json`,
    JSON.stringify({ results, errors, requests, themeColors }, null, 2)
  );
  console.log(JSON.stringify({ passed: results.length, results, errors }, null, 2));
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png` });
  await writeFile(
    `${output}/failure.json`,
    JSON.stringify({ results, errors, message: error.message, html: await page.content() }, null, 2)
  );
  throw error;
} finally {
  await browser.close();
}
