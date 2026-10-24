import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Button, CssBaseline, Stack, Typography } from '@mui/material';
import { LocalizationProvider } from 'src/components/Localization-provider/localization-provider';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { StudentFeesSummaryView } from 'src/screens/finance/FeeCollection/Components/ViewDetailsComponent/StudentFeesSummaryView';
import FeeOverview from 'src/screens/finance/FeeCollection/Components/ViewDetailsComponent/FeeOverviewDetails';
import { ConsolidatedFeeDetails } from 'src/screens/finance/FeeCollection/Components/ViewDetailsComponent/FeeTermsViewDetails';
import ConcessionsCard from 'src/screens/finance/FeeCollection/Components/ViewDetailsComponent/concessionDetails';
import PaymentHistory from 'src/screens/finance/FeeCollection/Components/ViewDetailsComponent/PaymentHistory';
import 'simplebar-react/dist/simplebar.min.css';

const store = configureStore({
  reducer: {
    auth: (
      state = {
        permissionsInitialized: true,
        loading: false,
        permissions: [{ name: 'Finance.Fees.InvoiceReceipt.View', isGranted: true }],
      }
    ) => state,
  },
});
function Fixture() {
  const { setMode } = useColorScheme();
  return (
    <Box sx={{ bgcolor: 'background.neutral', minHeight: '100dvh', p: 2 }}>
      <Stack spacing={2} sx={{ maxWidth: 1440, mx: 'auto' }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="h6">Fee Details · Synthetic Verification Data</Typography>
          <Button onClick={() => setMode('light')}>Light theme</Button>
          <Button onClick={() => setMode('dark')}>Dark theme</Button>
        </Stack>
        <StudentFeesSummaryView
          student={{
            id: 'synthetic',
            name: 'Synthetic Student',
            grNo: '1001',
            rollNo: '2',
            standardName: 'UKG',
            divisionName: 'A',
            mobileNo: 'Not recorded',
          }}
        />
        <FeeOverview
          total={50000}
          paid={12500}
          concession={37500}
          netFee={12500}
          pending={0}
          overdue={0}
          grossPaid={62500}
          overpayment={50000}
        />
        <ConsolidatedFeeDetails
          feeHeads={[
            {
              feeHeadId: 'school',
              feeHeadName: 'School fee',
              amount: 30000,
              paidAmount: 7500,
              pendingAmount: 0,
              concessionAmount: 22500,
              netFee: 7500,
              grossPaidAmount: 37500,
              overpaymentAmount: 30000,
              refundedAmount: 0,
              adjustmentCreditAmount: 0,
              description: '',
              status: 1,
            },
            {
              feeHeadId: 'tuition',
              feeHeadName: 'Tuition fee',
              amount: 20000,
              paidAmount: 5000,
              pendingAmount: 0,
              concessionAmount: 15000,
              netFee: 5000,
              grossPaidAmount: 25000,
              overpaymentAmount: 20000,
              refundedAmount: 0,
              adjustmentCreditAmount: 0,
              description: '',
              status: 1,
            },
          ]}
          charges={[
            {
              chargeId: 'uniform',
              name: 'Uniform charge',
              amount: 1000,
              paidAmount: 1000,
              pendingAmount: 0,
              waivedAmount: 0,
              canWaive: false,
              status: 1,
            },
            {
              chargeId: 'activity',
              name: 'Activity charge',
              amount: 500,
              paidAmount: 0,
              pendingAmount: 500,
              waivedAmount: 0,
              canWaive: true,
              status: 0,
            },
          ]}
        />
        <ConcessionsCard
          concessions={[
            {
              concessionRequestConcessionTypeId: 'credit',
              concessionTypeName: 'Approved concession',
              amount: 37500,
            },
          ]}
        />
        <PaymentHistory
          payments={[
            {
              paymentId: 'tx-1',
              receiptNumber: 'REC-2026-1',
              date: '2026-10-23',
              amount: 12500,
              paymentMethods: [0],
              status: 1,
              receipts: [
                { receiptId: 'doc-1', receiptNumber: 'FIN-2026-1', scope: 'Fee', hasPdf: true },
              ],
            },
            {
              paymentId: 'tx-2',
              receiptNumber: 'REC-2026-2',
              date: '2026-10-22',
              amount: 51000,
              paymentMethods: [2],
              status: 1,
              receipts: [
                { receiptId: 'doc-2', receiptNumber: 'FIN-2026-2', scope: 'Fee', hasPdf: true },
                { receiptId: 'doc-2-charge', receiptNumber: 'FCH-2026-2', scope: 'Charge', hasPdf: true },
              ],
            },
            {
              paymentId: 'tx-3',
              receiptNumber: 'REC-2026-3',
              date: '2026-10-21',
              amount: 100,
              paymentMethods: [1],
              status: 3,
              receipts: [
                { receiptId: 'doc-3', receiptNumber: 'KFE-2026-3', scope: 'Fee', hasPdf: false },
              ],
            },
          ]}
        />
      </Stack>
    </Box>
  );
}
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider>
        <CssBaseline />
        <Fixture />
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
