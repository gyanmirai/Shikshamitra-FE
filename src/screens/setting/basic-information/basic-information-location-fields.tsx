import type { FormikProps } from 'formik';

import { capitalizeFirstLetter } from 'src/utils/input-format';
import ShakingTextField from 'src/components/shaking-text-field';
import { Grid, Divider, TextField, Typography } from '@mui/material';

import { BasicInformationLocationSelectors } from './basic-information-location-selectors';

import type { IFormValues } from '../type';

export function BasicInformationLocationFields({ formik }: { formik: FormikProps<IFormValues> }) {
  const { values, errors, touched, setFieldValue } = formik;
  return (
    <>
      <Grid size={12}>
        <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
      </Grid>
      <Grid size={12}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          Location Details
        </Typography>
      </Grid>
      <BasicInformationLocationSelectors formik={formik} />{' '}
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          name="zipPostalCode"
          label="ZIP/Postal Code"
          value={values.zipPostalCode}
          onChange={(e) => {
            if (e.target.value.length <= 6) setFieldValue('zipPostalCode', e.target.value);
          }}
          type="number"
          error={touched.zipPostalCode && Boolean(errors.zipPostalCode)}
          helperText={touched.zipPostalCode && errors.zipPostalCode}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={touched.addressLine1 && Boolean(errors.addressLine1)}>
          <TextField
            fullWidth
            name="addressLine1"
            label="Address Line 1 *"
            placeholder="Building No./Flat/House No."
            value={values.addressLine1}
            onChange={(event) =>
              setFieldValue('addressLine1', capitalizeFirstLetter(event.target.value))
            }
            error={touched.addressLine1 && Boolean(errors.addressLine1)}
            helperText={touched.addressLine1 && errors.addressLine1}
            multiline
            rows={2}
          />
        </ShakingTextField>
      </Grid>
    </>
  );
}
