'use client';

import type { FormikProps } from 'formik';

import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { IPaymentTerm } from '../../type';
import type { IBoard } from '../../hooks/usePaymentTermForm';
import { getInvoiceOffsetLimit } from '../../invoiceScheduleValidation';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface BillingScheduleSectionProps {
  formik: FormikProps<IPaymentTerm>;
  board?: IBoard;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function BillingScheduleSection({ formik, board }: BillingScheduleSectionProps) {
  const isXDays = formik.values.demandGenerationRule === 'XDaysBeforeDue';
  const limit = getInvoiceOffsetLimit(formik.values, board?.startDate);

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, sm: isXDays ? 7 : 12 }}>
        <ShakingTextField
          error={formik.touched.demandGenerationRule && Boolean(formik.errors.demandGenerationRule)}
        >
          <CustomSelect
            label="Invoice Date Rule *"
            options={[
              { value: 'OnInstallmentStartDate', label: 'On installment start date' },
              { value: 'XDaysBeforeDue', label: 'X days before due date' },
              { value: 'OnDueDate', label: 'On due date' },
              { value: 'SpecificDate', label: 'On a specific date' },
            ]}
            value={formik.values.demandGenerationRule}
            onChange={(value) => {
              formik.setValues({
                ...formik.values,
                demandGenerationRule: value as IPaymentTerm['demandGenerationRule'],
                demandOffsetDays:
                  value === 'XDaysBeforeDue' ? formik.values.demandOffsetDays : null,
              });
            }}
            error={
              formik.touched.demandGenerationRule && Boolean(formik.errors.demandGenerationRule)
            }
            helperText={
              formik.touched.demandGenerationRule
                ? String(formik.errors.demandGenerationRule ?? '')
                : undefined
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
            inputProps={{ min: 1, max: limit?.days, step: 1 }}
            error={Boolean(formik.errors.demandOffsetDays)}
            helperText={
              formik.errors.demandOffsetDays ||
              (limit
                ? `Min 1 day; Max ${Math.max(0, limit.days)} days (${limit.name || 'installment'})`
                : 'Min 1 day')
            }
          />
        </Grid>
      )}
    </Grid>
  );
}
