import type { FormikProps } from 'formik';
import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { Stack, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

export function DocumentRequirementBasics({
  formik,
}: {
  formik: FormikProps<AdmissionDocumentRequirementPolicy>;
}) {
  const error = (key: keyof AdmissionDocumentRequirementPolicy) =>
    Boolean(formik.touched[key] && formik.errors[key]);
  return (
    <Stack spacing={2}>
      <ShakingTextField error={error('name')}>
        <TextField
          size="small"
          fullWidth
          label="Document name *"
          {...formik.getFieldProps('name')}
          error={error('name')}
          helperText={formik.touched.name && formik.errors.name}
        />
      </ShakingTextField>
      <ShakingTextField error={error('description')}>
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          label="Instructions (optional)"
          name="description"
          value={formik.values.description ?? ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={error('description')}
          helperText={formik.touched.description && formik.errors.description}
        />
      </ShakingTextField>
    </Stack>
  );
}
