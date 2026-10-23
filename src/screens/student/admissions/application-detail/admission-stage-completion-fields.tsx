import type { FormikProps } from 'formik';
import type { FormEvent, RefObject } from 'react';

import { StudentFeedback } from 'src/components/student-feedback';
import { Grid, Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';

import type { StageCompletionFormValues } from './admission-stage-completion';

export function EntranceExamCompletionFields({
  formik,
  passed,
  scheduledAtInputRef,
}: {
  formik: FormikProps<StageCompletionFormValues>;
  passed: boolean;
  scheduledAtInputRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          size="small"
          type="datetime-local"
          label="Exam date and time *"
          inputRef={scheduledAtInputRef}
          slotProps={{ inputLabel: { shrink: true } }}
          {...formik.getFieldProps('scheduledAt')}
          onInput={(event: FormEvent<HTMLDivElement>) => {
            const input = event.target as HTMLInputElement;
            formik.setFieldValue('scheduledAt', input.value).catch(() => undefined);
          }}
          error={Boolean(formik.touched.scheduledAt && formik.errors.scheduledAt)}
          helperText={formik.touched.scheduledAt && formik.errors.scheduledAt}
        />
      </Grid>
      {(['totalMarks', 'passingMarks', 'obtainedMarks'] as const).map((field) => (
        <Grid key={field} size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={`${field === 'totalMarks' ? 'Total' : field === 'passingMarks' ? 'Pass' : 'Obtained'} marks *`}
            {...formik.getFieldProps(field)}
            error={Boolean(formik.touched[field] && formik.errors[field])}
            helperText={formik.touched[field] && formik.errors[field]}
          />
        </Grid>
      ))}
      <Grid size={{ xs: 12 }}>
        <StudentFeedback
          notificationKey="STU-0165"
          presentation="inline"
          severity={passed ? 'success' : 'info'}
        >
          {passed
            ? 'Passing result — the workflow can continue.'
            : 'Enter passing marks to continue.'}
        </StudentFeedback>
      </Grid>
    </Grid>
  );
}

export function PhysicalFormCompletionFields({
  formik,
}: {
  formik: FormikProps<StageCompletionFormValues>;
}) {
  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <FormControlLabel
          control={<Checkbox {...formik.getFieldProps('issued')} checked={formik.values.issued} />}
          label="Physical registration form issued/taken *"
        />
        {formik.touched.issued && formik.errors.issued && (
          <Typography variant="caption" color="error">
            {formik.errors.issued}
          </Typography>
        )}
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          size="small"
          label="Form reference"
          placeholder="For example, PHY-2026-0002"
          {...formik.getFieldProps('formReference')}
          error={Boolean(formik.touched.formReference && formik.errors.formReference)}
          helperText={formik.touched.formReference && formik.errors.formReference}
        />
      </Grid>
    </Grid>
  );
}
