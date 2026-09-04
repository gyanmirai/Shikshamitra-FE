'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Select, MenuItem, InputLabel, Typography, FormControl } from '@mui/material';

import { ConcessionSectionCard } from './ConcessionCommon';

const APPLY_ON_OPTIONS = [
  { value: 'AllOutstanding', label: 'All outstanding installments' },
  { value: 'CurrentInstallment', label: 'Current unpaid installment only' },
  { value: 'FutureInstallments', label: 'Future installments only' },
];

export default function ConcessionApplicationSection({ formik }: { formik: any }) {
  return (
    <ConcessionSectionCard
      title="Application Behaviour"
      subtitle="Choose which unpaid demands may receive the concession. Paid fees are never changed."
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Apply Concession On *</InputLabel>
            <Select label="Apply Concession On *" name="applyOn" value={formik.values.applyOn}
              onChange={formik.handleChange} onBlur={formik.handleBlur}>
              {APPLY_ON_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ p: 1.5, height: '100%', bgcolor: 'action.hover', borderRadius: 1,
            border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:shield-check-bold-duotone" width={18}
              sx={{ color: 'success.main', flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" lineHeight={1.5}>
              The fee engine calculates from live outstanding balances and never creates a refund,
              wallet credit, or negative demand.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </ConcessionSectionCard>
  );
}
