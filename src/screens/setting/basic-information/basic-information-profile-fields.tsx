import type { FormikProps } from 'formik';

import { Grid, TextField } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { capitalizeFirstLetter } from 'src/utils/input-format';
import ShakingTextField from 'src/components/shaking-text-field';

import type { IFormValues } from '../type';

export function BasicInformationProfileFields({
  formik,
  editing,
}: {
  formik: FormikProps<IFormValues>;
  editing: boolean;
}) {
  const { values, errors, touched, handleChange, setFieldValue } = formik;
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={touched.instituteName && Boolean(errors.instituteName)}>
          <TextField
            fullWidth
            label="Institute Name *"
            name="instituteName"
            value={values.instituteName}
            onChange={(e) => setFieldValue('instituteName', capitalizeFirstLetter(e.target.value))}
            error={touched.instituteName && Boolean(errors.instituteName)}
            helperText={touched.instituteName && errors.instituteName}
            InputProps={{
              startAdornment: (
                <Iconify icon="solar:city-bold" width={20} color="text.disabled" sx={{ mr: 1 }} />
              ),
            }}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={touched.emailAddress && Boolean(errors.emailAddress)}>
          <TextField
            fullWidth
            label="Email Address *"
            name="emailAddress"
            value={values.emailAddress}
            onChange={handleChange}
            error={touched.emailAddress && Boolean(errors.emailAddress)}
            helperText={touched.emailAddress && errors.emailAddress}
            InputProps={{
              startAdornment: (
                <Iconify icon="solar:letter-bold" width={20} color="text.disabled" sx={{ mr: 1 }} />
              ),
            }}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={touched.contactNumber && Boolean(errors.contactNumber)}>
          <PhoneInput
            name="contactNumber"
            value={values.contactNumber}
            onChange={(value) => setFieldValue('contactNumber', value)}
            error={touched.contactNumber && Boolean(errors.contactNumber)}
            helperText={touched.contactNumber && errors.contactNumber}
            variant="outlined"
            label="Contact No. *"
            size="medium"
          />
        </ShakingTextField>
      </Grid>

      {!editing && (
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={touched.password && Boolean(errors.password)}>
            <TextField
              fullWidth
              name="password"
              label="Admin Password"
              type="password"
              value={values.password}
              onChange={handleChange}
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
            />
          </ShakingTextField>
        </Grid>
      )}
    </>
  );
}
