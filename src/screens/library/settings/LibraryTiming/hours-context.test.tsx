import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { savedHours, hoursResponse } from './hours.fixture';
import { mountHoursContext } from './hours-context.fixture';

const context = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
  return { confirmYear: vi.fn(async () => true) };
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/hooks/use-confirm-dialog', () => ({
  useConfirmDialog: () => [context.confirmYear, null],
}));
vi.mock('@mui/x-date-pickers/TimePicker', async () => ({
  TimePicker: (await import('./hours-clock.fixture')).TestClockField,
}));

it('protects the mounted annual draft through the real Library year-selection hook and saves its opened year', async () => {
  clearCachedAuthSession();
  context.confirmYear.mockClear();
  let savedYear: string | null = null;
  let savedMonday: unknown;
  mswServer.use(
    http.get('http://library.test/api/library/library-hours', ({ request }) => {
      const rows = savedHours();
      if (new URL(request.url).searchParams.get('academicYearId') === 'year-2')
        rows[0].startTime = '10:15:00';
      return HttpResponse.json(hoursResponse(rows));
    }),
    http.post('http://library.test/api/library/library-hours', async ({ request }) => {
      savedYear = new URL(request.url).searchParams.get('academicYearId');
      const body = (await request.json()) as { hours: { day: string }[] };
      savedMonday = body.hours.find((row) => row.day === 'Monday');
      return HttpResponse.json({ id: 'hours-id', message: 'Saved.' });
    })
  );
  const store = mountHoursContext();
  await screen.findByText('Monday');
  fireEvent.change(screen.getAllByLabelText('Clock time')[0], { target: { value: '11:45' } });
  await act(async () =>
    fireEvent.click(screen.getByRole('button', { name: 'Change academic year' }))
  );
  expect(context.confirmYear).not.toHaveBeenCalled();
  const guard = await screen.findByRole('dialog', { name: /Discard Unsaved Changes/i });
  fireEvent.click(within(guard).getByRole('button', { name: 'Keep editing' }));
  expect(store.getState().globalState.currentYear).toMatchObject({ id: 'year-id' });
  expect(screen.getAllByLabelText('Clock time')[0]).toHaveValue('11:45');
  fireEvent.click(screen.getByRole('button', { name: /^Save$/ }));
  fireEvent.click(
    within(await screen.findByRole('dialog')).getByRole('button', { name: /^Save$/ })
  );
  await waitFor(() => expect(savedYear).toBe('year-id'));
  expect(savedMonday).toEqual({
    day: 'Monday',
    status: 0,
    startTime: '11:45:00',
    endTime: '12:20:00',
  });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await act(async () =>
    fireEvent.click(screen.getByRole('button', { name: 'Change academic year' }))
  );
  expect(context.confirmYear).toHaveBeenCalledOnce();
  await waitFor(() =>
    expect(store.getState().globalState.currentYear).toMatchObject({ id: 'year-2' })
  );
  await waitFor(() => expect(screen.getAllByLabelText('Clock time')[0]).toHaveValue('10:15'));
});
