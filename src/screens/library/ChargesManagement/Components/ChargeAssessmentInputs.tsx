import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { assignLibraryChargeInitialValues } from './AssignChargeInitialValues';

export type ChargeEditorValues = ReturnType<typeof assignLibraryChargeInitialValues>;

export function ChargeAssessmentInputs({
  formik,
  disabled,
  fixed,
  isUpdate,
}: {
  formik: FormikProps<ChargeEditorValues>;
  disabled: boolean;
  fixed: boolean;
  isUpdate: boolean;
}) {
  const error = (field: keyof ChargeEditorValues) =>
    (formik.touched[field] || formik.submitCount > 0) && typeof formik.errors[field] === 'string'
      ? String(formik.errors[field])
      : undefined;
  return (
    <FormSectionCard
      title="Assessment"
      icon={GlobalIcons.receiptIcon}
      descriptionTooltip="Record the assessed amount and explicit school dates. Payment, waiver, reversal and receipts remain separate Finance actions."
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={Boolean(error('amount'))}>
            <NumericFormatCustom
              label="Amount"
              name="amount"
              required
              size="small"
              fullWidth
              value={formik.values.amount}
              valueIsNumericString
              roundToWholeRupees={false}
              decimalScale={2}
              disabled={disabled || fixed}
              error={Boolean(error('amount'))}
              helperText={error('amount')}
              onBlur={() => formik.setFieldTouched('amount', true)}
              onValueChange={(value, source) => {
                if (source.source === 'event') formik.setFieldValue('amount', value.value);
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={Boolean(error('chargeDate'))}>
            <DatePicker
              label="Assessment date"
              format="DD/MM/YYYY"
              value={formik.values.chargeDate}
              disabled={disabled || isUpdate}
              onChange={(value) => formik.setFieldValue('chargeDate', value)}
              slotProps={{
                textField: {
                  required: true,
                  name: 'chargeDate',
                  size: 'small',
                  fullWidth: true,
                  onBlur: () => formik.setFieldTouched('chargeDate', true),
                  error: Boolean(error('chargeDate')),
                  helperText: error('chargeDate'),
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={Boolean(error('dueDate'))}>
            <DatePicker
              label="Due date"
              format="DD/MM/YYYY"
              value={formik.values.dueDate}
              disabled={disabled}
              onChange={(value) => formik.setFieldValue('dueDate', value)}
              slotProps={{
                textField: {
                  required: true,
                  name: 'dueDate',
                  size: 'small',
                  fullWidth: true,
                  onBlur: () => formik.setFieldTouched('dueDate', true),
                  error: Boolean(error('dueDate')),
                  helperText: error('dueDate'),
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={12}>
          <ShakingTextField error={Boolean(error('reason'))}>
            <TextField
              label="Reason of charge"
              name="reason"
              required
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={formik.values.reason}
              disabled={disabled}
              onChange={(event) => formik.setFieldValue('reason', event.target.value)}
              onBlur={() => formik.setFieldTouched('reason', true)}
              error={Boolean(error('reason'))}
              helperText={error('reason')}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
