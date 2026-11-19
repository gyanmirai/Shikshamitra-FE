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

test('creates and previews a template, then preserves its published version during editing', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, notificationRules: true } });
  await prepare(page, request);
  await login(page);
  await page.goto('/academic/notification?view=templates');
  await page.setViewportSize({ width: 390, height: 844 });
  await expectHealthy(page);

  await page.getByRole('button', { name: 'New template' }).click();
  const drawer = page.getByRole('dialog', { name: 'New notification template' });
  const message = drawer.getByRole('textbox', { name: 'Message' });
  await drawer.getByRole('textbox', { name: 'Template name' }).fill('Homework family update');
  await drawer.getByRole('textbox', { name: 'Subject' }).fill('Homework published');
  await message.fill('Homework for {{unknown}}');
  await drawer.getByRole('button', { name: 'Save draft' }).click();
  await expect(drawer.getByText('Variable {{unknown}} is unavailable for this event.')).toBeVisible();
  await expect(message).toBeFocused();
  await message.fill('Homework for ');
  await drawer.getByRole('combobox', { name: 'Insert message variable' }).click();
  await page.getByRole('option', { name: /student name/ }).click();
  await expect(message).toHaveValue('Homework for {{student_name}}');
  await expect(message).toBeFocused();
  await drawer.getByRole('button', { name: 'Save draft' }).click();
  await expect(drawer.getByText('Draft · Version 1')).toBeVisible();
  await drawer.getByRole('button', { name: 'Load sample preview' }).click();
  await expect(drawer.getByText('Preview with sample data')).toBeVisible();
  await expect(drawer.getByText('Homework for Sample Student')).toBeVisible();
  await drawer.getByRole('button', { name: 'Publish draft' }).click();
  await page.getByRole('dialog', { name: 'Publish draft' }).getByRole('button', { name: 'Publish draft' }).click();
  await expect(drawer.getByText('Published · Version 1')).toBeVisible();
  await message.fill('Updated homework for {{student_name}}');
  await drawer.getByRole('button', { name: 'Close template editor' }).click();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await expect(message).toHaveValue('Updated homework for {{student_name}}');
  await drawer.getByRole('button', { name: 'Save new draft' }).click();
  await expect(drawer.getByText('Draft · Version 2')).toBeVisible();
  await drawer.getByRole('button', { name: 'Version history' }).click();
  await expect(drawer.getByText('Version 1 · Published')).toBeVisible();
  await expect(drawer.getByText('Version 2 · Draft')).toBeVisible();
});
