'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  Box,
  Stack,
  Paper,
  Divider,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { SummaryRow, ValidationCheck, ValidationWarning } from './CollectionCommon';

interface CollectionSummaryPanelProps {
  formik: any;
  checks: {
    nameValid: boolean;
    graceValid: boolean;
    graceTypeValid: boolean;
    headsValid: boolean;
    lateFeeValid: boolean;
    waiverHeadsValid: boolean;
    waiverApprovalValid: boolean;
    incomeHeadValid: boolean;
    slabValid: boolean;
    isDefaultConflict: boolean;
    uncappedRunawayRisk: boolean;
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
        width: 320,
        flexShrink: 0,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        borderLeft: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.default, 0.6)
            : alpha(theme.palette.grey[50], 0.7),
      }}
    >
      <Scrollbar sx={{ flex: 1 }}>
        <Box sx={{ p: 2.25 }}>
          {/* Section 1: Live Policy Summary */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 0.75,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:document-bold" width={14} height={14} />
            </Box>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'text.primary',
              }}
            >
              Live Summary
            </Typography>
          </Stack>

          <Stack spacing={0.5} mb={2.5}>
            <SummaryRow
              label="Policy Name"
              value={
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{
                    maxWidth: 160,
                    textAlign: 'right',
                    wordBreak: 'break-word',
                    fontSize: '0.72rem',
                  }}
                >
                  {formik.values.policyName || '—'}
                </Typography>
              }
            />
            <SummaryRow
              label="Status"
              value={
                <Label
                  color={formik.values.status === 'Active' ? 'success' : 'warning'}
                  sx={{ height: 18, fontSize: '0.65rem' }}
                >
                  {formik.values.status}
                </Label>
              }
            />
            <SummaryRow
              label="Grace Period"
              value={
                <Typography variant="caption" fontWeight={600} fontSize="0.72rem">
                  {formik.values.gracePeriodDays ?? 0} days ({formik.values.gracePeriodType})
                </Typography>
              }
            />
            <SummaryRow
              label="Late Fee Formula"
              value={
                <Label
                  color={formik.values.enableLateFee ? 'warning' : 'default'}
                  sx={{ height: 18, fontSize: '0.65rem' }}
                >
                  {formik.values.enableLateFee ? formik.values.lateFeeType : 'Disabled'}
                </Label>
              }
            />
            <SummaryRow
              label="Waivers"
              value={
                <Label
                  color={formik.values.enableWaiver ? 'info' : 'default'}
                  sx={{ height: 18, fontSize: '0.65rem' }}
                >
                  {formik.values.enableWaiver ? 'Enabled' : 'Disabled'}
                </Label>
              }
            />
            <SummaryRow
              label="Consider As Income"
              value={
                <Label
                  color={formik.values.considerAsIncome ? 'success' : 'default'}
                  sx={{ height: 18, fontSize: '0.65rem' }}
                >
                  {formik.values.considerAsIncome ? 'Yes' : 'No'}
                </Label>
              }
            />
            <SummaryRow
              label="Online Gateway"
              value={
                <Label
                  color={formik.values.allowOnlineCollection ? 'success' : 'default'}
                  sx={{ height: 18, fontSize: '0.65rem' }}
                >
                  {formik.values.allowOnlineCollection ? 'Allowed' : 'Disabled'}
                </Label>
              }
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Section 2: Rule Simulation / Calculator */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 0.75,
                bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                color: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:calculator-bold" width={14} height={14} />
            </Box>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'text.primary',
              }}
            >
              Impact Simulation
            </Typography>
          </Stack>

          <Stack spacing={1.25} mb={2.5}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Outstanding Overdue Fee"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Math.max(0, +e.target.value))}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                },
                htmlInput: { min: 0, style: { fontSize: '12px', padding: '6px 8px' } },
              }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Days Overdue Past Due Date"
              value={calcDaysLate}
              onChange={(e) => setCalcDaysLate(Math.max(0, +e.target.value))}
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">days</InputAdornment>,
                },
                htmlInput: { min: 0, style: { fontSize: '12px', padding: '6px 8px' } },
              }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Payment Amount Made"
              value={calcPayment}
              onChange={(e) => setCalcPayment(Math.max(0, +e.target.value))}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                },
                htmlInput: { min: 0, style: { fontSize: '12px', padding: '6px 8px' } },
              }}
            />

            <Paper
              variant="outlined"
              sx={{
                p: 1.75,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                boxShadow: '0 2px 8px -4px rgba(0,0,0,0.08)',
              }}
            >
              <Stack spacing={0.75}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Late Fee Accrued:
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="error.main">
                    ₹{calculatedLateFee.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Payment Allocated:
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="success.main">
                    ₹{allocatedPayment.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.25 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" fontWeight={600} color="text.primary">
                    Remaining Total Balance:
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                    ₹{remainingBalance.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Section 3: Policy Validation Checks */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 0.75,
                bgcolor: (theme) =>
                  checks.isReadyToPublish
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha(theme.palette.warning.main, 0.1),
                color: checks.isReadyToPublish ? 'success.main' : 'warning.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify
                icon={checks.isReadyToPublish ? 'solar:check-circle-bold' : 'solar:danger-triangle-bold'}
                width={14}
                height={14}
              />
            </Box>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'text.primary',
              }}
            >
              Validation Checklist
            </Typography>
          </Stack>

          <Stack spacing={0.5} mb={2}>
            <ValidationCheck label="General Information complete" valid={checks.nameValid} />
            <ValidationCheck label="Grace period configured" valid={checks.graceValid} />
            <ValidationCheck label="Grace day type supported" valid={checks.graceTypeValid} />
            <ValidationCheck label="Late fee heads selected" valid={checks.headsValid} />
            <ValidationCheck label="Late fee formula configured" valid={checks.lateFeeValid} />
            <ValidationCheck label="Escalation slabs valid (no gaps/overlaps)" valid={checks.slabValid} />
            <ValidationCheck label="Waiver fee heads selected" valid={checks.waiverHeadsValid} />
            <ValidationCheck label="Waiver approvers configured" valid={checks.waiverApprovalValid} />
            <ValidationCheck label="Income ledger head selected" valid={checks.incomeHeadValid} />
            <ValidationCheck
              label="Default policy conflict check"
              valid={!checks.isDefaultConflict}
            />
            {checks.uncappedRunawayRisk && (
              <ValidationWarning label="Uncapped formula: compound/percent fees have no ceiling amount" />
            )}
          </Stack>

          <Box sx={{ mt: 1.5 }}>
            {checks.isReadyToPublish ? (
              <Label color="success" variant="filled" sx={{ width: '100%', height: 26, fontSize: '0.72rem', fontWeight: 700 }}>
                Ready to Save / Activate
              </Label>
            ) : (
              <Label color="warning" variant="filled" sx={{ width: '100%', height: 26, fontSize: '0.72rem', fontWeight: 700 }}>
                Required Fields Incomplete
              </Label>
            )}
          </Box>
        </Box>
      </Scrollbar>
    </Box>
  );
}
