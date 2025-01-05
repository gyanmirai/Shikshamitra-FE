import type { Dayjs } from 'dayjs';
import type { Board } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { Form, Field, Formik } from 'formik';
import { matchIsValidTel } from 'mui-tel-input';

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
  FormControl,
  DialogActions,
} from '@mui/material';

import calculateAge from 'src/utils/calculate-age';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetClassQuery } from 'src/redux/class/classApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import { GenderType, GenderTypeArray } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetInquiryPreferenceQuery } from 'src/redux/student/inquiry-preference/inquiry-preference-api';
import {
  useAddStudentInquiryMutation,
  useUpdateStudentInquiryMutation,
} from 'src/redux/student/inquiry/inquiry-api';

import PhoneInput from 'src/components/phone-input';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

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
  address: Yup.string().required('Address is required'),
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
  state: Yup.string().required('State is required'),
  city: Yup.string().required('City is required'),
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
  formNo: string;
  board: string;
}

const InquiryForm = ({
  handleClose,
  editData,
}: {
  handleClose: () => void;
  editData: IInquiryData | null;
}) => {
  const initialValues = {
    // inquiryNumber: '12345',
    // organization: '',
    medium: editData?.educationMediumId || '',
    academicYear: editData?.academicYearId || '',
    class: editData?.standerdId || '',
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
    formNo: editData?.formNumber || '',
    // organization: editData?. || '',
  };
  const { data: inquiryPreference, isLoading: inquiryPrefrenceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
  });
  const { data: classes, isLoading: classLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  const [addInquiry] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentInquiryMutation,
  });
  const [updateInquiry] = useQueryAndMutation({
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
                  educationMediumId: values.medium,
                  academicYearId: values.academicYear,
                  standerdId: values.class,
                  inquiryPreferenceId: values.inquiryPreferences,

                  educationBoardId: values.board,
                },
              });
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
                educationMediumId: values.medium,
                academicYearId: values.academicYear,
                standerdId: values.class,
                inquiryPreferenceId: values.inquiryPreferences,
                educationBoardId: values.board,
              });
            }
            handleClose();
          } catch (error) {
            console.error('Error:', error);
          }
        }}
      >
        {({ errors, touched, handleChange, isSubmitting, setFieldValue, values, handleSubmit }) => (
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
                    onChange={(value) => setFieldValue('medium', value)}
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
                    isLoading={classLoading}
                    labelKey="name"
                    valueKey="id"
                    options={classes?.items}
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
                    label="Enquiry Preferences"
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
                </Grid>
                <Grid item xs={4}>
                  <Field
                    as={TextField}
                    fullWidth
                    size="small"
                    name="city"
                    label="City"
                    error={touched.city && errors.city}
                    helperText={touched.city && errors.city}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Field
                    as={TextField}
                    fullWidth
                    size="small"
                    name="state"
                    label="State"
                    error={touched.state && errors.state}
                    helperText={touched.state && errors.state}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Field
                    as={TextField}
                    fullWidth
                    size="small"
                    name="pinCode"
                    label="Pincode"
                    error={touched.pinCode && errors.pinCode}
                    helperText={touched.pinCode && errors.pinCode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    size="small"
                    name="address"
                    label="Address"
                    error={touched.address && errors.address}
                    helperText={touched.address && errors.address}
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
            </Scrollbar>
            <DialogActions sx={{ flexShrink: 0, p: 2 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained">
                Submit
              </Button>
            </DialogActions>
          </Box>
        )}
      </Formik>
    </Card>
  );
};

export default InquiryForm;
