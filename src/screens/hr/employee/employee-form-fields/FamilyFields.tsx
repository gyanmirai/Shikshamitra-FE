import { capitalize } from 'lodash';

import {
  Box,
  Grid,
  Stack,
  Paper,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import PhoneInput from 'src/components/phone-input';
import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import type { FieldsType } from './types';

function FatherAddressComponent(props: any) {
  const { formik, disabled } = props;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.fatherAddress1 && Boolean(formik.errors.fatherAddress1)}
        >
          <TextField
            name="fatherAddress1"
            label="Building No / Flat / House No"
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

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.fatherAddress2 && Boolean(formik.errors.fatherAddress2)}
        >
          <TextField
            name="fatherAddress2"
            label="Area/Locality/Road Name"
            value={formik.values.fatherAddress2}
            onChange={formik.handleChange}
            error={formik.touched.fatherAddress2 && Boolean(formik.errors.fatherAddress2)}
            helperText={formik.touched.fatherAddress2 && formik.errors.fatherAddress2}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.fatherAddress3 && Boolean(formik.errors.fatherAddress3)}
        >
          <TextField
            name="fatherAddress3"
            label="Landmark"
            value={formik.values.fatherAddress3}
            onChange={formik.handleChange}
            error={formik.touched.fatherAddress3 && Boolean(formik.errors.fatherAddress3)}
            helperText={formik.touched.fatherAddress3 && formik.errors.fatherAddress3}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <CountryComponent
          value={formik.values.fatherCountry}
          onChange={(_e: any, value: any) => {
            formik.setFieldValue('fatherState', null);
            formik.setFieldValue('fatherCountry', value);
          }}
          error={formik.touched.fatherCountry && Boolean(formik.errors.fatherCountry)}
          helperText={formik.touched.fatherCountry && formik.errors.fatherCountry}
          textFieldProps={{ label: 'Country' }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
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

      <Grid item xs={12} sm={6} md={4} lg={3}>
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

      <Grid item xs={12} sm={6} md={4} lg={3}>
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
    </Grid>
  );
}

function MotherAddressComponent(props: any) {
  const { formik, disabled } = props;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControlLabel
          disabled={!!disabled}
          control={
            <Checkbox
              checked={formik.values.sameAsFatherAddressForMother}
              onChange={(e) => {
                formik.setFieldValue('sameAsFatherAddressForMother', e.target.checked);
                if (e.target.checked) {
                  formik.setFieldValue('motherAddress1', formik.values.fatherAddress1);
                  formik.setFieldValue('motherAddress2', formik.values.fatherAddress2);
                  formik.setFieldValue('motherAddress3', formik.values.fatherAddress3);
                  formik.setFieldValue('motherCountry', formik.values.fatherCountry);
                  formik.setFieldValue('motherState', formik.values.fatherState);
                  formik.setFieldValue('motherCity', formik.values.fatherCity);
                  formik.setFieldValue('motherPinCode', formik.values.fatherPinCode);
                }
              }}
              name="sameAsFatherAddressForMother"
            />
          }
          label="Same as Father Address"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherAddress1 && Boolean(formik.errors.motherAddress1)}
        >
          <TextField
            name="motherAddress1"
            label="Building No / Flat / House No"
            value={formik.values.motherAddress1}
            onChange={formik.handleChange}
            error={formik.touched.motherAddress1 && Boolean(formik.errors.motherAddress1)}
            helperText={formik.touched.motherAddress1 && formik.errors.motherAddress1}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherAddress2 && Boolean(formik.errors.motherAddress2)}
        >
          <TextField
            name="motherAddress2"
            label="Area/Locality/Road Name"
            value={formik.values.motherAddress2}
            onChange={formik.handleChange}
            error={formik.touched.motherAddress2 && Boolean(formik.errors.motherAddress2)}
            helperText={formik.touched.motherAddress2 && formik.errors.motherAddress2}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherAddress3 && Boolean(formik.errors.motherAddress3)}
        >
          <TextField
            name="motherAddress3"
            label="Landmark"
            value={formik.values.motherAddress3}
            onChange={formik.handleChange}
            error={formik.touched.motherAddress3 && Boolean(formik.errors.motherAddress3)}
            helperText={formik.touched.motherAddress3 && formik.errors.motherAddress3}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <CountryComponent
          value={formik.values.motherCountry}
          onChange={(_e: any, value: any) => {
            formik.setFieldValue('motherState', null);
            formik.setFieldValue('motherCountry', value);
          }}
          error={formik.touched.motherCountry && Boolean(formik.errors.motherCountry)}
          helperText={formik.touched.motherCountry && formik.errors.motherCountry}
          textFieldProps={{ label: 'Country' }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <StateComponent
          onChange={(_e: any, value: any) => {
            formik.setFieldValue('motherState', value);
            formik.setFieldValue('motherCity', null);
          }}
          value={formik.values.motherState}
          countryValue={formik.values.motherCountry}
          error={formik.touched.motherState && Boolean(formik.errors.motherState)}
          helperText={formik.touched.motherState && formik.errors.motherState}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <CityComponent
          onChange={(_e: any, value: any) => {
            formik.setFieldValue('motherCity', value);
          }}
          value={formik.values.motherCity}
          stateValue={formik.values.motherState}
          error={formik.touched.motherCity && Boolean(formik.errors.motherCity)}
          helperText={formik.touched.motherCity && formik.errors.motherCity}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherPinCode && Boolean(formik.errors.motherPinCode)}
        >
          <TextField
            name="motherPinCode"
            label="Pincode"
            value={formik.values.motherPinCode}
            onChange={formik.handleChange}
            error={formik.touched.motherPinCode && Boolean(formik.errors.motherPinCode)}
            helperText={formik.touched.motherPinCode && formik.errors.motherPinCode}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
}

