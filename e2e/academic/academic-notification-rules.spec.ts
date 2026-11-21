import { test, expect } from '@playwright/test';

import { login, prepare, snapshot, fixtureApi, expectHealthy } from './academic-module-setup.helpers';

const tag = ['@module-academic', '@submodule-notifications', '@regression', '@responsive', '@accessibility'];

test('shows paused queue processing across the notification workspace', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, notificationRules: true } });
  await prepare(page, request);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  let isQueueWorkerEnabled = false;
  await page.route('**/api/academic/notifications/catalogue', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    await route.fulfill({ response, json: { ...(await response.json()), isQueueWorkerEnabled } });
  });
  await page.goto('/academic/notification?category=learning');
  const notice = page.getByRole('status').filter({ hasText: 'Notification processing is paused on this server.' });
  await expect(notice).toBeVisible();
  await expect(page.getByRole('button', { name: 'Configure Homework published' })).toBeEnabled();
  await page.getByRole('tab', { name: 'Templates' }).click();
  await expect(notice).toBeVisible();
  await page.getByRole('tab', { name: 'Delivery History' }).click();
  await expect(notice).toBeVisible();

  isQueueWorkerEnabled = true;
  const refreshed = page.waitForResponse((response) => response.url().endsWith('/notifications/catalogue'));
  await page.reload();
  await (await refreshed).finished();
  await expect(notice).toHaveCount(0);
  await expectHealthy(page);
  expect((await snapshot(request)).notificationRuleWrites).toEqual([]);
});

test('shows channel setup while staff prepare a notification rule', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, notificationRules: true } });
  await prepare(page, request);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/academic/notification?category=learning');
  await page.getByRole('button', { name: 'Configure Homework published' }).click();
  const drawer = page.getByRole('dialog', { name: 'Configure Rule' });
  const channels = drawer.getByRole('combobox', { name: 'Additional channels' });
  const setupRequired = drawer.getByText('School setup required for Email.', { exact: true });
  const setupUnknown = drawer.getByText('Setup status is unavailable for WhatsApp.', { exact: true });

  await channels.click();
  await expect(page.getByRole('option', { name: 'Email Setup required' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'WhatsApp Setup status unavailable' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Browser push Configured' })).toBeVisible();
  await page.getByRole('option', { name: 'Email Setup required' }).click();
  await page.getByRole('option', { name: 'WhatsApp Setup status unavailable' }).click();
  await page.keyboard.press('Escape');
  await expect(setupRequired).toBeVisible();
  await expect(setupUnknown).toBeVisible();
  await expectHealthy(page);

  await channels.press('ArrowDown');
  await page.getByRole('option', { name: 'WhatsApp Setup status unavailable' }).click();
  await page.keyboard.press('Escape');
  await expect(setupUnknown).toBeHidden();
  await expect(setupRequired).toBeVisible();
  await drawer.getByRole('button', { name: 'Submit' }).click();
  await expect(drawer).toBeHidden();
  await expect(page.getByRole('table', { name: 'Academic notification rules table' }).getByText('Set up Email')).toBeVisible();
  const [saved] = (await snapshot(request)).notificationRuleWrites;
  expect(saved).toMatchObject({ enabled: false, guardianMode: 0, channels: [3, 2] });
});

test('shows missing template coverage and opens Templates for the same event and scope', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, notificationRules: true } });
  await prepare(page, request);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/academic/notification?category=learning&templateEvent=Academic.Exam.Rescheduled&templateScope=school');
  await page.getByRole('button', { name: 'Configure Homework published' }).click();
  const drawer = page.getByRole('dialog', { name: 'Configure Rule' });
  await drawer.getByRole('switch', { name: 'Enabled' }).check();
  await drawer.getByRole('combobox', { name: 'Published templates' }).click();
  await page.getByRole('option', { name: /Homework notice/ }).click();
  await page.keyboard.press('Escape');
  const missing = drawer.getByRole('list', { name: 'Missing published templates' });
  await expect(missing).toHaveCount(0);
  await drawer.getByRole('checkbox', { name: 'Include student account' }).check();
  await drawer.getByRole('combobox', { name: 'Additional channels' }).click();
  await page.getByRole('option', { name: /^Email/ }).click();
  await page.keyboard.press('Escape');

  await expect(missing.getByRole('listitem')).toHaveText(['Guardian · Email', 'Student Account · In-app, Email']);
  await drawer.getByRole('button', { name: 'Expand Timing and Language' }).click();
  const language = drawer.getByRole('textbox', { name: 'Fallback language' });
  await language.fill('hi');
  await expect(missing.getByRole('listitem')).toHaveText(['Guardian · In-app, Email', 'Student Account · In-app, Email']);
  await language.fill('en');
  await expectHealthy(page);
  const openTemplates = drawer.getByRole('button', { name: 'Open templates' });
  const confirmation = page.getByRole('dialog', { name: 'Discard Unsaved Changes?' });
  await openTemplates.click();
  await confirmation.getByRole('button', { name: 'Keep editing' }).click();
  await expect(drawer.getByRole('checkbox', { name: 'Include student account' })).toBeChecked();
  await expect(missing.getByRole('listitem')).toHaveCount(2);

  async function checkViewport(width: number) {
    await page.setViewportSize({ width, height: 900 });
    await openTemplates.scrollIntoViewIfNeeded();
    await expect(openTemplates).toBeInViewport();
    await expectHealthy(page);
  }
  await checkViewport(768);
  await checkViewport(1440);

  await openTemplates.click();
  await confirmation.getByRole('button', { name: 'Discard changes' }).click();
  await expect(drawer).toBeHidden();
  await expect(page.getByRole('tab', { name: 'Templates' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('combobox', { name: 'Academic event' })).toHaveText('Homework published');
  await expect(page.getByRole('combobox', { name: 'Template list scope' })).toHaveText('Current medium and school');
  expect((await snapshot(request)).notificationRuleWrites).toEqual([]);
});

