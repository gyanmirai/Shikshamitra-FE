import { test, expect } from '@playwright/test';

import { login, prepare, fixtureApi, expectHealthy } from './academic-module-setup.helpers';

const tag = ['@module-academic', '@submodule-notifications', '@regression', '@responsive', '@accessibility'];

test('follows a dynamic template test from preview to delivery and the personal inbox', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, notificationRules: true, notificationTemplateTest: true } });
  await prepare(page, request);
  await login(page);
  await page.goto('/academic/notification');
  await expect(page.getByRole('table', { name: 'Academic notification rules table' })).toBeVisible();
  await page.getByRole('tab', { name: 'Templates' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'New template' }).click();
  const editor = page.getByRole('dialog', { name: 'New notification template' });
  await editor.getByRole('textbox', { name: 'Template name' }).fill('Homework family test');
  await editor.getByRole('textbox', { name: 'Subject' }).fill('Homework sample');
  await editor.getByRole('textbox', { name: 'Message' }).fill('Homework for {{student_name}}');
  await editor.getByRole('button', { name: 'Save draft' }).click();
  await editor.getByRole('button', { name: 'Load sample preview' }).click();
  await expect(editor.getByText('Homework for Sample Student')).toBeVisible();
  await editor.getByRole('button', { name: 'Send test' }).click();
  await page.getByRole('dialog', { name: 'Queue test send' }).getByRole('button', { name: 'Queue test send' }).click();
  await editor.getByRole('link', { name: 'Delivery History' }).click();

  const table = page.getByRole('table', { name: 'Academic notification delivery history table' });
  await expect(page.getByText('Template test', { exact: true })).toBeVisible();
  await expect(table.getByText('Queued', { exact: true })).toBeVisible();
  await expect(table.getByText('Delivered', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cancel pending deliveries' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open notifications' })).toHaveAccessibleDescription('0 unread notifications');

  const completed = await request.post(`${fixtureApi}/fixture/complete-template-test`);
  expect(completed.ok()).toBe(true);
  await page.reload();
  await expect(table.getByText('Delivered', { exact: true })).toBeVisible();
  async function checkViewport(width: number, height: number) {
    await page.setViewportSize({ width, height });
    await expectHealthy(page);
  }
  await checkViewport(390, 844);
  await checkViewport(768, 1024);
  await checkViewport(1440, 900);
  await page.getByRole('button', { name: 'Open notifications' }).click();
  const inbox = page.getByRole('dialog', { name: 'Notifications' });
  await expect(inbox.getByRole('heading', { name: '[Test] Homework sample' })).toBeVisible();
  await expect(inbox.getByText('Homework for Sample Student')).toBeVisible();
});