function SpouseAddressComponent(props: any) {
  const { formik, disabled } = props;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControlLabel
          disabled={!!disabled}
          control={
            <Checkbox
              checked={formik.values.sameAsFatherAddressForSpouse}
              onChange={(e) => {
                formik.setFieldValue('sameAsFatherAddressForSpouse', e.target.checked);
                if (e.target.checked) {
                  formik.setFieldValue('spouseAddress1', formik.values.fatherAddress1);
                  formik.setFieldValue('spouseAddress2', formik.values.fatherAddress2);
                  formik.setFieldValue('spouseAddress3', formik.values.fatherAddress3);
                  formik.setFieldValue('spouseCountry', formik.values.fatherCountry);
                  formik.setFieldValue('spouseState', formik.values.fatherState);
                  formik.setFieldValue('spouseCity', formik.values.fatherCity);
                  formik.setFieldValue('spousePinCode', formik.values.fatherPinCode);
                }
              }}
              name="sameAsFatherAddressForSpouse"
            />
          }
          label="Same as Father Address"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.spouseAddress1 && Boolean(formik.errors.spouseAddress1)}
        >
          <TextField
            name="spouseAddress1"
            label="Building No / Flat / House No"
            value={formik.values.spouseAddress1}
            onChange={formik.handleChange}
            error={formik.touched.spouseAddress1 && Boolean(formik.errors.spouseAddress1)}
            helperText={formik.touched.spouseAddress1 && formik.errors.spouseAddress1}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.spouseAddress2 && Boolean(formik.errors.spouseAddress2)}
        >
          <TextField
            name="spouseAddress2"
            label="Area/Locality/Road Name"
            value={formik.values.spouseAddress2}
            onChange={formik.handleChange}
            error={formik.touched.spouseAddress2 && Boolean(formik.errors.spouseAddress2)}
            helperText={formik.touched.spouseAddress2 && formik.errors.spouseAddress2}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.spouseAddress3 && Boolean(formik.errors.spouseAddress3)}
        >
          <TextField
            name="spouseAddress3"
            label="Landmark"
            value={formik.values.spouseAddress3}
            onChange={formik.handleChange}
            error={formik.touched.spouseAddress3 && Boolean(formik.errors.spouseAddress3)}
            helperText={formik.touched.spouseAddress3 && formik.errors.spouseAddress3}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <CountryComponent
          value={formik.values.spouseCountry}
          onChange={(_e: any, value: any) => {
            formik.setFieldValue('spouseState', null);
            formik.setFieldValue('spouseCountry', value);
          }}
          error={formik.touched.spouseCountry && Boolean(formik.errors.spouseCountry)}
          helperText={formik.touched.spouseCountry && formik.errors.spouseCountry}
          textFieldProps={{ label: 'Country' }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <StateComponent
          onChange={(_e: any, value: any) => {
            formik.setFieldValue('spouseState', value);
            formik.setFieldValue('spouseCity', null);
          }}
          value={formik.values.spouseState}
          countryValue={formik.values.spouseCountry}
          error={formik.touched.spouseState && Boolean(formik.errors.spouseState)}
          helperText={formik.touched.spouseState && formik.errors.spouseState}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <CityComponent
          onChange={(_e: any, value: any) => {
            formik.setFieldValue('spouseCity', value);
          }}
          value={formik.values.spouseCity}
          stateValue={formik.values.spouseState}
          error={formik.touched.spouseCity && Boolean(formik.errors.spouseCity)}
          helperText={formik.touched.spouseCity && formik.errors.spouseCity}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.spousePinCode && Boolean(formik.errors.spousePinCode)}
        >
          <TextField
            name="spousePinCode"
            label="Pincode"
            value={formik.values.spousePinCode}
            onChange={formik.handleChange}
            error={formik.touched.spousePinCode && Boolean(formik.errors.spousePinCode)}
            helperText={formik.touched.spousePinCode && formik.errors.spousePinCode}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
}