test('adds starter drafts for the selected event and preserves saved templates', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, notificationRules: true } });
  await prepare(page, request);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/academic/notification?view=templates');
  const add = page.getByRole('button', { name: 'Add starter drafts' });
  await expect(add).toBeVisible();

  await page.getByRole('button', { name: 'New template' }).click();
  const editor = page.getByRole('dialog', { name: 'New notification template' });
  await editor.getByRole('textbox', { name: 'Template name' }).fill('School homework wording');
  await editor.getByRole('textbox', { name: 'Subject' }).fill('Homework update');
  await editor.getByRole('textbox', { name: 'Message' }).fill('School message for {{student_name}}');
  await editor.getByRole('button', { name: 'Save draft' }).click();
  await expect(editor.getByText('Draft · Version 1')).toBeVisible();
  await editor.getByRole('button', { name: 'Close template editor' }).click();

  const confirmation = page.getByRole('dialog', { name: 'Add Starter Drafts' });
  await add.click();
  await expect(confirmation.getByText(/Homework published.*whole school/i)).toBeVisible();
  await confirmation.getByRole('button', { name: 'Cancel' }).click();
  await expect(confirmation).toBeHidden();

  async function confirmDrafts() {
    const response = page.waitForResponse((item) =>
      item.url().endsWith('/api/academic/notifications/templates/initialize-defaults') && item.request().method() === 'POST'
    );
    await confirmation.getByRole('button', { name: 'Add starter drafts' }).click();
    const saved = await response;
    expect(saved.request().postDataJSON()).toEqual({ eventKey: 'Academic.Homework.Published' });
    return saved;
  }

  await page.route('**/api/academic/notifications/templates/initialize-defaults', (route) => route.fulfill({
    status: 503,
    json: { detail: 'Starter draft setup is temporarily unavailable.' },
  }), { times: 1 });
  await add.click();
  expect((await confirmDrafts()).status()).toBe(503);
  await expect(confirmation.getByRole('alert')).toHaveText('Starter draft setup is temporarily unavailable.');
  const added = await confirmDrafts();
  expect(added.ok()).toBe(true);
  expect(await added.json()).toBe(2);
  await expect(confirmation).toBeHidden();
  const draftRows = page.getByRole('row').filter({ hasText: 'Homework starter' });
  await expect(draftRows).toHaveCount(2);
  await expect(draftRows.getByText('V1 · Draft', { exact: true })).toHaveCount(2);
  await expect(draftRows.getByText('Whole school', { exact: true })).toHaveCount(2);
  await expect(draftRows.getByText('Email', { exact: true })).toBeVisible();
  await expect(draftRows.getByText('In-app', { exact: true })).toBeVisible();
  await expect(page.getByText('School homework wording', { exact: true })).toBeVisible();
  await expectHealthy(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await add.click();
  const repeated = await confirmDrafts();
  expect(repeated.ok()).toBe(true);
  expect(await repeated.json()).toBe(0);
  await expect(confirmation).toBeHidden();
  await expect(draftRows).toHaveCount(2);
  await page.getByRole('button', { name: 'Open School homework wording' }).click();
  await expect(page.getByRole('textbox', { name: 'Message' })).toHaveValue('School message for {{student_name}}');
  await expectHealthy(page);
});

