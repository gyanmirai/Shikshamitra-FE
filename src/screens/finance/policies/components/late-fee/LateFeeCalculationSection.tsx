'use client';

import React from 'react';
import CustomAccordion from 'src/components/custom-accordian';
import { Grid, Select, MenuItem, TextField, InputLabel, FormControl } from '@mui/material';

interface LateFeeCalculationSectionProps {
  formik: any;
  expanded: boolean;
  onToggle: () => void;
}

export default function LateFeeCalculationSection({
  formik,
  expanded,
  onToggle,
}: LateFeeCalculationSectionProps) {
  return (
    <CustomAccordion
      title="2. Calculation Configuration"
      expanded={expanded}
      onChange={onToggle}
      isActive={expanded}
      content={
        <Grid container spacing={2.5} p={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Grace Period (Days) *"
              name="gracePeriodDays"
              value={formik.values.gracePeriodDays}
              onChange={formik.handleChange}
              error={formik.touched.gracePeriodDays && Boolean(formik.errors.gracePeriodDays)}
              helperText={
                formik.touched.gracePeriodDays && (formik.errors.gracePeriodDays as string)
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Grace Period Type</InputLabel>
              <Select
                label="Grace Period Type"
                name="gracePeriodType"
                value={formik.values.gracePeriodType}
                onChange={formik.handleChange}
              >
                <MenuItem value="Calendar">Calendar Days</MenuItem>
                <MenuItem value="Working">Working Days Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Late Fee Type *</InputLabel>
              <Select
                label="Late Fee Type *"
                name="lateFeeType"
                value={formik.values.lateFeeType}
                onChange={formik.handleChange}
              >
                <MenuItem value="Flat">Flat Amount</MenuItem>
                <MenuItem value="Percentage">Percentage Base</MenuItem>
                <MenuItem value="Compound">Compound Interest</MenuItem>
                <MenuItem value="Slab">Slab / Escalation Rules</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formik.values.lateFeeType === 'Flat' && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Flat Amount (₹) *"
                name="flatAmount"
                value={formik.values.flatAmount ?? ''}
                onChange={formik.handleChange}
                error={formik.touched.flatAmount && Boolean(formik.errors.flatAmount)}
                helperText={formik.touched.flatAmount && (formik.errors.flatAmount as string)}
              />
            </Grid>
          )}

          {(formik.values.lateFeeType === 'Percentage' ||
            formik.values.lateFeeType === 'Compound') && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Percentage (%) *"
                  name="percentage"
                  value={formik.values.percentage ?? ''}
                  onChange={formik.handleChange}
                  error={formik.touched.percentage && Boolean(formik.errors.percentage)}
                  helperText={formik.touched.percentage && (formik.errors.percentage as string)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Percentage Calculated On</InputLabel>
                  <Select
                    label="Percentage Calculated On"
                    name="percentageBase"
                    value={formik.values.percentageBase}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="OutstandingAmount">Outstanding Fee Amount</MenuItem>
                    <MenuItem value="OriginalAmount">Total Original Installment Amount</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {formik.values.lateFeeType === 'Compound' && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Compound Frequency</InputLabel>
                <Select
                  label="Compound Frequency"
                  name="compoundFrequency"
                  value={formik.values.compoundFrequency}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="Daily">Daily</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      }
    />
  );
}
