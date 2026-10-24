import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Box, Alert, Button, CssBaseline, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { financePermissions } from 'src/constants/finance-menu';
import RefundForm from 'src/screens/finance/feeRefund/NewRefundForm/RefundForm';
import RefundRemarksForm from 'src/screens/finance/feeRefund/Components/RefundRemarksForm';
import 'simplebar-react/dist/simplebar.min.css';

const store = configureStore({
  reducer: () => ({
    confirmPopup: { isChanges: false },
    globalState: {
      currentYear: { id: 'year', name: '2026–27', startDate: '2026-04-01', endDate: '2027-03-31' },
    },
    auth: {
      permissions: [{ name: financePermissions.fees.refundActions.approve, isGranted: true }],
    },
  }),
});

function Fixture() {
  const [saved, setSaved] = React.useState(false);
  const [viewRefund, setViewRefund] = React.useState(false);
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CssBaseline />
        <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Alert severity="info">
            Local regression harness · Synthetic student, receipt and payment data. No backend
            writes.
          </Alert>
          <Typography variant="h5" sx={{ p: 2 }}>
            Add Refund Request
          </Typography>
          <Button onClick={() => setViewRefund(true)}>View synthetic refund request</Button>
          {saved && (
            <Alert severity="success">Synthetic refund request submitted and approved.</Alert>
          )}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <RefundForm
              defaultBoardId="board"
              defaultMediumId="medium"
              defaultStandardId="class"
              defaultDivisionId="division"
              onCancel={(_, submitted) => setSaved(submitted)}
            />
          </Box>
          <RefundRemarksForm
            open={{ value: viewRefund } as any}
            onClose={() => setViewRefund(false)}
            onApprove={() => undefined}
            onReject={() => undefined}
            student={{
              id: 1,
              name: 'Synthetic Student',
              board: 'Synthetic Board',
              medium: 'English',
              class: 'VIII',
              division: 'A',
              grNo: '1001',
              rollNo: '5',
              totalPaidFees: 15000,
              totalPendingFees: 0,
              status: 7,
              _refundRequestId: 'refund-1',
            }}
          />
        </Box>
      </ThemeProvider>
    </Provider>
  );
}

createRoot(document.getElementById('root')!).render(<Fixture />);
