import { test, expect, type Page } from '@playwright/test';

import { createEmployeeFixture } from './employee/employee-fixtures';
import { saveAndNext, fillRequiredPersonalInformation } from './employee/employee-page';

const policyPath = /\/api\/(?:hr\/(?:payroll|attendance)\/policies|leave-policies)(?:\?|$)/;
const genericPermissionMessage = "You don't have permission to access this resource.";

async function openScenario(page: Page, scenario: string) {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => {
    if (policyPath.test(request.url())) requests.push(request.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/?scenario=${scenario}&run=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(`Scenario: ${scenario}`, { exact: true })).toBeVisible();
  return { requests, errors };
}

async function expectNoGenericToast(page: Page) {
  await expect(page.getByText(genericPermissionMessage, { exact: true })).toHaveCount(0);
}

test('Staff Add without policy prerequisites shows explicit guidance and makes no policy requests', async ({
  page,
}) => {
  const { requests, errors } = await openScenario(page, 'missing-permission');
  const dialog = page.getByRole('dialog', { name: 'Policy Access Required' });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByText('View payroll and attendance policies', { exact: true })
  ).toBeVisible();
  await expect(dialog.getByText('View leave policies', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Assign staff policies', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Preview policy assignment impact', { exact: true })).toBeVisible();
  await expect(page.getByLabel('First Name *', { exact: true })).toHaveCount(0);
  expect(requests).toEqual([]);
  await expectNoGenericToast(page);
  await page.keyboard.press('Tab');
  await expect
    .poll(() => dialog.evaluate((element) => element.contains(document.activeElement)))
    .toBe(true);
  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).toBeHidden();
  const review = page.getByRole('button', { name: 'Review required access', exact: true });
  await review.click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(review).toBeFocused();
  expect(errors).toEqual([]);
});

test('all prerequisite grants load defaults without policy management navigation', async ({
  page,
}) => {
  const { requests, errors } = await openScenario(page, 'ready');
  await expect(page.getByLabel('First Name *', { exact: true })).toBeVisible();
  await expect(page.getByText('Payroll: Payroll default', { exact: true })).toBeVisible();
  await expect(page.getByText('Attendance: Attendance default', { exact: true })).toBeVisible();
  await expect(page.getByText('Leave: Leave default', { exact: true })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Policy Access Required' })).toHaveCount(0);
  await expect.poll(() => requests.length).toBe(3);
  await expectNoGenericToast(page);
  expect(errors).toEqual([]);
});

test('stale grants returning 403 show the prerequisite dialog without a generic toast', async ({
  page,
}) => {
  const { requests, errors } = await openScenario(page, 'forbidden');
  await expect(page.getByRole('dialog', { name: 'Policy Access Required' })).toBeVisible();
  await expect.poll(() => requests.length).toBe(3);
  await expectNoGenericToast(page);
  expect(errors).toEqual([]);
});

test('refreshing permissions opens the wizard after a grant is added', async ({ page }) => {
  const { errors } = await openScenario(page, 'missing-permission');
  const dialog = page.getByRole('dialog', { name: 'Policy Access Required' });
  await dialog.getByRole('button', { name: 'Check access again', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByLabel('First Name *', { exact: true })).toBeVisible();
  await expect(page.getByText('Payroll: Payroll default', { exact: true })).toBeVisible();
  await expectNoGenericToast(page);
  expect(errors).toEqual([]);
});

test('transient failures offer retry and recover without losing a draft', async ({ page }) => {
  const { errors } = await openScenario(page, 'transient');
  const firstName = page.getByLabel('First Name *', { exact: true });
  await firstName.fill('Unsaved draft');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByText('Payroll: Payroll default', { exact: true })).toBeVisible();
  await expect(firstName).toHaveValue('Unsaved draft');
  await expect(page.getByRole('dialog', { name: 'Policy Access Required' })).toHaveCount(0);
  await expectNoGenericToast(page);
  expect(errors).toEqual([]);
});

([
  ['missing-default', 'Default leave policy missing'],
  ['multiple-default', 'Multiple default leave policies'],
] as const).forEach(([scenario, message]) => {
  test(`${scenario} remains a configuration issue instead of a permission error`, async ({
    page,
  }) => {
    const { errors } = await openScenario(page, scenario);
    await expect(page.getByText(message, { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Policy Access Required' })).toHaveCount(0);
    await expectNoGenericToast(page);
    expect(errors).toEqual([]);
  });
});

test('editing an existing staff member skips creation policy prerequisites and lookups', async ({
  page,
}) => {
  const { requests, errors } = await openScenario(page, 'edit');
  await expect(page.getByLabel('First Name *', { exact: true })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Policy Access Required' })).toHaveCount(0);
  expect(requests).toEqual([]);
  await expectNoGenericToast(page);
  expect(errors).toEqual([]);
});

test('a policy permission revoked before submit preserves the completed personal-information draft', async ({
  page,
}) => {
  test.setTimeout(120000);
  let submissions = 0;
  await page.route('**/api/employees/personal-info', async (route) => {
    expect(route.request().method()).toBe('POST');
    submissions += 1;
    await route.fulfill({
      status: 403,
      json: {
        error: {
          code: 'HR:Employee:010043',
          message: 'Policy access is required to add staff.',
          data: { missingPermissions: ['HR.Policies.Assign'] },
        },
      },
    });
  });
  const { errors } = await openScenario(page, 'ready');
  const employee = createEmployeeFixture('Synthetic Draft');
  await fillRequiredPersonalInformation(page, employee);
  await saveAndNext(page);
  const dialog = page.getByRole('dialog', { name: 'Policy Access Required' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Assign staff policies', { exact: true })).toBeVisible();
  expect(submissions).toBe(1);
  await expectNoGenericToast(page);
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByLabel('First Name *', { exact: true })).toHaveValue(employee.firstName);
  await expect(page.getByLabel('Email *', { exact: true })).toHaveValue(employee.email);
  expect(errors).toEqual([]);
});

test('returning to personal information after creation does not restart policy prerequisites', async ({
  page,
}) => {
  test.setTimeout(120000);
  let submissions = 0;
  await page.route('**/api/employees/personal-info', async (route) => {
    expect(route.request().method()).toBe('POST');
    submissions += 1;
    await route.fulfill({
      status: 200,
      json: { id: 'synthetic-employee', userId: 'synthetic-created-user' },
    });
  });
  const { requests, errors } = await openScenario(page, 'ready');
  await fillRequiredPersonalInformation(page, createEmployeeFixture('Synthetic Created'));
  await saveAndNext(page);
  const firstName = page.getByLabel('First Name *', { exact: true });
  await expect(firstName).toHaveCount(0);
  expect(submissions).toBe(1);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(firstName).toBeVisible();
  await expect(page.getByText('Assigned System Policies', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Policy Access Required' })).toHaveCount(0);
  expect(requests).toHaveLength(3);
  expect(errors).toEqual([]);
});
