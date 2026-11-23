'use client';

/**
 * ProrationSimulationSection — Calculation simulator
 *
 * Runs the server calculation algorithm against the last saved policy version.
 * Displays side-by-side scheduled amount vs computed prorated demand, reduction
 * metrics, proration factor, and formula explanation.
 */

import dayjs from 'dayjs';
import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { DetailSection } from 'src/screens/finance/components/detail-view';
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
} from '@mui/material';

import type { IProrationPolicyRule } from '../../types/finance-policy.types';

interface Props {
  policyId: string;
  rules: IProrationPolicyRule[];
}

export default function ProrationSimulationSection({ policyId, rules }: Props) {
  const [input, setInput] = useState({
    feeHeadId: rules[0]?.feeHeadId ?? '',
    scheduledAmount: '10000',
    coverageStartDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    coverageEndDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    chargeStartDate: dayjs().startOf('month').add(14, 'day').format('YYYY-MM-DD'),
    chargeEndDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  });

  const [simulate, { data, isLoading, error }] = useSimulateProrationPolicyMutation();
  const [submittedInput, setSubmittedInput] = useState<typeof input | null>(null);
  const result = submittedInput === input ? data : undefined;
  const currentError = submittedInput === input ? error : undefined;

  const canSimulate =
    Boolean(input.feeHeadId) &&
    input.scheduledAmount !== '' &&
    Boolean(input.coverageStartDate) &&
    Boolean(input.coverageEndDate) &&
    Boolean(input.chargeStartDate) &&
    Boolean(input.chargeEndDate) &&
    input.coverageStartDate <= input.coverageEndDate &&
    input.chargeStartDate <= input.chargeEndDate;

  const applyPreset = (type: 'admission' | 'withdrawal' | 'fullMonth') => {
    const month = dayjs().startOf('month');
    const startDate = month.format('YYYY-MM-DD');
    const endDate = month.endOf('month').format('YYYY-MM-DD');

    setInput((previous) => ({
      ...previous,
      coverageStartDate: startDate,
      coverageEndDate: endDate,
      chargeStartDate: type === 'admission' ? month.date(16).format('YYYY-MM-DD') : startDate,
      chargeEndDate: type === 'withdrawal' ? month.date(15).format('YYYY-MM-DD') : endDate,
    }));
  };

  return (
    <DetailSection
      title="Proration Preview"
      icon="solar:calculator-bold-duotone"
      helpText="Calculate sample fees using the current saved policy. The preview does not create student charges."
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
              Date presets
            </Typography>
            <Chip
              size="small"
              label="Mid-month joining"
              onClick={() => applyPreset('admission')}
              variant="outlined"
              sx={{ height: 24, fontSize: '0.7rem' }}
            />
            <Chip
              size="small"
              label="Mid-month withdrawal"
              onClick={() => applyPreset('withdrawal')}
              variant="outlined"
              sx={{ height: 24, fontSize: '0.7rem' }}
            />
            <Chip
              size="small"
              label="Full month"
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
            {rules.map((rule) => (
              <MenuItem key={rule.feeHeadId} value={rule.feeHeadId} sx={{ fontSize: '0.8rem' }}>
                {rule.feeHeadName || rule.feeHeadId}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Scheduled Amount */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <NumericFormatCustom
            name="scheduledAmount"
            fullWidth
            size="small"
            label="Scheduled amount"
            value={input.scheduledAmount}
            valueIsNumericString
            decimalScale={2}
            roundToWholeRupees={false}
            onValueChange={({ value }, source) => {
              if (source.source === 'event') {
                setInput((previous) => ({ ...previous, scheduledAmount: value }));
              }
            }}
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
            onClick={() => {
              setSubmittedInput(input);
              return simulate({
                id: policyId,
                body: { ...input, scheduledAmount: Number(input.scheduledAmount) },
              });
            }}
            startIcon={<Iconify icon="solar:play-circle-bold" width={18} />}
            sx={{ px: 2.5 }}
          >
            Calculate proration preview
          </LoadingButton>
        </Grid>

        {/* Error Callout */}
        {currentError && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error" sx={{ borderRadius: 1.25 }}>
              {parseApiProblemDetail(currentError).detail}
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
                  Policy v{result.policyVersion}
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
                      Scheduled amount
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
                      Prorated amount
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
                      <strong>Calculation</strong> {result.explanation}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </DetailSection>
  );
}
