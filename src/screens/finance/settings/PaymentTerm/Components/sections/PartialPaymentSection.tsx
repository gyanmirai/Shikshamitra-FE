'use client';

import type { FormikProps } from 'formik';

import {
  Box,
  Card,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { SectionCard } from '../ui/SectionCard';

import type { IPaymentTerm } from '../../type';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface PartialPaymentSectionProps {
  formik: FormikProps<IPaymentTerm>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PartialPaymentSection({ formik }: PartialPaymentSectionProps) {
  return (
    <SectionCard title="Partial Payment" subtitle="Control partial installment payment options.">
      <Stack spacing={2}>
        <Card
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: formik.values.allowPartialInstallment ? 'info.lighter' : 'transparent',
            borderColor: formik.values.allowPartialInstallment ? 'info.light' : 'divider',
            transition: 'all 0.2s ease',
          }}
        >
          <FormControlLabel
            sx={{ m: 0, width: '100%' }}
            control={
              <Switch
                checked={formik.values.allowPartialInstallment}
                onChange={(e) => formik.setFieldValue('allowPartialInstallment', e.target.checked)}
              />
            }
            label={
              <Box ml={0.5}>
                <Typography variant="body2" fontWeight={600}>
                  Allow Partial Installment Payment
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Students can pay a portion of an installment at a time
                </Typography>
              </Box>
            }
          />

          {formik.values.allowPartialInstallment && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Minimum Amount (₹)"
                  name="minPartialAmount"
                  value={formik.values.minPartialAmount ?? ''}
                  onChange={formik.handleChange}
                  inputProps={{ min: 0 }}
                  helperText="Min rupee amount per partial payment"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Minimum Percentage (%)"
                  name="minPartialPercentage"
                  value={formik.values.minPartialPercentage ?? ''}
                  onChange={formik.handleChange}
                  inputProps={{ min: 0, max: 100 }}
                  helperText="Min % of installment per payment"
                />
              </Grid>
            </Grid>
          )}
        </Card>
      </Stack>
    </SectionCard>
  );
}
