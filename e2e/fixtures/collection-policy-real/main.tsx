import 'src/components/scrollbar/styles.css';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Alert, Box, Button, CssBaseline, Stack, Typography } from '@mui/material';
import { api } from 'src/redux/service';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import CollectionPolicyDrawer from 'src/screens/finance/policies/components/CollectionPolicyDrawer';

async function start() {
  const response = await fetch('/fixture/context');
  if (!response.ok) throw new Error('The disposable Collection Policy API is unavailable.');
  const context = await response.json();
  const store = configureStore({
    reducer: {
      auth: () => ({ permissionsInitialized: true, permissions: [] }),
      globalState: () => ({
        currentYear: { id: context.academicYearId, name: 'Synthetic current year' },
      }),
      confirmPopup: () => ({ isChanges: false }),
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
  function Fixture() {
    const { setMode } = useColorScheme();
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [savedId, setSavedId] = useState('');
    const [saved, setSaved] = useState<any>(null);
    const refresh = async () => {
      const result = await fetch(
        `/api/finance/collection-policies?academicYearId=${context.academicYearId}&maxResultCount=100`
      );
      if (!result.ok) throw new Error('Policy readback failed.');
      const data = await result.json();
      const created = data.items.find((item: any) => item.policyName.startsWith('Browser Common'));
      if (created) {
        setSavedId(created.id);
        setSaved(created);
      }
    };
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          Test workspace: production Collection Policy form and real API, synthetic authentication
          and disposable SQLite.
        </Alert>
        <Stack direction="row" gap={1} sx={{ my: 2 }}>
          <Button onClick={() => setMode('light')}>Light theme</Button>
          <Button onClick={() => setMode('dark')}>Dark theme</Button>
          <Button
            onClick={() => {
              setEditData(null);
              setOpen(true);
            }}
          >
            Create collection policy
          </Button>
          <Button
            disabled={!savedId}
            onClick={async () => {
              const result = await fetch(`/api/finance/collection-policies/${savedId}`);
              if (!result.ok) throw new Error('Policy detail readback failed.');
              setEditData(await result.json());
              setOpen(true);
            }}
          >
            Edit saved policy
          </Button>
          <Button onClick={refresh}>Refresh saved policy</Button>
        </Stack>
        <Typography data-testid="saved-policy-id">{savedId}</Typography>
        <Box component="pre" data-testid="saved-policy-data">
          {saved ? JSON.stringify(saved, null, 2) : ''}
        </Box>
        <CollectionPolicyDrawer
          open={open}
          academicYearId={context.academicYearId}
          editData={editData}
          onClose={() => {
            setOpen(false);
            void refresh();
          }}
        />
      </Box>
    );
  }
  createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CssBaseline />
        <Fixture />
        <Toaster />
      </ThemeProvider>
    </Provider>
  );
}
void start().catch((error) => {
  document.getElementById('root')!.textContent = error.message;
});
