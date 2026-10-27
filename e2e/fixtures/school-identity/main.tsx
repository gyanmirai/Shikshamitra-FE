import 'src/components/scrollbar/styles.css';

import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import React, { useState } from 'react';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import CustomDialog from 'src/components/customDialog';
import { Box, Alert, Stack, Button, CssBaseline } from '@mui/material';
import SchoolIdentityScreen from 'src/screens/setting/school-identity';
import { defaultSettings } from 'src/components/settings/config-settings';
import { OrganizationForm } from 'src/components/academic-setup/stage-form';
import { schoolIdentityActions } from 'src/screens/setting/school-identity/types';

import { fixtureState, installFixture } from './mock-api';

installFixture();
const restricted = new URLSearchParams(window.location.search).has('signatureRestricted');
const grants = Object.values(schoolIdentityActions)
  .filter((name) => !restricted || name !== schoolIdentityActions.accessSignature)
  .map((name) => ({ name, isGranted: true }));
const store = configureStore({
  reducer: {
    auth: () => ({ permissions: grants, permissionsInitialized: true }),
    confirmPopup: () => ({ isChanges: false }),
    globalState: () => ({
      currentYear: { id: 'year-26' },
      currentBoard: { id: 'year-26-CBSE', academicYearId: 'year-26' },
      currentMedium: { id: 'year-26-CBSE-en', educationBoardId: 'year-26-CBSE' },
    }),
    [api.reducerPath]: api.reducer,
  },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});
function App() {
  const [dark, setDark] = useState(false);
  const [editOrganizationName, setEditOrganizationName] = useState(
    new URLSearchParams(window.location.search).has('organizationName')
  );
  const theme = createTheme({ ...defaultSettings, colorScheme: dark ? 'dark' : 'light' });
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme} forceThemeRerender>
        <CssBaseline />
        <Box sx={{ maxWidth: 1440, mx: 'auto', p: { xs: 1, sm: 3 } }}>
          <Alert severity="info">
            Synthetic School Identity fixture. Uses the production screen with mock APIs; no live
            school settings are changed.
          </Alert>
          <Stack direction="row" gap={1} sx={{ py: 1 }}>
            <Button
              onClick={() => {
                setDark(!dark);
                document.documentElement.setAttribute(
                  'data-mui-color-scheme',
                  dark ? 'light' : 'dark'
                );
              }}
            >
              Switch theme
            </Button>
            <Button
              onClick={() => {
                fixtureState.conflict = true;
              }}
            >
              Simulate next save conflict
            </Button>
            <Button
              onClick={() => {
                fixtureState.failUpload = true;
              }}
            >
              Simulate next upload error
            </Button>
          </Stack>
          <SchoolIdentityScreen />
          {editOrganizationName && (
            <CustomDialog
              open
              title="Edit Stage Primary"
              handleClose={() => setEditOrganizationName(false)}
            >
              <OrganizationForm
                editData={{ id: 'synthetic-primary', name: 'Primary' }}
                mediumId="year-26-GSEB-gu"
                handleClose={() => setEditOrganizationName(false)}
              />
            </CustomDialog>
          )}
        </Box>
        <Toaster />
      </ThemeProvider>
    </Provider>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