// ======================================
// Family Information Component
// ======================================
const FamilyMemberSection = ({
  type,
  title,
  formik,
  disabled,
}: {
  type: 'father' | 'mother' | 'spouse';
  title: string;
  formik: any;
  disabled: boolean;
}) => {
  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <Paper
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
      elevation={6}
    >
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        {title}
      </Typography>

      <Grid container spacing={2}>
        {/* Name Field */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ShakingTextField
            error={formik.touched[`${type}Name`] && Boolean(formik.errors[`${type}Name`])}
          >
            <TextField
              name={`${type}Name`}
              value={formik.values[`${type}Name`]}
              label={`${capitalizedType} Name `}
              onChange={(e) => {
                const value = capitalize(e.target.value);
                formik.setFieldValue(`${type}Name`, value);
              }}
              error={formik.touched[`${type}Name`] && Boolean(formik.errors[`${type}Name`])}
              helperText={formik.touched[`${type}Name`] && formik.errors[`${type}Name`]}
              fullWidth
              size="small"
              disabled={!!disabled}
            />
          </ShakingTextField>
        </Grid>

        {/* Occupation Field */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <TextField
            name={`${type}Occupation`}
            value={formik.values[`${type}Occupation`]}
            label={`${capitalizedType} Occupation`}
            onChange={(e) => {
              const value = capitalize(e.target.value);
              formik.setFieldValue(`${type}Occupation`, value);
            }}
            error={
              formik.touched[`${type}Occupation`] && Boolean(formik.errors[`${type}Occupation`])
            }
            helperText={formik.touched[`${type}Occupation`] && formik.errors[`${type}Occupation`]}
            fullWidth
            size="small"
            disabled={!!disabled}
          />
        </Grid>

        {/* Contact Field */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ShakingTextField
            error={formik.touched[`${type}ContactNo`] && Boolean(formik.errors[`${type}ContactNo`])}
          >
            <PhoneInput
              name={`${type}ContactNo`}
              value={formik.values[`${type}ContactNo`]}
              label={`${capitalizedType} Contact No.`}
              onChange={(value) => {
                formik.setFieldValue(`${type}ContactNo`, value);
              }}
              error={
                formik.touched[`${type}ContactNo`] && Boolean(formik.errors[`${type}ContactNo`])
              }
              disabled={!!disabled}
            />
          </ShakingTextField>
        </Grid>
      </Grid>

      {/* Address Component */}
      <Box sx={{ mt: 2 }}>
        {type === 'father' && <FatherAddressComponent formik={formik} disabled={disabled} />}
        {type === 'mother' && <MotherAddressComponent formik={formik} disabled={disabled} />}
        {type === 'spouse' && <SpouseAddressComponent formik={formik} disabled={disabled} />}
      </Box>
    </Paper>
  );
};

function RenderFamilyInformation(props: any) {
  const { formik, disabled } = props;

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <FamilyMemberSection
          type="father"
          title="Father Details"
          formik={formik}
          disabled={disabled}
        />
        <FamilyMemberSection
          type="mother"
          title="Mother Details"
          formik={formik}
          disabled={disabled}
        />
        <FamilyMemberSection
          type="spouse"
          title="Spouse Details"
          formik={formik}
          disabled={disabled}
        />
      </Stack>
    </Box>
  );
}

export const FamilyFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Father Name',
    name: 'fatherName',
    renderComp(props: any) {
      return <RenderFamilyInformation {...props} />;
    },
  },
];
