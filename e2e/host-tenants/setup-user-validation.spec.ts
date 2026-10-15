import { expect, test } from '@playwright/test';

import { field, fixture, login } from './helpers';

test.beforeEach(async ({ page, request }) => {
  await request.post(fixture, { data: { setupStep: 4 } });
  await login(page, 'SCHOOL_01');
  await expect(page.getByRole('heading', { name: 'Bring your team on board' })).toBeVisible();
  await page.getByRole('button', { name: 'Add user', exact: true }).click();
});
async function fillValid(page: import('@playwright/test').Page) {
  await field(page, 'User name').fill('teacher.one');
  await field(page, 'Email').fill('teacher@example.test');
  await field(page, 'Initial password').fill('Fixture-Staff-29!');
}
const submit = (page: import('@playwright/test').Page) => page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true });

test('invalid credentials show inline errors on blur and submit without an API request', async ({ page }) => {
  let creates = 0;
  page.on('request', outgoing => { if (outgoing.method() === 'POST' && outgoing.url().endsWith('/initial/users')) creates += 1; });
  await field(page, 'User name').fill('ab'); await field(page, 'Email').fill('testuser');
  await expect(field(page, 'User name')).toHaveAttribute('aria-invalid', 'true');
  await field(page, 'Initial password').fill('12345');
  await expect(page.getByText(/Use at least 8 characters; Include a lowercase/)).toBeVisible();
  await submit(page).click();
  await expect(field(page, 'Email')).toHaveAttribute('aria-invalid', 'true');
  await expect(field(page, 'Initial password')).toHaveAttribute('aria-invalid', 'true');
  await expect(field(page, 'User name')).toBeFocused(); expect(creates).toBe(0);
  await fillValid(page); await expect(page.getByText('Password meets all requirements.')).toBeVisible();
  await submit(page).click(); await expect(page.getByRole('dialog')).toHaveCount(0); expect(creates).toBe(1);
});

for (const status of [400, 409]) {
  test(`duplicate email ${status} shows banner, field error and toast, then permits correction`, async ({ page }) => {
    await page.route('**/api/institute-setup/initial/users', route => route.fulfill({ status, json: { errorCode: 'Volo.Abp.Identity:DuplicateEmail', detail: 'One or more business rules were violated.' } }));
    await fillValid(page); await submit(page).click();
    await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Email Already In Use');
    await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Please use a different email.');
    await expect(field(page, 'Email')).toBeFocused();
    await expect(page.locator('[data-sonner-toast]')).toContainText('already registered');
    await expect(page.getByRole('button', { name: 'Reload saved setup' })).toHaveCount(0);
    await field(page, 'User name').fill('teacher.two');
    await expect(field(page, 'Email')).toHaveAttribute('aria-invalid', 'true');
    await page.unroute('**/api/institute-setup/initial/users');
    await field(page, 'Email').fill('corrected@example.test'); await submit(page).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('teacher.two', { exact: true })).toBeVisible();
  });
}

test('server password validation retains input and marks the password field', async ({ page }) => {
  await page.route('**/api/institute-setup/initial/users', route => route.fulfill({ status: 400, json: { errorCode: 'Volo.Abp.Identity:PasswordRequiresNonAlphanumeric' } }));
  await fillValid(page); await submit(page).click();
  await expect(field(page, 'Initial password')).toBeFocused();
  await expect(field(page, 'Initial password')).toHaveAttribute('aria-invalid', 'true');
  await expect(field(page, 'User name')).toHaveValue('teacher.one');
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Password must include a special character.');
});

test('loading locks the form and a mobile network failure allows retry', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let release: () => void = () => {};
  const waiting = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/institute-setup/initial/users', async route => { await waiting; await route.abort('failed'); });
  await fillValid(page); await submit(page).click();
  await expect(page.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
  await expect(field(page, 'Email')).toBeDisabled();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toBeVisible();
  release(); await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Your entries are still here. Please retry.');
  await expect(submit(page)).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.unroute('**/api/institute-setup/initial/users'); await submit(page).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
