import { Box, Grid, TextField, Typography } from '@mui/material';

import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

const RenderLocalAddressFields = (props: any) => {
  const { formik, isEdit } = props;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1">Local Address</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            name="localAddressLine1"
            label="Building / Flat / House No"
            disabled={!isEdit}
            value={formik.values.localAddressLine1}
            onChange={formik.handleChange}
            error={formik.touched.localAddressLine1 && Boolean(formik.errors.localAddressLine1)}
            helperText={formik.touched.localAddressLine1 && formik.errors.localAddressLine1}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            disabled={!isEdit}
            name="localAddressLine2"
            label="Street / Road Name"
            value={formik.values.localAddressLine2}
            onChange={formik.handleChange}
            error={formik.touched.localAddressLine2 && Boolean(formik.errors.localAddressLine2)}
            helperText={formik.touched.localAddressLine2 && formik.errors.localAddressLine2}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            disabled={!isEdit}
            name="localAddressLine3"
            label="Area / Locality / Landmark"
            value={formik.values.localAddressLine3}
            onChange={formik.handleChange}
            error={formik.touched.localAddressLine3 && Boolean(formik.errors.localAddressLine3)}
            helperText={formik.touched.localAddressLine3 && formik.errors.localAddressLine3}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <CountryComponent
            value={formik.values.localCountry}
            onChange={(_e, value) => {
              formik.setFieldValue('localState', null);
              formik.setFieldValue('localCountry', value);
            }}
            // error={formik.touched.localCountry && Boolean(formik.errors.localCountry)}
            // helperText={formik.touched.localCountry && formik.errors.localCountry}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StateComponent
            value={formik.values.localState}
            onChange={(_e, value) => {
              formik.setFieldValue('localCity', null);
              formik.setFieldValue('localState', value);
            }}
            // error={formik.touched.localState && Boolean(formik.errors.localState)}
            // helperText={formik.touched.localState && formik.errors.localState}
            countryValue={formik.values.localCountry}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CityComponent
            value={formik.values.localCity}
            onChange={(_e, value) => formik.setFieldValue('localCity', value)}
            // error={formik.touched.localCity && Boolean(formik.errors.localCity)}
            // helperText={formik.touched.localCity && formik.errors.localCity}
            stateValue={formik.values.localState}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            disabled={!isEdit}
            name="localPincode"
            value={formik.values.localPincode}
            onChange={formik.handleChange}
            error={formik.touched.localPincode && Boolean(formik.errors.localPincode)}
            helperText={formik.touched.localPincode && formik.errors.localPincode}
            fullWidth
            size="small"
            label="Pincode"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RenderLocalAddressFields;
