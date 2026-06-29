'use client';

/**
 * ConcessionApplicationSection — Card 4
 * Apply Concession On, Paid Fee Adjustment, Pending Fee Handling, Future Installment Strategy
 * Full dynamic visibility based on the master "Apply On" selection.
 */

import React from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Grid,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  FormControl,
  FormHelperText,
} from '@mui/material';

import { ConcessionSectionCard } from './ConcessionCommon';

const APPLY_ON_OPTIONS = [
  { value: 'PendingFeesOnly', label: 'Pending Fees Only' },
  { value: 'PaidFeesOnly', label: 'Paid Fees Only' },
  { value: 'PaidAndPending', label: 'Paid + Pending' },
  { value: 'FutureInstallmentsOnly', label: 'Future Installments Only' },
  { value: 'CurrentInstallmentOnly', label: 'Current Installment Only' },
  { value: 'EntireFeeStructure', label: 'Entire Fee Structure' },
];

const PAID_FEE_ADJUSTMENT_OPTIONS = [
  { value: 'Refund', label: 'Refund to Student' },
  { value: 'CreditNote', label: 'Credit Note' },
  { value: 'StudentWallet', label: 'Student Wallet' },
  { value: 'FutureFeeAdjustment', label: 'Adjust Against Future Fees' },
  { value: 'ManualDecision', label: 'Manual Decision' },
];

const PENDING_FEE_HANDLING_OPTIONS = [
  { value: 'ReduceOutstanding', label: 'Reduce Outstanding' },
  { value: 'RecalculateInstallments', label: 'Recalculate Installments' },
  { value: 'FutureInstallmentsOnly', label: 'Apply to Future Installments Only' },
];

const FUTURE_INSTALLMENT_STRATEGY_OPTIONS = [
  { value: 'EqualDistribution', label: 'Equal Distribution Across Installments' },
  { value: 'RemainingInstallments', label: 'Remaining Installments Only' },
  { value: 'CurrentInstallment', label: 'Current Installment Only' },
];

// Helper — which apply-on values include paid fees
const AFFECTS_PAID = ['PaidFeesOnly', 'PaidAndPending', 'EntireFeeStructure'];
// Helper — which apply-on values include pending fees
const AFFECTS_PENDING = [
  'PendingFeesOnly',
  'PaidAndPending',
  'EntireFeeStructure',
  'CurrentInstallmentOnly',
];
// Helper — which values show future installment strategy
const AFFECTS_FUTURE = ['FutureInstallmentsOnly'];

interface ConcessionApplicationSectionProps {
  formik: any;
}

export default function ConcessionApplicationSection({
  formik,
}: ConcessionApplicationSectionProps) {
  const { applyOn } = formik.values;
  const showPaidAdjustment = AFFECTS_PAID.includes(applyOn);
  const showPendingHandling = AFFECTS_PENDING.includes(applyOn);
  const showFutureStrategy =
    AFFECTS_FUTURE.includes(applyOn) ||
    formik.values.pendingFeeHandling === 'FutureInstallmentsOnly';

  return (
    <ConcessionSectionCard
      title="Application Behaviour"
      subtitle="Define how and when the concession is applied — this is the most critical section."
    >
      <Grid container spacing={3}>
        {/* Apply Concession On */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl
            fullWidth
            size="small"
            error={formik.touched.applyOn && Boolean(formik.errors.applyOn)}
          >
            <InputLabel>Apply Concession On *</InputLabel>
            <Select
              label="Apply Concession On *"
              name="applyOn"
              value={formik.values.applyOn}
              onChange={(e) => {
                formik.handleChange(e);
                // Reset dependent fields on mode change
                formik.setFieldValue('paidFeeAdjustment', null);
                formik.setFieldValue('pendingFeeHandling', null);
                formik.setFieldValue('futureInstallmentStrategy', null);
              }}
              onBlur={formik.handleBlur}
            >
              {APPLY_ON_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.applyOn && formik.errors.applyOn && (
              <FormHelperText>{formik.errors.applyOn as string}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Context Info */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box
            sx={{
              p: 1.5,
              height: '100%',
              bgcolor: 'action.hover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Iconify
              icon="solar:info-circle-bold-duotone"
              width={18}
              sx={{ color: 'info.main', flexShrink: 0 }}
            />
            <Typography variant="caption" color="text.secondary" lineHeight={1.5}>
              Determines the scope of fees the concession engine targets. Paid fee adjustments and
              pending fee handling options appear based on your selection.
            </Typography>
          </Box>
        </Grid>

        {/* Paid Fee Adjustment */}
        {showPaidAdjustment && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Paid Fee Adjustment</InputLabel>
              <Select
                label="Paid Fee Adjustment"
                name="paidFeeAdjustment"
                value={formik.values.paidFeeAdjustment || ''}
                onChange={formik.handleChange}
              >
                {PAID_FEE_ADJUSTMENT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                How to handle already collected fees when concession is applied
              </FormHelperText>
            </FormControl>
          </Grid>
        )}

        {/* Refund warning */}
        {showPaidAdjustment && formik.values.paidFeeAdjustment === 'Refund' && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Alert severity="warning" variant="outlined" sx={{ fontSize: '0.78rem' }}>
              Selecting &quot;Refund&quot; will trigger a refund voucher and require bank details
              from the student or guardian. Ensure your Refund Policy is configured.
            </Alert>
          </Grid>
        )}

        {/* Pending Fee Handling */}
        {showPendingHandling && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Pending Fee Handling</InputLabel>
              <Select
                label="Pending Fee Handling"
                name="pendingFeeHandling"
                value={formik.values.pendingFeeHandling || ''}
                onChange={formik.handleChange}
              >
                {PENDING_FEE_HANDLING_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>How pending (unpaid) fees should be recalculated</FormHelperText>
            </FormControl>
          </Grid>
        )}

        {/* Future Installment Strategy */}
        {(showFutureStrategy || AFFECTS_FUTURE.includes(applyOn)) && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Future Installment Strategy</InputLabel>
              <Select
                label="Future Installment Strategy"
                name="futureInstallmentStrategy"
                value={formik.values.futureInstallmentStrategy || ''}
                onChange={formik.handleChange}
              >
                {FUTURE_INSTALLMENT_STRATEGY_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>How to spread the concession across installments</FormHelperText>
            </FormControl>
          </Grid>
        )}
      </Grid>
    </ConcessionSectionCard>
  );
}
