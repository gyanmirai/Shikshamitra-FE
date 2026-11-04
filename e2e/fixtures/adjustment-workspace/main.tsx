import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Stack, Button, Typography, CssBaseline } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { financePermissions } from 'src/constants/finance-menu';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import Adjustments from 'src/screens/finance/adjustments';
import { failNextRead, failNextSave, setActor } from './mock-api';
import 'simplebar-react/dist/simplebar.min.css';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';

function authState(actor: string) {
  return {
    user: { sub: actor, name: actor === 'maker' ? 'Creator' : 'Reviewer' },
    permissionsInitialized: true,
    loading: false,
    permissions: ['View', ...(actor === 'viewer' ? [] : ['Add', 'Delete'])].map((action) => ({
      name: `${financePermissions.fees.adjustment}.${action}`,
      isGranted: true,
    })),
  };
}
const store = configureStore({
  reducer: {
    confirmPopup,
    auth: (state = authState('checker'), action) =>
      action.type === 'fixture/actor' && typeof action.payload === 'string'
        ? authState(action.payload)
        : state,
    globalState: () => ({
      currentYear: {
        id: 'year-2026',
        name: '2026-2027',
        boards: [
          { id: 'cbse', name: 'CBSE', educationMediums: [{ id: 'english', name: 'English' }] },
        ],
      },
    }),
  },
});
function Fixture() {
  const { mode, setMode } = useColorScheme();
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          p: { xs: 1, sm: 2 },
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
          <Typography variant="caption" sx={{ mr: 'auto' }}>
            Adjustment UI verification · synthetic data
          </Typography>
          {['maker', 'checker', 'viewer'].map((actor) => (
            <Button
              key={actor}
              size="small"
              onClick={() => {
                setActor(actor);
                store.dispatch({ type: 'fixture/actor', payload: actor });
              }}
            >
              {actor === 'maker' ? 'Creator' : actor === 'checker' ? 'Reviewer' : 'View only'}
            </Button>
          ))}
          <Button size="small" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
            Toggle theme
          </Button>
          <Button size="small" onClick={failNextSave}>
            Fail next save
          </Button>
          <Button size="small" onClick={failNextRead}>
            Fail next detail read
          </Button>
        </Stack>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <Adjustments />
        </Box>
      </Box>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider
      theme={createTheme(defaultSettings)}
      defaultMode="light"
      modeStorageKey="adjustment-workspace-mode"
    >
      <Fixture />
    </ThemeProvider>
  </Provider>
);
