'use client';

import React from 'react';
import CustomAccordion from 'src/components/custom-accordian';
import { Grid, Select, MenuItem, TextField, InputLabel, FormControl } from '@mui/material';

interface LateFeeLimitsSectionProps {
  formik: any;
  expanded: boolean;
  onToggle: () => void;
}

export default function LateFeeLimitsSection({
  formik,
  expanded,
  onToggle,
}: LateFeeLimitsSectionProps) {
  return (
    <CustomAccordion
      title="4. Maximum Limits"
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
              label="Minimum Late Fee Charge (₹)"
              name="minimumCharge"
              value={formik.values.minimumCharge ?? ''}
              onChange={formik.handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Maximum Late Fee Charge (₹)"
              name="maximumCharge"
              value={formik.values.maximumCharge ?? ''}
              onChange={formik.handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Round Off Method</InputLabel>
              <Select
                label="Round Off Method"
                name="roundOffMethod"
                value={formik.values.roundOffMethod}
                onChange={formik.handleChange}
              >
                <MenuItem value="None">None</MenuItem>
                <MenuItem value="Nearest">Nearest Whole Number</MenuItem>
                <MenuItem value="RoundUp">Round Up</MenuItem>
                <MenuItem value="RoundDown">Round Down</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      }
    />
  );
}
