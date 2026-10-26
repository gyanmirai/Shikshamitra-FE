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
import YearSetup from 'src/components/academic-setup/year-setup';
import { defaultSettings } from 'src/components/settings/config-settings';

dayjs.extend(customParseFormat);
const viewOnly = new URLSearchParams(window.location.search).get('access') === 'view';
const store = configureStore({
  reducer: {
    confirmPopup: () => ({ isChanges: false }),
    auth: () => ({
      permissions: ['View', ...(viewOnly ? [] : ['Edit', 'Add', 'Delete'])].map((action) => ({
        name: `InstituteSetup.AcademicSetup.${action}`,
        isGranted: true,
      })),
    }),
    [api.reducerPath]: api.reducer,
  },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});

function Workspace() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = createTheme({ ...defaultSettings, colorScheme: mode });
  return (
    <ThemeProvider
      theme={theme}
      defaultMode={mode}
      modeStorageKey={`reorder-test-${mode}`}
      key={mode}
    >
      <CssBaseline />
      <Box
        sx={{
          p: 1,
          height: { xs: 'auto', md: '100vh' },
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Alert
          severity="info"
          action={
            <Button color="inherit" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
              Toggle theme
            </Button>
          }
        >
          Test workspace: production Academic Setup with a disposable database and synthetic
          sign-in.
        </Alert>
        <Box sx={{ flex: 1, minHeight: 0 }}>
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
