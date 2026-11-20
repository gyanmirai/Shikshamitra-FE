import { it, expect } from 'vitest';
import { act, screen } from '@testing-library/react';

import { financialNotices, mountAlertDashboard } from './dashboard-alerts.fixture';

it('shows principal financial notices as readable information without Charges View', () => {
  mountAlertDashboard('principal');
  expect(screen.getByText('Finance Position')).toBeVisible();
  financialNotices.forEach((notice) => expect(screen.getByText(notice.message)).toBeVisible());
  expect(screen.queryByRole('link', { name: /Open charge register for/i })).toBeNull();
});

it('removes principal financial navigation on actual Charges View revocation while preserving notices', async () => {
  const grants = ['Library.Dashboard.View', 'Library.Charges.View'];
  const fixture = mountAlertDashboard('principal', undefined, grants);
  expect(screen.getByText('Finance Position')).toBeVisible();
  expect(
    screen.getByRole('link', { name: `Open charge register for ${financialNotices[0].title}` })
  ).toHaveAttribute('href', '/library/charges-management');
  grants.splice(grants.indexOf('Library.Charges.View'), 1);
  await act(async () => {
    fixture.store.dispatch({ type: 'test/authRefreshed' });
  });
  expect(screen.queryByRole('link', { name: /Open charge register for/i })).toBeNull();
  financialNotices.forEach((notice) => expect(screen.getByText(notice.message)).toBeVisible());
});
