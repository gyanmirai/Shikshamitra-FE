import 'src/global.css';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Box, Alert, Button, CssBaseline } from '@mui/material';
import auth, { setPermissions } from 'src/redux/auth/authSlice';
import YearSetup from 'src/components/academic-setup/year-setup';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

dayjs.extend(customParseFormat);
const params = new URLSearchParams(window.location.search);
const store = configureStore({
  reducer: { auth, confirmPopup, [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});
store.dispatch(
  setPermissions(
    ['View', ...(params.get('access') === 'view' ? [] : ['Edit', 'Add', 'Delete'])].map(
      (action) => ({
        name: `InstituteSetup.AcademicSetup.${action}`,
        isGranted: true,
      })
    )
  )
);

function Workspace() {
  const [mode, setMode] = useState<'light' | 'dark'>(
    params.get('theme') === 'dark' ? 'dark' : 'light'
  );
  return (
    <ThemeProvider
      theme={createTheme({ ...defaultSettings, colorScheme: mode })}
      defaultMode={mode}
      modeStorageKey={`academic-field-formatting-${mode}`}
      key={mode}
    >
      <CssBaseline />
      <Box sx={{ p: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Alert
          severity="info"
          action={
            <Button color="inherit" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
              Use {mode === 'light' ? 'dark' : 'light'} theme
            </Button>
          }
        >
          Local test workspace. Academic Setup uses synthetic school data and in-memory settings.
        </Alert>
        <Box sx={{ height: { xs: 'auto', md: 800 }, minHeight: 0 }}>
          <YearSetup />
        </Box>
      </Box>
      <Toaster />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <Workspace />
  </Provider>
);
