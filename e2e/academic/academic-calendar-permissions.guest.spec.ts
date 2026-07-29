/* eslint-disable import/no-extraneous-dependencies */
import { expect, test } from '@playwright/test';

const apiBaseUrl = () => {
  const url = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Set E2E_API_URL or NEXT_PUBLIC_API_URL before running Academic API tests.');
  }
  return url.replace(/\/$/, '');
};

const tenant = () => process.env.E2E_TENANT || 'DDVS';

function attachCases(...ids: string[]) {
  test.info().annotations.push({ type: 'case', description: ids.join(', ') });
}

async function anonymousApiRequest(path: string, init?: Parameters<typeof fetch>[1]) {
  return fetch(`${apiBaseUrl()}/api${path}`, {
    redirect: 'manual',
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
  'Academic Calendar anonymous permission boundary',
  { tag: ['@module-academic', '@submodule-academic-calendar', '@permission', '@critical'] },
  () => {
    test('AC-CAL-020 anonymous user cannot read calendar management APIs', async () => {
      attachCases('AC-CAL-020');

      const response = await anonymousApiRequest('/academic/calendars');

      expect([302, 401, 403]).toContain(response.status);
    });

    test('AC-CAL-021 anonymous user cannot create Academic Calendar records', async () => {
      attachCases('AC-CAL-021');

      const response = await anonymousApiRequest('/academic/calendars', {
        method: 'POST',
        body: JSON.stringify({
          academicYearId: '00000000-0000-0000-0000-000000000000',
          name: 'e2e-anonymous-calendar',
          startDate: '2026-04-01T00:00:00+05:30',
          endDate: '2027-03-31T00:00:00+05:30',
          isDefault: false,
        }),
      });

      expect([302, 401, 403]).toContain(response.status);
    });
  }
);
