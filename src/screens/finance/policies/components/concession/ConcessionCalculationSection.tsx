'use client';

/**
 * ConcessionCalculationSection — Card 2
 * Calculation Method, Percentage/Amount inputs, Base, Round Off, Min/Max
 */

import React from 'react';
import {
  Grid,
  Alert,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  FormHelperText,
  InputAdornment,
} from '@mui/material';

import { ConcessionSectionCard } from './ConcessionCommon';

const CALCULATION_METHOD_OPTIONS = [
  { value: 'Percentage', label: 'Percentage (%)' },
  { value: 'FixedAmount', label: 'Fixed Amount (₹)' },
  { value: 'FullWaiver', label: 'Full Waiver (100% concession)' },
  { value: 'Manual', label: 'Manual (set per concession request)' },
];

const CALCULATION_BASE_OPTIONS = [
  { value: 'OriginalFee', label: 'Original Fee' },
  { value: 'OutstandingAmount', label: 'Outstanding Amount' },
  { value: 'FeeHeadAmount', label: 'Fee Head Amount' },
];

const ROUND_OFF_OPTIONS = [
  { value: 'None', label: 'None' },
  { value: 'RoundUp', label: 'Round Up' },
  { value: 'RoundDown', label: 'Round Down' },
  { value: 'NearestRupee', label: 'Nearest Rupee' },
];

interface ConcessionCalculationSectionProps {
  formik: any;
}

export default function ConcessionCalculationSection({
  formik,
}: ConcessionCalculationSectionProps) {
  const method = formik.values.calculationMethod;
  const isPercentage = method === 'Percentage';
  const isFixed = method === 'FixedAmount';
  const isManual = method === 'Manual';
  const isFullWaiver = method === 'FullWaiver';
  const showAmountFields = isPercentage || isFixed;
  const showBaseAndRoundOff = !isManual && !isFullWaiver;

  return (
    <ConcessionSectionCard
      title="Calculation Rules"
      subtitle="Define how the concession amount is computed by the finance engine."
    >
      <Grid container spacing={3}>
        {/* Calculation Method */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl
            fullWidth
            size="small"
            error={formik.touched.calculationMethod && Boolean(formik.errors.calculationMethod)}
          >
            <InputLabel>Calculation Method *</InputLabel>
            <Select
              label="Calculation Method *"
              name="calculationMethod"
              value={formik.values.calculationMethod}
              onChange={formik.handleChange}
            >
              {CALCULATION_METHOD_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.calculationMethod && formik.errors.calculationMethod && (
              <FormHelperText>{formik.errors.calculationMethod as string}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Percentage Input */}
        {isPercentage && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Percentage Value *"
              name="percentageValue"
              value={formik.values.percentageValue ?? ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.percentageValue && Boolean(formik.errors.percentageValue)}
              helperText={
                (formik.touched.percentageValue && (formik.errors.percentageValue as string)) ||
                'Enter a value between 0–100'
              }
              InputProps={{
                startAdornment: <InputAdornment position="start">%</InputAdornment>,
                inputProps: { min: 0, max: 100, step: 0.5 },
              }}
            />
          </Grid>
        )}

        {/* Fixed Amount Input */}
        {isFixed && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Fixed Amount *"
              name="fixedAmount"
              value={formik.values.fixedAmount ?? ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.fixedAmount && Boolean(formik.errors.fixedAmount)}
              helperText={
                (formik.touched.fixedAmount && (formik.errors.fixedAmount as string)) ||
                'Fixed concession amount in ₹'
              }
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { min: 0 },
              }}
            />
          </Grid>
        )}

        {/* FullWaiver Info */}
        {isFullWaiver && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Alert severity="info" variant="outlined" sx={{ fontSize: '0.8rem' }}>
              Full Waiver applies 100% concession on the selected fee heads. No additional value is
              needed.
            </Alert>
          </Grid>
        )}

        {/* Manual Info */}
        {isManual && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Alert severity="warning" variant="outlined" sx={{ fontSize: '0.8rem' }}>
              Manual method requires the finance admin to enter the concession amount during the
              Concession Request. No calculation fields are configured here.
            </Alert>
          </Grid>
        )}

        {/* Calculation Base (shown for Percentage / Fixed only) */}
        {showBaseAndRoundOff && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Calculation Base</InputLabel>
              <Select
                label="Calculation Base"
                name="calculationBase"
                value={formik.values.calculationBase}
                onChange={formik.handleChange}
              >
                {CALCULATION_BASE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Round Off */}
        {showBaseAndRoundOff && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Round Off</InputLabel>
              <Select
                label="Round Off"
                name="roundOff"
                value={formik.values.roundOff}
                onChange={formik.handleChange}
              >
                {ROUND_OFF_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Minimum Concession */}
        {showAmountFields && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Minimum Concession (₹)"
              name="minimumConcession"
              value={formik.values.minimumConcession ?? ''}
              onChange={formik.handleChange}
              helperText="Leave blank for no minimum"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { min: 0 },
              }}
            />
          </Grid>
        )}
      </Grid>
    </ConcessionSectionCard>
  );
}
