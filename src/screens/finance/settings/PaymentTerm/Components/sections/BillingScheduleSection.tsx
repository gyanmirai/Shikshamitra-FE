'use client';

import type { FormikProps } from 'formik';

import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

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
      subtitle="Choose how the bill generation date is calculated for every installment."
      info="This rule calculates when each student bill is generated. It does not change the installment due date."
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: isXDays ? 7 : 12 }}>
          <ShakingTextField
            error={
              formik.touched.demandGenerationRule && Boolean(formik.errors.demandGenerationRule)
            }
          >
            <CustomSelect
              label="Generate Bills *"
              options={[
                { value: 'OnInstallmentStartDate', label: 'On installment start date' },
                { value: 'XDaysBeforeDue', label: 'X days before due date' },
                { value: 'OnDueDate', label: 'On due date' },
                { value: 'SpecificDate', label: 'On a specific date' },
              ]}
              value={formik.values.demandGenerationRule}
              onChange={(value) => {
                formik.setFieldValue('demandGenerationRule', value);
                if (value !== 'XDaysBeforeDue') formik.setFieldValue('demandOffsetDays', null);
              }}
              error={
                formik.touched.demandGenerationRule && Boolean(formik.errors.demandGenerationRule)
              }
              helperText={
                formik.touched.demandGenerationRule
                  ? String(formik.errors.demandGenerationRule ?? '')
                  : ''
              }
            />
          </ShakingTextField>
        </Grid>

        {/* Offset Days — conditional */}
        {isXDays && (
          <Grid size={{ xs: 12, sm: 5 }}>
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
      </Grid>
    </SectionCard>
  );
}
