import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { AdmissionCycleDialogProps } from '../admission-cycle-dialog';

export function CycleDetailsFields({
  formik,
  academicYears,
  academicYearsError,
  academicYearsLoading,
  saving,
}: Pick<
  AdmissionCycleDialogProps,
  'academicYears' | 'academicYearsError' | 'academicYearsLoading' | 'saving'
> & { formik: FormikProps<CreateUpdateAdmissionCycle> }) {
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
          <TextField
            fullWidth
            size="small"
            required
            label="Cycle name"
            {...formik.getFieldProps('name')}
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name ? formik.errors.name : undefined}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ShakingTextField
          error={
            Boolean(formik.touched.academicYearId && formik.errors.academicYearId) ||
            academicYearsError
          }
        >
          <CustomSelect
            label="Academic year"
            name="academicYearId"
            value={formik.values.academicYearId}
            options={academicYears.map((year) => ({ value: year.id, label: year.name }))}
            onChange={(value) => formik.setFieldValue('academicYearId', String(value))}
            onBlur={formik.handleBlur}
            formControlProps={{ required: true }}
            error={
              Boolean(formik.touched.academicYearId && formik.errors.academicYearId) ||
              academicYearsError
            }
            helperText={
              (formik.touched.academicYearId && formik.errors.academicYearId) ||
              (academicYearsError
                ? 'Unable to load academic years. Please close and try again.'
                : undefined)
            }
            isLoading={academicYearsLoading}
            disabled={saving}
            noOptionsMessage={
              academicYearsError
                ? 'Unable to load academic years. Please close and try again.'
                : 'No academic years available'
            }
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          size="small"
          label="Description (optional)"
          placeholder="Internal purpose or audience, e.g. Nursery to Grade 9"
          slotProps={{ inputLabel: { shrink: true } }}
          {...formik.getFieldProps('description')}
          error={Boolean(formik.touched.description && formik.errors.description)}
          helperText={formik.touched.description ? formik.errors.description : undefined}
          inputProps={{ maxLength: 1000 }}
        />
      </Grid>
    </>
  );
}
