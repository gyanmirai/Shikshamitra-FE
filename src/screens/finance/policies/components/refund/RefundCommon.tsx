'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Paper, Stack, Divider, Typography } from '@mui/material';

import type { IRefundPolicyFormValues } from '../../types/finance-policy.types';

// ─── SectionCard ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionCard({ title, subtitle, icon, children, action }: SectionCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 2.5,
        borderRadius: 1.75,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.95)
            : alpha(theme.palette.background.paper, 0.98),
        borderColor: 'divider',
        boxShadow: (theme) => `0 2px 12px -4px ${alpha(theme.palette.grey[500], 0.1)}`,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={18} height={18} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" display="block">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {action && <Box>{action}</Box>}
      </Stack>
      {children}
    </Paper>
  );
}

// ─── RefundSummaryPanel ──────────────────────────────────────────────────────

interface RefundSummaryPanelProps {
  formik: { values: IRefundPolicyFormValues };
  checks: {
    generalValid: boolean;
    eligibilityValid: boolean;
    amountValid: boolean;
    deductionValid: boolean;
    isReadyToPublish: boolean;
  };
  liveSimulation: {
    remainingEligible: number;
    rawRefund: number;
    deductionAmount: number;
    capAdjustment: number;
    finalRefund: number;
  };
}

export function RefundSummaryPanel({ formik, checks, liveSimulation }: RefundSummaryPanelProps) {
  const { values } = formik;

  const amountModeLabel =
    values.amountMode === 'RemainingPaidAmount'
      ? '100% Remaining Paid'
      : values.amountMode === 'ManualUpToEligible'
        ? 'Manual (Up to eligible)'
        : values.amountMode === 'FixedAmount'
          ? `Fixed ₹${values.fixedAmount ?? 0}`
          : `${values.percentageValue ?? 0}% of Eligible`;

  const deductionLabel =
    values.deductionType === 'None'
      ? 'No Deduction'
      : values.deductionType === 'FixedAmount'
        ? `Fixed ₹${values.deductionValue ?? 0}`
        : `${values.deductionValue ?? 0}% Deduction`;

  return (
    <Box
      sx={{
        width: 340,
        flexShrink: 0,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        borderLeft: '1px solid',
        borderColor: 'divider',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.default, 0.6)
            : alpha(theme.palette.grey[50], 0.7),
      }}
    >
      <Scrollbar sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Header */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Iconify icon="solar:chart-square-bold-duotone" color="primary.main" width={20} height={20} />
              <Typography variant="subtitle2" fontWeight={700}>
                Live Policy Summary
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Real-time parameter overview and calculated preview.
            </Typography>
          </Box>

          {/* Policy Identity Pill */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.75,
              borderRadius: 1.25,
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                POLICY IDENTITY
              </Typography>
              <Label color={values.status === 'Active' ? 'success' : 'warning'} sx={{ height: 20 }}>
                {values.status}
              </Label>
            </Stack>

            <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ mb: 0.25 }}>
              {values.policyName || 'Untitled Policy'}
            </Typography>
            <Divider sx={{ my: 1.25 }} />

            <Stack spacing={0.75}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Fee Scope:
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {values.feeHeadScope === 'AllFeeHeads'
                    ? 'All Fee Heads'
                    : `${values.applicableFeeHeadIds?.length ?? 0} Heads Selected`}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Calculation Mode:
                </Typography>
                <Typography variant="caption" fontWeight={600} color="primary.main">
                  {amountModeLabel}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Deductions:
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {deductionLabel}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Payout Methods:
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {values.allowedPayoutMethods?.length ?? 0} enabled
                </Typography>
              </Box>
              {values.processingTargetDays != null && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Processing Target:
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {values.processingTargetDays} days SLA
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Live Calculation Preview Card */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.75,
              borderRadius: 1.25,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
              <Iconify icon="solar:calculator-bold-duotone" color="primary.main" width={18} height={18} />
              <Typography variant="caption" fontWeight={700} color="primary.main">
                ESTIMATED WATERFALL (EXAMPLE ₹10,000)
              </Typography>
            </Stack>

            <Stack spacing={0.75}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Remaining Eligible:
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  ₹{liveSimulation.remainingEligible.toLocaleString('en-IN')}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Raw Refund Base:
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  ₹{liveSimulation.rawRefund.toLocaleString('en-IN')}
                </Typography>
              </Box>
              {liveSimulation.deductionAmount > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="error.main">
                    Deduction:
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="error.main">
                    -₹{liveSimulation.deductionAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              )}
              {liveSimulation.capAdjustment > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="warning.main">
                    Cap Ceiling Adjustment:
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="warning.main">
                    -₹{liveSimulation.capAdjustment.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 0.5 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" fontWeight={700}>
                  Net Refund:
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} color="success.main">
                  ₹{liveSimulation.finalRefund.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Validation Checklist */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.75,
              borderRadius: 1.25,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
              READINESS CHECKLIST
            </Typography>

            <Stack spacing={1}>
              <CheckItem label="General Information" valid={checks.generalValid} hint="Name (min 3 chars), Status" />
              <CheckItem
                label="Eligibility & Scope"
                valid={checks.eligibilityValid}
                hint="Fee heads scope & applicable heads"
              />
              <CheckItem
                label="Amount Rules & Caps"
                valid={checks.amountValid}
                hint="Valid mode, value, & cap bounds"
              />
              <CheckItem
                label="Deduction & Payout"
                valid={checks.deductionValid}
                hint="At least 1 payout method & valid deduction"
              />
            </Stack>
          </Paper>

          {/* Financial Guarantee & Ledger Integrity Callout */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 1.25,
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
              borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Iconify
                icon="solar:shield-check-bold"
                color="info.main"
                width={18}
                height={18}
                sx={{ flexShrink: 0, mt: 0.2 }}
              />
              <Box>
                <Typography variant="caption" fontWeight={700} color="info.main" display="block">
                  Settled Money Only Invariant
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.71rem' }}>
                  Refund payouts are strictly constrained to settled receipts. Prior refunds and active reservations
                  are always subtracted first before calculating eligibility.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Scrollbar>
    </Box>
  );
}

function CheckItem({ label, valid, hint }: { label: string; valid: boolean; hint: string }) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        <Iconify
          icon={valid ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
          color={valid ? 'success.main' : 'text.disabled'}
          width={16}
          height={16}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" fontWeight={600} color={valid ? 'text.primary' : 'text.secondary'} noWrap>
            {label}
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: '0.68rem' }}>
            {hint}
          </Typography>
        </Box>
      </Stack>
      <Label color={valid ? 'success' : 'default'} sx={{ height: 18, fontSize: '0.65rem' }}>
        {valid ? 'OK' : 'Incomplete'}
      </Label>
    </Box>
  );
}
