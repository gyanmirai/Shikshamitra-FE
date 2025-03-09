import type { Dayjs } from 'dayjs';
import type { Board } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { Form, Field, Formik } from 'formik';
import { matchIsValidTel } from 'mui-tel-input';

import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Card,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import calculateAge from 'src/utils/calculate-age';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import { GenderType, GenderTypeArray } from 'src/enums/gender';
import { InquiryStatusType } from 'src/enums/inquiry-status-type';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByOrganizationIdQuery } from 'src/redux/class/classApi';
import { useGetInquiryPreferenceQuery } from 'src/redux/student/inquiry-preference/inquiry-preference-api';
import {
  useAddStudentInquiryMutation,
  useUpdateStudentInquiryMutation,
} from 'src/redux/student/inquiry/inquiry-api';

import PhoneInput from 'src/components/phone-input';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import StandardAddress, { useStandardAddress } from 'src/components/stardard-address';

import { InquiryPreferenceForm } from '../setting/inquiryPreference';

import type { IInquiryData } from '.';

const validationSchema = Yup.object().shape({
  inquiryNumber: Yup.string(),
  organization: Yup.string(),
  academicYear: Yup.string().required('Academic Year is required'),
  class: Yup.string().required('Class is required'),
  lastName: Yup.string().required('Last name is required'),
  firstName: Yup.string().required('First name is required'),
  middleName: Yup.string(),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  age: Yup.string().required('Age is required'),
  dateOfInquiry: Yup.date().required('Date of inquiry is required'),
  gender: Yup.string()
    // .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .required('Gender is required'),
  address: Yup.string(),
  parentsContactNo: Yup.string()
    .test('Mobile NO', 'Parents ContactNo is not valid', (value) =>
      matchIsValidTel((value || '') as string)
    )
    .required('Parents contact number is required'),
  alternateContactDetails: Yup.string().test('Mobile NO', 'ContactNo is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  previousSchool: Yup.string(),
  inquiryPreferences: Yup.string(),
  pinCode: Yup.number()
    .test('picode', 'Must be exactly 6 numbers', (value) => !!`${value}`.match(/\b\d{6}\b/))
    .required('Pin code is required'),
  state: Yup.string(),
  city: Yup.string(),
  // board: Yup.string().required('Board is required'),
  // medium: Yup.string().required('Medium is required'),
});

interface FormikValues {
  // inquiryNumber: string;
  // organization: string;
  academicYear: string;
  class: string;
  lastName: string;
  firstName: string;
  middleName: string;
  dateOfBirth: Dayjs | null;
  age: string | number;
  dateOfInquiry: Dayjs | null;
  gender: GenderType;
  address: string;
  parentsContactNo: string;
  alternateContactDetails: string;
  previousSchool: string;
  inquiryPreferences: string;
  city: string;
  state: string;
  pinCode: number;
  medium: string;
  formNo: string | undefined;
  board: string;
  country: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
}

const InquiryForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: IInquiryData | null;
}) => {
  const dialog = useBoolean();
  const initialValues = {
    // inquiryNumber: '12345',
    // organization: '',
    medium: editData?.educationMediumId || '',
    academicYear: editData?.academicYearId || '',
    class: editData?.standardId || '',
    lastName: editData?.lastName || '',
    city: editData?.city || '',
    state: editData?.state || '',
    pinCode: editData?.pinCode || 0,
    firstName: editData?.firstName || '',
    middleName: editData?.middleName || '',
    dateOfBirth: editData?.dateOfBirth ? dayjs(editData?.dateOfBirth) : null,
    age: editData?.dateOfBirth ? calculateAge(dayjs(editData?.dateOfBirth).format()) : '',
    // age: editData?.age || '',
    dateOfInquiry: editData?.dateOfInquiry ? dayjs(editData?.dateOfInquiry) : dayjs(new Date()),
    gender: editData?.genderType || GenderType.Male,
    address: editData?.address || '',
    parentsContactNo: editData?.parentContactNumber || '',
    alternateContactDetails: editData?.alternativeContactNumber || '',
    previousSchool: editData?.previousSchoolName || '',
    inquiryPreferences: editData?.inquiryPreferenceId || '',
    board: editData?.educationBoardId || '',
    formNo: editData?.formNumber || undefined,
    country: editData?.country || '',
    addressLine1: editData?.addressLine1 || '',
    addressLine2: editData?.addressLine2 || '',
    addressLine3: editData?.addressLine3 || '',
    // organization: editData?. || '',
  };
  const { renderCountry, renderState, renderCity } = useStandardAddress();
  const { data: inquiryPreference, isLoading: inquiryPrefrenceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
  });

  const [getClassByOrganization, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByOrganizationIdQuery,
  });
  const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  const [addInquiry, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentInquiryMutation,
  });
  const [updateInquiry, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentInquiryMutation,
  });

  return (
    <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (
          values: FormikValues,
          { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
        ) => {
          try {
            if (editData) {
              await updateInquiry({
                id: editData.id,
                body: {
                  firstName: values.firstName,
                  middleName: values.middleName,
                  lastName: values.lastName,
                  formNumber: values.formNo,
                  previousSchoolName: values.previousSchool,
                  dateOfBirth: dateConvertor(values.dateOfBirth?.format(dateFormat) || '') || '',
                  // age: values.age,
                  dateOfInquiry:
                    dateConvertor(values.dateOfInquiry?.format(dateFormat) || '') || '',
                  genderType: values.gender,
                  parentContactNumber: values.parentsContactNo,
                  alternativeContactNumber: values.alternateContactDetails,
                  city: values.city,
                  state: values.state,
                  pinCode: values.pinCode,
                  address: values.address,
                  inquiryStatusType: 0,
                  educationMediumId: values.medium,
                  academicYearId: values.academicYear,
                  standardId: values.class,
                  inquiryPreferenceId: values.inquiryPreferences,

                  educationBoardId: values.board,
                },
              }).unwrap();
            } else {
              await addInquiry({
                firstName: values.firstName,
                middleName: values.middleName,
                lastName: values.lastName,
                formNumber: values.formNo,
                previousSchoolName: values.previousSchool,
                dateOfBirth: dateConvertor(values.dateOfBirth?.format(dateFormat) || '') || '',
                // age: values.age,
                dateOfInquiry: dateConvertor(values.dateOfInquiry?.format(dateFormat) || '') || '',
                genderType: values.gender,
                parentContactNumber: values.parentsContactNo,
                alternativeContactNumber: values.alternateContactDetails,
                city: values.city,
                state: values.state,
                pinCode: values.pinCode,
                address: values.address,
                inquiryStatusType: InquiryStatusType.Pending,
                educationMediumId: values.medium,
                academicYearId: values.academicYear,
                standardId: values.class,
                inquiryPreferenceId: values.inquiryPreferences,
                educationBoardId: values.board,
              }).unwrap();
            }
            handleClose(null, true);
          } catch (error) {
            console.error('Error:', error);
          }
        }}
      >
        {({ errors, touched, handleChange, isSubmitting, setFieldValue, values, handleSubmit }) => (
          <BackPopUpChecked initialValues={initialValues} currentValues={values}>
            <Box
              component={Form}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              onSubmit={handleSubmit}
            >
              <Scrollbar
                sx={{
                  p: 2,
                  height: '100%',
                }}
              >
                <Grid container spacing={3}>
                  {/* <Grid item xs={12} md={4}>
                  <Field
                    as={TextField}
                    fullWidth
                    size="small"
                    name="inquiryNumber"
                    label="Enquiry Number"
                    disabled
                  />
                </Grid> */}
                  <Grid item xs={12} md={4}>
                    <CustomSelect
                      name="academicYear"
                      label="Academic Year"
                      isLoading={yearLoading}
                      options={academicYear?.items || []}
                      value={values.academicYear}
                      labelKey="name"
                      valueKey="id"
                      onChange={(value) => setFieldValue('academicYear', value)}
                      error={!!(touched.academicYear && errors.academicYear) || false}
                      helperText={(touched.academicYear && errors.academicYear) || ''}
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <CustomSelect
                      name="board"
                      label="Board"
                      isLoading={boardLoading}
                      options={board?.items || []}
                      labelKey="name"
                      valueKey="id"
                      value={values.board}
                      onChange={(value) => setFieldValue('board', value)}
                      error={!!(touched.board && errors.board) || false}
                      helperText={(touched.board && errors.board) || ''}
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <CustomSelect
                      name="medium"
                      label="Medium"
                      disabled={!values.board}
                      options={
                        board?.items?.find((item: Board) => item.id === values.board)
                          ?.educationMediums || []
                      }
                      value={values.medium}
                      labelKey="name"
                      valueKey="id"
                      onChange={(value) => {
                        getClassByOrganization(value);
                        setFieldValue('medium', value);
                      }}
                      error={!!(touched.medium && errors.medium) || false}
                      helperText={(touched.medium && errors.medium) || ''}
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    />
                  </Grid>
                  {/* <Grid item xs={12} md={4}>
                  <CustomSelect
                    name="organization"
                    label="organization"
                    options={[]}
                    value={values.organization}
                    onChange={(value) => setFieldValue('organization', value)}
                    error={!!(touched.organization && errors.organization) || false}
                    helperText={(touched.organization && errors.organization) || ''}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </Grid> */}

                  <Grid item xs={4}>
                    <Field
                      as={TextField}
                      fullWidth
                      size="small"
                      name="lastName"
                      label="Last Name"
                      error={touched.lastName && errors.lastName}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Field
                      as={TextField}
                      fullWidth
                      size="small"
                      name="firstName"
                      label="First Name"
                      error={touched.firstName && errors.firstName}
                      helperText={touched.firstName && errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Field
                      as={TextField}
                      fullWidth
                      size="small"
                      name="middleName"
                      label="Middle Name"
                      error={touched.middleName && errors.middleName}
                      helperText={touched.middleName && errors.middleName}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      size="small"
                      name="formNo"
                      label="Form Number"
                      error={touched.formNo && errors.formNo}
                      helperText={touched.formNo && errors.formNo}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomSelect
                      name="class"
                      label="Class"
                      disabled={!values.medium}
                      isLoading={classLoading}
                      labelKey="name"
                      valueKey="id"
                      options={classes || []}
                      value={values.class}
                      onChange={(value) => setFieldValue('class', value)}
                      error={!!(touched.class && errors.class) || false}
                      helperText={(touched.class && errors.class) || ''}
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      size="small"
                      name="previousSchool"
                      label="Previous School"
                      error={touched.previousSchool && errors.previousSchool}
                      helperText={touched.previousSchool && errors.previousSchool}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Date of Birth"
                      name="dateOfBirth"
                      value={values.dateOfBirth}
                      format="DD/MM/YYYY"
                      onChange={(newValue) => {
                        const date = newValue?.format();
                        if (date) {
                          const age = calculateAge(date);
                          setFieldValue('age', age);
                        }
                        setFieldValue('dateOfBirth', newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          helperText: touched.dateOfBirth && (errors.dateOfBirth as string),
                          error: touched.dateOfBirth && Boolean(errors.dateOfBirth),
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      value={values.age}
                      fullWidth
                      size="small"
                      name="age"
                      label="Age"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Date of Inquiry"
                      name="dateOfInquiry"
                      value={values.dateOfInquiry}
                      format="DD/MM/YYYY"
                      onChange={(newValue) => setFieldValue('dateOfInquiry', newValue)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          helperText: touched.dateOfInquiry && (errors.dateOfInquiry as string),
                          error: touched.dateOfInquiry && Boolean(errors.dateOfInquiry),
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id="dropdown-label" size="small">
                        Gender
                      </InputLabel>
                      <Select
                        labelId="dropdown-label"
                        id="dropdown"
                        value={values.gender}
                        onChange={handleChange}
                        size="small"
                        label="Gender"
                        name="gender"
                      >
                        {GenderTypeArray.map((i, index) => (
                          <MenuItem key={i} value={index}>
                            {GenderType[index]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}>
                    <PhoneInput
                      name="parentsContactNo"
                      value={values.parentsContactNo}
                      onChange={(value) => {
                        setFieldValue('parentsContactNo', value);
                      }}
                      placeholder="Parents Contact No."
                      error={touched.parentsContactNo && Boolean(errors.parentsContactNo)}
                      helperText={touched.parentsContactNo && errors.parentsContactNo}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <PhoneInput
                      name="alternateContactDetails"
                      value={values.alternateContactDetails}
                      onChange={(value) => {
                        setFieldValue('alternateContactDetails', value);
                      }}
                      placeholder="Alternate Contact Details"
                      error={
                        touched.alternateContactDetails && Boolean(errors.alternateContactDetails)
                      }
                      helperText={touched.alternateContactDetails && errors.alternateContactDetails}
                      variant="outlined"
                      label="Alternate Contact Details"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <CustomSelect
                      label="Inquiry Preferences"
                      name="inquiryPreferences"
                      isLoading={inquiryPrefrenceLoading}
                      options={inquiryPreference?.items || []}
                      value={values.inquiryPreferences}
                      labelKey="preferenceName"
                      valueKey="id"
                      onChange={(value) => setFieldValue('inquiryPreferences', value)}
                      formControlProps={{
                        fullWidth: true,
                        sx: {
                          maxWidth: 'unset',
                        },
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      textAlign="right"
                      color="primary.main"
                      fontSize={12}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        dialog.onTrue();
                      }}
                    >
                      add Inquiry Preferences
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <StandardAddress.RenderAddressField
                      name="addressLine1"
                      label="Address Line 1"
                      value={values.addressLine1}
                      onChange={handleChange}
                      error={touched.addressLine1 && Boolean(errors.addressLine1)}
                      helperText={touched.addressLine1 && errors.addressLine1}
                      fullWidth
                      placeholder="Address Line 1"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <StandardAddress.RenderAddressField
                      name="addressLine2"
                      label="Address Line 2"
                      value={values.addressLine2}
                      onChange={handleChange}
                      error={touched.addressLine2 && Boolean(errors.addressLine2)}
                      helperText={(touched.addressLine2 && errors.addressLine2) || ''}
                      fullWidth
                      placeholder="Address Line 2"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <StandardAddress.RenderAddressField
                      name="addressLine3"
                      label="Address Line 3"
                      value={values.addressLine3}
                      onChange={handleChange}
                      error={touched.addressLine3 && Boolean(errors.addressLine3)}
                      helperText={(touched.addressLine3 && errors.addressLine3) || ''}
                      fullWidth
                      placeholder="Address Line 3"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    {renderCountry()}

                    {/* <StandardAddress.RenderCountry
                    name="country"
                    value={values.country}
                    onChange={(value) => setFieldValue('country', value)}
                    error={touched.country && Boolean(errors.country)}
                    helperText={(touched.country && errors.country) || ''}
                    fullWidth
                    placeholder="Country"
                    size="small"
                    label="Country"
                    options={[]}
                  /> */}
                  </Grid>
                  <Grid item xs={4}>
                    {renderState()}
                    {/* <StandardAddress.RenderState
                    name="state"
                    value={values.state}
                    onChange={handleChange}
                    error={touched.state && Boolean(errors.state)}
                    helperText={(touched.state && errors.state) || ''}
                    fullWidth
                    placeholder="State"
                    size="small"
                    label="State"
                    options={[]}
                  /> */}
                  </Grid>
                  <Grid item xs={4}>
                    {renderCity()}
                    {/* <StandardAddress.RenderCity
                    name="city"
                    value={values.city}
                    onChange={handleChange}
                    error={touched.city && Boolean(errors.city)}
                    helperText={(touched.city && errors.city) || ''}
                    fullWidth
                    placeholder="City"
                    size="small"
                    label="City"
                    options={[]}
                  /> */}
                  </Grid>
                  <Grid item xs={4}>
                    <StandardAddress.RenderPincode
                      name="pinCode"
                      value={values.pinCode}
                      onChange={handleChange}
                      error={touched.pinCode && Boolean(errors.pinCode)}
                      helperText={touched.pinCode && errors.pinCode}
                      fullWidth
                      placeholder="Pincode"
                      size="small"
                      label="Pincode"
                    />
                  </Grid>
                </Grid>
              </Scrollbar>
              <DialogActions sx={{ flexShrink: 0, p: 2 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton
                  loading={isAddLoading || isUpdateLoading}
                  type="submit"
                  variant="contained"
                >
                  Submit
                </LoadingButton>
              </DialogActions>
            </Box>
          </BackPopUpChecked>
        )}
      </Formik>

      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Inquiry Preference">
        <InquiryPreferenceForm handleClose={dialog.onFalse} editData={null} />
      </CustomDialog>
    </Card>
  );
};

export default InquiryForm;
