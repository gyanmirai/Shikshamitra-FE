'use client';

import type { FormikProps } from 'formik';

import {
  Grid,
  Select,
  Switch,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
} from '@mui/material';

import { SectionCard } from '../ui/SectionCard';

import type { IPaymentTerm } from '../../type';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface BillingScheduleSectionProps {
  formik: FormikProps<IPaymentTerm>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function BillingScheduleSection({ formik }: BillingScheduleSectionProps) {
  const isXDays = formik.values.demandGenerationRule === 'XDaysBeforeDue';

  return (
    <SectionCard
      title="Billing Schedule"
      subtitle="Configure when payment demands are generated and their initial status."
      action={
        <Switch
          checked={formik.values.enableBillingSchedule}
          onChange={(e) => {
            const { checked } = e.target;
            formik.setFieldValue('enableBillingSchedule', checked);
            if (!checked) {
              formik.setFieldValue('demandGenerationRule', 'Immediately');
              formik.setFieldValue('demandOffsetDays', null);
            }
          }}
        />
      }
    >
      {formik.values.enableBillingSchedule && (
        <Grid container spacing={2.5}>
          {/* Generate Bills */}
          <Grid size={{ xs: 12, sm: isXDays ? 5 : 6 }}>
            <FormControl
              fullWidth
              size="small"
              error={
                formik.touched.demandGenerationRule && Boolean(formik.errors.demandGenerationRule)
              }
            >
              <InputLabel>Generate Bills *</InputLabel>
              <Select
                label="Generate Bills *"
                name="demandGenerationRule"
                value={formik.values.demandGenerationRule}
                onChange={formik.handleChange}
              >
                <MenuItem value="Immediately">Immediately on assignment</MenuItem>
                <MenuItem value="XDaysBeforeDue">X Days before due date</MenuItem>
                <MenuItem value="OnDueDate">On due date</MenuItem>
                <MenuItem value="Manual">Manual only</MenuItem>
              </Select>
              {formik.touched.demandGenerationRule && formik.errors.demandGenerationRule && (
                <Typography variant="caption" color="error.main" mt={0.5} display="block">
                  {formik.errors.demandGenerationRule}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Offset Days — conditional */}
          {isXDays && (
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Days Before Due *"
                name="demandOffsetDays"
                value={formik.values.demandOffsetDays ?? ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{ min: 1 }}
                error={formik.touched.demandOffsetDays && Boolean(formik.errors.demandOffsetDays)}
                helperText={
                  (formik.touched.demandOffsetDays && formik.errors.demandOffsetDays) || 'Min 1 day'
                }
              />
            </Grid>
          )}

          {/* Initial Demand Status */}
          <Grid size={{ xs: 12, sm: isXDays ? 4 : 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Initial Demand Status</InputLabel>
              <Select
                label="Initial Demand Status"
                name="initialDemandStatus"
                value={formik.values.initialDemandStatus}
                onChange={formik.handleChange}
              >
                <MenuItem value="Draft">Draft — Requires approval to go live</MenuItem>
                <MenuItem value="Published">Published — Immediately visible to parents</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}
    </SectionCard>
  );
}
