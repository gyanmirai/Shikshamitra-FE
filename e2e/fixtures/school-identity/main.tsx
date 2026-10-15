import 'src/components/scrollbar/styles.css';

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Box, Alert, Button, Stack, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Toaster } from 'sonner';
import { api } from 'src/redux/service';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import SchoolIdentityScreen from 'src/screens/setting/school-identity';
import { schoolIdentityActions } from 'src/screens/setting/school-identity/types';
import { installFixture, fixtureState } from './mock-api';

installFixture();
const restricted = new URLSearchParams(window.location.search).has('signatureRestricted');
const grants = Object.values(schoolIdentityActions)
  .filter(name => !restricted || name !== schoolIdentityActions.accessSignature)
  .map(name => ({ name, isGranted: true }));
const store = configureStore({
  reducer: {
    auth: () => ({ permissions: grants, permissionsInitialized: true }),
    confirmPopup: () => ({ isChanges: false }),
    globalState: () => ({ currentYear: { id: 'year-26' }, currentBoard: { id: 'year-26-CBSE' }, currentMedium: { id: 'year-26-CBSE-en' } }),
    [api.reducerPath]: api.reducer,
  },
  middleware: defaults => defaults({ serializableCheck: false }).concat(api.middleware),
});
function App() {
  const [dark, setDark] = useState(false);
  const theme = createTheme({ ...defaultSettings, colorScheme: dark ? 'dark' : 'light' });
  return <Provider store={store}><ThemeProvider theme={theme} forceThemeRerender>
    <CssBaseline />
    <Box sx={{ maxWidth: 1440, mx: 'auto', p: { xs: 1, sm: 3 } }}>
      <Alert severity="info">Synthetic School Identity fixture. Uses the production screen with mock APIs; no live school settings are changed.</Alert>
      <Stack direction="row" gap={1} sx={{ py: 1 }}>
        <Button onClick={() => { setDark(!dark); document.documentElement.setAttribute('data-mui-color-scheme', dark ? 'light' : 'dark'); }}>Switch theme</Button>
        <Button onClick={() => { fixtureState.conflict = true; }}>Simulate next save conflict</Button>
        <Button onClick={() => { fixtureState.failUpload = true; }}>Simulate next upload error</Button>
      </Stack>
      <SchoolIdentityScreen />
    </Box><Toaster />
  </ThemeProvider></Provider>;
}
createRoot(document.getElementById('root')!).render(<App />);
