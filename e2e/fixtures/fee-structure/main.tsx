import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { CssBaseline, Box, Alert, Typography, Button } from '@mui/material';
import { Toaster } from 'sonner';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import FeeStructureWorkspaceCard from 'src/screens/finance/settings/FeeStructure/Components/FeeStructureWorkspaceCard';
import 'simplebar-react/dist/simplebar.min.css';
import { readyFixture, pinnedPolicyFixture } from './mock-api';

const store = configureStore({ reducer: (state = { confirmPopup: { isChanges: true } }) => state });
function ThemeControls() {
  const { setMode } = useColorScheme();
  return (
    <Box sx={{ display: 'inline-flex', gap: 1, mb: 2, ml: 1 }}>
      <Button size="small" onClick={() => setMode('light')}>
        Light theme
      </Button>
      <Button size="small" onClick={() => setMode('dark')}>
        Dark theme
      </Button>
    </Box>
  );
}
function Fixture() {
  const [configured, setConfigured] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CssBaseline />
        <Box sx={{ bgcolor: 'background.neutral', minHeight: '100vh', p: { xs: 1, md: 4 } }}>
          <Box sx={{ maxWidth: 1450, mx: 'auto' }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Component verification fixture · synthetic school data · no backend or financial
              transactions
            </Alert>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Manage Fee Structure
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Class 5 · Primary · CBSE / English · 2026–27
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setConfigured(!configured);
                setPinned(false);
              }}
              sx={{ mb: 2 }}
            >
              {configured ? 'Load empty draft fixture' : 'Load configured draft fixture'}
            </Button>
            <Button
              size="small"
              onClick={() => {
                setConfigured(true);
                setPinned(true);
              }}
              sx={{ mb: 2 }}
            >
              Load saved policy overrides fixture
            </Button>
            <ThemeControls />
            <FeeStructureWorkspaceCard
              key={`${configured}-${pinned}`}
              index={0}
              initialData={{
                name: '',
                classId: 'class',
                feeStructureMetaDataId: 'metadata',
                feeHeads: [],
                status: 1,
                record: configured ? (pinned ? pinnedPolicyFixture : readyFixture) : undefined,
              }}
            />
          </Box>
        </Box>
        <Toaster />
      </ThemeProvider>
    </Provider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
