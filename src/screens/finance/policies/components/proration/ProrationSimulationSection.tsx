'use client';

/**
 * ProrationSimulationSection — Calculation simulator
 *
 * Runs the server calculation algorithm against the last saved policy version.
 * Displays side-by-side scheduled amount vs computed prorated demand, reduction
 * metrics, proration factor, and formula explanation.
 */

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useSimulateProrationPolicyMutation } from 'src/redux/finance/prorationPolicy';
import {
  Box,
  Grid,
  Chip,
  Paper,
  Stack,
  Alert,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';

import { ConcessionSectionCard as SectionCard } from '../concession/ConcessionCommon';

import type { IProrationFeeHeadRule } from '../../types/finance-policy.types';

interface Props {
  policyId: string;
  rules: IProrationFeeHeadRule[];
}

export default function ProrationSimulationSection({ policyId, rules }: Props) {
  const enabledRules = useMemo(
    () => rules.filter((rule) => rule.ruleType !== 'NoProration'),
    [rules]
  );

  const [input, setInput] = useState({
    feeHeadId: '',
    scheduledAmount: 10000,
    coverageStartDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    coverageEndDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    chargeStartDate: dayjs().startOf('month').add(14, 'day').format('YYYY-MM-DD'),
    chargeEndDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  });

  const [simulate, { data: result, isLoading, error }] = useSimulateProrationPolicyMutation();

  useEffect(() => {
    if (!enabledRules.some((rule) => rule.feeHeadId === input.feeHeadId)) {
      setInput((previous) => ({
        ...previous,
        feeHeadId: enabledRules[0]?.feeHeadId ?? '',
      }));
    }
  }, [enabledRules, input.feeHeadId]);

  const canSimulate =
    Boolean(input.feeHeadId) &&
    input.scheduledAmount >= 0 &&
    Boolean(input.coverageStartDate) &&
    Boolean(input.coverageEndDate) &&
    Boolean(input.chargeStartDate) &&
    Boolean(input.chargeEndDate) &&
    input.coverageStartDate <= input.coverageEndDate &&
    input.chargeStartDate <= input.chargeEndDate;

  // Preset Date Range Helper
  const applyPreset = (type: 'midMonth' | 'fullMonth') => {
    const startOfCurrentMonth = dayjs().startOf('month');
    const endOfCurrentMonth = dayjs().endOf('month');

    if (type === 'midMonth') {
      setInput((prev) => ({
        ...prev,
        coverageStartDate: startOfCurrentMonth.format('YYYY-MM-DD'),
        coverageEndDate: endOfCurrentMonth.format('YYYY-MM-DD'),
        chargeStartDate: startOfCurrentMonth.date(16).format('YYYY-MM-DD'),
        chargeEndDate: endOfCurrentMonth.format('YYYY-MM-DD'),
      }));
    } else if (type === 'fullMonth') {
      setInput((prev) => ({
        ...prev,
        coverageStartDate: startOfCurrentMonth.format('YYYY-MM-DD'),
        coverageEndDate: endOfCurrentMonth.format('YYYY-MM-DD'),
        chargeStartDate: startOfCurrentMonth.format('YYYY-MM-DD'),
        chargeEndDate: endOfCurrentMonth.format('YYYY-MM-DD'),
      }));
    }
  };

  return (
    <SectionCard
      subtitle="Preview the calculation using the last saved policy version. Unsaved changes are not included."
      title="Calculation Simulator"

      icon="solar:calculator-bold-duotone"
      action={
        <Label color="info" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}>
          Interactive Preview
        </Label>
      }
    >
      <Grid container spacing={2}>
        {/* Quick Date Presets */}
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ fontSize: '0.72rem' }}
            >
              Quick Presets:
            </Typography>
            <Chip
              size="small"
              label="Mid-Month Joiner (16th to EOM)"
              onClick={() => applyPreset('midMonth')}
              variant="outlined"
              sx={{ height: 24, fontSize: '0.7rem' }}
            />
            <Chip
              size="small"
              label="Full Month (1st to EOM)"
              onClick={() => applyPreset('fullMonth')}
              variant="outlined"
              sx={{ height: 24, fontSize: '0.7rem' }}
            />
          </Stack>
        </Grid>

        {/* Fee Head Selector */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Target Fee Head"
            value={input.feeHeadId}
            onChange={(event) => setInput((value) => ({ ...value, feeHeadId: event.target.value }))}
          >
            {enabledRules.map((rule) => (
              <MenuItem key={rule.feeHeadId} value={rule.feeHeadId} sx={{ fontSize: '0.8rem' }}>
                {rule.feeHeadName || rule.feeHeadId} ({rule.ruleType.replace('Proration', '')})
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Scheduled Amount */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Scheduled Base Amount"
            value={input.scheduledAmount}
            onChange={(event) =>
              setInput((value) => ({ ...value, scheduledAmount: Number(event.target.value) }))
            }
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            inputProps={{ min: 0, step: 100 }}
          />
        </Grid>

        {/* Installment Coverage Start & End Dates */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Billing Period Start"
            value={input.coverageStartDate}
            onChange={(event) =>
              setInput((value) => ({ ...value, coverageStartDate: event.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Billing Period End"
            value={input.coverageEndDate}
            onChange={(event) =>
              setInput((value) => ({ ...value, coverageEndDate: event.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Student Charge Start & End Dates */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Student Active From"
            value={input.chargeStartDate}
            onChange={(event) =>
              setInput((value) => ({ ...value, chargeStartDate: event.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Student Active Until"
            value={input.chargeEndDate}
            onChange={(event) =>
              setInput((value) => ({ ...value, chargeEndDate: event.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Action Button */}
        <Grid size={{ xs: 12 }}>
          <LoadingButton
            variant="contained"
            color="primary"
            size="small"
            loading={isLoading}
            disabled={!canSimulate}
            onClick={() => simulate({ id: policyId, body: input })}
            startIcon={<Iconify icon="solar:play-circle-bold" width={18} />}
            sx={{ px: 2.5 }}
          >
            Calculate Proration Preview
          </LoadingButton>
        </Grid>

        {/* Error Callout */}
        {error && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error" sx={{ borderRadius: 1.25 }}>
              {parseApiProblemDetail(error).detail}
            </Alert>
          </Grid>
        )}

        {/* Calculation Result Display */}
        {result && (
          <Grid size={{ xs: 12 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.25,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Iconify
                  icon="solar:check-circle-bold"
                  width={20}
                  height={20}
                  sx={{ color: 'success.main' }}
                />
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                  Calculation Result
                </Typography>
                <Label color="primary" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}>
                  Factor: {result.factor.toFixed(4)}
                </Label>
                <Label color="info" sx={{ height: 20, fontSize: '0.68rem' }}>
                  {result.ruleType}
                </Label>
              </Stack>

              {/* Metric Breakdown Cards */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 1.25,
                      bgcolor: 'background.paper',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block">
                      Original Scheduled Amount
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      {formatNumber(result.scheduledAmount, 'INR')}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 1.25,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="primary.main"
                      fontWeight={600}
                      display="block"
                    >
                      Calculated Prorated Demand
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                      {formatNumber(result.proratedAmount, 'INR')}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 1.25,
                      bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                      borderColor: (theme) => alpha(theme.palette.success.main, 0.3),
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="success.dark"
                      fontWeight={600}
                      display="block"
                    >
                      Student Reduction / Savings
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      - {formatNumber(result.reductionAmount, 'INR')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Step-by-Step Explanation */}
              {result.explanation && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.8),
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Iconify
                      icon="solar:info-circle-bold"
                      width={16}
                      height={16}
                      sx={{ color: 'text.secondary', mt: 0.2, flexShrink: 0 }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.74rem', lineHeight: 1.5 }}
                    >
                      <strong>Formula Breakdown:</strong> {result.explanation}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </SectionCard>
  );
}
