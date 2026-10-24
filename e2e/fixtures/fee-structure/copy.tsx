import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Button, CssBaseline, Typography, Alert } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import CopyFeeStructureDialog from 'src/screens/finance/settings/FeeStructure/Components/CopyFeeStructureDialog';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { copyMode, copyFixtureStatus, fixtureClassRecords } from './mock-api';
import 'simplebar-react/dist/simplebar.min.css';

const store = configureStore({ reducer: { confirmPopup: confirmPopupReducer } });
function Fixture() {
  const [open, setOpen] = React.useState(true);
  const [status, setStatus] = React.useState({ ...copyFixtureStatus });
  const [copied, setCopied] = React.useState<any>(null);
  const { setMode } = useColorScheme();
  React.useEffect(() => {
    const update = () => setStatus({ ...copyFixtureStatus });
    window.addEventListener('copy-fixture-state', update);
    return () => window.removeEventListener('copy-fixture-state', update);
  }, []);
  return (
    <>
      <CssBaseline />
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          Synthetic copy verification · {copyMode} policy scenario · no backend or financial
          transactions
        </Alert>
        <Typography data-testid="copy-status">
          Copies created: {status.created} · Save attempts: {status.attempts} · Source refund:{' '}
          {fixtureClassRecords.class[0].refundPolicyVersionId}
        </Typography>
        {copied && (
          <Typography role="status">
            Copied {copied.name} · Refund selected: {copied.refundPolicyVersionId}
          </Typography>
        )}
        <Button size="small" onClick={() => setOpen(true)}>
          Open copy form
        </Button>
        <Button size="small" onClick={() => setMode('light')}>
          Light theme
        </Button>
        <Button size="small" onClick={() => setMode('dark')}>
          Dark theme
        </Button>
      </Box>
      {open && (
        <CopyFeeStructureDialog
          feeStructureMetadataId="metadata"
          standardId="other"
          classes={[
            { id: 'class', name: 'Class 5' },
            { id: 'other', name: 'Class 6' },
          ]}
          existingNames={['Class 6 Annual Fees']}
          onClose={() => setOpen(false)}
          onCopied={(record) => {
            setCopied(record);
            setOpen(false);
          }}
          onBusyChange={() => {}}
        />
      )}
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Fixture />
    </ThemeProvider>
  </Provider>
);
