import 'simplebar-react/dist/simplebar.min.css';

import type { IFinancePolicyRow } from 'src/screens/finance/policies/types/finance-policy.types';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { Box, Button, Typography, CssBaseline } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';
import FinancePolicyDetailsDrawer from 'src/screens/finance/policies/components/FinancePolicyDetailsDrawer';

const params = new URLSearchParams(window.location.search);
const dark = params.has('dark');
const policy = {
  id: 'fixture-refund-policy',
  policyName: 'Refund details verification',
  policyType: 'refund',
  academicYearName: '2026-2027',
  status: 'Active',
  version: 1,
} as IFinancePolicyRow;

const details = {
  description: 'Synthetic refund settings for local visual verification. No backend writes.',
  feeHeadScope: 'AllFeeHeads',
  applicableFeeHeadIds: [],
  includePaidCharges: true,
  includePaidLateFee: false,
  allowPartialRefund: true,
  amountMode: 'ManualUpToEligible',
  deductionType: 'None',
  allowedPayoutMethods: ['Cash', 'BankTransfer'],
  processingTargetDays: 7,
  version: 1,
};

function Fixture() {
  const [open, setOpen] = React.useState(true);
  const [empty, setEmpty] = React.useState(params.has('empty'));

  return (
    <ThemeProvider
      theme={createTheme({ ...defaultSettings, colorScheme: dark ? 'dark' : 'light' })}
      defaultMode={dark ? 'dark' : 'light'}
      modeStorageKey={`refund-details-fixture-${dark ? 'dark' : 'light'}`}
    >
      <CssBaseline />
      <Box sx={{ p: 2 }}>
        <Typography variant="h5">Refund Policy Details Verification</Typography>
        <Typography variant="body2">
          Production component; synthetic saved settings; no backend writes.
        </Typography>
        <Button
          onClick={() => {
            setEmpty(false);
            setOpen(true);
          }}
        >
          Open configured policy
        </Button>
        <Button
          onClick={() => {
            setEmpty(true);
            setOpen(true);
          }}
        >
          Open policy without limits
        </Button>
      </Box>
      <FinancePolicyDetailsDrawer
        open={open}
        onClose={() => setOpen(false)}
        policy={policy}
        policyDetails={{
          ...details,
          maximumPerRequest: empty ? null : 12500,
          maximumPerStudentYear: empty ? null : 25000,
        }}
      />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Fixture />);
