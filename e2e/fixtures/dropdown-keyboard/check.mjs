import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const origin = process.argv[2] || 'http://127.0.0.1:4207';
const output = '.artifacts/dropdown-keyboard';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const results = [];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

async function check(name, action) {
  try {
    await action();
    results.push({ name, status: 'passed' });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, status: 'failed', error: error.message });
    await page.screenshot({ path: `${output}/${name.replaceAll(/[^a-z0-9]+/gi, '-')}.png` });
    console.log(`FAIL ${name}: ${error.message.split('\n')[0]}`);
  }
}

async function open(kind, suffix = '') {
  await page.goto(`${origin}/?kind=${kind}${suffix}`);
  if (suffix.includes('dialog')) await expect(page.getByRole('dialog')).toBeVisible();
  else
    await expect(
      page.getByRole('heading', { name: 'Dropdown keyboard test fixture' })
    ).toBeVisible();
  const trigger =
    kind === 'chart'
      ? page.getByRole('button', { name: 'Choose chart period', exact: true })
      : page.getByRole('combobox');
  await trigger.click();
  await expect(page.getByRole(kind === 'chart' ? 'menu' : 'listbox')).toBeVisible();
  return trigger;
}

async function highlightMaple(kind) {
  if (['autocomplete', 'readonly', 'remote', 'responsive', 'search'].includes(kind)) {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
  } else {
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
  }
}

try {
  for (const kind of [
    'custom',
    'search',
    'multi',
    'grouped',
    'autocomplete',
    'readonly',
    'remote',
    'responsive',
    'chart',
    'textfield',
  ]) {
    for (const key of ['Space', 'Enter', 'Tab']) {
      await check(`${kind} ${key} selection`, async () => {
        await open(kind);
        await highlightMaple(kind);
        await page.keyboard.press(key);
        await expect(page.getByTestId('selection')).toHaveText(
          kind === 'chart' ? 'Maple' : 'maple'
        );
        await expect(page.getByTestId('submitted')).toHaveText('no');
        if (key === 'Tab') {
          await expect(page.getByRole('button', { name: 'Next field', exact: true })).toBeFocused();
          await expect(page.getByRole(kind === 'chart' ? 'menu' : 'listbox')).toHaveCount(0);
        }
      });
    }
  }
  for (const kind of ['autocomplete', 'remote', 'responsive', 'search']) {
    await check(`${kind} search spaces`, async () => {
      const trigger = await open(kind);
      const input = kind === 'search' ? page.getByPlaceholder('Search options') : trigger;
      await input.fill('Red');
      await input.press('Space');
      await input.press('O');
      await expect(input).toHaveValue('Red O');
      await expect(page.getByTestId('selection')).toHaveText('none');
    });
  }
  for (const kind of ['multi', 'grouped', 'responsive']) {
    await check(`${kind} Tab preserves selected option`, async () => {
      await open(kind);
      await highlightMaple(kind);
      await page.keyboard.press('Space');
      await expect(page.getByTestId('selection')).toHaveText('maple');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('selection')).toHaveText('maple');
      await expect(page.getByRole('button', { name: 'Next field', exact: true })).toBeFocused();
    });
  }
  for (const kind of ['custom', 'search', 'autocomplete', 'chart']) {
    await check(`${kind} Shift+Tab does not select`, async () => {
      await open(kind);
      await highlightMaple(kind);
      await page.keyboard.press('Shift+Tab');
      await expect(page.getByTestId('selection')).toHaveText('none');
      await expect(page.getByRole('button', { name: 'Previous field', exact: true })).toBeFocused();
    });
  }
  for (const kind of ['custom', 'search', 'autocomplete']) {
    await check(`${kind} Escape preserves parent dialog`, async () => {
      await open(kind, '&dialog=1');
      await page.keyboard.press('Escape');
      await expect(page.getByRole('listbox')).toHaveCount(0);
      await expect(page.getByRole('dialog')).toBeVisible();
    });
  }
  await check('disabled option is skipped', async () => {
    await open('disabled');
    await page.keyboard.press('Home');
    await page.keyboard.press('Space');
    await expect(page.getByTestId('selection')).toHaveText('maple');
  });
  await check('empty dropdown Tab advances without selecting', async () => {
    await open('empty');
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('selection')).toHaveText('none');
    await expect(page.getByRole('button', { name: 'Next field', exact: true })).toBeFocused();
  });
  await page.goto(`${origin}/?kind=custom`);
  await page.getByRole('combobox').click();
  await highlightMaple('custom');
  await page.screenshot({ path: `${output}/dropdown-keyboard.png`, animations: 'disabled' });
  await writeFile(`${output}/results.json`, JSON.stringify({ results, errors }, null, 2));
  assert.equal(errors.length, 0, errors.join('\n'));
  assert.equal(
    results.filter((result) => result.status === 'failed').length,
    0,
    'Dropdown smoke checks failed'
  );
} finally {
  await browser.close();
}
