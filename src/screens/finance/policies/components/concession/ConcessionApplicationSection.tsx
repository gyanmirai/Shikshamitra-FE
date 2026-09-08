'use client';

/**
 * ConcessionApplicationSection — Card 3
 * Installment Application Scope & Financial Recalculation Invariant
 */

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Grid,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { ConcessionSectionCard } from './ConcessionCommon';

const APPLY_ON_OPTIONS = [
  {
    value: 'AllOutstanding',
    label: 'All Outstanding Installments',
    caption: 'Apply proportionally across all current and future unpaid installments',
  },
  {
    value: 'CurrentInstallment',
    label: 'Current Unpaid Installment Only',
    caption: 'Apply only to the earliest active unpaid installment in the schedule',
  },
  {
    value: 'FutureInstallments',
    label: 'Future Installments Only',
    caption: 'Apply discount strictly to installments whose due dates are in the future',
  },
];

export default function ConcessionApplicationSection({ formik }: { formik: any }) {
  return (
    <ConcessionSectionCard
      title="Application Behaviour"
      subtitle="Define which installments receive the discount. Existing paid collections are strictly protected."
      icon="solar:shield-check-bold"
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={!!(formik.touched.applyOn && formik.errors.applyOn)}>
            <FormControl
              fullWidth
              size="small"
              error={formik.touched.applyOn && Boolean(formik.errors.applyOn)}
            >
              <InputLabel>Apply Concession On *</InputLabel>
              <Select
                label="Apply Concession On *"
                name="applyOn"
                value={formik.values.applyOn}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                {APPLY_ON_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {option.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {option.caption}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.applyOn && formik.errors.applyOn && (
                <FormHelperText>{formik.errors.applyOn as string}</FormHelperText>
              )}
            </FormControl>
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.04),
              borderRadius: 1.5,
              borderColor: (theme) => alpha(theme.palette.success.main, 0.25),
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
            }}
          >
            <Iconify
              icon="solar:shield-check-bold"
              width={22}
              height={22}
              sx={{ color: 'success.main', flexShrink: 0, mt: 0.25 }}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                Financial Engine Guarantee
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block', lineHeight: 1.45 }}>
                Concessions only recalculate unpaid balances. The system will never generate a refund, wallet credit, or negative installment demand.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </ConcessionSectionCard>
  );
}
