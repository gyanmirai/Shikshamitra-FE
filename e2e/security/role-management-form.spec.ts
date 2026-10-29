import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request, page }) => {
  await request.post('/fixture/reset');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('button', { name: 'Set Module Visibility for QA Role 01', exact: true })
  ).toBeVisible();
});

test('required errors focus the field and dirty closing preserves or discards the draft', async ({
  page,
  request,
}) => {
  const launcher = page.getByRole('button', { name: 'Add Role', exact: true });
  await launcher.click();
  const dialog = page.getByRole('dialog', { name: 'Add Role', exact: true });
  await expect(dialog.getByText('Role Details', { exact: true })).toBeVisible();
  const name = dialog.getByRole('textbox', { name: 'Role Name' });
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(dialog.getByText('Role is required', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Color is required', { exact: true })).toBeVisible();
  await expect(name).toBeFocused();
  await name.fill('Synthetic unsaved draft');
  await name.press('Enter');
  await expect(dialog.getByRole('button', { name: 'Green (#00B96B)', exact: true })).toBeFocused();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  const confirmation = page.getByRole('dialog', { name: 'Discard Unsaved Changes?', exact: true });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole('button', { name: 'Keep Editing', exact: true }).click();
  await expect(name).toHaveValue('Synthetic unsaved draft');
  await dialog.getByRole('button', { name: 'close', exact: true }).click();
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole('button', { name: 'Keep Editing', exact: true }).click();
  await page.keyboard.press('Escape');
  await confirmation.getByRole('button', { name: 'Discard Changes', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(launcher).toBeFocused();
  expect((await (await request.get('/fixture/state')).json()).writes).toHaveLength(0);
  await launcher.click();
  await expect(page.getByRole('textbox', { name: 'Role Name' })).toHaveValue('');
  const checkTheme = async (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
      await page.getByRole('button', { name: 'Switch theme' }).click();
      await launcher.click();
    }
    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`role-form-${theme}.png`) });
  };
  await checkTheme('light');
  await checkTheme('dark');
});

test('native submit locks edits and close, retains failure, and retries once', async ({
  page,
  request,
}) => {
  await page.getByRole('button', { name: 'Add Role', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Add Role', exact: true });
  const name = dialog.getByRole('textbox', { name: 'Role Name' });
  await name.fill('synthetic HR role');
  await expect(name).toHaveValue('Synthetic HR role');
  await dialog.getByRole('button', { name: 'Green (#00B96B)', exact: true }).click();
  await request.post('/fixture/control', { data: { failSave: true, delay: 900 } });
  await name.press('Enter');
  await expect(dialog.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
  await expect(name).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'close', exact: true })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('alert')).toContainText('A role with this name already exists.');
  await expect(name).toHaveValue('Synthetic HR role');
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeEnabled();
  await name.press('Enter');
  await expect(dialog).toHaveCount(0);
  const state = await (await request.get('/fixture/state')).json();
  expect(state.writes).toHaveLength(2);
  expect(state.writes[1].body).toMatchObject({
    name: 'Synthetic HR role',
    color: '#00B96B',
    employeeGroupAudience: 'Both',
    employeeOnboardingAssignable: false,
    extraProperties: { roleAudience: 'Employee', employeeOnboardingAssignable: false },
  });
});

test('edit retains role metadata and delete opens the existing confirmation', async ({
  page,
  request,
}) => {
  await page.getByRole('button', { name: 'More actions for QA Role 01', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Edit QA Role 01', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit Role', exact: true });
  await expect(dialog.getByRole('textbox', { name: 'Role Name' })).toHaveValue('QA Role 01');
  await expect(
    dialog.getByRole('button', { name: 'Green (#00B96B)', exact: true })
  ).toHaveAttribute('aria-pressed', 'true');
  await dialog.getByRole('combobox', { name: /Employee Group Availability/ }).click();
  await page.getByRole('option', { name: 'Teaching only', exact: true }).click();
  await dialog.getByRole('checkbox', { name: 'Available for employee onboarding' }).check();
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const state = await (await request.get('/fixture/state')).json();
  expect(state.writes).toHaveLength(1);
  expect(state.writes[0]).toMatchObject({
    method: 'PUT',
    path: '/api/identity/roles/qa-role-1',
    body: { employeeOnboardingAssignable: true, employeeGroupAudience: 'Teaching' },
  });
  await page.getByRole('button', { name: 'More actions for QA Role 01', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Delete QA Role 01', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Delete Role', exact: true })).toContainText(
    'QA Role 01'
  );
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  expect((await (await request.get('/fixture/state')).json()).writes).toHaveLength(1);
});
