import { capitalize } from 'lodash';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Radio,
  Select,
  Divider,
  MenuItem,
  TextField,
  FormLabel,
  InputLabel,
  RadioGroup,
  FormControl,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import calculateAge from 'src/utils/calculate-age';
import { fileToBase64 } from 'src/utils/file-to-base64';

import { GenderType, GenderTypeArray } from 'src/enums/gender';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { UploadAvatar } from 'src/components/upload';
import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import RenderBoard from './RenderBoard';
import RenderClass from './RenderClass';
import RenderMedium from './RenderMedium';
import RenderAcademicYear from './RenderAcademicYear';
import RenderInquiryPrefrance from './RenderInquiryPrefrance';

import type { FieldsType } from './type';

export const generalFormFields: FieldsType[] = [
  {
    name: 'inquiryNo',
    label: 'Inquiry No',
    type: 'text',
    otherProps: { disabled: true, autoFocus: true },
    gridProps: { xs: 12, md: 12 },
    renderComp(props) {
      const { formik, isEdit: disabled } = props;
      return (
        <Box>
          <SectionCard title="Inquiry & Admission Details">
            {/* <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.inquiryNo && Boolean(formik.errors.inquiryNo)}
              >
                <TextField
                  fullWidth
                  size="small"
                  label="Inquiry No"
                  placeholder="Enter Inquiry No"
                  {...formik.getFieldProps('inquiryNo')}
                  onChange={(e) => {
                    const newName = capitalize(e.target.value);
                    formik.setFieldValue('inquiryNo', newName);
                  }}
                  error={formik.touched.inquiryNo && Boolean(formik.errors.inquiryNo)}
                  helperText={formik.touched.inquiryNo && formik.errors.inquiryNo}
                  disabled
                />
              </ShakingTextField>
            </Grid> */}
            <Grid item xs={12} md={3}>
              <ShakingTextField error={formik.touched.formNo && Boolean(formik.errors.formNo)}>
                <TextField
                  fullWidth
                  size="small"
                  label="Form No"
                  name="formNo"
                  placeholder="Enter Form No"
                  onChange={formik.handleChange}
                  error={formik.touched.formNo && Boolean(formik.errors.formNo)}
                  helperText={formik.touched.formNo && formik.errors.formNo}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <RenderAcademicYear {...props} />
            </Grid>
            <Grid item xs={12} md={3}>
              <RenderBoard {...props} />
            </Grid>
            <Grid item xs={12} md={3}>
              <RenderMedium {...props} />
            </Grid>
            <Grid item xs={12} md={3}>
              <RenderClass {...props} />
            </Grid>
          </SectionCard>

          <SectionCard title="Student Information">
            <Grid item xs={12} md={3}>
              <UploadAvatar
                maxSize={3145728}
                onDrop={async (acceptedFiles: File[]) => {
                  const value = acceptedFiles[0];
                  const base64 = await fileToBase64(value);
                  formik.setFieldValue('photo', base64);
                }}
                value={formik.values.photo}
                error={formik.touched.photo && Boolean(formik.errors.photo)}
                disabled={!disabled}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <ShakingTextField
                    error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  >
                    <TextField
                      key="firstName"
                      size="small"
                      placeholder="Enter First Name *"
                      name="firstName"
                      label="First Name *"
                      value={formik.values.firstName}
                      onBlur={formik.handleBlur}
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      helperText={formik.touched.firstName && formik.errors.firstName}
                      fullWidth
                      onChange={(e: any) => {
                        const newName = capitalize(e.target.value);
                        formik.setFieldValue('firstName', newName);
                      }}
                      disabled={!disabled}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <ShakingTextField
                    error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                  >
                    <TextField
                      key="middleName"
                      size="small"
                      label="Middle Name *"
                      name="middleName"
                      placeholder="Enter Middle Name *"
                      value={formik.values.middleName}
                      onBlur={formik.handleBlur}
                      error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                      helperText={formik.touched.middleName && formik.errors.middleName}
                      fullWidth
                      onChange={(e: any) => {
                        const newName = capitalize(e.target.value);
                        formik.setFieldValue('middleName', newName);
                      }}
                      disabled={!disabled}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <ShakingTextField
                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  >
                    <TextField
                      key="lastName"
                      size="small"
                      label="Last Name *"
                      name="lastName"
                      placeholder="Enter Last Name *"
                      value={formik.values.lastName}
                      onBlur={formik.handleBlur}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      helperText={formik.touched.lastName && formik.errors.lastName}
                      fullWidth
                      onChange={(e: any) => {
                        const newName = capitalize(e.target.value);
                        formik.setFieldValue('lastName', newName);
                      }}
                      disabled={!disabled}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <ShakingTextField error={formik.touched.dob && Boolean(formik.errors.dob)}>
                    <DatePicker
                      label="Date of Birth *"
                      name="dob"
                      value={formik.values.dob}
                      disabled={!disabled}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          placeholder: 'Date of Birth *',
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.dob && Boolean(formik.errors.dob),
                          helperText: formik.touched.dob && formik.errors.dob,
                          disabled: !disabled,
                        },
                      }}
                      onChange={(newValue) => {
                        const date = newValue?.format();
                        if (date) {
                          const age = calculateAge(date);
                          formik.setFieldValue('age', age);
                        }
                        formik.setFieldValue('dob', newValue);
                      }}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <ShakingTextField error={formik.touched.gender && Boolean(formik.errors.gender)}>
                    <FormControl
                      fullWidth
                      error={formik.touched.gender && Boolean(formik.errors.gender)}
                      disabled={!disabled}
                    >
                      <FormLabel
                        id="gender-radio-group"
                        error={formik.touched.gender && Boolean(formik.errors.gender)}
                      >
                        Gender *
                      </FormLabel>
                      <RadioGroup
                        row
                        aria-labelledby="gender-radio-group"
                        name="gender"
                        value={formik.values.gender}
                        onChange={formik.handleChange}
                      >
                        {GenderTypeArray.map((i, index) => (
                          <FormControlLabel
                            key={i}
                            value={index}
                            control={<Radio size="small" />}
                            label={GenderType[index]}
                            disabled={!disabled}
                          />
                        ))}
                      </RadioGroup>
                      <FormHelperText error>
                        {formik.touched.gender && formik.errors.gender}
                      </FormHelperText>
                    </FormControl>
                  </ShakingTextField>
                </Grid>
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard title="Contact Details">
            <Grid item xs={12} md={4}>
              <ShakingTextField error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}>
                <PhoneInput
                  name="mobileNo"
                  disabled={!disabled}
                  value={formik.values.mobileNo}
                  onChange={(value) => {
                    formik.setFieldValue('mobileNo', value);
                  }}
                  placeholder="Enter Primary Contact No."
                  label="Primary Contact No *"
                  error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}
                  helperText={formik.touched.mobileNo && formik.errors.mobileNo}
                  variant="outlined"
                  size="small"
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <ShakingTextField
                error={
                  formik.touched.alternativeContactNumber &&
                  Boolean(formik.errors.alternativeContactNumber)
                }
              >
                <PhoneInput
                  name="alternativeContactNumber"
                  value={formik.values.alternativeContactNumber}
                  disabled={!disabled}
                  onChange={(value) => {
                    formik.setFieldValue('alternativeContactNumber', value);
                  }}
                  placeholder="Enter Secondary Contact No."
                  label="Secondary Contact No."
                  error={
                    formik.touched.alternativeContactNumber &&
                    Boolean(formik.errors.alternativeContactNumber)
                  }
                  helperText={
                    formik.touched.alternativeContactNumber &&
                    formik.errors.alternativeContactNumber
                  }
                  variant="outlined"
                  size="small"
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <ShakingTextField error={formik.touched.email && Boolean(formik.errors.email)}>
                <TextField
                  key="email"
                  size="small"
                  label="Email"
                  name="email"
                  placeholder="Enter Email"
                  value={formik.values.email}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  fullWidth
                  onChange={(e: any) => {
                    const newName = capitalize(e.target.value);
                    formik.setFieldValue('email', newName);
                  }}
                  disabled={!disabled}
                  InputProps={{
                    startAdornment: (
                      <>
                        <Iconify icon="mdi-light:email" />{' '}
                        <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                      </>
                    ),
                  }}
                />
              </ShakingTextField>
            </Grid>
          </SectionCard>

          <SectionCard title="Identification & Personal Details">
            <Grid item xs={12} md={3}>
              <ShakingTextField error={formik.touched.adharNo && Boolean(formik.errors.adharNo)}>
                <TextField
                  key="adharNo"
                  size="small"
                  label="Aadhar No"
                  name="adharNo"
                  type="number"
                  placeholder="Enter Aadhar No"
                  value={formik.values.adharNo}
                  onBlur={formik.handleBlur}
                  error={formik.touched.adharNo && Boolean(formik.errors.adharNo)}
                  helperText={formik.touched.adharNo && formik.errors.adharNo}
                  fullWidth
                  onChange={formik.handleChange}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField error={formik.touched.apparId && Boolean(formik.errors.apparId)}>
                <TextField
                  key="apparId"
                  size="small"
                  label="Appar Id"
                  name="apparId"
                  placeholder="Enter Appar Id"
                  value={formik.values.apparId}
                  onBlur={formik.handleBlur}
                  error={formik.touched.apparId && Boolean(formik.errors.apparId)}
                  helperText={formik.touched.apparId && formik.errors.apparId}
                  fullWidth
                  onChange={formik.handleChange}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField error={formik.touched.panNo && Boolean(formik.errors.panNo)}>
                <TextField
                  key="panNo"
                  size="small"
                  label="Pan No"
                  name="panNo"
                  placeholder="Enter Pan No"
                  value={formik.values.panNo}
                  onBlur={formik.handleBlur}
                  error={formik.touched.panNo && Boolean(formik.errors.panNo)}
                  helperText={formik.touched.panNo && formik.errors.panNo}
                  fullWidth
                  onChange={formik.handleChange}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.inquiryPreference && Boolean(formik.errors.inquiryPreference)}
              >
                <RenderInquiryPrefrance {...props} />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField error={formik.touched.religion && Boolean(formik.errors.religion)}>
                <TextField
                  key="religion"
                  size="small"
                  label="Religion"
                  name="religion"
                  placeholder="Enter Religion"
                  value={formik.values.religion}
                  onBlur={formik.handleBlur}
                  error={formik.touched.religion && Boolean(formik.errors.religion)}
                  helperText={formik.touched.religion && formik.errors.religion}
                  fullWidth
                  onChange={(e: any) => {
                    const newName = capitalize(e.target.value);
                    formik.setFieldValue('religion', newName);
                  }}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.familyCast && Boolean(formik.errors.familyCast)}
              >
                <TextField
                  key="familyCast"
                  size="small"
                  label="Family Cast"
                  name="familyCast"
                  placeholder="Enter Family Cast"
                  value={formik.values.familyCast}
                  onBlur={formik.handleBlur}
                  error={formik.touched.familyCast && Boolean(formik.errors.familyCast)}
                  helperText={formik.touched.familyCast && formik.errors.familyCast}
                  fullWidth
                  onChange={(e: any) => {
                    const newName = capitalize(e.target.value);
                    formik.setFieldValue('familyCast', newName);
                  }}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.castCategory && Boolean(formik.errors.castCategory)}
              >
                <FormControl
                  fullWidth
                  error={
                    props.formik.touched.castCategory && Boolean(props.formik.errors.castCategory)
                  }
                  disabled={!disabled}
                >
                  <InputLabel
                    id="dropdown-label"
                    size="small"
                    error={
                      props.formik.touched.castCategory && Boolean(props.formik.errors.castCategory)
                    }
                  >
                    Cast Category *
                  </InputLabel>
                  <Select
                    labelId="dropdown-label"
                    id="dropdown"
                    value={props.formik.values.castCategory}
                    onChange={props.formik.handleChange}
                    size="small"
                    label="Cast Category *"
                    name="castCategory"
                    error={
                      props.formik.touched.castCategory && Boolean(props.formik.errors.castCategory)
                    }
                    disabled={!disabled}
                  >
                    {EmployeeCastTypeArray.map((i, index) => (
                      <MenuItem key={i} value={index}>
                        {EmployeeCastType[index]}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {props.formik.touched.castCategory && props.formik.errors.castCategory}
                  </FormHelperText>
                </FormControl>
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.nationality && Boolean(formik.errors.nationality)}
              >
                <TextField
                  key="nationality"
                  size="small"
                  label="Nationality"
                  name="nationality"
                  placeholder="Enter Nationality"
                  value={formik.values.nationality}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nationality && Boolean(formik.errors.nationality)}
                  helperText={formik.touched.nationality && formik.errors.nationality}
                  fullWidth
                  onChange={(e: any) => {
                    const newName = capitalize(e.target.value);
                    formik.setFieldValue('nationality', newName);
                  }}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.birthPlace && Boolean(formik.errors.birthPlace)}
              >
                <TextField
                  key="birthPlace"
                  size="small"
                  label="Birth Place"
                  name="birthPlace"
                  placeholder="Enter Birth Place"
                  value={formik.values.birthPlace}
                  onBlur={formik.handleBlur}
                  error={formik.touched.birthPlace && Boolean(formik.errors.birthPlace)}
                  helperText={formik.touched.birthPlace && formik.errors.birthPlace}
                  fullWidth
                  onChange={(e: any) => {
                    const newName = capitalize(e.target.value);
                    formik.setFieldValue('birthPlace', newName);
                  }}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.motherTongue && Boolean(formik.errors.motherTongue)}
              >
                <FormControl
                  fullWidth
                  size="small"
                  error={formik.touched.motherTongue && Boolean(formik.errors.motherTongue)}
                  disabled={!disabled}
                >
                  <InputLabel id="mother-tongue-label">Mother Tongue</InputLabel>
                  <Select
                    labelId="mother-tongue-label"
                    id="motherTongue"
                    name="motherTongue"
                    value={formik.values.motherTongue}
                    label="Mother Tongue"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Gujarati">Gujarati</MenuItem>
                    <MenuItem value="Marathi">Marathi</MenuItem>
                    <MenuItem value="Hindi">Hindi</MenuItem>
                  </Select>
                  <FormHelperText>
                    {formik.touched.motherTongue && formik.errors.motherTongue}
                  </FormHelperText>
                </FormControl>
              </ShakingTextField>
            </Grid>
          </SectionCard>

          <SectionCard title="Address Information">
            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
              >
                <TextField
                  key="addressLine1"
                  size="small"
                  label="Building / Flat / House No"
                  name="addressLine1"
                  placeholder="Enter Building / Flat / House No"
                  value={formik.values.addressLine1}
                  onBlur={formik.handleBlur}
                  error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
                  helperText={formik.touched.addressLine1 && formik.errors.addressLine1}
                  fullWidth
                  onChange={formik.handleChange}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)}
              >
                <TextField
                  key="addressLine2"
                  size="small"
                  label="Street / Road Name"
                  name="addressLine2"
                  placeholder="Enter Street / Road Name"
                  value={formik.values.addressLine2}
                  onBlur={formik.handleBlur}
                  error={formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)}
                  helperText={formik.touched.addressLine2 && formik.errors.addressLine2}
                  fullWidth
                  onChange={formik.handleChange}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.addressLine3 && Boolean(formik.errors.addressLine3)}
              >
                <TextField
                  key="addressLine3"
                  size="small"
                  label="Area / Locality / Landmark"
                  name="addressLine3"
                  placeholder="Enter Area / Locality / Landmark"
                  value={formik.values.addressLine3}
                  onBlur={formik.handleBlur}
                  error={formik.touched.addressLine3 && Boolean(formik.errors.addressLine3)}
                  helperText={formik.touched.addressLine3 && formik.errors.addressLine3}
                  fullWidth
                  onChange={formik.handleChange}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField error={formik.touched.country && Boolean(formik.errors.country)}>
                <CountryComponent
                  value={props.formik.values.country}
                  onChange={(e, value) => {
                    props.formik.setFieldValue('country', value);
                  }}
                  error={
                    props.formik.touched.country && Boolean(props.formik.errors?.country?.name)
                  }
                  helperText={props.formik.touched.country && props.formik.errors?.country?.name}
                  disabled={!disabled}
                  textFieldProps={{
                    label: 'Country *',
                    placeholder: 'Country *',
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField error={formik.touched.state && Boolean(formik.errors.state)}>
                <StateComponent
                  value={props.formik.values.state}
                  onChange={(e, value) => {
                    props.formik.setFieldValue('state', value);
                  }}
                  countryValue={props.formik.values.country}
                  error={props.formik.touched.state && Boolean(props.formik.errors?.state?.name)}
                  helperText={props.formik.touched.state && props.formik.errors?.state?.name}
                  disabled={!disabled}
                  textFieldProps={{
                    label: 'State *',
                    placeholder: 'State *',
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField error={formik.touched.city && Boolean(formik.errors.city)}>
                <CityComponent
                  value={props.formik.values.city}
                  onChange={(e, value) => {
                    props.formik.setFieldValue('city', value);
                  }}
                  stateValue={props.formik.values.state}
                  error={props.formik.touched.city && Boolean(props.formik.errors?.city?.name)}
                  helperText={props.formik.touched.city && props.formik.errors?.city?.name}
                  disabled={!disabled}
                  textFieldProps={{
                    label: 'City *',
                    placeholder: 'City *',
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <ShakingTextField error={formik.touched.pinCode && Boolean(formik.errors.pinCode)}>
                <TextField
                  key="pinCode"
                  size="small"
                  label="Pin Code"
                  name="pinCode"
                  placeholder="Enter Pin Code"
                  value={formik.values.pinCode}
                  onBlur={formik.handleBlur}
                  error={formik.touched.pinCode && Boolean(formik.errors.pinCode)}
                  helperText={formik.touched.pinCode && formik.errors.pinCode}
                  fullWidth
                  onChange={formik.handleChange}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
          </SectionCard>

          <SectionCard title="Previous Schooling">
            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.previousSchool && Boolean(formik.errors.previousSchool)}
              >
                <TextField
                  key="previousSchool"
                  size="small"
                  label="Previous School"
                  name="previousSchool"
                  placeholder="Enter Previous School"
                  value={formik.values.previousSchool}
                  onBlur={formik.handleBlur}
                  error={formik.touched.previousSchool && Boolean(formik.errors.previousSchool)}
                  helperText={formik.touched.previousSchool && formik.errors.previousSchool}
                  fullWidth
                  onChange={formik.handleChange}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
          </SectionCard>
        </Box>
      );
    },
  },
];
