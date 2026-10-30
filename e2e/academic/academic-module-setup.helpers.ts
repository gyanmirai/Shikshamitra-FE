/* eslint-disable import/no-extraneous-dependencies -- Playwright helpers run only in the development test suite. */
import { expect, type Page, type APIRequestContext } from '@playwright/test';

export const fixtureApi = process.env.ACADEMIC_SETUP_FIXTURE_API ?? 'http://127.0.0.1:4467';
export const ordinaryPath = '/academic/audits?source=setup-smoke';

export async function snapshot(request: APIRequestContext) {
  return (await request.get(`${fixtureApi}/fixture/snapshot`)).json();
}

export async function prepare(page: Page, request: APIRequestContext, theme = 'light') {
  const context = await (await request.get(`${fixtureApi}/fixture/context`)).json();
  await page.addInitScript(
    ({ selection, mode }) => {
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('theme-mode', mode);
      localStorage.setItem('app-settings', JSON.stringify({ colorScheme: mode }));
      localStorage.setItem(
        'persist:root',
        JSON.stringify({
          globalState: JSON.stringify({
            currentYear: selection.year,
            currentBoard: selection.board,
            currentMedium: selection.medium,
          }),
          _persist: JSON.stringify({ version: -1, rehydrated: true }),
        })
      );
    },
    { selection: context, mode: theme }
  );
}

export async function login(page: Page, user = 'admin') {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel(/^School code$/i).fill('SCHOOL_01');
  await page.getByLabel(/^Email (?:\/|or) username$/i).fill(user);
  await page.getByLabel('Password', { exact: true }).fill('Fixture-Password-29!');
  await page.getByRole('button', { name: /^Sign in$/i }).click();
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const response = await fetch('/api/auth/session');
        return response.ok && Boolean((await response.json())?.accessToken);
      })
    )
    .toBe(true);
}

export async function openGuide(page: Page, query = '') {
  await page.goto(`/academic/setup${query ? `?${query}` : ''}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('progressbar', { name: 'Setup progress' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save progress', exact: true })).toBeEnabled();
}

export async function expectHealthy(page: Page) {
  await expect(page.locator('body')).not.toContainText(
    /Application error|Internal Server Error|Maximum update depth|Minified React error|client-side exception|Build Error/i
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
}
