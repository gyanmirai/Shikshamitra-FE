import React from 'react';
import 'src/components/scrollbar/styles.css';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import AttendanceTrackingScreen from 'src/screens/hr/attendance-tracking';

const store = configureStore({
  reducer: {
    globalState: () => ({ currentYear: { id: 'synthetic-year' } }),
    confirmPopup: () => ({ isChanges: false }),
    auth: () => ({ permissions: [] }),
  },
});
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            height: { xs: 'auto', md: '100dvh' },
            minHeight: '100dvh',
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <AttendanceTrackingScreen />
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
