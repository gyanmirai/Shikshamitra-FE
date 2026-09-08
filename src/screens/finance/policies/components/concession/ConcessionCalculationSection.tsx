'use client';

/**
 * ConcessionCalculationSection — Card 2
 * Value Source, Calculation Method, Percentage/Amount inputs, Base, Round Off, Min/Max Limits
 */

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Grid,
  Alert,
  Paper,
  Stack,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  FormHelperText,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { ConcessionSectionCard } from './ConcessionCommon';

const CALCULATION_METHOD_OPTIONS = [
  {
    value: 'Percentage',
    label: 'Percentage (%)',
    caption: 'Calculate concession as a percentage of unpaid fee heads',
    icon: 'solar:percent-bold',
  },
  {
    value: 'FixedAmount',
    label: 'Fixed Amount (₹)',
    caption: 'Deduct a fixed rupee concession from eligible installment demands',
    icon: 'solar:dollar-minimalistic-bold',
  },
  {
    value: 'FullWaiver',
    label: 'Full Waiver (100%)',
    caption: 'Completely waive 100% of the assigned fee head balance',
    icon: 'solar:shield-check-bold',
  },
];

const ROUND_OFF_OPTIONS = [
  { value: 'None', label: 'None (Exact Decimal)' },
  { value: 'RoundUp', label: 'Round Up (Ceil to next rupee)' },
  { value: 'RoundDown', label: 'Round Down (Floor to previous rupee)' },
  { value: 'NearestRupee', label: 'Nearest Rupee (Standard mathematical round)' },
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
      subtitle="Define how concession amounts and ceilings are computed by the fee engine."
      icon={GlobalIcons.receiptIcon}
    >
      <Grid container spacing={2.5}>
        {/* Value Source */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={!!(formik.touched.valueSource && formik.errors.valueSource)}>
            <FormControl
              fullWidth
              size="small"
              error={formik.touched.valueSource && Boolean(formik.errors.valueSource)}
            >
              <InputLabel>Value Source *</InputLabel>
              <Select
                label="Value Source *"
                name="valueSource"
                value={formik.values.valueSource}
                onChange={(event) => {
                  formik.handleChange(event);
                  if (
                    event.target.value === 'RequestEnteredWithinLimits' &&
                    method === 'FullWaiver'
                  ) {
                    formik.setFieldValue('calculationMethod', 'Percentage');
                  }
                }}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="PolicyFixed">
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Fixed by Policy
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Pre-set exact discount value applied uniformly to all eligible students
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="RequestEnteredWithinLimits">
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Entered in Request (Within Limits)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Approver enters concession amount per student up to configured maximum ceiling
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
              {formik.touched.valueSource && formik.errors.valueSource && (
                <FormHelperText>{formik.errors.valueSource as string}</FormHelperText>
              )}
            </FormControl>
          </ShakingTextField>
        </Grid>

        {/* Calculation Method */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField
            error={!!(formik.touched.calculationMethod && formik.errors.calculationMethod)}
          >
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
                onBlur={formik.handleBlur}
              >
                {CALCULATION_METHOD_OPTIONS.map((o) => (
                  <MenuItem
                    key={o.value}
                    value={o.value}
                    disabled={isRequestEntered && o.value === 'FullWaiver'}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon={o.icon} width={16} height={16} sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" fontWeight={600}>
                          {o.label}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {o.caption}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.calculationMethod && formik.errors.calculationMethod && (
                <FormHelperText>{formik.errors.calculationMethod as string}</FormHelperText>
              )}
            </FormControl>
          </ShakingTextField>
        </Grid>

        {/* Fixed by Policy — Percentage Input */}
        {!isRequestEntered && isPercentage && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.percentageValue && formik.errors.percentageValue)}
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Percentage Value *"
                name="percentageValue"
                placeholder="e.g. 25"
                value={formik.values.percentageValue ?? ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.percentageValue && Boolean(formik.errors.percentageValue)}
                helperText={
                  (formik.touched.percentageValue && (formik.errors.percentageValue as string)) ||
                  'Enter concession rate between 0.01% – 100%'
                }
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  },
                  htmlInput: { min: 0.01, max: 100, step: 0.5 },
                }}
              />
            </ShakingTextField>
          </Grid>
        )}

        {/* Fixed by Policy — Fixed Amount Input */}
        {!isRequestEntered && isFixed && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={!!(formik.touched.fixedAmount && formik.errors.fixedAmount)}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Fixed Concession Amount *"
                name="fixedAmount"
                placeholder="e.g. 5000"
                value={formik.values.fixedAmount ?? ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fixedAmount && Boolean(formik.errors.fixedAmount)}
                helperText={
                  (formik.touched.fixedAmount && (formik.errors.fixedAmount as string)) ||
                  'Fixed discount amount in Indian Rupees (₹)'
                }
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  },
                  htmlInput: { min: 0.01, step: 1 },
                }}
              />
            </ShakingTextField>
          </Grid>
        )}

        {/* Fixed by Policy — Full Waiver Info Card */}
        {!isRequestEntered && isFullWaiver && (
          <Grid size={{ xs: 12 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.06),
                borderColor: (theme) => alpha(theme.palette.success.main, 0.25),
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Iconify
                icon="solar:shield-check-bold"
                width={24}
                height={24}
                sx={{ color: 'success.main', flexShrink: 0 }}
              />
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                  100% Full Waiver Concession
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Full Waiver automatically waives 100% of the assigned fee head balance. No
                  numeric input required.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Request Entered within Limits — Maximum Percentage Input */}
        {isRequestEntered && isPercentage && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.maximumPercentage && formik.errors.maximumPercentage)}
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Maximum Percentage Ceiling *"
                name="maximumPercentage"
                placeholder="e.g. 50"
                value={formik.values.maximumPercentage ?? ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.maximumPercentage && Boolean(formik.errors.maximumPercentage)}
                helperText={
                  (formik.touched.maximumPercentage &&
                    (formik.errors.maximumPercentage as string)) ||
                  'Maximum allowed percentage approvers can grant (0.01% – 100%)'
                }
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  },
                  htmlInput: { min: 0.01, max: 100, step: 0.5 },
                }}
              />
            </ShakingTextField>
          </Grid>
        )}

        {/* Request Entered within Limits — Maximum Fixed Amount Input */}
        {isRequestEntered && isFixed && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.maximumFixedAmount && formik.errors.maximumFixedAmount)}
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Maximum Fixed Amount Ceiling *"
                name="maximumFixedAmount"
                placeholder="e.g. 15000"
                value={formik.values.maximumFixedAmount ?? ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.maximumFixedAmount && Boolean(formik.errors.maximumFixedAmount)
                }
                helperText={
                  (formik.touched.maximumFixedAmount &&
                    (formik.errors.maximumFixedAmount as string)) ||
                  'Maximum allowed discount in ₹ approvers can grant'
                }
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  },
                  htmlInput: { min: 0.01, step: 1 },
                }}
              />
            </ShakingTextField>
          </Grid>
        )}

        {/* Round Off Selection */}
        {!isFullWaiver && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={!!(formik.touched.roundOff && formik.errors.roundOff)}>
              <FormControl
                fullWidth
                size="small"
                error={formik.touched.roundOff && Boolean(formik.errors.roundOff)}
              >
                <InputLabel>Rounding Method</InputLabel>
                <Select
                  label="Rounding Method"
                  name="roundOff"
                  value={formik.values.roundOff || 'None'}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {ROUND_OFF_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.roundOff && formik.errors.roundOff && (
                  <FormHelperText>{formik.errors.roundOff as string}</FormHelperText>
                )}
              </FormControl>
            </ShakingTextField>
          </Grid>
        )}
      </Grid>
    </ConcessionSectionCard>
  );
}
