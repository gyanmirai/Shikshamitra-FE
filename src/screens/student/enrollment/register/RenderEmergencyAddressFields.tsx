import { Grid, Checkbox, Collapse, TextField } from '@mui/material';

import { Subheader } from 'src/components/nav-section';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

const RenderEmergencyAddressFields = (props: any) => {
  const { formik, isEdit } = props;

  return (
    <>
      <Subheader
        data-title="Emergency Address"
        open={formik.values.isOpenEmergencyAddress}
        // onClick={() => {
        //   formik.setFieldValue('isOpenEmergencyAddress', !formik.values.isOpenEmergencyAddress);
        // }}
        sx={{ pt: 0, fontWeight: 600 }}
      >
        <Checkbox
          checked={formik.values.emergencySameAsLocal}
          disabled={!isEdit}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => {
            formik.setFieldValue('emergencySameAsLocal', e.target.checked);
            formik.setFieldValue('isOpenEmergencyAddress', !e.target.checked);
            if (e.target.checked) {
              formik.setFieldValue('emergencyAddressLine1', formik.values.localAddressLine1);
              formik.setFieldValue('emergencyAddressLine2', formik.values.localAddressLine2);
              formik.setFieldValue('emergencyAddressLine3', formik.values.localAddressLine3);
              formik.setFieldValue('emergencyCountry', formik.values.localCountry);
              formik.setFieldValue('emergencyState', formik.values.localState);
              formik.setFieldValue('emergencyCity', formik.values.localCity);
              formik.setFieldValue('emergencyPincode', formik.values.localPincode);
            }
          }}
          sx={{ p: 0 }}
        />{' '}
        Emergency Address Same as Local Address{' '}
      </Subheader>
      <Collapse in={formik.values.isOpenEmergencyAddress}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              disabled={!isEdit}
              name="emergencyAddressLine1"
              label="Building / Flat / House No"
              value={formik.values.emergencyAddressLine1}
              onChange={formik.handleChange}
              error={
                formik.touched.emergencyAddressLine1 && Boolean(formik.errors.emergencyAddressLine1)
              }
              helperText={
                formik.touched.emergencyAddressLine1 && formik.errors.emergencyAddressLine1
              }
              fullWidth
              placeholder="Enter Building / Flat / House No"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              disabled={!isEdit}
              name="emergencyAddressLine2"
              label="Street / Road Name"
              value={formik.values.emergencyAddressLine2}
              onChange={formik.handleChange}
              error={
                formik.touched.emergencyAddressLine2 && Boolean(formik.errors.emergencyAddressLine2)
              }
              helperText={
                formik.touched.emergencyAddressLine2 && formik.errors.emergencyAddressLine2
              }
              fullWidth
              placeholder="Enter Street / Road Name"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              disabled={!isEdit}
              name="emergencyAddressLine3"
              label="Area / Locality / Landmark"
              value={formik.values.emergencyAddressLine3}
              onChange={formik.handleChange}
              error={
                formik.touched.emergencyAddressLine3 && Boolean(formik.errors.emergencyAddressLine3)
              }
              helperText={
                formik.touched.emergencyAddressLine3 && formik.errors.emergencyAddressLine3
              }
              fullWidth
              placeholder="Enter Area / Locality / Landmark"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CountryComponent
              value={formik.values.emergencyCountry}
              onChange={(_e, value) => {
                formik.setFieldValue('emergencyState', null);
                formik.setFieldValue('emergencyCountry', value);
              }}
              error={formik.touched.emergencyCountry && Boolean(formik.errors.emergencyCountry)}
              helperText={formik.touched.emergencyCountry && formik.errors.emergencyCountry}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StateComponent
              value={formik.values.emergencyState}
              onChange={(_e, value) => {
                formik.setFieldValue('emergencyCity', null);
                formik.setFieldValue('emergencyState', value);
              }}
              error={formik.touched.emergencyState && Boolean(formik.errors.emergencyState)}
              helperText={formik.touched.emergencyState && formik.errors.emergencyState}
              countryValue={formik.values.emergencyCountry}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CityComponent
              value={formik.values.emergencyCity}
              onChange={(_e, value) => formik.setFieldValue('emergencyCity', value)}
              error={formik.touched.emergencyCity && Boolean(formik.errors.emergencyCity)}
              helperText={formik.touched.emergencyCity && formik.errors.emergencyCity}
              stateValue={formik.values.emergencyState}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="emergencyPincode"
              disabled={!isEdit}
              value={formik.values.emergencyPincode}
              onChange={formik.handleChange}
              error={formik.touched.emergencyPincode && Boolean(formik.errors.emergencyPincode)}
              helperText={formik.touched.emergencyPincode && formik.errors.emergencyPincode}
              fullWidth
              placeholder="Enter Pincode"
              size="small"
              label="Pincode"
            />
          </Grid>
        </Grid>
      </Collapse>
    </>
  );
};

export default RenderEmergencyAddressFields;
