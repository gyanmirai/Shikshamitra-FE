import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { Stack, Button, Typography, CssBaseline } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';
import { EsiPolicyArchiveDialog } from 'src/screens/hr/payroll/setting/esi-policy-archive-dialog';

import { policy } from './mock-api';

const mode = new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light';
function Fixture() {
  const [open, setOpen] = useState(false);
  return (
    <ThemeProvider
      theme={createTheme({ ...defaultSettings, colorScheme: mode })}
      defaultMode={mode}
      storageManager={null}
    >
      <CssBaseline />
      <Stack sx={{ p: 2 }} spacing={2}>
        <Typography variant="h5">ESIC archive review</Typography>
        <Typography>Synthetic UI fixture. No school records are changed.</Typography>
        <Button onClick={() => setOpen(true)}>Review archive</Button>
        {open && <EsiPolicyArchiveDialog policy={policy} onClose={() => setOpen(false)} />}
      </Stack>
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