test('links a published WhatsApp revision and waits for provider approval before test send', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, {
    data: { visited: true, notificationRules: true, whatsappApproval: true, notificationTemplateTest: true },
  });
  await prepare(page, request);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/academic/notification?view=templates');
  await page.getByRole('button', { name: 'New template' }).click();
  const drawer = page.getByRole('dialog', { name: 'New notification template' });
  await drawer.getByRole('textbox', { name: 'Template name' }).fill('Homework WhatsApp');
  await drawer.getByRole('combobox', { name: 'Delivery channel' }).click();
  await page.getByRole('option', { name: 'WhatsApp', exact: true }).click();
  await drawer.getByRole('textbox', { name: 'Message' }).fill('Homework for {{student_name}}. Open the school website.');
  await drawer.getByRole('button', { name: 'Save draft' }).click();
  const testSend = drawer.getByRole('button', { name: 'Send test' });
  await expect(testSend).toBeDisabled();
  await drawer.getByRole('button', { name: 'Publish draft' }).click();
  await page.getByRole('dialog', { name: 'Publish draft' }).getByRole('button', { name: 'Publish draft' }).click();

  await drawer.getByRole('button', { name: 'Link WhatsApp template' }).click();
  const link = page.getByRole('dialog', { name: 'Link WhatsApp Template' });
  await link.getByRole('textbox', { name: 'Meta template name' }).fill('homework_notice');
  await link.getByRole('button', { name: 'Link template' }).click();
  await expect(link).toBeHidden();
  await drawer.getByRole('button', { name: 'Submit for approval' }).click();
  const submit = page.getByRole('dialog', { name: 'Submit for WhatsApp Approval' });
  await submit.getByRole('button', { name: 'Submit for approval' }).click();
  await expect(drawer.getByText('Awaiting provider approval', { exact: true })).toBeVisible();
  await expect(testSend).toBeDisabled();
  await drawer.getByRole('button', { name: 'Refresh status' }).click();
  const approval = drawer.getByText('Approved by provider', { exact: true });
  await expect(approval).toBeVisible();
  await expect(testSend).toBeEnabled();
  await expectHealthy(page);
  await page.setViewportSize({ width: 768, height: 1024 });
  await approval.scrollIntoViewIfNeeded();
  await expect(approval).toBeInViewport();
  await expectHealthy(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await approval.scrollIntoViewIfNeeded();
  await expect(approval).toBeInViewport();
  await expectHealthy(page);
  await testSend.click();
  await page.getByRole('dialog', { name: 'Queue test send' }).getByRole('button', { name: 'Queue test send' }).click();
  await expect(drawer.getByText('Template test queued.')).toBeVisible();
  const writes = (await snapshot(request)).whatsappApprovalWrites;
  expect(writes.map((write: { action: string }) => write.action)).toEqual(['link', 'submit', 'sync']);
  expect(writes[0]).toMatchObject({
    providerTemplateName: 'homework_notice', templateId: expect.any(String), revisionId: expect.any(String),
  });
});

