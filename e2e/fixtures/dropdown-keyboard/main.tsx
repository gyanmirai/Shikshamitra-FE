import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import {
  Alert,
  Stack,
  Button,
  Dialog,
  Typography,
  CssBaseline,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import { DropdownField } from './dropdown-field';

const kinds = [
  'custom',
  'search',
  'multi',
  'grouped',
  'autocomplete',
  'readonly',
  'remote',
  'responsive',
  'chart',
  'textfield',
  'empty',
  'disabled',
];

function Fixture() {
  const parameters = new URLSearchParams(window.location.search);
  const kind = parameters.get('kind') || 'custom';
  const [open, setOpen] = useState(true);
  return (
    <Stack spacing={2} sx={{ p: 3, maxWidth: 740, mx: 'auto' }}>
      <Typography variant="h4">Dropdown keyboard test fixture</Typography>
      <Alert severity="info">
        Synthetic choices exercise production dropdown components and theme.
      </Alert>
      <Stack direction="row" gap={1} flexWrap="wrap">
        {kinds.map((name) => (
          <Button key={name} component="a" href={`?kind=${name}`}>
            {name}
          </Button>
        ))}
      </Stack>
      <Typography>Test fixture: {kind}</Typography>
      {parameters.has('dialog') ? (
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Dropdown test fixture dialog</DialogTitle>
          <DialogContent>
            <DropdownField kind={kind} />
          </DialogContent>
        </Dialog>
      ) : (
        <DropdownField kind={kind} />
      )}
    </Stack>
  );
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light">
    <CssBaseline />
    <Fixture />
  </ThemeProvider>
);
