'use client';

import type { FormikProps } from 'formik';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Grid,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  FormHelperText,
  InputAdornment,
} from '@mui/material';

import { SectionCard } from './RefundCommon';

import type { IRefundPolicyFormValues } from '../../types/finance-policy.types';

interface RefundAmountSectionProps {
  formik: FormikProps<IRefundPolicyFormValues>;
}

export default function RefundAmountSection({ formik }: RefundAmountSectionProps) {
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } = formik;

  const isFieldInvalid = (name: keyof IRefundPolicyFormValues) =>
    Boolean(touched[name] && errors[name]);

  const getHelperText = (name: keyof IRefundPolicyFormValues) =>
    touched[name] ? (errors[name] as string) : undefined;

  return (
    <SectionCard
      title="Refund Calculation & Ceilings"
      subtitle="Configure refund formula mode, rate values, rounding method, and regulatory hard caps."
      icon="solar:calculator-minimalistic-bold-duotone"
    >
      <Grid container spacing={2}>
        {/* Amount Mode */}
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth size="small" error={isFieldInvalid('amountMode')}>
            <InputLabel id="amount-mode-label">Calculation Mode</InputLabel>
            <Select
              labelId="amount-mode-label"
              label="Calculation Mode"
              name="amountMode"
              value={values.amountMode}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <MenuItem value="RemainingPaidAmount">Entire Remaining Paid Amount (100%)</MenuItem>
              <MenuItem
                value="ManualUpToEligible"
                disabled={!values.allowPartialRefund}
              >
                Manual (Entered in request up to eligible)
              </MenuItem>
              <MenuItem value="Percentage">Percentage of Eligible Amount (%)</MenuItem>
              <MenuItem value="FixedAmount">Fixed Amount (₹)</MenuItem>
            </Select>
            {getHelperText('amountMode') && (
              <FormHelperText>{getHelperText('amountMode')}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Percentage Input */}
        {values.amountMode === 'Percentage' && (
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              size="small"
              type="number"
              name="percentageValue"
              label="Refund Percentage"
              placeholder="e.g. 75"
              value={values.percentageValue ?? ''}
              onChange={(e) =>
                setFieldValue(
                  'percentageValue',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              onBlur={handleBlur}
              error={isFieldInvalid('percentageValue')}
              helperText={getHelperText('percentageValue') || 'Calculated against the eligible settled balance'}
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 0.01, max: 100, step: 0.01 },
                },
              }}
            />
          </Grid>
        )}

        {/* Fixed Amount Input */}
        {values.amountMode === 'FixedAmount' && (
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              size="small"
              type="number"
              name="fixedAmount"
              label="Fixed Refund Amount"
              placeholder="e.g. 5000"
              value={values.fixedAmount ?? ''}
              onChange={(e) =>
                setFieldValue('fixedAmount', e.target.value === '' ? null : Number(e.target.value))
              }
              onBlur={handleBlur}
              error={isFieldInvalid('fixedAmount')}
              helperText={getHelperText('fixedAmount') || 'Fixed amount refunded up to available balance'}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0.01, step: 1 },
                },
              }}
            />
          </Grid>
        )}

        {/* Rounding Method */}
        <Grid size={{ xs: 12, md: values.amountMode === 'Percentage' || values.amountMode === 'FixedAmount' ? 4 : 8 }}>
          <FormControl fullWidth size="small" error={isFieldInvalid('roundingMethod')}>
            <InputLabel id="rounding-method-label">Rounding Method</InputLabel>
            <Select
              labelId="rounding-method-label"
              label="Rounding Method"
              name="roundingMethod"
              value={values.roundingMethod}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <MenuItem value="None">No Rounding (Exact decimal)</MenuItem>
              <MenuItem value="NearestRupee">Nearest Rupee (Standard Math Round)</MenuItem>
              <MenuItem value="RoundUp">Round Up (Ceiling to next Rupee)</MenuItem>
              <MenuItem value="RoundDown">Round Down (Floor to integer)</MenuItem>
            </Select>
            {getHelperText('roundingMethod') && (
              <FormHelperText>{getHelperText('roundingMethod')}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Maximum Per Request */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            name="maximumPerRequest"
            label="Maximum Cap per Request"
            placeholder="e.g. 25000"
            value={values.maximumPerRequest ?? ''}
            onChange={(e) =>
              setFieldValue(
                'maximumPerRequest',
                e.target.value === '' ? null : Number(e.target.value)
              )
            }
            onBlur={handleBlur}
            error={isFieldInvalid('maximumPerRequest')}
            helperText={
              getHelperText('maximumPerRequest') ||
              'Hard ceiling on any single refund voucher. Leave empty for no single-voucher cap.'
            }
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { min: 0.01 },
              },
            }}
          />
        </Grid>

        {/* Maximum Per Student / Academic Year */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            name="maximumPerStudentYear"
            label="Maximum Cap per Student / Year"
            placeholder="e.g. 50000"
            value={values.maximumPerStudentYear ?? ''}
            onChange={(e) =>
              setFieldValue(
                'maximumPerStudentYear',
                e.target.value === '' ? null : Number(e.target.value)
              )
            }
            onBlur={handleBlur}
            error={isFieldInvalid('maximumPerStudentYear')}
            helperText={
              getHelperText('maximumPerStudentYear') ||
              'Cumulative limit per student in this academic year (includes processed & reserved).'
            }
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { min: 0.01 },
              },
            }}
          />
        </Grid>
      </Grid>
    </SectionCard>
  );
}
