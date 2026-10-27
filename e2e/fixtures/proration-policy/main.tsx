import 'simplebar-react/dist/simplebar.min.css';

import type {
  IFinancePolicyRow,
  IProrationPolicyFormValues,
} from 'src/screens/finance/policies/types/finance-policy.types';

import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { api } from 'src/redux/service';
import { financePermissions } from 'src/constants/finance-menu';
import { useGetProrationPoliciesQuery } from 'src/redux/finance/prorationPolicy';
import ProrationPolicyDrawer from 'src/screens/finance/policies/components/ProrationPolicyDrawer';
import ProrationPolicyWorkspace from 'src/screens/finance/policies/workspaces/ProrationPolicyWorkspace';
import { Snackbar } from 'src/components/snackbar';
import { useFormik } from 'formik';
import { createRoot } from 'react-dom/client';
import { createTheme } from 'src/theme/create-theme';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { defaultSettings } from 'src/components/settings/config-settings';
import { Box, Alert, Stack, Button, Typography, CssBaseline } from '@mui/material';
import { ProrationSummaryPanel } from 'src/screens/finance/policies/components/proration/ProrationCommon';
import FinancePolicyDetailsDrawer from 'src/screens/finance/policies/components/FinancePolicyDetailsDrawer';
import ProrationFeeHeadsSection from 'src/screens/finance/policies/components/proration/ProrationFeeHeadsSection';
import {
  getProrationFormChecks,
  toProrationPolicyPayload,
  buildProrationValidationSchema,
} from 'src/screens/finance/policies/hooks/useProrationPolicyForm';

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    globalState: () => ({ currentYear: { id: 'synthetic-year' } }),
    auth: () => ({
      permissions: [
        { name: financePermissions.policies.prorationPolicyActions.activate, isGranted: true },
        { name: financePermissions.policies.prorationPolicyActions.view, isGranted: true },
        { name: financePermissions.policies.prorationPolicyActions.clone, isGranted: true },
      ],
    }),
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

function Fixture() {
  const { setMode } = useColorScheme();
  const [payload, setPayload] = React.useState('');
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<IFinancePolicyRow | null>(null);
  const { data: savedPolicies } = useGetProrationPoliciesQuery({
    academicYearId: 'synthetic-year',
  });
  const formik = useFormik<IProrationPolicyFormValues>({
    initialValues: {
      policyType: 'proration',
      policyName: 'Admission and Early Withdrawal',
      policyCode: 'PRO-01',
      description: '',
      status: 'Draft',
      academicYearId: 'synthetic-year',
      isDefault: false,
      feeHeadRules: [
        {
          feeHeadId: 'tuition',
          feeHeadName: 'Tuition Fee',
          feeType: 'Recurring',
          ruleType: 'MonthlyProration',
          applyOnAdmission: true,
          configuration: { monthlyRule: 'ChargeNextMonth', cutOffDay: 15, roundOff: 'NoRoundOff' },
          applyOnEarlyWithdrawal: true,
          earlyWithdrawalRuleType: 'MonthlyProration',
          earlyWithdrawalConfiguration: { monthlyRule: 'HalfMonthRule', cutOffDay: 15 },
        },
        {
          feeHeadId: 'transport',
          feeHeadName: 'Transport Fee',
          feeType: 'Recurring',
          ruleType: 'NoProration',
          configuration: { roundOff: 'NoRoundOff' },
          applyOnAdmission: false,
          applyOnEarlyWithdrawal: true,
          earlyWithdrawalRuleType: 'DailyProration',
          earlyWithdrawalConfiguration: { calculationBasis: 'CalendarDays', minimumChargeDays: 0 },
        },
        {
          feeHeadId: 'admission',
          feeHeadName: 'Admission Fee',
          feeType: 'OneTime',
          ruleType: 'NoProration',
          configuration: {},
        },
      ],
    },
    validationSchema: buildProrationValidationSchema(false),
    onSubmit: (values) => setPayload(JSON.stringify(toProrationPolicyPayload(values), null, 2)),
  });
  const row: IFinancePolicyRow = {
    id: 'fixture-policy',
    policyType: 'proration',
    policyName: formik.values.policyName,
    policyCode: formik.values.policyCode,
    status: 'Draft',
    academicYearId: 'synthetic-year',
    academicYearName: 'Fixture Academic Year',
    effectiveFrom: null,
    effectiveTo: null,
    updatedBy: 'Fixture',
    updatedAt: '2026-10-05',
    isDefault: false,
  };
  return (
    <Stack
      spacing={2}
      sx={{ p: { xs: 1, md: 3 }, bgcolor: 'background.neutral', minHeight: '100vh' }}
    >
      <Alert severity="info">
        Component verification · synthetic fee heads · no backend writes
      </Alert>
      <Stack direction="row" gap={1} flexWrap="wrap">
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null);
            setDrawerOpen(true);
          }}
        >
          Open create drawer
        </Button>
        {!!savedPolicies?.items.length && (
          <Button
            onClick={() => {
              const saved = savedPolicies.items[0];
              setEditData({
                ...row,
                id: saved.id!,
                policyName: saved.policyName,
                status: saved.status,
                version: saved.version,
              });
              setDrawerOpen(true);
            }}
          >
            Reopen saved policy
          </Button>
        )}
      </Stack>
      <ProrationPolicyDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editData={editData}
        academicYearId="synthetic-year"
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Create Proration Policy</Typography>
        <Stack direction="row">
          <Button onClick={() => setMode('light')}>Light</Button>
          <Button onClick={() => setMode('dark')}>Dark</Button>
        </Stack>
      </Stack>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, p: { xs: 1, md: 2 } }}>
          <ProrationFeeHeadsSection formik={formik} />
        </Box>
        <ProrationSummaryPanel formik={formik} checks={getProrationFormChecks(formik.values)} />
      </Box>
      <Button variant="contained" onClick={() => formik.submitForm()}>
        Review Saved Fields
      </Button>
      <Button onClick={() => setDetailsOpen(true)}>View Policy Details</Button>
      <FinancePolicyDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        policy={row}
        policyDetails={{ ...toProrationPolicyPayload(formik.values), version: 1 }}
      />
      {!!payload && (
        <Box component="pre" sx={{ p: 2, bgcolor: 'background.paper', overflow: 'auto' }}>
          {payload}
        </Box>
      )}
    </Stack>
  );
}

function CloneFixture() {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2, gap: 1 }}>
      <Alert severity="info">Clone verification · synthetic policies · no backend writes</Alert>
      <Box sx={{ flex: 1, minHeight: 0 }}><ProrationPolicyWorkspace /></Box>
      <Snackbar />
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <CssBaseline />
    <Provider store={store}>
      {new URLSearchParams(window.location.search).has('clone') ? <CloneFixture /> : <Fixture />}
    </Provider>
  </ThemeProvider>
);