test('explains what an unavailable event needs in Rules and Configure Rule', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, notificationRules: true } });
  await prepare(page, request);
  await login(page);
  await page.goto('/academic/notification?category=examinations');
  const table = page.getByRole('table', { name: 'Academic notification rules table' });
  const reason = 'This notice requires a saved exam reschedule and a list of the people affected.';
  await expect(table.getByText('Event integration unavailable')).toBeVisible();
  await expect(table.getByText(reason)).toBeVisible();
  await table.getByRole('button', { name: 'Configure Exam rescheduled' }).click();
  const drawer = page.getByRole('dialog', { name: 'Configure Rule' });
  await expect(drawer.getByRole('alert')).toHaveText(reason);
  await expect(drawer.getByRole('switch', { name: 'Enabled' })).toBeDisabled();

  async function checkViewport(width: number, height: number) {
    await page.setViewportSize({ width, height });
    await expect(drawer.getByText(reason)).toBeInViewport();
    await expect(drawer.getByRole('button', { name: 'Cancel' })).toBeInViewport();
    await expectHealthy(page);
  }
  await checkViewport(390, 844);
  await checkViewport(768, 1024);
  await checkViewport(1440, 900);
  await drawer.getByRole('button', { name: 'Cancel' }).click();
  expect((await snapshot(request)).notificationRuleWrites).toEqual([]);
});

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

test('saves and reloads linked student notification preferences at phone width', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true } });
  await prepare(page, request);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Open notifications' }).click();
  await page.getByRole('button', { name: 'Notification preferences' }).click();
  const dialog = page.getByRole('dialog', { name: 'Notification Preferences' });
  await dialog.getByLabel('Apply to').selectOption({ label: 'Sample Learner' });
  await dialog.getByRole('checkbox', { name: 'WhatsApp' }).uncheck();
  await dialog.getByRole('switch', { name: /Quiet hours/ }).check();
  await dialog.getByRole('button', { name: 'Submit' }).click();
  await expect(dialog).toBeHidden();
  const [saved] = (await snapshot(request)).preferenceWrites;
  expect(saved.preferences).toMatchObject({
    category: 'Academic.Homework', studentId: 'b0000000-0000-4000-8000-000000000001',
    enabledChannels: [2, 3, 4], quietHoursEnabled: true, quietHoursStart: '20:00', quietHoursEnd: '07:00',
  });
  await page.getByRole('button', { name: 'Notification preferences' }).click();
  await dialog.getByLabel('Apply to').selectOption({ label: 'Sample Learner' });
  await expect(dialog.getByRole('checkbox', { name: 'WhatsApp' })).not.toBeChecked();
  await expect(dialog.getByLabel('Quiet hours start')).toHaveValue('20:00');
  async function checkViewport(width: number, height: number) {
    await page.setViewportSize({ width, height });
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeInViewport();
    await expectHealthy(page);
  }
  await checkViewport(390, 844);
  await checkViewport(768, 1024);
  await checkViewport(1440, 900);
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
  const delivered = table.getByText('Delivered', { exact: true });
  const unknown = table.getByText('Acceptance unknown', { exact: true });
  await expect(delivered).toBeInViewport({ ratio: 1 });
  await expect(unknown).toBeInViewport({ ratio: 1 });
  const scrollLeft = await table.evaluate((element) => {
    const scroll = element.closest<HTMLElement>('.simplebar-content-wrapper');
    if (!scroll) throw new Error('Delivery history is missing its table scroll container.');
    scroll.scrollLeft = scroll.scrollWidth;
    return scroll.scrollLeft;
  });
  expect(scrollLeft).toBeGreaterThan(0);
  await expect(table.getByRole('columnheader', { name: 'Delivery status' })).toBeInViewport({ ratio: 1 });
  await expect(delivered).toBeInViewport({ ratio: 1 });
  await expect(unknown).toBeInViewport({ ratio: 1 });
  await page.getByRole('combobox', { name: 'Delivery status' }).click();
  await page.getByRole('option', { name: 'Acceptance unknown', exact: true }).click();
  await expect(table.getByText('Delivered', { exact: true })).toHaveCount(0);
  await expect(table.getByText('Smtp acceptance unknown', { exact: true })).toBeVisible();
  await expectHealthy(page);
});

