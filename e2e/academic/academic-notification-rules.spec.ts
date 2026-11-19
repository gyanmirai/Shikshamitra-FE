import { test, expect } from '@playwright/test';

import { login, prepare, snapshot, fixtureApi, expectHealthy } from './academic-module-setup.helpers';

const tag = ['@module-academic', '@submodule-notifications', '@regression', '@responsive', '@accessibility'];

test('legacy category link opens the scoped Rules workspace and saves an override', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, notificationRules: true } });
  await prepare(page, request);
  await login(page);
  await page.goto('/academic/notification?tab=homeworkAssignment');
  const table = page.getByRole('table', { name: 'Academic notification rules table' });
  await expect(table.getByText('Disabled · inherited')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expectHealthy(page);
  await table.getByRole('button', { name: 'Configure Homework published' }).click();
  const drawer = page.getByRole('dialog', { name: 'Configure Rule' });
  await expect(drawer.getByText('Primary guardian is included.')).toBeVisible();
  await expect(drawer.getByRole('checkbox', { name: 'Include student account' })).not.toBeChecked();
  await drawer.getByRole('switch', { name: 'Enabled' }).click();
  await drawer.getByRole('combobox', { name: 'Published templates' }).click();
  await page.getByRole('option', { name: /Homework notice/ }).click();
  await page.keyboard.press('Escape');
  await drawer.getByRole('button', { name: 'Submit' }).click();
  await expect(drawer).toBeHidden();
  await expect(table.getByText('Enabled', { exact: true })).toBeVisible();
  const [saved] = (await snapshot(request)).notificationRuleWrites;
  expect(saved).toMatchObject({ enabled: true, guardianMode: 0, includeStudentAccount: false });
  expect(saved.scope.mediumId).toBeTruthy();
  expect(saved.concurrencyStamp).toBeUndefined();
});
