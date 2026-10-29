import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/600.css';
import 'src/components/scrollbar/styles.css';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { createTheme } from 'src/theme/create-theme';
import { Box, Button, CssBaseline } from '@mui/material';
import { defaultSettings } from 'src/components/settings';
import UserTable from 'src/screens/security/user/user-table';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';

const store = configureStore({
  reducer: { auth: () => ({ permissions: [] }), confirmPopup, [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults().concat(api.middleware),
});

function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return <Button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>Switch theme</Button>;
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light">
      <CssBaseline />
      <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', minHeight: 0, p: 1 }}>
        <Box>
          Synthetic User Directory. No school data is changed. <ThemeToggle />
        </Box>
        <Box component="main" sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <UserTable onAction={() => {}} />
        </Box>
      </Box>
    </ThemeProvider>
  </Provider>
);
