import 'src/components/scrollbar/styles.css';

import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { Box, CssBaseline } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import ManualAttendance from 'src/screens/hr/attendance/manual-attendance';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    confirmPopup,
    auth: () => ({ permissions: [] }),
    globalState: () => ({ currentYear: { startDate: '2026-04-01', endDate: '2027-03-31' } }),
  },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider
      theme={createTheme(defaultSettings)}
      defaultMode={
        new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light'
      }
    >
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ height: { xs: 'auto', md: '100dvh' }, minHeight: '100dvh', minWidth: 0, p: 1 }}>
          <ManualAttendance />
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
