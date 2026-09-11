import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Grid, MenuItem, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

export function FormBuilderDetailFields({
  formik,
}: {
  formik: FormikProps<CreateUpdateAdmissionForm>;
}) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
          <TextField
            fullWidth
            size="small"
            label="Form name *"
            placeholder="e.g. Admission application 2026–27"
            slotProps={{ inputLabel: { shrink: true } }}
            {...formik.getFieldProps('name')}
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={
              (formik.touched.name && formik.errors.name) || 'A name your team will recognize.'
            }
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={Boolean(formik.touched.code && formik.errors.code)}>
          <TextField
            fullWidth
            size="small"
            label="Form code *"
            placeholder="e.g. ADMISSION_2026"
            slotProps={{ inputLabel: { shrink: true } }}
            {...formik.getFieldProps('code')}
            onChange={(event) => formik.setFieldValue('code', event.target.value.toUpperCase())}
            error={Boolean(formik.touched.code && formik.errors.code)}
            helperText={
              (formik.touched.code && formik.errors.code) || 'Unique code, such as ADMISSION_2026.'
            }
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Form layout *"
          value={formik.values.layoutType}
          onChange={(event) => formik.setFieldValue('layoutType', Number(event.target.value))}
          helperText="How applicants move through the form you build."
        >
          <MenuItem value={0}>Single page</MenuItem>
          <MenuItem value={1}>Step by step</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Fields per row on desktop *"
          value={formik.values.fieldsPerRow}
          onChange={(event) => formik.setFieldValue('fieldsPerRow', Number(event.target.value))}
          helperText="On phones, fields are shown in one column."
        >
          {[1, 2, 3, 4].map((columns) => (
            <MenuItem key={columns} value={columns}>
              {columns} {columns === 1 ? 'field' : 'fields'}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          size="small"
          label="Description (optional)"
          multiline
          minRows={3}
          placeholder="Help your team know when to use this form."
          slotProps={{ inputLabel: { shrink: true } }}
          {...formik.getFieldProps('description')}
        />
      </Grid>
    </Grid>
  );
}
