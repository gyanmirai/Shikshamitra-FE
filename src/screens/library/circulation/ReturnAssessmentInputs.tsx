import type { FormikProps } from 'formik';

import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { CirculationDateField } from './CirculationDateField';

import type { ReturnValues } from './return-form';

export function ReturnAssessmentInputs({
  formik,
  disabled,
  fixed,
  requiresYearReason,
}: {
  formik: FormikProps<ReturnValues>;
  disabled: boolean;
  fixed: boolean;
  requiresYearReason: boolean;
}) {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <ShakingTextField error={Boolean(formik.touched.amount && formik.errors.amount)}>
          <NumericFormatCustom
            label="Assessment amount"
            name="amount"
            required
            size="small"
            fullWidth
            prefix=""
            value={formik.values.amount}
            decimalScale={2}
            roundToWholeRupees={false}
            allowNegative={false}
            disabled={disabled || fixed}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.amount && formik.errors.amount)}
            helperText={formik.touched.amount && formik.errors.amount}
            onValueChange={(value, source) => {
              if (source.source === 'event') formik.setFieldValue('amount', value.value);
            }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CirculationDateField
          label="Assessment date"
          name="chargeDate"
          value={formik.values.chargeDate || null}
          disabled={disabled}
          error={formik.touched.chargeDate && formik.errors.chargeDate}
          onChange={(value) => formik.setFieldValue('chargeDate', value)}
          onBlur={() => formik.setFieldTouched('chargeDate', true)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CirculationDateField
          label="Assessment due date"
          name="fineDueDate"
          value={formik.values.fineDueDate}
          disabled={disabled}
          error={formik.touched.fineDueDate && formik.errors.fineDueDate}
          onChange={(value) => formik.setFieldValue('fineDueDate', value)}
          onBlur={() => formik.setFieldTouched('fineDueDate', true)}
        />
      </Grid>
      <Grid size={12}>
        <ShakingTextField
          error={Boolean(formik.touched.assessmentReason && formik.errors.assessmentReason)}
        >
          <TextField
            label="Assessment reason"
            name="assessmentReason"
            required
            fullWidth
            size="small"
            multiline
            minRows={2}
            value={formik.values.assessmentReason || ''}
            disabled={disabled}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            inputProps={{ maxLength: 500 }}
            error={Boolean(formik.touched.assessmentReason && formik.errors.assessmentReason)}
            helperText={formik.touched.assessmentReason && formik.errors.assessmentReason}
          />
        </ShakingTextField>
      </Grid>
      {requiresYearReason && (
        <Grid size={12}>
          <ShakingTextField
            error={Boolean(
              formik.touched.assessmentAcademicYearReason &&
              formik.errors.assessmentAcademicYearReason
            )}
          >
            <TextField
              label="Assessment academic context reason"
              name="assessmentAcademicYearReason"
              required
              fullWidth
              size="small"
              multiline
              minRows={2}
              value={formik.values.assessmentAcademicYearReason || ''}
              disabled={disabled}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 500 }}
              error={Boolean(
                formik.touched.assessmentAcademicYearReason &&
                formik.errors.assessmentAcademicYearReason
              )}
              helperText={
                (formik.touched.assessmentAcademicYearReason &&
                  formik.errors.assessmentAcademicYearReason) ||
                'Explain using a different or newly confirmed academic year for this assessment.'
              }
            />
          </ShakingTextField>
        </Grid>
      )}
    </Grid>
  );
}
