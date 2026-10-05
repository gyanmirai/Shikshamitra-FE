import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { academicPermissions } from 'src/constants/academic-menu';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';

import { quickContext } from './quick-substitution-test-data';
import { QuickSubstitutionDrawer } from './QuickSubstitutionDrawer';

export function renderQuickSubstitution(allowed = true) {
  mswServer.use(
    http.get(/https:\/\/api\.(iconify\.design|simplesvg\.com|unisvg\.com)\/.*/, () =>
      HttpResponse.json({ icons: {}, not_found: [] })
    )
  );
  const onClose = () => {};
  const store = configureStore({
    reducer: {
      auth: () => ({
        permissions: allowed
          ? ['View', 'Add'].map((action) => ({
              name: `${academicPermissions.timetable.substitutionManagement}.${action}`,
              isGranted: true,
            }))
          : [],
      }),
      confirmPopup: confirmPopupReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const view = render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <QuickSubstitutionDrawer context={quickContext} onClose={onClose} />
      </ThemeProvider>
    </Provider>
  );
  return { ...view, store };
}
