'use client';

import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Chip, Stack, Paper, Divider, TextField, Typography } from '@mui/material';

import { SummaryRow, ValidationCheck } from './CollectionCommon';

interface CollectionSummaryPanelProps {
  formik: any;
  checks: {
    nameValid: boolean;
    graceValid: boolean;
    lateFeeValid: boolean;
    waiverHeadsValid: boolean;
    isReadyToPublish: boolean;
  };
  calcAmount: number;
  setCalcAmount: (val: number) => void;
  calcDaysLate: number;
  setCalcDaysLate: (val: number) => void;
  calcPayment: number;
  setCalcPayment: (val: number) => void;
  calculatedLateFee: number;
  allocatedPayment: number;
  remainingBalance: number;
}

export default function CollectionSummaryPanel({
  formik,
  checks,
  calcAmount,
  setCalcAmount,
  calcDaysLate,
  setCalcDaysLate,
  calcPayment,
  setCalcPayment,
  calculatedLateFee,
  allocatedPayment,
  remainingBalance,
}: CollectionSummaryPanelProps) {
  return (
    <Box
      sx={{
        width: 300,
        flexShrink: 0,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        borderLeft: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.neutral' : 'grey.50'),
      }}
    >
      <Scrollbar sx={{ flex: 1 }}>
        <Box sx={{ p: 2 }}>
          {/* Summary */}
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'text.secondary',
            }}
          >
            Live Summary
          </Typography>
          <Stack spacing={0.75} mt={1} mb={2.5}>
            <SummaryRow
              label="Policy Name"
              value={
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{
                    maxWidth: 140,
                    textAlign: 'right',
                    wordBreak: 'break-word',
                    fontSize: '0.7rem',
                  }}
                >
                  {formik.values.policyName || '—'}
                </Typography>
              }
            />
            <SummaryRow
              label="Status"
              value={
                <Chip
                  label={formik.values.status}
                  size="small"
                  color={formik.values.status === 'Active' ? 'success' : 'default'}
                  sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
                />
              }
            />
            <SummaryRow
              label="Grace Period"
              value={
                <Typography variant="caption" fontWeight={600} fontSize="0.7rem">
                  {formik.values.gracePeriodDays} days
                </Typography>
              }
            />
            <SummaryRow
              label="Late Fee Type"
              value={
                <Typography variant="caption" fontWeight={600} fontSize="0.7rem">
                  {formik.values.enableLateFee ? formik.values.lateFeeType : 'Disabled'}
                </Typography>
              }
            />
            <SummaryRow
              label="Waiver Enabled"
              value={
                <Chip
                  label={formik.values.enableWaiver ? 'Yes' : 'No'}
                  size="small"
                  color={formik.values.enableWaiver ? 'primary' : 'default'}
                  variant={formik.values.enableWaiver ? 'filled' : 'outlined'}
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              }
            />
            <SummaryRow
              label="Consider as Income"
              value={
                <Chip
                  label={formik.values.considerAsIncome ? 'Yes' : 'No'}
                  size="small"
                  color={formik.values.considerAsIncome ? 'success' : 'default'}
                  variant={formik.values.considerAsIncome ? 'filled' : 'outlined'}
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              }
            />
            <SummaryRow
              label="Online Collection"
              value={
                <Chip
                  label={formik.values.allowOnlineCollection ? 'Allowed' : 'Disabled'}
                  size="small"
                  color={formik.values.allowOnlineCollection ? 'success' : 'default'}
                  variant={formik.values.allowOnlineCollection ? 'filled' : 'outlined'}
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              }
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Live Calculator */}
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'text.secondary',
            }}
          >
            Live Calculator
          </Typography>
          <Stack spacing={1.5} mt={1} mb={2.5}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Outstanding (₹)"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Math.max(0, +e.target.value))}
              slotProps={{ htmlInput: { style: { fontSize: '11px', padding: '6px 8px' } } }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Days Late"
              value={calcDaysLate}
              onChange={(e) => setCalcDaysLate(Math.max(0, +e.target.value))}
              slotProps={{ htmlInput: { style: { fontSize: '11px', padding: '6px 8px' } } }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Payment Amount (₹)"
              value={calcPayment}
              onChange={(e) => setCalcPayment(Math.max(0, +e.target.value))}
              slotProps={{ htmlInput: { style: { fontSize: '11px', padding: '6px 8px' } } }}
            />

            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
              <Stack spacing={0.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography sx={{ fontSize: '11px' }}>Late Fee:</Typography>
                  <Typography sx={{ fontSize: '11px' }} fontWeight={700} color="error.main">
                    ₹{calculatedLateFee}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography sx={{ fontSize: '11px' }}>Allocated:</Typography>
                  <Typography sx={{ fontSize: '11px' }} fontWeight={700} color="success.main">
                    ₹{allocatedPayment}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography sx={{ fontSize: '11px' }}>Remaining Balance:</Typography>
                  <Typography sx={{ fontSize: '11px' }} fontWeight={700}>
                    ₹{remainingBalance}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Validation panel */}
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'text.secondary',
            }}
          >
            Validation Panel
          </Typography>
          <Stack spacing={0.5} mt={1}>
            <ValidationCheck label="General Information Complete" valid={checks.nameValid} />
            <ValidationCheck label="Grace Period Configured" valid={checks.graceValid} />
            <ValidationCheck label="Late Fee Slabs/Inputs Configured" valid={checks.lateFeeValid} />
            <ValidationCheck label="Waiver Applies To Fee Heads" valid={checks.waiverHeadsValid} />
            {checks.isReadyToPublish ? (
              <Chip
                label="Ready to Publish"
                size="small"
                color="success"
                sx={{ mt: 1, height: 20, fontSize: '10px' }}
              />
            ) : (
              <Chip
                label="Requires Fields Completion"
                size="small"
                color="warning"
                sx={{ mt: 1, height: 20, fontSize: '10px' }}
              />
            )}
          </Stack>
        </Box>
      </Scrollbar>
    </Box>
  );
}
