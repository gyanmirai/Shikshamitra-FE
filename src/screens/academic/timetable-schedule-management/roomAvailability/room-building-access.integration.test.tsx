import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { SessionProvider } from 'next-auth/react';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import RoomAvailabilityScreen from './RoomAvailabilityScreen';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
vi.mock('@iconify/react', () => ({ Icon: () => <span aria-hidden="true" />, disableCache: () => {} }));

it('loads room filters with timetable access without calling Building management', async () => {
  const requests: URL[] = [];
  let managementReads = 0;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/institute-setup/buildings', () => {
      managementReads += 1;
      return HttpResponse.json({ error: { message: 'Access denied for Building: View' } }, { status: 403 });
    }),
    http.get('*/api/academics/timetable/room-availability/buildings/lookup', () => HttpResponse.json([
      { id: 'science', buildingName: 'Science Block', floors: [{ id: 'first', floorName: 'First Floor', floorNo: 1 }] },
    ])),
    http.get('*/api/academics/timetable/room-availability', ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json([]);
    }),
    http.get('*/api/academics/timetable/room-reservations/summary', () => HttpResponse.json({ statusCounts: {} })),
  );
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      globalState: (state = {}) => state,
      confirmPopup: (state = { isChanges: false }) => state,
    },
    middleware: defaults => defaults().concat(api.middleware),
  });
  clearCachedAuthSession();
  const view = render(
    <Provider store={store}>
      <SessionProvider session={null}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <RoomAvailabilityScreen />
          </LocalizationProvider>
        </ThemeProvider>
      </SessionProvider>
    </Provider>
  );
  try {
    await waitFor(() => expect(requests.length).toBeGreaterThan(0));
    expect(managementReads).toBe(0);
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Building' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Science Block' }));
    await waitFor(() => expect(requests.at(-1)?.searchParams.get('buildingId')).toBe('science'));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Floor' }));
    fireEvent.click(await screen.findByRole('option', { name: 'First Floor' }));
    await waitFor(() => expect(requests.at(-1)?.searchParams.get('floorId')).toBe('first'));
  } finally {
    view.unmount();
    store.dispatch(api.util.resetApiState());
    clearCachedAuthSession();
  }
}, 30_000);
