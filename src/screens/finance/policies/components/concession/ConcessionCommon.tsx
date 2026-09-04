'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Chip, Stack, Paper, Divider, TextField, Typography } from '@mui/material';

import { SummaryRow, ValidationCheck } from '../collection/CollectionCommon';

// ─── Concession-specific helpers ─────────────────────────────────────────────

export function ConcessionSectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2.5,
        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
        borderRadius: 2,
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        {icon && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={18} sx={{ color: 'primary.main' }} />
          </Box>
        )}
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.4}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" display="block">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Card>
  );
}

// ─── Summary Panel ────────────────────────────────────────────────────────────

interface ConcessionSummaryPanelProps {
  formik: any;
  checks: {
    generalValid: boolean;
    calcValid: boolean;
    applicationValid: boolean;
    isReadyToPublish: boolean;
  };
  simulation: {
    concessionAmount: number;
    refundRequired: number;
    newOutstanding: number;
    lateFeeImpact: number;
  };
  simFeeAmount: number;
  setSimFeeAmount: (v: number) => void;
  simAlreadyPaid: number;
  setSimAlreadyPaid: (v: number) => void;
  simLateFee: number;
  setSimLateFee: (v: number) => void;
}

export function ConcessionSummaryPanel({
  formik,
  checks,
  simulation,
  simFeeAmount,
  setSimFeeAmount,
  simAlreadyPaid,
  setSimAlreadyPaid,
  simLateFee,
  setSimLateFee,
}: ConcessionSummaryPanelProps) {
  const { values } = formik;

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
          {/* Live Summary */}
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
                    maxWidth: 130,
                    textAlign: 'right',
                    wordBreak: 'break-word',
                    fontSize: '0.7rem',
                  }}
                >
                  {values.policyName || '—'}
                </Typography>
              }
            />

            <SummaryRow
              label="Calculation"
              value={
                <Typography variant="caption" fontWeight={600} fontSize="0.7rem">
                  {values.calculationMethod}
                  {values.calculationMethod === 'Percentage' && values.percentageValue
                    ? ` (${values.percentageValue}%)`
                    : ''}
                  {values.calculationMethod === 'FixedAmount' && values.fixedAmount
                    ? ` (₹${values.fixedAmount})`
                    : ''}
                </Typography>
              }
            />
            <SummaryRow
              label="Apply On"
              value={
                <Typography variant="caption" fontWeight={600} fontSize="0.68rem">
                  {values.applyOn.replace(/([A-Z])/g, ' $1').trim()}
                </Typography>
              }
            />
            <SummaryRow
              label="Status"
              value={
                <Chip
                  label={values.status}
                  size="small"
                  color={values.status === 'Active' ? 'success' : 'default'}
                  sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
                />
              }
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Impact Simulation */}
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'text.secondary',
            }}
          >
            Impact Simulation
          </Typography>
          <Stack spacing={1.25} mt={1} mb={2.5}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Fee Amount (₹)"
              value={simFeeAmount}
              onChange={(e) => setSimFeeAmount(Math.max(0, +e.target.value))}
              slotProps={{ htmlInput: { style: { fontSize: '11px', padding: '6px 8px' } } }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Already Paid (₹)"
              value={simAlreadyPaid}
              onChange={(e) => setSimAlreadyPaid(Math.max(0, +e.target.value))}
              slotProps={{ htmlInput: { style: { fontSize: '11px', padding: '6px 8px' } } }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Late Fee (₹)"
              value={simLateFee}
              onChange={(e) => setSimLateFee(Math.max(0, +e.target.value))}
              slotProps={{ htmlInput: { style: { fontSize: '11px', padding: '6px 8px' } } }}
            />
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
              <Stack spacing={0.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography sx={{ fontSize: '11px' }}>Concession:</Typography>
                  <Typography sx={{ fontSize: '11px' }} fontWeight={700} color="success.main">
                    ₹{simulation.concessionAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography sx={{ fontSize: '11px' }}>Refund Required:</Typography>
                  <Typography sx={{ fontSize: '11px' }} fontWeight={700} color="warning.main">
                    ₹{simulation.refundRequired.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography sx={{ fontSize: '11px' }}>New Outstanding:</Typography>
                  <Typography sx={{ fontSize: '11px' }} fontWeight={700}>
                    ₹{simulation.newOutstanding.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Validation Panel */}
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'text.secondary',
            }}
          >
            Validation
          </Typography>
          <Stack spacing={0.5} mt={1}>
            <ValidationCheck label="General Information Complete" valid={checks.generalValid} />
            <ValidationCheck label="Calculation Valid" valid={checks.calcValid} />
            <ValidationCheck label="Application Rules Valid" valid={checks.applicationValid} />

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
