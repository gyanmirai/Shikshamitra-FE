import type { ReactElement } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { GlobalIcons } from 'src/utils/icons';
import { mswServer } from 'src/test/mswServer';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { loadIcons, _api as iconifyApi } from '@iconify/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export const calendarId = 'calendar-one';
export const calendarUrl = '*/api/academic';
export async function prepareCalendarFormNetwork() {
  iconifyApi.setFetch((...args) => fetch(...args));
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get(`${calendarUrl}/calendars`, () =>
      HttpResponse.json({ items: [{ id: calendarId, isDefault: true }] })
    ),
    http.get(`${calendarUrl}/calendars/${calendarId}/days`, () => HttpResponse.json({ items: [] })),
    http.get('https://api.iconify.design/:collection', ({ request, params }) =>
      HttpResponse.json({
        prefix: String(params.collection).replace('.json', ''),
        icons: {},
        not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
      })
    )
  );
  await new Promise<void>((resolve) => {
    loadIcons(
      [
        GlobalIcons.cancel,
        GlobalIcons.edit,
        GlobalIcons.submit,
        GlobalIcons.info,
        'mdi:briefcase-check-outline',
        'mdi:flag-outline',
        'mdi:beach',
        'mdi:clock-time-four-outline',
        'mdi:party-popper',
        'mdi:file-document-edit-outline',
        'mdi:account-group-outline',
        'mdi:alert-octagon-outline',
      ],
      (_loaded, _missing, pending) => {
        if (!pending.length) resolve();
      }
    );
  });
}

export function renderCalendarForm(ui: ReactElement) {
  const store = configureStore({
    reducer: {
      globalState: () => ({ currentMedium: { id: 'medium-one' } }),
      confirmPopup: confirmPopupReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>{ui}</LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}
