import { test, expect, type Page } from '@playwright/test';

import { createEmployeeFixture } from './employee/employee-fixtures';
import { saveAndNext, fillRequiredPersonalInformation } from './employee/employee-page';

const policyPath = /\/api\/(?:hr\/(?:payroll|attendance)\/policies|leave-policies)(?:\?|$)/;

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

[
  'missing-permission',
  'ready',
  'forbidden',
  'transient',
  'missing-default',
  'multiple-default',
  'no-year',
].forEach((scenario) => {
  test(`${scenario}: personal information stays available without policy reads`, async ({
    page,
  }) => {
    const { requests, errors } = await openScenario(page, scenario);
    const firstName = page.getByLabel('First Name *', { exact: true });
    await expect(firstName).toBeVisible();
    await expect(
      page.getByText(/Staff use the applicable school policies automatically/)
    ).toBeVisible();
    await firstName.fill('Synthetic draft');
    await expect(page.getByRole('button', { name: 'Save & Next', exact: true })).toBeEnabled();
    await expect(page.getByRole('dialog', { name: 'Policy Access Required' })).toHaveCount(0);
    await expect(
      page.getByText("You don't have permission to access this resource.", { exact: true })
    ).toHaveCount(0);
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
    await page.keyboard.press('Tab');
    expect(await page.locator(':focus').count()).toBe(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });
});

test('Staff Add alone saves without a policy override and returning to step one does not create twice', async ({
  page,
}) => {
  let submissions = 0;
  await page.route('**/api/employees/personal-info', async (route) => {
    submissions += 1;
    const data = route.request().postData() || '';
    expect(data).not.toContain('policyOverride');
    expect(data).not.toContain('confirmationToken');
    await route.fulfill({
      status: 200,
      json: { id: 'synthetic-employee', userId: 'synthetic-created-user' },
    });
  });
  const { requests, errors } = await openScenario(page, 'missing-permission');
  const employee = createEmployeeFixture('Synthetic Created');
  await fillRequiredPersonalInformation(page, employee);
  await saveAndNext(page);
  const firstName = page.getByLabel('First Name *', { exact: true });
  await expect(firstName).toHaveCount(0);
  expect(submissions).toBe(1);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(firstName).toHaveValue(employee.firstName);
  await expect(page.getByText('System Policies', { exact: true })).toHaveCount(0);
  expect(submissions).toBe(1);
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

test('failed creation retains all personal details and allows retry without policy rights', async ({
  page,
}) => {
  let submissions = 0;
  await page.route('**/api/employees/personal-info', async (route) => {
    submissions += 1;
    expect(route.request().postData()).not.toContain('policyOverride');
    await route.fulfill(
      submissions === 1
        ? { status: 503, json: { detail: 'Synthetic creation failure. Please retry.' } }
        : { status: 200, json: { id: 'synthetic-employee', userId: 'synthetic-created-user' } }
    );
  });
  const { requests, errors } = await openScenario(page, 'missing-permission');
  const employee = createEmployeeFixture('Synthetic Retry');
  await fillRequiredPersonalInformation(page, employee);
  await saveAndNext(page);
  await expect(
    page.getByText('Synthetic creation failure. Please retry.', { exact: true })
  ).toBeVisible();
  await expect(page.getByLabel('First Name *', { exact: true })).toHaveValue(employee.firstName);
  await expect(page.getByLabel('Email *', { exact: true })).toHaveValue(employee.email);
  await saveAndNext(page);
  await expect(page.getByLabel('First Name *', { exact: true })).toHaveCount(0);
  expect(submissions).toBe(2);
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

test('editing existing staff keeps creation lookups disabled', async ({ page }) => {
  const { requests, errors } = await openScenario(page, 'edit');
  await expect(page.getByLabel('First Name *', { exact: true })).toHaveValue('Existing');
  await expect(page.getByRole('dialog', { name: 'Policy Access Required' })).toHaveCount(0);
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});
