import 'simplebar-react/dist/simplebar.min.css';

import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { createTheme } from 'src/theme/create-theme';
import { financePermissions } from 'src/constants/finance-menu';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { defaultSettings } from 'src/components/settings/config-settings';
import FinanceReconciliation from 'src/screens/finance/Finance-reconciliation';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box, Alert, Stack, Button, Typography, CssBaseline } from '@mui/material';
import AdjustmentTable from 'src/screens/finance/adjustments/components/AdjustmentTable';
import { AdjustmentTabEnum } from 'src/screens/finance/adjustments/enums/adjustment.enum';
import ReceiptManagement from 'src/screens/finance/InvoiceAndReceipt/Components/ReceiptManagement';

import { api, requests } from './mock-service';

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    confirmPopup,
    globalState: () => ({
      currentYear: {
        id: 'year',
        name: '2026-2027',
        startDate: '2026-06-01',
        endDate: '2027-05-31',
        boards: [
          { id: 'board', name: 'GSEB', educationMediums: [{ id: 'medium', name: 'English' }] },
        ],
      },
    }),
    auth: () => ({
      permissionsInitialized: true,
      loading: false,
      permissions: [{ name: `${financePermissions.fees.adjustment}.View`, isGranted: true }],
    }),
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
function Fixture() {
  const [workspace, setWorkspace] = React.useState('Receipts');
  const [adjustmentTab, setAdjustmentTab] = React.useState(AdjustmentTabEnum.Pending);
  const [evidence, setEvidence] = React.useState(false);
  const { setMode } = useColorScheme();
  return (
    <Stack spacing={1} sx={{ height: '100vh', p: 1, bgcolor: 'background.neutral' }}>
      <Alert severity="info">
        Synthetic local QA · production Receipts and Reconciliation screens · 70 receipts and 76
        entries per payment method · no financial writes
      </Alert>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {['Receipts', 'Reconciliation', 'Adjustments'].map((name) => (
          <Button key={name} onClick={() => setWorkspace(name)}>
            {name}
          </Button>
        ))}
        <Button onClick={() => setMode('light')}>Light</Button>
        <Button onClick={() => setMode('dark')}>Dark</Button>
        <Button onClick={() => setEvidence(!evidence)}>Request evidence</Button>
      </Stack>
      <Typography variant="h5">Finance Table Search and Filter QA</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {workspace === 'Receipts' ? (
          <ReceiptManagement />
        ) : workspace === 'Reconciliation' ? (
          <FinanceReconciliation />
        ) : (
          <AdjustmentTable
            activeTab={adjustmentTab}
            onTabChange={setAdjustmentTab}
            tabCounts={{ 0: 1, 1: 0, 2: 1 }}
            onCreateAdjustment={() => {}}
            onView={() => {}}
          />
        )}
      </Box>
      {evidence && (
        <Box component="pre" sx={{ maxHeight: 160, overflow: 'auto', fontSize: 11 }}>
          {JSON.stringify(requests.slice(-12), null, 2)}
        </Box>
      )}
    </Stack>
  );
}
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <Fixture />
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
