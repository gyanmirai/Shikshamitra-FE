import type { FormikProps } from 'formik';
import type { ReviewDraft } from 'src/redux/student/admissions/admission-review-types';

import { Stack, MenuItem, TextField } from '@mui/material';

import { recommendationLabels } from './review-model';

export function ReviewRecommendationFields({ formik }: { formik: FormikProps<ReviewDraft> }) {
  return (
    <Stack spacing={2}>
      <TextField
        select
        fullWidth
        size="small"
        label="Recommendation"
        value={formik.values.recommendation ?? ''}
        onChange={(event) => formik.setFieldValue('recommendation', event.target.value || null)}
        disabled={formik.isSubmitting}
      >
        <MenuItem value="">Choose a recommendation</MenuItem>
        {Object.entries(recommendationLabels).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        multiline
        minRows={3}
        size="small"
        label="Recommendation reason"
        {...formik.getFieldProps('reason')}
        disabled={formik.isSubmitting}
        error={Boolean(formik.touched.reason && formik.errors.reason)}
        helperText={
          (formik.touched.reason && formik.errors.reason) ||
          'Required when submitting. Explain the evidence behind your recommendation.'
        }
      />
      <TextField
        fullWidth
        multiline
        minRows={2}
        size="small"
        label="Review notes"
        {...formik.getFieldProps('notes')}
        disabled={formik.isSubmitting}
        error={Boolean(formik.touched.notes && formik.errors.notes)}
        helperText={formik.touched.notes && formik.errors.notes}
      />
    </Stack>
  );
}
