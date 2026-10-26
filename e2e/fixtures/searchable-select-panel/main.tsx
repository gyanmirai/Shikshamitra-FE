import '@fontsource/barlow/600.css';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';

import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { Box, Link, Stack, Typography, CssBaseline } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';

import { store } from './store';
import { StructurePreview } from './structure-preview';
import { SecondaryControls } from './secondary-controls';

const mode = new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light';

function Fixture() {
  return (
    <Box component="main" sx={{ maxWidth: 880, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2}>
        <Stack spacing={1}>
          <Typography variant="h4">Searchable select panel</Typography>
          <Typography color="text.secondary" variant="body2">
            Synthetic school-safe fixture. The production initial-setup structure step uses local
            board options; no school records or backend requests are used.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link href="?theme=light" aria-current={mode === 'light' ? 'page' : undefined}>
              Light theme
            </Link>
            <Link href="?theme=dark" aria-current={mode === 'dark' ? 'page' : undefined}>
              Dark theme
            </Link>
          </Stack>
        </Stack>
        <StructurePreview />
        <SecondaryControls />
      </Stack>
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider
      theme={createTheme({ ...defaultSettings, colorScheme: mode })}
      defaultMode={mode}
      modeStorageKey={`searchable-panel-${mode}`}
    >
      <CssBaseline />
      <Fixture />
    </ThemeProvider>
  </Provider>
);
