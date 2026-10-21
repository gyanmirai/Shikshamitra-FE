import 'src/components/scrollbar/styles.css';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { Box, Alert, Stack, Button, CssBaseline } from '@mui/material';
import SchoolDocumentsScreen from 'src/screens/setting/school-documents';
import { defaultSettings } from 'src/components/settings/config-settings';
import { schoolDocumentActions } from 'src/screens/setting/school-documents/types';

const access = new URLSearchParams(window.location.search).get('access') ?? 'full';
const grants = Object.values(schoolDocumentActions)
  .filter((name) => access === 'full' || (access === 'view' && name === schoolDocumentActions.view))
  .map((name) => ({ name, isGranted: true }));
const store = configureStore({
  reducer: {
    auth: () => ({ permissions: grants, permissionsInitialized: true }),
    confirmPopup: () => ({ isChanges: false }),
    [api.reducerPath]: api.reducer,
  },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});

function App() {
  const [dark, setDark] = useState(false);
  const theme = createTheme({ ...defaultSettings, colorScheme: dark ? 'dark' : 'light' });
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme} forceThemeRerender>
        <CssBaseline />
        <Box sx={{ maxWidth: 1500, mx: 'auto', p: { xs: 1, sm: 3 } }}>
          <Alert severity="info">
            Test workspace: production School Documents screen and real API, synthetic
            authentication and disposable SQLite. No school data is changed.
          </Alert>
          <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap sx={{ py: 1 }}>
            <Button
              onClick={() => {
                setDark(!dark);
                document.documentElement.setAttribute(
                  'data-mui-color-scheme',
                  dark ? 'light' : 'dark'
                );
              }}
            >
              Switch Theme
            </Button>
            <Button onClick={() => fetch('/fixture/fail-save', { method: 'POST' })}>
              Fail Next Save
            </Button>
            <Button onClick={() => fetch('/fixture/fail-preview', { method: 'POST' })}>
              Fail Next Preview
            </Button>
          </Stack>
          <SchoolDocumentsScreen />
        </Box>
        <Toaster />
      </ThemeProvider>
    </Provider>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
