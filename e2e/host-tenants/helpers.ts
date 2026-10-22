// This helper is used exclusively by the Playwright development test suite.
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, type Page } from '@playwright/test';

export const fixtureOrigin = process.env.HOST_TENANT_API_ORIGIN ?? 'http://127.0.0.1:4399';
export const fixture = `${fixtureOrigin}/fixture/reset`;
// MUI appends an aria-hidden required marker to the associated label text.
export const field = (page: Page, label: string) =>
  page.getByLabel(new RegExp(`^${label}\\s*\\*?$`));
export async function login(page: Page, code = '') {
  await page.goto('/login');
  if (code) await page.getByLabel(/^School code$/i).fill(code);
  else
    await page.getByRole('button', { name: 'Platform administrator sign in', exact: true }).click();
  await page.getByLabel(/^Email (?:\/|or) username$/i).fill('admin');
  await page.getByLabel('Password', { exact: true }).fill('Fixture-Password-29!');
  await page.getByRole('button', { name: /^Sign in$/i }).click();
  await expect(page.getByRole('button', { name: /^Signing in\.\.\.$/i })).toHaveCount(0);
}
export async function fillCreate(page: Page) {
  const values = {
    'School code': 'NEW_SCHOOL',
    'Institute name': 'New Synthetic School',
    'Institute email': 'office@new.example.test',
    'Contact number': '9876543210',
    'Address line 1': 'Test Road',
    City: 'Surat',
    State: 'Gujarat',
    'Postal code': '395001',
    'Administrator email': 'admin@new.example.test',
    'Initial password': 'Fixture-School-29!',
  };
  // Browser interactions must finish in order before filling the next control.
  // eslint-disable-next-line no-restricted-syntax
  for (const [label, value] of Object.entries(values)) {
    // eslint-disable-next-line no-await-in-loop
    await field(page, label).fill(value);
  }
}
