import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { openLibraryApi } from 'src/redux/library/LibraryDataSearch';
import confirmReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

const theme = createTheme(defaultSettings);
export const catalogueGrants = [
  'Library.Settings.CatalogueConfiguration.View',
  'Library.Settings.CatalogueConfiguration.Update',
];

export function catalogueTestStore(permissions = catalogueGrants) {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      [openLibraryApi.reducerPath]: openLibraryApi.reducer,
      auth: () => ({
        permissionsInitialized: true,
        loading: false,
        permissions: permissions.map((name) => ({ name, isGranted: true })),
      }),
      globalState: () => ({ currentYear: { id: 'year-id' } }),
      confirmPopup: confirmReducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware, openLibraryApi.middleware),
  });
}

export function catalogueTestWrapper(store: ReturnType<typeof catalogueTestStore>) {
  return ({ children }: PropsWithChildren) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </Provider>
  );
}
