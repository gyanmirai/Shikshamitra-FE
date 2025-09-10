import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

interface FatherAddressComponentProps {
  formik: any;
  disabled?: boolean;
}

export const FatherAddressComponent = ({ formik, disabled }: FatherAddressComponentProps) => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      <CountryComponent
        value={formik.values.fatherCountry}
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('fatherState', null);
          formik.setFieldValue('fatherCountry', value);
        }}
        error={formik.touched.fatherCountry && Boolean(formik.errors.fatherCountry)}
        helperText={formik.touched.fatherCountry && formik.errors.fatherCountry}
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      <StateComponent
        value={formik.values.fatherState}
        countryValue={formik.values.fatherCountry}
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('fatherState', value);
          formik.setFieldValue('fatherCity', null);
        }}
        error={formik.touched.fatherState && Boolean(formik.errors.fatherState)}
        helperText={formik.touched.fatherState && formik.errors.fatherState}
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      <CityComponent
        value={formik.values.fatherCity}
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('fatherCity', value);
        }}
        stateValue={formik.values.fatherState}
        error={formik.touched.fatherCity && Boolean(formik.errors.fatherCity)}
        helperText={formik.touched.fatherCity && formik.errors.fatherCity}
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      <ShakingTextField
        error={formik.touched.fatherPinCode && Boolean(formik.errors.fatherPinCode)}
      >
        <TextField
          name="fatherPinCode"
          label="Pincode"
          value={formik.values.fatherPinCode}
          onChange={formik.handleChange}
          error={formik.touched.fatherPinCode && Boolean(formik.errors.fatherPinCode)}
          helperText={formik.touched.fatherPinCode && formik.errors.fatherPinCode}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      <ShakingTextField
        error={formik.touched.fatherAddress1 && Boolean(formik.errors.fatherAddress1)}
      >
        <TextField
          name="fatherAddress1"
          label="Father Address 1"
          value={formik.values.fatherAddress1}
          onChange={formik.handleChange}
          error={formik.touched.fatherAddress1 && Boolean(formik.errors.fatherAddress1)}
          helperText={formik.touched.fatherAddress1 && formik.errors.fatherAddress1}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
    </Grid>
  </Grid>
);
