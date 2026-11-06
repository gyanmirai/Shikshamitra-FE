import type { FormikProps } from 'formik';

import { TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import type { AdmissionFormCloneValues } from '../../admission-form-clone-dialog';

export function FormCloneFields({ formik }: { formik: FormikProps<AdmissionFormCloneValues> }) {
  return (
    <>
      <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
        <TextField
          fullWidth
          autoFocus
          required
          size="small"
          label="Form name"
          {...formik.getFieldProps('name')}
          error={Boolean(formik.touched.name && formik.errors.name)}
          helperText={formik.touched.name ? formik.errors.name : 'A name your team will recognize.'}
        />
      </ShakingTextField>
      <ShakingTextField error={Boolean(formik.touched.description && formik.errors.description)}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          size="small"
          label="Description (optional)"
          {...formik.getFieldProps('description')}
          error={Boolean(formik.touched.description && formik.errors.description)}
          helperText={
            formik.touched.description && formik.errors.description
              ? formik.errors.description
              : 'Leave blank to keep the original description.'
          }
        />
      </ShakingTextField>
    </>
  );
}
