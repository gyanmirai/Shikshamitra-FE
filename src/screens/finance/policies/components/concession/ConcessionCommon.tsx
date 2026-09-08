'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Card,
  Chip,
  Stack,
  Paper,
  Divider,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { SummaryRow, ValidationCheck } from '../collection/CollectionCommon';

// ─── Concession Section Card ──────────────────────────────────────────────────

export function ConcessionSectionCard({
  title,
  subtitle,
  icon,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2.5,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.98),
        borderColor: (theme) => alpha(theme.palette.divider, 0.9),
        boxShadow: (theme) => `0 4px 16px -8px ${alpha(theme.palette.grey[500], 0.16)}`,
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.default, 0.5)
              : alpha(theme.palette.grey[50], 0.8),
          borderRadius: '15px 15px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          {icon && (
            <Box
              sx={{
                width: 32,
                height: 32,
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
          )}
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" display="block">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
    </Card>
  );
}

// ─── Live Summary & Simulation Panel ──────────────────────────────────────────

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
  const isRequestEntered = values.valueSource === 'RequestEnteredWithinLimits';
  const calculationLabel =
    values.calculationMethod === 'FixedAmount'
      ? 'Fixed Amount'
      : values.calculationMethod === 'FullWaiver'
        ? 'Full Waiver'
        : 'Percentage';

  const configuredValue =
    values.calculationMethod === 'FullWaiver'
      ? '100% Waiver'
      : values.calculationMethod === 'Percentage'
        ? `${isRequestEntered ? (values.maximumPercentage ?? '—') : (values.percentageValue ?? '—')}%`
        : `₹${isRequestEntered ? (values.maximumFixedAmount ?? '—') : (values.fixedAmount ?? '—')}`;

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
            : alpha(theme.palette.grey[50], 0.8),
      }}
    >
      <Scrollbar sx={{ flex: 1 }}>
        <Box sx={{ p: 2 }}>
          {/* Section Header: Live Parameter Summary */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.25}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'text.secondary',
              }}
            >
              Live Policy Summary
            </Typography>
            <CustomTooltip
              title="Real-time parameters derived from current form values"
              placement="left"
              arrow
            >
              <Iconify
                icon={GlobalIcons.info}
                width={15}
                height={15}
                sx={{ color: 'info.main', cursor: 'pointer' }}
              />
            </CustomTooltip>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 1.5,
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
              borderColor: 'divider',
            }}
          >
            <Stack spacing={0.25}>
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
                      fontSize: '0.72rem',
                    }}
                  >
                    {values.policyName || '—'}
                  </Typography>
                }
              />

              <SummaryRow
                label="Status"
                value={
                  <Chip
                    label={values.status}
                    size="small"
                    color={values.status === 'Active' ? 'success' : 'warning'}
                    variant={values.status === 'Active' ? 'filled' : 'outlined'}
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                  />
                }
              />

              <SummaryRow
                label="Value Source"
                value={
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ maxWidth: 140, textAlign: 'right', fontSize: '0.7rem' }}
                  >
                    {isRequestEntered ? 'Per Request (Limit)' : 'Fixed by Policy'}
                  </Typography>
                }
              />

              <SummaryRow
                label="Calculation"
                value={
                  <Typography variant="caption" fontWeight={600} fontSize="0.72rem">
                    {calculationLabel}
                  </Typography>
                }
              />

              <SummaryRow
                label={isRequestEntered ? 'Maximum Limit' : 'Policy Value'}
                value={
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="primary.main"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {configuredValue}
                  </Typography>
                }
              />

              <SummaryRow
                label="Apply On"
                value={
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ maxWidth: 140, textAlign: 'right', fontSize: '0.7rem' }}
                  >
                    {values.applyOn ? values.applyOn.replace(/([A-Z])/g, ' $1').trim() : '—'}
                  </Typography>
                }
              />

              <SummaryRow
                label="Round Off"
                value={
                  <Typography variant="caption" fontWeight={600} fontSize="0.7rem">
                    {values.roundOff ? values.roundOff.replace(/([A-Z])/g, ' $1').trim() : 'None'}
                  </Typography>
                }
              />
            </Stack>
          </Paper>

          <Divider sx={{ my: 1.5 }} />

          {/* Section Header: Impact Simulator */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.25}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'text.secondary',
              }}
            >
              Impact Simulation
            </Typography>
            <CustomTooltip
              title="Test real-time calculation logic with hypothetical student balance numbers"
              placement="left"
              arrow
            >
              <Iconify
                icon={GlobalIcons.info}
                width={15}
                height={15}
                sx={{ color: 'info.main', cursor: 'pointer' }}
              />
            </CustomTooltip>
          </Stack>

          <Stack spacing={1.25} mb={2}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Gross Installment Amount"
              value={simFeeAmount}
              onChange={(e) => setSimFeeAmount(Math.max(0, +e.target.value))}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                },
                htmlInput: { min: 0 },
              }}
            />

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Already Paid"
              value={simAlreadyPaid}
              onChange={(e) => setSimAlreadyPaid(Math.max(0, +e.target.value))}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                },
                htmlInput: { min: 0 },
              }}
            />

            {/* Simulation Result Card */}
            <Paper
              variant="outlined"
              sx={{
                p: 1.75,
                borderRadius: 1.5,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.success.main, 0.06)
                    : alpha(theme.palette.primary.main, 0.03),
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <Stack spacing={0.85}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Concession Deduction:
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="success.main">
                    - ₹{simulation.concessionAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Refund Created:
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    ₹0 (Zero Refund Guarantee)
                  </Typography>
                </Box>

                <Divider sx={{ my: 0.25, borderStyle: 'dashed' }} />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" fontWeight={700} color="text.primary">
                    Net Student Outstanding:
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                    ₹{simulation.newOutstanding.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Section Header: Validation Checklist */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'text.secondary',
              }}
            >
              Validation Checklist
            </Typography>
            <CustomTooltip
              title="All checks must pass before this policy can be saved and activated"
              placement="left"
              arrow
            >
              <Iconify
                icon={GlobalIcons.info}
                width={15}
                height={15}
                sx={{ color: 'info.main', cursor: 'pointer' }}
              />
            </CustomTooltip>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
              borderColor: 'divider',
            }}
          >
            <Stack spacing={0.5}>
              <ValidationCheck label="General Info & Name Valid" valid={checks.generalValid} />
              <ValidationCheck label="Calculation Rule & Limits Set" valid={checks.calcValid} />
              <ValidationCheck label="Application Scope Configured" valid={checks.applicationValid} />
            </Stack>

            <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
              {checks.isReadyToPublish ? (
                <Chip
                  icon={<Iconify icon={GlobalIcons.tick} width={14} height={14} />}
                  label="Ready to Save & Apply"
                  size="small"
                  color="success"
                  sx={{ width: '100%', height: 24, fontSize: '0.72rem', fontWeight: 700 }}
                />
              ) : (
                <Chip
                  icon={<Iconify icon={GlobalIcons.alertIcon} width={14} height={14} />}
                  label="Requires Field Completion"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ width: '100%', height: 24, fontSize: '0.72rem', fontWeight: 600 }}
                />
              )}
            </Box>
          </Paper>
        </Box>
      </Scrollbar>
    </Box>
  );
}
