'use client';

import type { FormikProps } from 'formik';

import { Box } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { getInvoiceOffsetLimit } from '../../invoiceScheduleValidation';

import type { IPaymentTerm } from '../../type';
import type { IBoard } from '../../hooks/usePaymentTermForm';

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
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, maxWidth: '100%' }}>
      <Box sx={{ width: 300, maxWidth: '100%' }}>
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
      </Box>

      {/* Offset Days — conditional */}
      {isXDays && (
        <Box sx={{ width: 200, maxWidth: '100%' }}>
          <ShakingTextField
            error={Boolean(formik.touched.demandOffsetDays && formik.errors.demandOffsetDays)}
          >
            <NumericFormatCustom
              fullWidth
              size="small"
              prefix=""
              decimalScale={0}
              roundToWholeRupees={false}
              label="Days Before Due *"
              name="demandOffsetDays"
              value={formik.values.demandOffsetDays ?? ''}
              onValueChange={(value, source) => {
                if (source.source === 'event')
                  formik.setFieldValue('demandOffsetDays', value.value);
              }}
              onBlur={formik.handleBlur}
              inputProps={{ min: 1, max: limit?.days, step: 1 }}
              error={Boolean(formik.touched.demandOffsetDays && formik.errors.demandOffsetDays)}
              helperText={
                (formik.touched.demandOffsetDays && formik.errors.demandOffsetDays) ||
                (limit
                  ? `Min 1 day; Max ${Math.max(0, limit.days)} days (${limit.name || 'installment'})`
                  : 'Min 1 day')
              }
            />
          </ShakingTextField>
        </Box>
      )}
    </Box>
  );
}
