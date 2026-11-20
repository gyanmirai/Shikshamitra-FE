import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { shikshaMitraToast } from 'src/components/toast';
import { librarySettingsType } from 'src/redux/tagTypes';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { librarySettingsApi } from 'src/redux/library/settingApi';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { mountHours, savedHours, hoursResponse } from './hours.fixture';

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
const mondayDraft = () => {
  const select = screen.queryByRole('combobox', { name: /Monday status/i });
  return select
    ? select.textContent
    : (screen.getAllByRole('switch')[0] as HTMLInputElement).checked;
};
function changeMondayDraft() {
  const select = screen.queryByRole('combobox', { name: /Monday status/i });
  if (select) {
    const next = select.textContent?.includes('Open') ? 'Closed' : 'Open';
    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByRole('option', { name: next }));
  } else fireEvent.click(screen.getAllByRole('switch')[0]);
}
it('keeps a dirty school-day draft after a real subscribed background refresh completes', async () => {
  let reads = 0;
  mswServer.use(
    http.get('http://library.test/api/library/library-hours', () => {
      reads += 1;
      const items = savedHours();
      if (reads > 1) items[0].startTime = '10:15:00';
      return HttpResponse.json(hoursResponse(items));
    })
  );
  const { store } = mountHours();
  await screen.findByText('Monday');
  const opened = mondayDraft();
  changeMondayDraft();
  const edited = mondayDraft();
  expect(edited).not.toBe(opened);
  await act(async () => {
    store.dispatch(api.util.invalidateTags([librarySettingsType.librarySettings]));
  });
  await waitFor(() =>
    expect(
      librarySettingsApi.endpoints.getLibraryTiming.select({ academicYearId: 'year-id' })(
        store.getState()
      ).data?.items[0].startTime
    ).toBe('10:15:00')
  );
  expect(mondayDraft()).toBe(edited);
  expect(screen.getByRole('button', { name: /^Save$/ })).toBeEnabled();
});
it('preserves actual manually entered times and the selected year through the real save request', async () => {
  let hours = savedHours();
  let body: { hours: typeof hours } | undefined;
  let year: string | null = null;
  mswServer.use(
    http.get('http://library.test/api/library/library-hours', () =>
      HttpResponse.json(hoursResponse(hours))
    ),
    http.post('http://library.test/api/library/library-hours', async ({ request }) => {
      body = (await request.json()) as { hours: typeof hours };
      year = new URL(request.url).searchParams.get('academicYearId');
      ({ hours } = body);
      return HttpResponse.json({ id: 'hours-id', message: 'Saved.' });
    })
  );
  mountHours();
  await screen.findByText('Monday');
  expect(screen.getAllByLabelText('Clock time')[0]).toBeEnabled();
  fireEvent.change(screen.getAllByLabelText('Clock time')[0], { target: { value: '11:45' } });
  fireEvent.click(screen.getByRole('button', { name: /^Save$/ }));
  fireEvent.click(
    within(await screen.findByRole('dialog')).getByRole('button', { name: /^Save$/ })
  );
  await waitFor(() => expect(shikshaMitraToast.success).toHaveBeenCalled());
  expect(year).toBe('year-id');
  expect(body?.hours.find((row) => row.day === 'Monday')).toEqual({
    day: 'Monday',
    startTime: '11:45:00',
    endTime: '12:20:00',
    status: 0,
  });
  expect(body?.hours.find((row) => row.day === 'Sunday')?.status).toBe(2);
});