test('confirms a retry for the exact rejected email attempt and refreshes queued status', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, notificationDeliveries: true, notificationRules: true, notificationRetry: 'queued' } });
  await prepare(page, request);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/academic/notification?view=history&operation=5d643be1-59a9-4d91-a7b1-7dbd9b673011');
  const table = page.getByRole('table', { name: 'Academic notification delivery history table' });
  const retry = table.getByRole('button', { name: 'Retry Email' });
  await expect(retry).toHaveCount(1);
  await expect(retry).toBeInViewport({ ratio: 1 });
  await expect(table.getByText('Failed', { exact: true })).toBeInViewport({ ratio: 1 });
  await expect(table.getByRole('row').filter({ hasText: 'Acceptance unknown' }).getByRole('button', { name: /Retry/ })).toHaveCount(0);
  await retry.click();
  const confirmation = page.getByRole('dialog', { name: 'Retry Delivery' });
  const [sent] = await Promise.all([
    page.waitForRequest((candidate) => candidate.method() === 'POST' && candidate.url().includes('/retry?')),
    confirmation.getByRole('button', { name: 'Queue retry' }).click(),
  ]);
  const route = new URL(sent.url());
  expect(route.pathname).toContain('/dispatches/5d643be1-59a9-4d91-a7b1-7dbd9b673030/retry');
  expect(route.searchParams.get('expectedAttemptId')).toBe('5d643be1-59a9-4d91-a7b1-7dbd9b673031');
  await expect(page.getByText('Email retry queued.', { exact: false })).toBeVisible();
  await expect(table.getByText('Queued', { exact: true })).toBeVisible();
  await expect(table.getByText('Failed', { exact: true })).toBeVisible();
  await expect(retry).toHaveCount(0);
  await expectHealthy(page);
});

test('refreshes history and explains when a retry needs review', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, notificationDeliveries: true, notificationRules: true, notificationRetry: 'conflict' } });
  await prepare(page, request);
  await login(page);
  await page.goto('/academic/notification?view=history&operation=5d643be1-59a9-4d91-a7b1-7dbd9b673011');
  const table = page.getByRole('table', { name: 'Academic notification delivery history table' });
  await table.getByRole('button', { name: 'Retry Email' }).click();
  await page.getByRole('dialog', { name: 'Retry Delivery' }).getByRole('button', { name: 'Queue retry' }).click();
  await expect(page.getByText('This attempt now needs review.', { exact: false })).toBeVisible();
  await expect(table.getByRole('button', { name: 'Retry Email' })).toHaveCount(0);
  await expect(table.getByText('Queued', { exact: true })).toHaveCount(0);
});

