import '@fontsource/barlow/600.css';
import '@fontsource/barlow/700.css';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import 'src/components/scrollbar/styles.css';

import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import RoleScreen from 'src/screens/security/role';
import { createTheme } from 'src/theme/create-theme';
import { Box, Button, CssBaseline } from '@mui/material';
import { defaultSettings } from 'src/components/settings';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';

const readOnly = new URLSearchParams(window.location.search).has('readonly');
const grants = readOnly ? [] : ['Create', 'Update', 'Delete', 'ManagePermissions'];
const store = configureStore({
  reducer: {
    auth: () => ({
      permissions: grants.map((action) => ({
        name: `AbpIdentity.Roles.${action}`,
        isGranted: true,
      })),
    }),
    confirmPopup,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return <Button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>Switch theme</Button>;
}
function Preview() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light">
        <CssBaseline />
        <Box
          sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', p: 1, minHeight: 0 }}
        >
          <Box sx={{ flexShrink: 0 }}>
            Synthetic Role Management fixture. No school data is changed. <ThemeToggle />
          </Box>
          <Box component="main" sx={{ flex: 1, minHeight: 0 }}>
            <RoleScreen />
          </Box>
        </Box>
      </ThemeProvider>
    </Provider>
  );
}
createRoot(document.getElementById('root')!).render(<Preview />);
