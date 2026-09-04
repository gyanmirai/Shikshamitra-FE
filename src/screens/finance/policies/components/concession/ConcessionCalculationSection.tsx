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
  const isRequestEntered = formik.values.valueSource === 'RequestEnteredWithinLimits';
  const isPercentage = method === 'Percentage';
  const isFixed = method === 'FixedAmount';
  const isFullWaiver = method === 'FullWaiver';

  return (
    <ConcessionSectionCard
      title="Calculation Rules"
      subtitle="Define how the concession amount is computed by the finance engine."
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Value Source *</InputLabel>
            <Select
              label="Value Source *"
              name="valueSource"
              value={formik.values.valueSource}
              onChange={(event) => {
                formik.handleChange(event);
                if (event.target.value === 'RequestEnteredWithinLimits' && method === 'FullWaiver') {
                  formik.setFieldValue('calculationMethod', 'Percentage');
                }
              }}
            >
              <MenuItem value="PolicyFixed">Fixed by policy</MenuItem>
              <MenuItem value="RequestEnteredWithinLimits">Entered in request (within limits)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
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
                <MenuItem key={o.value} value={o.value} disabled={isRequestEntered && o.value === 'FullWaiver'}>
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
        {!isRequestEntered && isPercentage && (
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
        {!isRequestEntered && isFixed && (
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
        {!isRequestEntered && isFullWaiver && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Alert severity="info" variant="outlined" sx={{ fontSize: '0.8rem' }}>
              Full Waiver applies 100% concession on the selected fee heads. No additional value is
              needed.
            </Alert>
          </Grid>
        )}

        {isRequestEntered && isPercentage && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="warning" variant="outlined" sx={{ fontSize: '0.8rem' }}>
              Staff will enter the concession value in the request. The server will never allow a
              concession above the eligible unpaid amount.
            </Alert>
          </Grid>
        )}

        {isRequestEntered && isFixed && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth size="small" type="number" label="Maximum Fixed Amount *"
              name="maximumFixedAmount" value={formik.values.maximumFixedAmount ?? ''}
              onChange={formik.handleChange}
              error={formik.touched.maximumFixedAmount && Boolean(formik.errors.maximumFixedAmount)}
              helperText={formik.touched.maximumFixedAmount && formik.errors.maximumFixedAmount as string}
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
          </Grid>
        )}

        {isRequestEntered && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth size="small" type="number" label="Maximum Percentage *"
              name="maximumPercentage" value={formik.values.maximumPercentage ?? ''}
              onChange={formik.handleChange} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          </Grid>
        )}

        {!isFullWaiver && (
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
      </Grid>
    </ConcessionSectionCard>
  );
}