(['approve', 'changed'] as const).forEach((scenario) => {
  test(`reviews an assigned notification send and handles ${scenario === 'approve' ? 'approval' : 'a changed request'}`, { tag }, async ({ page, request }) => {
    await request.post(`${fixtureApi}/fixture/reset`, { data: {
      visited: true, notificationDeliveries: true, notificationRules: true, notificationApproval: scenario,
    } });
    await prepare(page, request);
    await login(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/academic/notification?view=history');
    await page.getByRole('link', { name: 'Homework published' }).click();
    await expect(page.getByText('101 eligible recipients', { exact: true })).toBeVisible();
    await expect(page.getByText('Sample homework notice', { exact: true })).toBeVisible();
    const approveButton = page.getByRole('button', { name: 'Approve send', exact: true });
    if (scenario === 'approve') {
      const checkReview = async (width: number, height: number) => {
        await page.setViewportSize({ width, height });
        await approveButton.scrollIntoViewIfNeeded();
        await expect(approveButton).toBeInViewport();
        await expectHealthy(page);
      };
      await checkReview(390, 844);
      await checkReview(768, 1024);
      await checkReview(1440, 900);
      await checkReview(390, 844);
    }
    await approveButton.click();
    const approve = page.getByRole('dialog', { name: 'Approve Notification Send' });
    await approve.getByRole('button', { name: 'Approve send', exact: true }).click();
    if (scenario === 'changed') {
      await expect(page.getByText('This request has changed.', { exact: false })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Approve send', exact: true })).toHaveCount(0);
      await page.getByRole('button', { name: 'Reject send', exact: true }).click();
      await page.getByRole('dialog', { name: 'Reject Notification Send' }).getByRole('button', { name: 'Reject send' }).click();
      await expect(page.getByText('Notification request rejected.', { exact: true })).toBeVisible();
      await expect(page.getByText('Rejected', { exact: true })).toBeVisible();
    } else {
      await expect(page.getByText('Notification approved and queued.', { exact: true })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'Approve send', exact: true })).toHaveCount(0);
    await page.getByRole('link', { name: 'Pending approvals', exact: true }).click();
    await expect(page.getByText('No pending approvals are assigned to you.', { exact: true })).toBeVisible();
    await expectHealthy(page);
  });
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

test('explains a missing primary guardian without granting access to Student Records', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, manualNotification: true } });
  await prepare(page, request);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/academic/notifications/manual/preview', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, json: {
      reviewToken: null, expiresAt: null, eligibleRecipientCount: 0, requiresApproval: false,
      channels: [{
        channel: 3, eligibleRecipientCount: 0, readyDeliveryCount: 0,
        exclusions: [{ code: 'Communication:Notification:PrimaryGuardianNotConfigured', count: 1 }],
      }],
      samples: [], blockingIssues: [],
    } });
  });
  await page.goto('/academic/gradingAndFeedback');
  await page.getByRole('combobox', { name: 'Subject', exact: true }).click();
  await page.getByRole('option', { name: 'Mathematics', exact: true }).click();
  await page.getByRole('combobox', { name: 'Homework title' }).click();
  await page.getByRole('option', { name: /Fraction practice/ }).click();
  await page.getByRole('button', { name: 'Send reminder for Sample Learner' }).click();
  const dialog = page.getByRole('dialog', { name: 'Send Notification' });
  await dialog.getByRole('button', { name: 'Preview recipients' }).click();
  await expect(dialog.getByText(/Choose a main contact in Parents & Contact/)).toBeVisible();
  await expect(dialog.getByText('Primary guardian not configured · 1 excluded')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Open student record' })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Confirm send' })).toHaveCount(0);
  const writes = (await snapshot(request)).manualNotificationWrites;
  expect(writes.previews).toHaveLength(1);
  expect(writes.confirmations).toEqual([]);
  await expectHealthy(page);
});

test('confirms a reviewed homework reminder for the selected student and opens delivery history', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, manualNotification: true } });
  await prepare(page, request);
  await login(page);
  await page.route(/\/api\/academic\/notifications\/manual\/(preview|send)$/, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    await route.fulfill({
      response,
      json: { ...(await response.json()), isQueueWorkerEnabled: route.request().url().endsWith('/preview') },
    });
  });
  await page.goto('/academic/gradingAndFeedback');
  await page.getByRole('combobox', { name: 'Subject', exact: true }).click();
  await page.getByRole('option', { name: 'Mathematics', exact: true }).click();
  await page.getByRole('combobox', { name: 'Homework title' }).click();
  await page.getByRole('option', { name: /Fraction practice/ }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Send reminder for Sample Learner' }).click();
  const dialog = page.getByRole('dialog', { name: 'Send Notification' });
  await expect(dialog.getByText('Family notification for Sample Learner')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Confirm send' })).toHaveCount(0);
  await dialog.getByRole('checkbox', { name: 'Email', exact: true }).click();
  await expect(dialog.getByRole('checkbox', { name: 'WhatsApp (unavailable)' })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Preview recipients' }).click();
  await expect(dialog.getByText('Email missing · 1 excluded')).toBeVisible();
  await expect(dialog.getByText('Homework due soon')).toBeVisible();
  const paused = dialog.getByRole('status').filter({ hasText: 'Notification processing is paused on this server.' });
  await expect(paused).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Confirm send' }).click();
  await expect(dialog.getByRole('status').filter({ hasText: /^Queued$/ })).toBeVisible();
  await expect(paused).toBeVisible();
  const writes = (await snapshot(request)).manualNotificationWrites;
  expect(writes.previews).toHaveLength(1);
  expect(writes.confirmations).toHaveLength(1);
  expect(writes.previews[0].selectedRecipients).toEqual([{ kind: 'Student', studentId: 'a43c43cc-bbcf-43a5-9111-1260ba985601' }]);
  await dialog.getByRole('link', { name: 'Delivery History' }).click();
  await expect(page.getByRole('table', { name: 'Academic notification delivery history table' })).toBeVisible();
  await expect(page.getByText('Queued', { exact: true })).toBeVisible();
  await expectHealthy(page);
});
