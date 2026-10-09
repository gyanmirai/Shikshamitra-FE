import 'simplebar-react/dist/simplebar.min.css';

import { Provider } from 'react-redux';
import React, { useState } from 'react';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { createTheme } from 'src/theme/create-theme';
import CustomDialog from 'src/components/customDialog';
import { defaultSettings } from 'src/components/settings';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Alert, Stack, Button, Typography, CssBaseline } from '@mui/material';
import PermissionAccessForm from 'src/screens/security/role/permission-access-form';

const store = configureStore({ reducer: { [api.reducerPath]: api.reducer, confirmPopup },
  middleware: (getDefault) => getDefault().concat(api.middleware) });
const targets = [
  { id: 'synthetic-user', name: 'Akshay Patel (synthetic)', provider: 'U', label: 'User' },
  { id: 'synthetic-override', name: 'User with direct override', provider: 'U', label: 'User override' },
  { id: 'synthetic-additional', name: 'User with additional grant', provider: 'U', label: 'User additional' },
  { name: 'HOD', provider: 'R', label: 'Role HOD' },
];
function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return <Button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
    {mode === 'dark' ? 'Use light theme' : 'Use dark theme'}
  </Button>;
}
function Preview() {
  const [selected, setSelected] = useState<{ target: typeof targets[number]; mode: 'actions' | 'visibility' }>();
  const [busy, setBusy] = useState(false);
  return <Provider store={store}><ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light"><CssBaseline />
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Security permission inheritance</Typography>
      <ThemeToggle />
      <Alert severity="info" sx={{ my: 2 }}>Synthetic network fixture using the real permission form and API client. School data is unaffected.</Alert>
      <Stack spacing={2}>{targets.map((target) => <Stack key={target.label} direction="row" spacing={2}>
        <Button variant="outlined" onClick={() => setSelected({ target, mode: 'actions' })}>{target.label} Module Permission</Button>
        <Button variant="outlined" onClick={() => setSelected({ target, mode: 'visibility' })}>{target.label} Set Module Visibility</Button>
      </Stack>)}</Stack>
    </Box>
    {selected && <CustomDialog open title={`Permissions of ${selected.target.name}`} fullScreen maxWidth="xl" hasForm={false}
      disableClose={busy} handleClose={() => setSelected(undefined)}>
      <PermissionAccessForm key={`${selected.target.label}:${selected.mode}`} editData={selected.target}
        providerName={selected.target.provider} mode={selected.mode} onBusyChange={setBusy} handleClose={() => setSelected(undefined)} />
    </CustomDialog>}
  </ThemeProvider></Provider>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
