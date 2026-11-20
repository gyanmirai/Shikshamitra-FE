import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { screen } from '@testing-library/react';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { mountHours, hoursResponse } from './hours.fixture';

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
beforeEach(() => {
  clearCachedAuthSession();
  vi.clearAllMocks();
});

it.each([false, undefined])(
  'keeps hours read-only when the owning server capability is %s despite both local actions',
  async (canManageHours) => {
    const response: Record<string, unknown> = { ...hoursResponse() };
    if (canManageHours === undefined) delete response.canManageHours;
    else response.canManageHours = canManageHours;
    mswServer.use(
      http.get('http://library.test/api/library/library-hours', () => HttpResponse.json(response))
    );
    mountHours();
    await screen.findByText('Monday');
    expect(screen.queryByRole('combobox', { name: 'Monday status' })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Save$/ })).toBeNull();
    expect(screen.getByText('09:10:00')).toBeVisible();
  }
);

it('retains the current owning action gate even when the server management capability is true', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/library-hours', () =>
      HttpResponse.json(hoursResponse())
    )
  );
  mountHours(['Library.Settings.LibraryHours.View']);
  await screen.findByText('Monday');
  expect(screen.queryByRole('combobox', { name: 'Monday status' })).toBeNull();
  expect(screen.queryByRole('button', { name: /^Save$/ })).toBeNull();
  expect(screen.getByText('09:10:00')).toBeVisible();
});
