/* eslint-disable import/no-extraneous-dependencies -- Playwright tests are test-only. */
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('/fixture/reset');
});

[
  ['buildings', 'Buildings'],
  ['roomTypes', 'Room Types'],
  ['rooms', 'Rooms'],
  ['shifts', 'Shift Management'],
  ['schoolIdentity', 'School Identity'],
  ['schoolDocuments', 'School Documents'],
].forEach(([scope, title]) => {
  test(`${title} settings persist, preview new entries, and stay contained`, async ({
    page,
    request,
  }) => {
    await page.goto(`/?scope=${scope}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Field settings', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Field Formatting', exact: true });
    await expect(dialog.getByRole('radio', { name: /^Default/ })).toBeChecked();
    await dialog.getByRole('radio', { name: /^Uppercase/ }).check();
    const input = dialog.getByRole('textbox', { name: 'You type', exact: true });
    await input.fill('mixed entry');
    await expect(dialog.getByLabel('New entry will be saved as', { exact: true })).toHaveText(
      'MIXED ENTRY'
    );
    await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Field settings', exact: true }).click();
    await expect(dialog.getByRole('radio', { name: /^Uppercase/ })).toBeChecked();
    if (scope === 'rooms') {
      await dialog.getByRole('combobox', { name: 'Field', exact: true }).click();
      await page.getByRole('option', { name: 'Extra feature', exact: true }).click();
      await expect(dialog.getByRole('radio', { name: /^Default/ })).toBeChecked();
      await dialog.getByRole('radio', { name: /PascalCase/ }).check();
      await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(dialog).toHaveCount(0);
    } else {
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    }
    await page.getByLabel('New entry', { exact: true }).fill('raw mIxEd entry');
    await expect(page.getByLabel('New entry', { exact: true })).toHaveValue('raw mIxEd entry');
    await expect(
      page.getByText('Will be saved as: RAW MIXED ENTRY', { exact: true })
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    const state = await (await request.get('/fixture/state')).json();
    expect(state.writes.map((entry: { scope: string }) => entry.scope)).toEqual(
      scope === 'rooms' ? [scope, scope] : [scope]
    );
    if (scope === 'rooms') expect(state.rules.rooms).toEqual({ roomName: 4, featureName: 3 });
    expect(state.rules.buildings.floorName).toBe(0);
    expect(state.rules.schoolDocuments.notes).toBe(0);
  });
});

test('a failed save preserves the draft and retries without affecting another scope', async ({
  page,
  request,
}) => {
  await page.goto('/?scope=rooms&theme=dark', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Field settings', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Field Formatting', exact: true });
  await dialog.getByRole('radio', { name: /PascalCase/ }).check();
  await request.post('/fixture/fail-next-save');
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('Could not save');
  await expect(dialog.getByRole('radio', { name: /PascalCase/ })).toBeChecked();
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const state = await (await request.get('/fixture/state')).json();
  expect(state.rules.rooms.roomName).toBe(3);
  expect(state.rules.buildings.buildingName).toBe(0);
  expect(state.writes).toHaveLength(1);
});

test('Unicode preview uses the owning module and keeps raw input', async ({ page, request }) => {
  await page.goto('/?scope=schoolDocuments', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Field settings', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Field Formatting', exact: true });
  await dialog.getByRole('radio', { name: /^Uppercase/ }).check();
  const input = dialog.getByRole('textbox', { name: 'You type', exact: true });
  await input.fill('école primaire');
  await expect(dialog.getByLabel('New entry will be saved as', { exact: true })).toHaveText(
    'ÉCOLE PRIMAIRE'
  );
  await expect(input).toHaveValue('école primaire');
  const state = await (await request.get('/fixture/state')).json();
  expect(state.previews).toContainEqual({
    scope: 'schoolDocuments',
    value: 'école primaire',
    textCase: 4,
  });
  expect(state.writes).toEqual([]);
});

test('view-only users cannot change field settings', async ({ page, request }) => {
  await page.goto('/?scope=buildings&access=view', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Buildings', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Field settings', exact: true })).toHaveCount(0);
  const state = await (await request.get('/fixture/state')).json();
  expect(state.writes).toEqual([]);
});

test('secondary fields save independently from the main name field', async ({ page, request }) => {
  await page.goto('/?scope=buildings&theme=dark', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Field settings', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Field Formatting', exact: true });
  await dialog.getByRole('combobox', { name: 'Field', exact: true }).click();
  await page.getByRole('option', { name: 'Floor name', exact: true }).click();
  await dialog.getByRole('radio', { name: /^Uppercase/ }).check();
  await expect(dialog.getByLabel('New entry will be saved as', { exact: true })).toHaveText(
    'GROUND FLOOR'
  );
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const state = await (await request.get('/fixture/state')).json();
  expect(state.rules.buildings).toEqual({ buildingName: 0, floorName: 4, description: 0 });
});

test('keyboard dismissal protects dirty changes and restores trigger focus', async ({
  page,
  request,
}) => {
  await page.goto('/?scope=shifts&theme=dark', { waitUntil: 'domcontentloaded' });
  const trigger = page.getByRole('button', { name: 'Field settings', exact: true });
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Field Formatting', exact: true });
  await expect(dialog.getByRole('radio', { name: /^Default/ })).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.press('Enter');
  await dialog.getByRole('radio', { name: /^Uppercase/ }).press('Space');
  await page.keyboard.press('Escape');
  const confirmation = page.getByRole('dialog', { name: 'Discard Unsaved Changes?', exact: true });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole('button', { name: 'Keep editing', exact: true }).click();
  await expect(dialog.getByRole('radio', { name: /^Uppercase/ })).toBeChecked();
  await page.keyboard.press('Escape');
  await confirmation.getByRole('button', { name: 'Discard changes', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  const state = await (await request.get('/fixture/state')).json();
  expect(state.writes).toEqual([]);
});
