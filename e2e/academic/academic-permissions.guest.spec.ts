/* eslint-disable import/no-extraneous-dependencies */
import { expect, test } from '@playwright/test';

const apiBaseUrl = () => {
  const url = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Set E2E_API_URL or NEXT_PUBLIC_API_URL before running Academic API tests.');
  }
  return url.replace(/\/$/, '');
};

const appBaseUrl = () =>
  process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const tenant = () => process.env.E2E_TENANT || 'DDVS';

async function anonymousApiRequest(path: string, init?: Parameters<typeof fetch>[1]) {
  return fetch(`${apiBaseUrl()}/api${path}`, {
    ...init,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      __tenant: tenant(),
      ...init?.headers,
    },
  });
}

test.describe(
  'Academic anonymous permission boundary',
  { tag: ['@module-academic', '@submodule-permissions', '@permission', '@critical'] },
  () => {
    test('anonymous user cannot read protected Academic APIs', async () => {
      const responses = await Promise.all([
        anonymousApiRequest(
          '/academics/exams?AcademicMediumId=00000000-0000-0000-0000-000000000000&Status=0'
        ),
        anonymousApiRequest(
          '/academics/question-bank/dashboard?academicYearId=00000000-0000-0000-0000-000000000000'
        ),
        anonymousApiRequest(
          '/academic/homeworks?academicMediumId=00000000-0000-0000-0000-000000000000'
        ),
      ]);

      for (const response of responses) {
        expect([401, 403]).toContain(response.status);
      }
    });

    test('anonymous user is redirected away from protected Academic routes', async ({ page }) => {
      for (const path of [
        '/academic/dashboard',
        '/academic/scheduleExam',
        '/academic/calendarManagement',
      ]) {
        await page.goto(`${appBaseUrl()}${path}`, { waitUntil: 'domcontentloaded' });
        await expect(page).not.toHaveURL(new RegExp(`${path.replaceAll('/', '\\/')}$`));
      }
    });
  }
);
