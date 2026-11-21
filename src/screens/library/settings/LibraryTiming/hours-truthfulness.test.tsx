import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { shikshaMitraToast } from 'src/components/toast';
import { screen, fireEvent } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { mountHours, serveHours, hoursResponse } from './hours.fixture';

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
it('keeps manually configured hours usable without promising a nonexistent school-hours provider', async () => {
  serveHours();
  mountHours();
  await screen.findByText('Monday');
  expect(screen.queryByRole('button', { name: /Same as School Hours/i })).not.toBeInTheDocument();
  expect(screen.getByText(/enter.*library.*hours.*manually/i)).toBeVisible();
  expect(shikshaMitraToast.success).not.toHaveBeenCalled();
});
it('shows a real failed read and retries instead of presenting fabricated closed saved days', async () => {
  let reads = 0;
  mswServer.use(
    http.get('http://library.test/api/library/library-hours', () => {
      reads += 1;
      return reads === 1
        ? HttpResponse.json({ detail: 'Opening hours could not be read.' }, { status: 500 })
        : HttpResponse.json(hoursResponse());
    })
  );
  mountHours();
  expect(await screen.findByText('Opening hours could not be read.')).toBeVisible();
  expect(screen.queryByRole('button', { name: /^Save$/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Retry/ }));
  await screen.findByText('Monday');
  expect(reads).toBe(2);
});
