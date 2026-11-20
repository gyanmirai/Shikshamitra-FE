import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { screen } from '@testing-library/react';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { mountHours, savedHours, serveHours, hoursResponse } from './hours.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('@mui/x-date-pickers/TimePicker', async () => ({
  TimePicker: (await import('./hours-clock.fixture')).TestClockField,
}));
beforeEach(clearCachedAuthSession);
it('shows actual Open0, Closed1 and Holiday2 without converting holiday evidence into closed', async () => {
  serveHours();
  mountHours();
  await screen.findByText('Monday');
  expect(screen.getByRole('combobox', { name: /Monday status/i })).toHaveTextContent('Open');
  expect(screen.getByRole('combobox', { name: /Tuesday status/i })).toHaveTextContent('Closed');
  expect(screen.getByRole('combobox', { name: /Sunday status/i })).toHaveTextContent('Holiday');
  expect(screen.getAllByLabelText('Clock time')[0]).toHaveValue('09:10');
});
it('keeps unsupported original open-time text visible for review without guessing its clock value', async () => {
  const hours = savedHours();
  hours[0] = { ...hours[0], startTime: '09:10 AM', endTime: '12:20 PM', status: 0 };
  mswServer.use(
    http.get('http://library.test/api/library/library-hours', () =>
      HttpResponse.json(hoursResponse(hours))
    )
  );
  mountHours();
  await screen.findByText('Monday');
  expect(screen.getByText(/needs review/i)).toBeVisible();
  expect(screen.getByText('09:10 AM')).toBeVisible();
  expect(screen.getByText('12:20 PM')).toBeVisible();
  expect(screen.getAllByLabelText('Clock time')[0]).toHaveValue('');
  expect(screen.getByRole('button', { name: /^Save$/ })).toBeDisabled();
});
