import dayjs from 'dayjs';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/redux/auth/authSlice';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import LoadSession from 'src/redux/auth/load-session';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { openLibraryApi } from 'src/redux/library/LibraryDataSearch';
import { ClassForm } from 'src/components/academic-setup/class-setup';
import ShiftManagementScreen from 'src/screens/setting/shift-management';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
  Alert,
  Stack,
  Button,
  Dialog,
  Typography,
  CssBaseline,
  DialogTitle,
} from '@mui/material';

import { tenants, useSession, switchTenant } from './auth';

dayjs.extend(customParseFormat);
const store = configureStore({
  reducer: {
    auth: authReducer,
    globalState: () => ({}),
    confirmPopup: () => ({ isChanges: false }),
    [api.reducerPath]: api.reducer,
    [openLibraryApi.reducerPath]: openLibraryApi.reducer,
  },
  middleware: (defaults) =>
    defaults({ serializableCheck: false }).concat(api.middleware, openLibraryApi.middleware),
});
const theme = createTheme(defaultSettings);

function App() {
  const { data } = useSession();
  const [standardOpen, setStandardOpen] = useState(false);
  const school = data.profile.tenantid === tenants.ddvs ? 'DDVS' : 'Shree Swaminarayan Vidyalaya';
  return (
    <Provider store={store}>
      <LoadSession />
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Alert severity="info">
              Disposable test: production grid, standard form, and session cache; real backend with
              synthetic authentication.
            </Alert>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Typography variant="h6">{school}</Typography>
              <Button onClick={() => switchTenant('ddvs')}>Switch to DDVS</Button>
              <Button onClick={() => switchTenant('swaminarayan')}>Switch to Swaminarayan</Button>
              <Button onClick={() => setStandardOpen(true)}>Add Standard</Button>
            </Stack>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <ShiftManagementScreen />
            </Box>
            <Dialog open={standardOpen} onClose={() => setStandardOpen(false)} fullWidth>
              <DialogTitle>Add Standard</DialogTitle>
              <ClassForm
                handleClose={() => setStandardOpen(false)}
                editData={null}
                organizationId="synthetic-stage"
              />
            </Dialog>
          </Box>
          <Toaster />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
