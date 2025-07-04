import { capitalize } from 'lodash';

import { Box, Grid, Stack, Checkbox, TextField, FormControlLabel } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import PhoneInput from 'src/components/phone-input';
import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import { CardActions, SectionCard } from './InformationFields';

import type { FieldsType } from './types';

function FatherAddressComponent(props: any) {
  const { formik, disabled } = props;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          disabled={!!disabled}
          control={
            <Checkbox
              checked={formik.values.sameAsEmployeeAddressForFather}
              onChange={(e) => {
                formik.setFieldValue('sameAsEmployeeAddressForFather', e.target.checked);
                if (e.target.checked) {
                  formik.setFieldValue('fatherAddress1', formik.values.addressLine1);
                  formik.setFieldValue('fatherAddress2', formik.values.addressLine2);
                  formik.setFieldValue('fatherAddress3', formik.values.addressLine3);
                  formik.setFieldValue('fatherCountry', formik.values.country);
                  formik.setFieldValue('fatherState', formik.values.state);
                  formik.setFieldValue('fatherCity', formik.values.city);
                  formik.setFieldValue('fatherPinCode', formik.values.pincode);
                }
              }}
              name="sameAsEmployeeAddressForFather"
            />
          }
          label="Same as Employee Address"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.fatherAddress1 && Boolean(formik.errors.fatherAddress1)}
        >
          <TextField
            name="fatherAddress1"
            label="Building No./Flat/House No."
            value={formik.values.fatherAddress1 || ''}
            // InputLabelProps={{ shrink: !!formik.values.fatherAddress1 }}
            onChange={formik.handleChange}
            error={formik.touched.fatherAddress1 && Boolean(formik.errors.fatherAddress1)}
            helperText={formik.touched.fatherAddress1 && formik.errors.fatherAddress1}
            fullWidth
            size="small"
            disabled={!!disabled}
            InputLabelProps={{ shrink: true }}
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
            value={formik.values.fatherAddress2 || ''}
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
            value={formik.values.fatherAddress3 || ''}
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
          disabled={!!disabled}
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
          disabled={!!disabled}
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
          disabled={!!disabled}
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
            value={formik.values.fatherPinCode || ''}
            onChange={(e) => {
              const { value } = e.target;
              if (value.length <= 6) {
                formik.handleChange(e);
                formik.validateField('fatherPinCode');
              }
            }}
            // onChange={formik.handleChange}
            error={formik.touched.fatherPinCode && Boolean(formik.errors.fatherPinCode)}
            helperText={formik.touched.fatherPinCode && formik.errors.fatherPinCode}
            fullWidth
            type="number"
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
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          disabled={!!disabled}
          control={
            <Checkbox
              checked={formik.values.sameAsFatherAddressForMother}
              onChange={(e) => {
                formik.setFieldValue('sameAsFatherAddressForMother', e.target.checked);
                if (e.target.checked) {
                  formik.setFieldValue('motherAddress1', formik.values.addressLine1);
                  formik.setFieldValue('motherAddress2', formik.values.addressLine2);
                  formik.setFieldValue('motherAddress3', formik.values.addressLine3);
                  formik.setFieldValue('motherCountry', formik.values.country);
                  formik.setFieldValue('motherState', formik.values.state);
                  formik.setFieldValue('motherCity', formik.values.city);
                  formik.setFieldValue('motherPinCode', formik.values.pincode);
                }
              }}
              name="sameAsFatherAddressForMother"
            />
          }
          label="Same as Employee Address"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.motherAddress1 && Boolean(formik.errors.motherAddress1)}
        >
          <TextField
            name="motherAddress1"
            label="Building No./Flat/House No."
            value={formik.values.motherAddress1 || ''}
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
            value={formik.values.motherAddress2 || ''}
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
            value={formik.values.motherAddress3 || ''}
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
          disabled={!!disabled}
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
          disabled={!!disabled}
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
          disabled={!!disabled}
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
            value={formik.values.motherPinCode || ''}
            // onChange={formik.handleChange}
            onChange={(e) => {
              const { value } = e.target;
              if (value.length <= 6) {
                formik.handleChange(e);
                formik.validateField('motherPinCode');
              }
            }}
            error={formik.touched.motherPinCode && Boolean(formik.errors.motherPinCode)}
            helperText={formik.touched.motherPinCode && formik.errors.motherPinCode}
            fullWidth
            size="small"
            type="number"
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
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          disabled={!!disabled}
          control={
            <Checkbox
              checked={formik.values.sameAsFatherAddressForSpouse}
              onChange={(e) => {
                formik.setFieldValue('sameAsFatherAddressForSpouse', e.target.checked);
                if (e.target.checked) {
                  formik.setFieldValue('spouseAddress1', formik.values.addressLine1);
                  formik.setFieldValue('spouseAddress2', formik.values.addressLine2);
                  formik.setFieldValue('spouseAddress3', formik.values.addressLine3);
                  formik.setFieldValue('spouseCountry', formik.values.country);
                  formik.setFieldValue('spouseState', formik.values.state);
                  formik.setFieldValue('spouseCity', formik.values.city);
                  formik.setFieldValue('spousePinCode', formik.values.pincode);
                }
              }}
              name="sameAsFatherAddressForSpouse"
            />
          }
          label="Same as Employee Address"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched.spouseAddress1 && Boolean(formik.errors.spouseAddress1)}
        >
          <TextField
            name="spouseAddress1"
            label="Building No./Flat/House No."
            value={formik.values.spouseAddress1 || ''}
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
            value={formik.values.spouseAddress2 || ''}
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
            value={formik.values.spouseAddress3 || ''}
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
          disabled={!!disabled}
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
          disabled={!!disabled}
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
          disabled={!!disabled}
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
            value={formik.values.spousePinCode || ''}
            // onChange={formik.handleChange}
            onChange={(e) => {
              const { value } = e.target;
              if (value.length <= 6) {
                formik.handleChange(e);
                formik.validateField('spousePinCode');
              }
            }}
            error={formik.touched.spousePinCode && Boolean(formik.errors.spousePinCode)}
            helperText={formik.touched.spousePinCode && formik.errors.spousePinCode}
            fullWidth
            type="number"
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
  isMainForm,
  editData,
}: {
  type: 'father' | 'mother' | 'spouse';
  title: string;
  formik: any;
  isMainForm: boolean;
  editData: any;
}) => {
  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

  const isEditable = useBoolean(!!isMainForm);
  const handleSave = () => {
    formik.submitForm();
  };
  const handleCancel = () => {
    formik.setFieldValue(`${type}Name`, editData.fatherDetails.name || '');
    formik.setFieldValue(`${type}Occupation`, editData.fatherDetails.occupation || '');
    formik.setFieldValue(`${type}ContactNo`, editData.fatherDetails.contactNo || '');
    formik.setFieldValue(`${type}Address1`, editData.fatherDetails.address1 || '');
    formik.setFieldValue(`${type}Address2`, editData.fatherDetails.address2 || '');
    formik.setFieldValue(`${type}Address3`, editData.fatherDetails.address3 || '');
    formik.setFieldValue(`${type}Country`, {
      name: editData?.fatherDetails?.countryName || '',
      isoCode: editData?.fatherDetails?.countryIsoCode || '',
    });
    formik.setFieldValue(`${type}State`, {
      name: editData?.fatherDetails?.stateName || '',
      isoCode: editData?.fatherDetails?.stateIsoCode || '',
    });
    formik.setFieldValue(`${type}City`, {
      name: editData?.fatherDetails?.city || '',
    });
    formik.setFieldValue(`${type}PinCode`, editData.fatherDetails.pinCode);
  };
  return (
    <SectionCard
      title={title}
      headerContent={
        !isMainForm && (
          <CardActions
            isEdit={isEditable}
            isLoading={formik.isSubmitting}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )
      }
    >
      {/* Name Field */}
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ShakingTextField
          error={formik.touched[`${type}Name`] && Boolean(formik.errors[`${type}Name`])}
        >
          <TextField
            name={`${type}Name`}
            value={formik.values[`${type}Name`]}
            label={`Full Name `}
            // placeholder={`Enter ${capitalizedType} Name `}
            // onChange={(e) => {
            //   const value = capitalize(e.target.value);
            //   if (/^[A-Za-z ]*$/.test(value)) {
            //     formik.setFieldValue(`${type}Name`, value);
            //   }
            // }}
            onChange={(e) => {
              const value = e.target.value
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
              formik.setFieldValue(`${type}Name`, value);
            }}
            error={formik.touched[`${type}Name`] && Boolean(formik.errors[`${type}Name`])}
            helperText={formik.touched[`${type}Name`] && formik.errors[`${type}Name`]}
            fullWidth
            size="small"
            disabled={!isEditable.value}
          />
        </ShakingTextField>
      </Grid>

      {/* Occupation Field */}
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <TextField
          name={`${type}Occupation`}
          value={formik.values[`${type}Occupation`]}
          label={` Occupation`}
          onChange={(e) => {
            const value = capitalize(e.target.value);
            if (/^[A-Za-z ]*$/.test(value)) {
              formik.setFieldValue(`${type}Occupation`, value);
            }
          }}
          error={formik.touched[`${type}Occupation`] && Boolean(formik.errors[`${type}Occupation`])}
          helperText={formik.touched[`${type}Occupation`] && formik.errors[`${type}Occupation`]}
          fullWidth
          size="small"
          disabled={!isEditable.value}
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
            label="Mobile No."
            onChange={(value) => {
              formik.setFieldValue(`${type}ContactNo`, value);
              formik.validateField(`${type}ContactNo`);
            }}
            // placeholder={`Enter ${capitalizedType} Contact No.`}
            error={formik.touched[`${type}ContactNo`] && Boolean(formik.errors[`${type}ContactNo`])}
            helperText={formik.touched[`${type}ContactNo`] && formik.errors[`${type}ContactNo`]}
            disabled={!isEditable.value}
          />
        </ShakingTextField>
      </Grid>

      <Grid item xs={12}>
        {type === 'father' && (
          <FatherAddressComponent formik={formik} disabled={!isEditable.value} />
        )}
        {type === 'mother' && (
          <MotherAddressComponent formik={formik} disabled={!isEditable.value} />
        )}
        {type === 'spouse' && (
          <SpouseAddressComponent formik={formik} disabled={!isEditable.value} />
        )}
      </Grid>
    </SectionCard>
  );
};

function RenderFamilyInformation(props: any) {
  const { formik, isMainForm, editData } = props;

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={3}>
        <FamilyMemberSection
          type="father"
          title="Father Details"
          formik={formik}
          isMainForm={isMainForm}
          editData={editData}
        />
        <FamilyMemberSection
          type="mother"
          title="Mother Details"
          formik={formik}
          isMainForm={isMainForm}
          editData={editData}
        />
        <FamilyMemberSection
          type="spouse"
          title="Spouse Details"
          formik={formik}
          isMainForm={isMainForm}
          editData={editData}
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
