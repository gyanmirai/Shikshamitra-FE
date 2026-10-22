import type { FormikProps } from 'formik';

import { Grid, Alert } from '@mui/material';
import { LanguageInputField } from 'src/screens/academic/components/language-typing';

import { SubjectColorField } from './SubjectColorField';

import type { SubjectFormValues } from '../initialValues';

interface SubjectConfigurationFieldsProps {
  formik: FormikProps<SubjectFormValues>;
  isUsed: boolean;
}

export function SubjectConfigurationFields({ formik, isUsed }: SubjectConfigurationFieldsProps) {
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <SubjectColorField formik={formik} />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <LanguageInputField
          fullWidth
          multiline
          minRows={2}
          label="Description"
          name="description"
          size="small"
          value={formik.values.description}
          onChange={formik.handleChange}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
          inputProps={{ maxLength: 500 }}
        />
      </Grid>

      {isUsed && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="warning">
            This subject is already used in academic modules. Major changes may affect existing
            records.
          </Alert>
        </Grid>
      )}
    </>
  );
}
