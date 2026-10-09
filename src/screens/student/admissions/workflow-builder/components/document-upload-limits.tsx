import type { FormikProps } from 'formik';
import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { Grid } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { DOCUMENT_FORMATS } from 'src/redux/student/admissions/admission-document-policy';

export function DocumentUploadLimits({
  formik,
}: {
  formik: FormikProps<AdmissionDocumentRequirementPolicy>;
}) {
  const { values, touched, errors } = formik;
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={Boolean(touched.allowedExtensions && errors.allowedExtensions)}>
          <CustomSelect
            multiple
            size="small"
            fullWidth
            label="Allowed file formats"
            value={values.allowedExtensions}
            options={DOCUMENT_FORMATS.map((value) => ({ value, label: value.toUpperCase() }))}
            onBlur={() => formik.setFieldTouched('allowedExtensions')}
            onChange={(value) => formik.setFieldValue('allowedExtensions', value)}
            error={Boolean(touched.allowedExtensions && errors.allowedExtensions)}
            helperText={
              touched.allowedExtensions ? String(errors.allowedExtensions ?? '') : undefined
            }
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={Boolean(touched.maxFileSizeMb && errors.maxFileSizeMb)}>
          <NumericFormatCustom
            size="small"
            fullWidth
            prefix=""
            suffix=" MB"
            decimalScale={0}
            label="Maximum file size"
            name="maxFileSizeMb"
            value={values.maxFileSizeMb}
            onBlur={formik.handleBlur}
            onValueChange={({ floatValue }) =>
              formik.setFieldValue('maxFileSizeMb', floatValue ?? 0)
            }
            error={Boolean(touched.maxFileSizeMb && errors.maxFileSizeMb)}
            helperText={
              touched.maxFileSizeMb && errors.maxFileSizeMb
                ? errors.maxFileSizeMb
                : 'Choose 1–20 MB per uploaded file.'
            }
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
}
