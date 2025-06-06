import { Grid, Checkbox, Collapse, TextField } from '@mui/material';

import { Subheader } from 'src/components/nav-section';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

const RenderPermanentAddressFields = (props: any) => {
  const { formik, isEdit } = props;
  return (
    <>
      <Subheader
        data-title="Permanent Address"
        open={formik.values.isOpenPermanentAddress}
        onClick={() => {}}
        sx={{ pt: 0, fontWeight: 600 }}
      >
        <Checkbox
          checked={formik.values.sameAsLocalForPermanent}
          size="small"
          disabled={!isEdit}
          sx={{ p: 0 }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => {
            formik.setFieldValue('sameAsLocalForPermanent', e.target.checked);
            formik.setFieldValue('isOpenPermanentAddress', !e.target.checked);
            if (e.target.checked) {
              formik.setFieldValue('permanentAddressLine1', formik.values.localAddressLine1);
              formik.setFieldValue('permanentAddressLine2', formik.values.localAddressLine2);
              formik.setFieldValue('permanentAddressLine3', formik.values.localAddressLine3);
              formik.setFieldValue('permanentCountry', formik.values.localCountry);
              formik.setFieldValue('permanentState', formik.values.localState);
              formik.setFieldValue('permanentCity', formik.values.localCity);
              formik.setFieldValue('permanentPincode', formik.values.localPincode);
            }
          }}
          name="sameAsLocal"
        />{' '}
        Permanent Address Same as Local Address{' '}
      </Subheader>
      <Collapse in={formik.values.isOpenPermanentAddress}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              disabled={!isEdit}
              name="permanentAddressLine1"
              label="Building / Flat / House No"
              value={formik.values.permanentAddressLine1}
              onChange={formik.handleChange}
              error={
                formik.touched.permanentAddressLine1 && Boolean(formik.errors.permanentAddressLine1)
              }
              helperText={
                formik.touched.permanentAddressLine1 && formik.errors.permanentAddressLine1
              }
              fullWidth
              placeholder="Enter Building / Flat / House No"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              disabled={!isEdit}
              name="permanentAddressLine2"
              label="Street / Road Name"
              value={formik.values.permanentAddressLine2}
              onChange={formik.handleChange}
              error={
                formik.touched.permanentAddressLine2 && Boolean(formik.errors.permanentAddressLine2)
              }
              helperText={
                formik.touched.permanentAddressLine2 && formik.errors.permanentAddressLine2
              }
              fullWidth
              placeholder="Enter Street / Road Name"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              disabled={!isEdit}
              name="permanentAddressLine3"
              label="Area / Locality / Landmark"
              value={formik.values.permanentAddressLine3}
              onChange={formik.handleChange}
              error={
                formik.touched.permanentAddressLine3 && Boolean(formik.errors.permanentAddressLine3)
              }
              helperText={
                formik.touched.permanentAddressLine3 && formik.errors.permanentAddressLine3
              }
              fullWidth
              placeholder="Enter Area / Locality / Landmark"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CountryComponent
              value={formik.values.permanentCountry}
              onChange={(_e, value) => {
                formik.setFieldValue('permanentState', null);
                formik.setFieldValue('permanentCountry', value);
              }}
              error={formik.touched.permanentCountry && Boolean(formik.errors.permanentCountry)}
              helperText={formik.touched.permanentCountry && formik.errors.permanentCountry}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StateComponent
              value={formik.values.permanentState}
              onChange={(_e, value) => {
                formik.setFieldValue('permanentCity', null);
                formik.setFieldValue('permanentState', value);
              }}
              error={formik.touched.permanentState && Boolean(formik.errors.permanentState)}
              helperText={formik.touched.permanentState && formik.errors.permanentState}
              countryValue={formik.values.permanentCountry}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CityComponent
              value={formik.values.permanentCity}
              onChange={(_e, value) => formik.setFieldValue('permanentCity', value)}
              error={formik.touched.permanentCity && Boolean(formik.errors.permanentCity)}
              helperText={formik.touched.permanentCity && formik.errors.permanentCity}
              stateValue={formik.values.permanentState}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="permanentPincode"
              disabled={!isEdit}
              value={formik.values.permanentPincode}
              onChange={formik.handleChange}
              error={formik.touched.permanentPincode && Boolean(formik.errors.permanentPincode)}
              helperText={formik.touched.permanentPincode && formik.errors.permanentPincode}
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
export default RenderPermanentAddressFields;
