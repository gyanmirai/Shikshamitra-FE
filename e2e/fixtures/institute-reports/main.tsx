import 'src/components/scrollbar/styles.css';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Box, Alert, Button, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { api } from 'src/redux/service';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import InstituteReportsScreen from 'src/screens/setting/reports';

const access = new URLSearchParams(window.location.search).get('access') ?? 'full';
const permissions = ['InstituteSetup.Reports.View', 'InstituteSetup.Reports.Add', 'InstituteSetup.AcademicSetup.View', 'InstituteSetup.RoomManagement.View',
  'InstituteSetup.BuildingManagement.View', 'InstituteSetup.RoomTypeManagement.View', 'InstituteSetup.ShiftManagement.View',
  'InstituteSetup.SchoolDocuments.View', 'InstituteSetup.SchoolIdentity.View', 'InstituteSetup.SchoolIdentity.AccessSignature']
  .filter((name) => access !== 'none' && !(access === 'view' && !name.endsWith('.View'))
    && !(access === 'no-documents' && name.includes('.SchoolDocuments.')) && !(access === 'no-identity' && name.includes('.SchoolIdentity.'))
    && !(access === 'no-signatures' && name.endsWith('.AccessSignature'))).map((name) => ({ name, isGranted: true }));
const store = configureStore({
  reducer: {
    auth: () => ({ permissions, permissionsInitialized: true }),
    globalState: () => ({ currentYear: { id: '11111111-1111-1111-1111-111111111111', name: '2026-2027' } }),
    confirmPopup: () => ({ isChanges: false }),
    [api.reducerPath]: api.reducer,
  },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});
function App() {
  const [dark, setDark] = useState(false);
  return <Provider store={store}><ThemeProvider theme={createTheme({ ...defaultSettings, colorScheme: dark ? 'dark' : 'light' })} forceThemeRerender>
    <CssBaseline />
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', minWidth: 0, p: 1, gap: 1 }}>
      <Alert severity="info">Synthetic UI test workspace. The screen uses fixture APIs; no school data or AI provider is contacted.</Alert>
      <Box><Button onClick={() => { setDark(!dark); document.documentElement.setAttribute('data-mui-color-scheme', dark ? 'light' : 'dark'); }}>Switch Theme</Button>
        <Button onClick={() => fetch('/fixture/fail-preview', { method: 'POST' })}>Fail Next Preview</Button></Box>
      <InstituteReportsScreen />
    </Box><Toaster />
  </ThemeProvider></Provider>;
}
createRoot(document.getElementById('root')!).render(<App />);
