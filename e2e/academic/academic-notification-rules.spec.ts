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

test('shows scoped delivery evidence and filters unknown acceptance on a phone', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, notificationDeliveries: true } });
  await prepare(page, request);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/academic/notification?view=history&operation=5d643be1-59a9-4d91-a7b1-7dbd9b673011');
  const table = page.getByRole('table', { name: 'Academic notification delivery history table' });
  await expect(page.getByText('Partially failed', { exact: true })).toBeVisible();
  await expect(table.getByText('Delivered', { exact: true })).toBeVisible();
  await expect(table.getByText('Acceptance unknown', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Delivery status' }).click();
  await page.getByRole('option', { name: 'Acceptance unknown', exact: true }).click();
  await expect(table.getByText('Delivered', { exact: true })).toHaveCount(0);
  await expect(table.getByText('Smtp acceptance unknown', { exact: true })).toBeVisible();
  await expectHealthy(page);
});

test('reports a personal unread count and keeps read and acknowledge actions distinct', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, notificationDeliveries: true } });
  await prepare(page, request);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dashboard');
  const open = page.getByRole('button', { name: 'Open notifications' });
  await expect(open).toHaveAccessibleDescription('1 unread notification');
  await open.click();
  const drawer = page.getByRole('dialog', { name: 'Notifications' });
  await expect(drawer.getByRole('heading', { name: 'Homework notice' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Open record' })).toHaveAttribute('href', '/academic/dashboard');
  await drawer.getByRole('button', { name: 'Mark as read' }).click();
  await expect(drawer.getByRole('button', { name: 'Mark as read' })).toHaveCount(0);
  await expect(drawer.getByText('Acknowledged', { exact: true })).toHaveCount(0);
  await drawer.getByRole('button', { name: 'Acknowledge' }).click();
  await expect(drawer.getByText('Acknowledged', { exact: true })).toBeVisible();
  await drawer.getByRole('tab', { name: 'Unread', exact: true }).click();
  await expect(drawer.getByText('You have no unread notifications.')).toBeVisible();
  await drawer.getByRole('button', { name: 'Close notifications' }).click();
  await expect(open).toHaveAccessibleDescription('0 unread notifications');
  await expectHealthy(page);
});
