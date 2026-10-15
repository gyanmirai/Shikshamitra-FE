import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const origin = 'http://127.0.0.1:4321';
const a = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const b = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const output = new URL('../../../.artifacts/shift-isolation/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
const results = [];
page.on('pageerror', (error) => errors.push(error.message));
const check = async (name, action) => {
  await action();
  results.push({ name, status: 'passed' });
  console.log(`PASS ${name}`);
};
const ownInput = {
  shiftName: 'Swaminarayan browser shift',
  startTime: '08:00:00',
  endTime: '16:00:00',
};
try {
  await page.goto(origin);
  await check('DDVS grid contains its four shifts and excludes host legacy rows', async () => {
    for (const name of ['Mayur shift', 'Full Day Shift', 'Afternoon Shift', 'Morning Shift'])
      await expect(page.getByRole('cell', { name, exact: true })).toBeVisible();
    await expect(page.getByText('Legacy unassigned shift')).toHaveCount(0);
  });
  const response = await page.request.get(`${origin}/api/app/shift-management`, {
    headers: { Authorization: `Bearer ${a}` },
  });
  const foreign = (await response.json()).items[0];
  await check(
    'tenant switch clears both query results and the cached token immediately',
    async () => {
      await page.getByRole('button', { name: 'Switch to Swaminarayan' }).click();
      await expect(page.getByText('Shree Swaminarayan Vidyalaya', { exact: true })).toBeVisible();
      await expect(page.getByText('No shifts have been added yet.')).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Mayur shift', exact: true })).toHaveCount(0);
    }
  );
  await check(
    'foreign read update delete and forged standard assignment are rejected by the real API',
    async () => {
      const headers = { Authorization: `Bearer ${b}` };
      const url = `${origin}/api/app/shift-management/${foreign.id}`;
      expect((await page.request.get(url, { headers })).status()).toBe(404);
      expect((await page.request.put(url, { headers, data: ownInput })).status()).toBe(404);
      expect((await page.request.delete(url, { headers })).status()).toBe(404);
      const standard = await page.request.post(`${origin}/api/app/standard`, {
        headers,
        data: {
          name: 'Forged class',
          ageLowerLimit: 6,
          educationMediumStageId: a,
          shiftId: foreign.id,
        },
      });
      expect(standard.status()).toBe(400);
      expect(await standard.text()).toContain('HR:Attendance:020310');
    }
  );
  await check('new shift creation ignores a client-supplied foreign tenant ID', async () => {
    const created = await page.request.post(`${origin}/api/app/shift-management`, {
      headers: { Authorization: `Bearer ${b}` },
      data: { ...ownInput, tenantId: a },
    });
    expect(created.ok()).toBe(true);
    await page.reload();
    await expect(page.getByRole('cell', { name: ownInput.shiftName, exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Mayur shift', exact: true })).toHaveCount(0);
  });
  await check('Add Standard dropdown contains only this school’s shift', async () => {
    await page.getByRole('button', { name: 'Add Standard', exact: true }).click();
    await page.getByRole('combobox', { name: 'Shift (optional)' }).click();
    await expect(page.getByRole('option', { name: /Swaminarayan browser shift/ })).toBeVisible();
    await expect(
      page.getByRole('option', { name: /Mayur|Morning|Afternoon|Full Day/ })
    ).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  });
  await check('own shift can be edited and the grid refetches the saved name', async () => {
    await page
      .getByRole('row')
      .filter({ hasText: ownInput.shiftName })
      .getByRole('button', { name: 'Edit', exact: true })
      .click();
    await page
      .getByRole('textbox', { name: 'Name', exact: true })
      .fill('Swaminarayan updated shift');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(
      page.getByRole('cell', { name: 'Swaminarayan updated shift', exact: true })
    ).toBeVisible();
  });
  await check('switching back restores DDVS data without showing Swaminarayan data', async () => {
    await page.getByRole('button', { name: 'Switch to DDVS' }).click();
    await expect(page.getByRole('cell', { name: 'Mayur shift', exact: true })).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Swaminarayan updated shift', exact: true })
    ).toHaveCount(0);
    await page.screenshot({
      path: new URL('ddvs-grid.png', output).pathname.replace(/^\/(\w:)/, '$1'),
      fullPage: true,
    });
  });
  await check('browser runtime has no uncaught errors', async () => expect(errors).toEqual([]));
} finally {
  await writeFile(new URL('results.json', output), JSON.stringify({ results, errors }, null, 2));
  await browser.close();
}
