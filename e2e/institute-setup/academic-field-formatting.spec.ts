import { test, expect } from '@playwright/test';

['light', 'dark'].forEach((theme) => {
  test(`${theme}: configure new-name formatting without rewriting saved school values`, async ({
    page,
    request,
  }) => {
    await request.post('/fixture/reset');
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/?theme=${theme}`);
    await page.getByRole('button', { name: 'Open Board CBSE', exact: true }).click();
    await page.getByRole('button', { name: 'Open Medium English', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Open Stage primary stage', exact: true })
    ).toBeVisible();
    const trigger = page.getByRole('button', { name: 'Field settings', exact: true });
    await trigger.click();
    const popover = page.getByRole('dialog', { name: 'Field Formatting', exact: true });
    await expect(popover).toBeVisible();
    await expect(popover.getByRole('radio', { name: /^Default/ })).toBeChecked();
    await expect(popover.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
    await popover.getByRole('radio', { name: /^camelCase/ }).check();
    await expect(popover.getByText('secondaryStage', { exact: true }).last()).toBeVisible();
    await popover.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(popover).toHaveCount(0);
    await trigger.click();
    await expect(popover.getByRole('radio', { name: /^camelCase/ })).toBeChecked();
    await popover.getByRole('radio', { name: /^PascalCase/ }).check();
    await request.post('/fixture/fail-next-save');
    await popover.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(popover.getByRole('radio', { name: /^PascalCase/ })).toBeChecked();
    await expect(popover.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
    let state = await (await request.get('/fixture/state')).json();
    expect(state.rules.stage).toBe(2);
    await popover.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(popover).toHaveCount(0);
    await page.reload();
    await page.getByRole('button', { name: 'Field settings', exact: true }).click();
    await expect(popover.getByRole('radio', { name: /^PascalCase/ })).toBeChecked();
    state = await (await request.get('/fixture/state')).json();
    expect(state.rules.stage).toBe(3);
    expect(state.boards[0].name).toBe('CBSE');
    expect(state.boards[0].educationMediums[0].educationMediumStages[0].name).toBe('primary stage');
    const bounds = await popover.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await page.screenshot({
      path: test.info().outputPath(`formatting-${theme}.png`),
      fullPage: true,
    });
    await popover.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(popover).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test('view-only school user does not receive the settings action', async ({ page, request }) => {
  await request.post('/fixture/reset');
  await page.goto('/?access=view');
  await expect(page.getByRole('heading', { name: 'Academic Setup', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Field settings', exact: true })).toHaveCount(0);
  const state = await (await request.get('/fixture/state')).json();
  expect(state.writes).toEqual([]);
});

test('Uppercase saves, previews Unicode, and keeps existing names unchanged', async ({
  page,
  request,
}) => {
  await request.post('/fixture/reset');
  await page.goto('/');
  await page.getByRole('button', { name: 'Field settings', exact: true }).click();
  const popover = page.getByRole('dialog', { name: 'Field Formatting', exact: true });
  await expect(popover.getByRole('radio', { name: /^Default/ })).toBeChecked();
  await popover.getByRole('radio', { name: /^Uppercase/ }).check();
  await expect(popover.getByLabel('New entry will be saved as', { exact: true })).toHaveText(
    'SECONDARY STAGE'
  );
  await popover.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(popover).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Field settings', exact: true }).click();
  await expect(popover.getByRole('radio', { name: /^Uppercase/ })).toBeChecked();
  const input = popover.getByRole('textbox', { name: 'You type', exact: true });
  await input.fill('école primaire');
  await expect(popover.getByLabel('New entry will be saved as', { exact: true })).toHaveText(
    'ÉCOLE PRIMAIRE'
  );
  await expect(input).toHaveValue('école primaire');
  await expect(popover.getByRole('button', { name: 'Submit', exact: true })).toBeVisible();
  const state = await (await request.get('/fixture/state')).json();
  expect(state.rules.stage).toBe(4);
  expect(state.rules.medium).toBe(0);
  expect(state.boards[0].name).toBe('CBSE');
  expect(state.boards[0].educationMediums[0].educationMediumStages[0].name).toBe('primary stage');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
});

test('Unicode preview preserves raw input and uses the authoritative PascalCase output', async ({
  page,
  request,
}) => {
  await request.post('/fixture/reset');
  await page.goto('/');
  await page.getByRole('button', { name: 'Field settings', exact: true }).click();
  const popover = page.getByRole('dialog', { name: 'Field Formatting', exact: true });
  const input = popover.getByRole('textbox', { name: 'You type', exact: true });
  const output = popover.getByLabel('New entry will be saved as', { exact: true });
  await input.fill('ßeta');
  await expect(output).toHaveText('ßeta');
  await popover.getByRole('radio', { name: /^PascalCase/ }).check();
  await expect(output).toHaveText('ßeta');
  await expect(input).toHaveValue('ßeta');
  const state = await (await request.get('/fixture/state')).json();
  expect(state.previewRequests).toEqual([{ value: 'ßeta', textCase: 3 }]);
  expect(state.writes).toEqual([]);
  expect(state.rules).toEqual({ board: 0, medium: 0, stage: 0, standard: 0, division: 0 });
});
