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
          <SectionCard title="Inquiry & Admission">
            <Grid item xs={12} md={3}>
              <ShakingTextField error={formik.touched.formNo && Boolean(formik.errors.formNo)}>
                <TextField
                  fullWidth
                  size="small"
                  label="Form No"
                  name="formNo"
                  value={formik.values.formNo}
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

          <SectionCard title="Student">
            <Grid item xs={12} md={3}>
              <UploadAvatar
                maxSize={3145728}
                onDrop={async (acceptedFiles: File[]) => {
                  const value = acceptedFiles[0];
                  const base64 = await fileToBase64(value);
                  formik.setFieldValue('photo', base64);
                  formik.setFieldTouched('photo', true);
                }}
                value={formik.values.photo}
                error={formik.touched.photo && Boolean(formik.errors.photo)}
                disabled={!disabled}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <ShakingTextField
                    error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  >
                    <TextField
                      key="firstName"
                      size="small"
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
                        formik.setFieldTouched('firstName', true);
                      }}
                      disabled={!disabled}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ShakingTextField
                    error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                  >
                    <TextField
                      key="middleName"
                      size="small"
                      label="Middle Name *"
                      name="middleName"
                      value={formik.values.middleName}
                      onBlur={formik.handleBlur}
                      error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                      helperText={formik.touched.middleName && formik.errors.middleName}
                      fullWidth
                      onChange={(e: any) => {
                        const newName = capitalize(e.target.value);
                        formik.setFieldValue('middleName', newName);
                        formik.setFieldTouched('middleName', true);
                      }}
                      disabled={!disabled}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ShakingTextField
                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  >
                    <TextField
                      key="lastName"
                      size="small"
                      label="Last Name *"
                      name="lastName"
                      value={formik.values.lastName}
                      onBlur={formik.handleBlur}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      helperText={formik.touched.lastName && formik.errors.lastName}
                      fullWidth
                      onChange={(e: any) => {
                        const newName = capitalize(e.target.value);
                        formik.setFieldValue('lastName', newName);
                        formik.setFieldTouched('lastName', true);
                      }}
                      disabled={!disabled}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ShakingTextField error={formik.touched.dob && Boolean(formik.errors.dob)}>
                    <DatePicker
                      label="Date of Birth *"
                      name="dob"
                      value={formik.values.dob}
                      disabled={!disabled}
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: {
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
                        formik.setFieldTouched('dob', true);
                      }}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xs={12} md={4}>
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
                    formik.setFieldTouched('mobileNo', true);
                  }}
                  label="Primary Contact No *"
                  error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}
                  helperText={formik.touched.mobileNo && formik.errors.mobileNo}
                  onBlur={formik.handleBlur}
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
                    formik.setFieldTouched('alternativeContactNumber', true);
                  }}
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
                  label="Primary Email"
                  name="email"
                  value={formik.values.email}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  fullWidth
                  onChange={(e: any) => {
                    formik.setFieldValue('email', e.target.value);
                    formik.setFieldTouched('email', true);
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

          <SectionCard title="Identification & Personal">
            <Grid item xs={12} md={3}>
              <ShakingTextField error={formik.touched.adharNo && Boolean(formik.errors.adharNo)}>
                <TextField
                  key="adharNo"
                  size="small"
                  label="Aadhar No"
                  name="adharNo"
                  type="text"
                  value={formik.values.adharNo}
                  onBlur={formik.handleBlur}
                  error={formik.touched.adharNo && Boolean(formik.errors.adharNo)}
                  helperText={formik.touched.adharNo && formik.errors.adharNo}
                  fullWidth
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 12) {
                      value = value.slice(0, 12);
                    }
                    formik.setFieldValue('adharNo', value);
                    formik.setFieldTouched('adharNo', true);
                  }}
                  inputProps={{
                    maxLength: 12,
                    pattern: '[0-9]*',
                  }}
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
                <FormControl
                  fullWidth
                  disabled={!disabled}
                  error={!!formik.errors.religion && formik.touched.religion}
                >
                  <InputLabel id="religion-label" size="small">
                    Religion
                  </InputLabel>
                  <Select
                    labelId="religion-label"
                    id="religion"
                    value={formik.values.religion}
                    onChange={formik.handleChange}
                    size="small"
                    label="Religion "
                    name="religion"
                  >
                    <MenuItem value="Hinduism">Hinduism</MenuItem>
                    <MenuItem value="Islam">Islam</MenuItem>
                    <MenuItem value="Christianity">Christianity</MenuItem>
                    <MenuItem value="Sikhism">Sikhism</MenuItem>
                    <MenuItem value="Buddhism">Buddhism</MenuItem>
                    <MenuItem value="Jainism">Jainism</MenuItem>
                    <MenuItem value="Judaism">Judaism</MenuItem>
                    <MenuItem value="Zoroastrianism">Zoroastrianism (Parsi)</MenuItem>
                  </Select>
                  {formik.touched.religion && formik.errors.religion && (
                    <FormHelperText>{formik.errors.religion}</FormHelperText>
                  )}
                </FormControl>
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
                  value={formik.values.familyCast}
                  onBlur={formik.handleBlur}
                  error={formik.touched.familyCast && Boolean(formik.errors.familyCast)}
                  helperText={formik.touched.familyCast && formik.errors.familyCast}
                  fullWidth
                  onChange={(e: any) => {
                    const newName = capitalize(e.target.value);
                    formik.setFieldValue('familyCast', newName);
                    formik.setFieldTouched('familyCast', true);
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
                  value={formik.values.nationality}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nationality && Boolean(formik.errors.nationality)}
                  helperText={formik.touched.nationality && formik.errors.nationality}
                  fullWidth
                  onChange={(e: any) => {
                    const newName = capitalize(e.target.value);
                    formik.setFieldValue('nationality', newName);
                    formik.setFieldTouched('nationality', true);
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
                  value={formik.values.birthPlace}
                  onBlur={formik.handleBlur}
                  error={formik.touched.birthPlace && Boolean(formik.errors.birthPlace)}
                  helperText={formik.touched.birthPlace && formik.errors.birthPlace}
                  fullWidth
                  onChange={(e: any) => {
                    const newName = capitalize(e.target.value);
                    formik.setFieldValue('birthPlace', newName);
                    formik.setFieldTouched('birthPlace', true);
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

          <SectionCard title="Address">
            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
              >
                <TextField
                  key="addressLine1"
                  size="small"
                  label="Building No./Flat/ House No."
                  name="addressLine1"
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
                  label="Area/Locality/Road Name"
                  name="addressLine2"
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
                  label="Landmark"
                  name="addressLine3"
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
                    formik.setFieldTouched('country', true);
                  }}
                  error={
                    props.formik.touched.country && Boolean(props.formik.errors?.country?.name)
                  }
                  helperText={props.formik.touched.country && props.formik.errors?.country?.name}
                  disabled={!disabled}
                  textFieldProps={{
                    label: 'Country *',
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
                    formik.setFieldTouched('state', true);
                  }}
                  countryValue={props.formik.values.country}
                  error={props.formik.touched.state && Boolean(props.formik.errors?.state?.name)}
                  helperText={props.formik.touched.state && props.formik.errors?.state?.name}
                  disabled={!disabled}
                  textFieldProps={{
                    label: 'State *',
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
                    formik.setFieldTouched('city', true);
                  }}
                  stateValue={props.formik.values.state}
                  error={props.formik.touched.city && Boolean(props.formik.errors?.city?.name)}
                  helperText={props.formik.touched.city && props.formik.errors?.city?.name}
                  disabled={!disabled}
                  textFieldProps={{
                    label: 'City *',
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
                  value={formik.values.pinCode}
                  onBlur={formik.handleBlur}
                  error={formik.touched.pinCode && Boolean(formik.errors.pinCode)}
                  helperText={formik.touched.pinCode && formik.errors.pinCode}
                  fullWidth
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 6) {
                      value = value.slice(0, 6);
                    }
                    formik.setFieldValue('pinCode', value);
                    formik.setFieldTouched('pinCode', true);
                  }}
                  inputProps={{
                    maxLength: 6,
                    pattern: '[0-9]*',
                  }}
                  disabled={!disabled}
                />
              </ShakingTextField>
            </Grid>
          </SectionCard>

          <SectionCard title="Previous School">
            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.previousSchool && Boolean(formik.errors.previousSchool)}
              >
                <TextField
                  key="previousSchool"
                  size="small"
                  label="Previous School"
                  name="previousSchool"
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
            <Grid item xs={12} md={3}>
              <ShakingTextField
                error={formik.touched.lastClassPassed && Boolean(formik.errors.lastClassPassed)}
              >
                <TextField
                  key="lastClassPassed"
                  size="small"
                  label="Last Class Passed"
                  name="lastClassPassed"
                  value={formik.values.lastClassPassed}
                  onBlur={formik.handleBlur}
                  error={formik.touched.lastClassPassed && Boolean(formik.errors.lastClassPassed)}
                  helperText={formik.touched.lastClassPassed && formik.errors.lastClassPassed}
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
