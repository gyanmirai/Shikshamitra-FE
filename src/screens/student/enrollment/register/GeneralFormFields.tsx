import { capitalize } from 'lodash';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Radio,
  Divider,
  TextField,
  FormLabel,
  RadioGroup,
  FormHelperText,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fileToBase64 } from 'src/utils/file-to-base64';

import { GenderType, GenderTypeArray } from 'src/enums/gender';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import {
  CardActions,
  SectionCard,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { UploadAvatar } from 'src/components/upload';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
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

const RenderGeneralFormFields = (props: any) => {
  const { formik, isEdit: disabled, isMainForm = false } = props;
  const isGeneralFormEditable = useBoolean(isMainForm);
  const isStudentDetailsEditable = useBoolean(isMainForm);
  const isContactDetailsEditable = useBoolean(isMainForm);
  const isIdentificationEditable = useBoolean(isMainForm);
  const isAddressEditable = useBoolean(isMainForm);
  const isPreviousSchoolEditable = useBoolean(isMainForm);
  // console.log('formik ---register values--', formik.values);

  console.log(formik, 'formik================');

  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    await formik?.submitForm?.();
    if (Object.keys(validation).length > 0) return false;

    formik.resetForm({ values: formik.values });
    return undefined;
  };
  const handleCancel = () => {
    formik.resetForm();
  };

  return (
    <Box>
      <SectionCard
        title="Inquiry & Admission"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isGeneralFormEditable}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={3}>
          <ShakingTextField error={formik.touched.formNo && Boolean(formik.errors.formNo)}>
            <TextField
              fullWidth
              size="small"
              label="Form No.*"
              name="formNo"
              value={formik.values.formNo}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={formik.touched.formNo && Boolean(formik.errors.formNo)}
              helperText={formik.touched.formNo && formik.errors.formNo}
              disabled={!isGeneralFormEditable.value}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <RenderAcademicYear {...props} isEdit={Boolean(isGeneralFormEditable.value)} />
        </Grid>
        <Grid item xs={12} md={3}>
          <RenderBoard {...props} isEdit={Boolean(isGeneralFormEditable.value)} />
        </Grid>
        <Grid item xs={12} md={3}>
          <RenderMedium {...props} isEdit={Boolean(isGeneralFormEditable.value)} />
        </Grid>
        <Grid item xs={12} md={3}>
          <RenderClass {...props} isEdit={Boolean(isGeneralFormEditable.value)} />
        </Grid>
      </SectionCard>

      <SectionCard
        title="Student"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isStudentDetailsEditable}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={3}>
          <UploadAvatar
            maxSize={3145728}
            onDrop={async (acceptedFiles: File[]) => {
              const value = acceptedFiles[0];

              // Check if file size is within 3MB limit
              if (value.size > 3 * 1024 * 1024) {
                shikshaMitraToast.error({ message: 'File size should be less than 3MB.' });
                return;
              }

              const base64 = await fileToBase64(value);
              formik.setFieldValue('photo', base64);
              formik.setFieldTouched('photo', true);
            }}
            value={formik.values.photo}
            error={formik.touched.photo && Boolean(formik.errors.photo)}
            disabled={!isStudentDetailsEditable.value}
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
                    const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    const capitalized = capitalize(onlyLetters);

                    formik.setFieldValue('firstName', capitalized);
                    formik.setFieldTouched('firstName', true);
                  }}
                  disabled={!isStudentDetailsEditable.value}
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
                  label="Middle Name"
                  name="middleName"
                  value={formik.values.middleName}
                  onBlur={formik.handleBlur}
                  error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                  helperText={formik.touched.middleName && formik.errors.middleName}
                  fullWidth
                  onChange={(e: any) => {
                    const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    const capitalized = capitalize(onlyLetters);
                    formik.setFieldValue('middleName', capitalized);
                    formik.setFieldTouched('middleName', true);
                  }}
                  disabled={!isStudentDetailsEditable.value}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <ShakingTextField error={formik.touched.lastName && Boolean(formik.errors.lastName)}>
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
                    const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    const capitalized = capitalize(onlyLetters);
                    formik.setFieldValue('lastName', capitalized);
                    formik.setFieldTouched('lastName', true);
                  }}
                  disabled={!isStudentDetailsEditable.value}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <ShakingTextField error={formik.touched.dob && Boolean(formik.errors.dob)}>
                <DatePicker
                  label="Date of Birth *"
                  name="dob"
                  value={formik.values.dob}
                  disabled={!isStudentDetailsEditable.value}
                  format="DD-MM-YYYY"
                  onClose={() => formik.handleBlur('dob')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.dob && Boolean(formik.errors.dob),
                      helperText: formik.touched.dob && formik.errors.dob,
                      disabled: !isStudentDetailsEditable.value,
                    },
                  }}
                  onChange={(newValue) => {
                    // const date = newValue
                    // if (date) {
                    //   const age = calculateAge(date);
                    //   formik.setFieldValue('age', age);

                    // }
                    formik.setFieldValue('dob', newValue);
                    formik.setFieldTouched('dob', true);
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center">
                <FormLabel
                  sx={{
                    color: 'black',
                    marginRight: 2,
                    whiteSpace: 'nowrap',
                    '&.Mui-focused': { color: 'black' },
                    '&.Mui-error': { color: 'error.main' },
                  }}
                >
                  Gender *
                </FormLabel>

                <RadioGroup
                  row
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
                      disabled={!isStudentDetailsEditable.value}
                    />
                  ))}
                </RadioGroup>
              </Box>

              <FormHelperText error>{formik.touched.gender && formik.errors.gender}</FormHelperText>
            </Grid>
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard
        title="Contact Details"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isContactDetailsEditable}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={
              formik.touched.primaryContactNumber && Boolean(formik.errors.primaryContactNumber)
            }
          >
            <PhoneInput
              name="primaryContactNumber"
              disabled={!isContactDetailsEditable.value}
              value={formik.values.primaryContactNumber}
              onChange={(value) => {
                formik.setFieldValue('primaryContactNumber', value);
                formik.setFieldTouched('primaryContactNumber', true, true);
              }}
              label="Primary Contact No *"
              error={
                formik.touched.primaryContactNumber && Boolean(formik.errors.primaryContactNumber)
              }
              helperText={formik.touched.primaryContactNumber && formik.errors.primaryContactNumber}
              onBlur={formik.handleBlur}
              variant="outlined"
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <ShakingTextField
            error={
              formik.touched.secondaryContactNumber && Boolean(formik.errors.secondaryContactNumber)
            }
          >
            <PhoneInput
              name="secondaryContactNumber"
              value={formik.values.secondaryContactNumber}
              disabled={!isContactDetailsEditable.value}
              onChange={(value) => {
                formik.setFieldValue('secondaryContactNumber', value);
                formik.setFieldTouched('secondaryContactNumber', true, true);
              }}
              label="Secondary Contact No."
              onBlur={formik.handleBlur}
              error={
                formik.touched.secondaryContactNumber &&
                Boolean(formik.errors.secondaryContactNumber)
              }
              helperText={
                formik.touched.secondaryContactNumber && formik.errors.secondaryContactNumber
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
              disabled={!isContactDetailsEditable.value}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="mdi-light:email" />
                      <Divider orientation="vertical" flexItem sx={{ height: 24 }} />
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </ShakingTextField>
        </Grid>
      </SectionCard>

      <SectionCard
        title="Identification & Personal"
        headerContent={
          !isMainForm && (
            <CardActions
              isEdit={isIdentificationEditable}
              isLoading={formik.isSubmitting}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={3}>
          <ShakingTextField error={formik.touched.adharNo && Boolean(formik.errors.adharNo)}>
            <TextField
              key="adharNo"
              size="small"
              type="number"
              label="Aadhar No. *"
              name="adharNo"
              value={formik.values.adharNo}
              onBlur={formik.handleBlur}
              error={formik.touched.adharNo && Boolean(formik.errors.adharNo)}
              helperText={formik.touched.adharNo && formik.errors.adharNo}
              fullWidth
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 12) {
                  value = value.slice(0, 12);
                }

                formik.setFieldValue('adharNo', value);
                // formik.setFieldTouched('adharNo', true, true);
              }}
              inputProps={{
                maxLength: 12,
                pattern: '[0-9]*',
              }}
              onWheel={(e) => (e.target as HTMLElement).blur()}
              disabled={!isIdentificationEditable.value}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <ShakingTextField error={formik.touched.apparId && Boolean(formik.errors.apparId)}>
            <TextField
              key="apparId"
              size="small"
              type="number"
              label="Appar Id"
              name="apparId"
              value={formik.values.apparId}
              onBlur={formik.handleBlur}
              error={formik.touched.apparId && Boolean(formik.errors.apparId)}
              helperText={formik.touched.apparId && formik.errors.apparId}
              fullWidth
              // onChange={formik.handleChange}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 12) {
                  value = value.slice(0, 12);
                }
                formik.setFieldValue('apparId', value);
                // formik.setFieldTouched('apparId', true, true);
              }}
              inputProps={{
                maxLength: 12,
                pattern: '[0-9]*',
              }}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onWheel={(e) => (e.target as HTMLElement).blur()}
              disabled={!isIdentificationEditable.value}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <ShakingTextField error={formik.touched.panNo && Boolean(formik.errors.panNo)}>
            <TextField
              key="panNo"
              size="small"
              label="Pan No."
              name="panNo"
              value={formik.values.panNo.toUpperCase()}
              onBlur={formik.handleBlur}
              error={formik.touched.panNo && Boolean(formik.errors.panNo)}
              helperText={formik.touched.panNo && formik.errors.panNo}
              fullWidth
              disabled={!isIdentificationEditable.value}
              inputProps={{
                maxLength: 10,
                inputMode: 'text',
                pattern: '[A-Za-z0-9]{10}',
              }}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                const regex = /^[A-Za-z0-9]{0,10}$/;
                if (regex.test(value)) {
                  formik.setFieldValue('panNo', value);
                }
              }}
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={3}>
          <ShakingTextField
            error={formik.touched.inquiryPreference && Boolean(formik.errors.inquiryPreference)}
          >
            <RenderInquiryPrefrance {...props} disabled={!isIdentificationEditable.value} />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <ShakingTextField error={formik.touched.religion && Boolean(formik.errors.religion)}>
            <CustomSelect
              labelId="religion-label"
              // id="religion"
              value={formik.values.religion}
              onChange={(value) => {
                formik.setFieldValue('religion', value);
              }}
              size="small"
              onBlur={formik.handleBlur}
              label="Religion "
              name="religion"
              options={[
                { id: 'Hinduism', name: 'Hinduism' },
                { id: 'Islam', name: 'Islam' },
                { id: 'Christianity', name: 'Christianity' },
                { id: 'Sikhism', name: 'Sikhism' },
                { id: 'Buddhism', name: 'Buddhism' },
                { id: 'Jainism', name: 'Jainism' },
                { id: 'Judaism', name: 'Judaism' },
                { id: 'Zoroastrianism', name: 'Zoroastrianism' },
              ]}
              valueKey="id"
              labelKey="name"
              error={formik?.touched?.religion && formik.errors?.religion}
              helperText={formik?.touched?.religion && formik?.errors?.religion}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <ShakingTextField error={formik.touched.familyCast && Boolean(formik.errors.familyCast)}>
            <TextField
              key="familyCast *"
              size="small"
              label="Family Cast *"
              name="familyCast"
              value={formik.values.familyCast}
              onBlur={formik.handleBlur}
              error={formik.touched.familyCast && Boolean(formik.errors.familyCast)}
              helperText={formik.touched.familyCast && formik.errors.familyCast}
              fullWidth
              onChange={(e: any) => {
                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                const capitalized = capitalize(onlyLetters);
                const newName = capitalized
                  .split(' ')
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
                formik.setFieldValue('familyCast', newName);
                formik.setFieldTouched('familyCast', true, true);
              }}
              disabled={!isIdentificationEditable.value}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <ShakingTextField
            error={formik.touched.castCategory && Boolean(formik.errors.castCategory)}
          >
            <CustomSelect
              labelId="dropdown-label"
              id="dropdown"
              value={formik.values.castCategory}
              onChange={(val) => {
                formik.setFieldValue('castCategory', val);
              }}
              size="small"
              onBlur={formik.handleBlur}
              label="Cast Category *"
              name="castCategory"
              error={formik.touched.castCategory && Boolean(formik.errors.castCategory)}
              helperText={formik.touched.castCategory && formik.errors.castCategory}
              disabled={!isIdentificationEditable.value}
              options={EmployeeCastTypeArray.map((i, index) => ({
                value: index,
                label: EmployeeCastType[index],
              }))}
            />
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
                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                const capitalized = capitalize(onlyLetters);
                const newName = capitalized
                  .split(' ')
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
                formik.setFieldValue('nationality', newName);
                formik.setFieldTouched('nationality', true);
              }}
              disabled={!isIdentificationEditable.value}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <ShakingTextField error={formik.touched.birthPlace && Boolean(formik.errors.birthPlace)}>
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
                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                const capitalized = capitalize(onlyLetters);
                const newName = capitalized
                  .split(' ')
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
                formik.setFieldValue('birthPlace', newName);
                formik.setFieldTouched('birthPlace', true, true);
              }}
              disabled={!isIdentificationEditable.value}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <ShakingTextField
            error={formik.touched.motherTongue && Boolean(formik.errors.motherTongue)}
          >
            <CustomSelect
              labelId="mother-tongue-label"
              // id="motherTongue"
              name="motherTongue"
              value={formik.values.motherTongue}
              label="Mother Tongue"
              onChange={(value) => {
                formik.setFieldValue('motherTongue', value);
              }}
              onBlur={formik.handleBlur}
              options={[
                { id: 'English', name: 'English' },
                { id: 'Gujarati', name: 'Gujarati' },
                { id: 'Marathi', name: 'Marathi' },
                { id: 'Hindi', name: 'Hindi' },
              ]}
              valueKey="id"
              labelKey="name"
              error={formik?.touched?.motherTongue && formik.errors?.motherTongue}
              helperText={formik?.touched?.motherTongue && formik?.errors?.motherTongue}
            />
          </ShakingTextField>
        </Grid>
      </SectionCard>

      <SectionCard
        title="Address"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isAddressEditable}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
        <Grid item xs={12} md={3}>
          <ShakingTextField
            error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
          >
            <TextField
              key="addressLine1"
              size="small"
              label="Building No./Flat/ House No. *"
              name="addressLine1"
              value={formik.values.addressLine1}
              onBlur={formik.handleBlur}
              error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
              helperText={formik.touched.addressLine1 && formik.errors.addressLine1}
              fullWidth
              onChange={formik.handleChange}
              disabled={!isAddressEditable.value}
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
              label="Area/Locality/Road Name *"
              name="addressLine2"
              value={formik.values.addressLine2}
              onBlur={formik.handleBlur}
              error={formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)}
              helperText={formik.touched.addressLine2 && formik.errors.addressLine2}
              fullWidth
              onChange={formik.handleChange}
              disabled={!isAddressEditable.value}
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
              disabled={!isAddressEditable.value}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <ShakingTextField error={formik.touched.country && Boolean(formik.errors.country)}>
            <CountryComponent
              value={formik.values.country}
              onChange={(e, value) => {
                formik.setFieldValue('state', { name: '', isoCode: '' });
                formik.setFieldValue('country', { name: value?.name, isoCode: value?.isoCode });
              }}
              name="country"
              onBlur={formik.handleBlur}
              error={formik.touched.country && Boolean(formik.errors?.country?.name)}
              helperText={formik.touched.country && formik.errors?.country?.name}
              disabled={!isAddressEditable.value}
              textFieldProps={{
                label: 'Country *',
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <ShakingTextField error={formik.touched.state && Boolean(formik.errors.state)}>
            <StateComponent
              value={formik.values.state}
              onChange={(e, value) => {
                formik.setFieldValue('state', {
                  ...(value || {}),
                  name: value?.name,
                  isoCode: value?.isoCode,
                });
                formik.setFieldValue('city', { name: '' });
              }}
              onBlur={formik.handleBlur}
              countryValue={formik.values.country}
              error={formik.touched.state && Boolean(formik.errors?.state?.name)}
              helperText={formik.touched.state && formik.errors?.state?.name}
              disabled={!isAddressEditable.value || !formik.values.country}
              textFieldProps={{
                label: 'State *',
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <ShakingTextField error={formik.touched.city && Boolean(formik.errors.city)}>
            <CityComponent
              value={formik.values.city}
              onChange={(e, value) => {
                formik.setFieldValue('city', { name: value?.name });
              }}
              onBlur={formik.handleBlur}
              stateValue={formik.values.state}
              error={formik.touched.city && Boolean(formik.errors?.city?.name)}
              helperText={formik.touched.city && formik.errors?.city?.name}
              disabled={!isAddressEditable.value || !formik.values.state}
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
              label="PIN Code"
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
                formik.setFieldTouched('pinCode', true, true);
              }}
              inputProps={{
                maxLength: 6,
                pattern: '[0-9]*',
              }}
              disabled={!isAddressEditable.value}
            />
          </ShakingTextField>
        </Grid>
      </SectionCard>

      <SectionCard
        title="Previous School"
        headerContent={
          !isMainForm && (
            <CardActions
              isLoading={formik.isSubmitting}
              isEdit={isPreviousSchoolEditable}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )
        }
      >
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
              onChange={(e: any) => {
                const alphanumeric = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                const words = alphanumeric.split(' ');
                const capitalizedWords = words.map((word: string) => {
                  if (word) {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                  }
                  return '';
                });
                const newName = capitalizedWords.join(' ');
                formik.setFieldValue('previousSchool', newName);
                formik.setFieldTouched('previousSchool', true, true);
              }}
              disabled={!isPreviousSchoolEditable.value}
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
              onChange={(e: any) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                formik.setFieldValue('lastClassPassed', onlyNumbers);
                formik.setFieldTouched('lastClassPassed', true, true);
              }}
              disabled={!isPreviousSchoolEditable.value}
            />
          </ShakingTextField>
        </Grid>
      </SectionCard>
    </Box>
  );
};

export const generalFormFields: FieldsType[] = [
  {
    name: 'inquiryNo',
    label: 'Inquiry No',
    type: 'text',
    otherProps: { disabled: true, autoFocus: true },
    gridProps: { xs: 12, md: 12 },
    renderComp(props) {
      return <RenderGeneralFormFields {...props} />;
    },
  },
];
