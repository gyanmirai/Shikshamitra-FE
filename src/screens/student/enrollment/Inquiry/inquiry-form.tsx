import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { Form, Field, Formik } from 'formik';

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

import { useGetClassQuery } from 'src/redux/class/classApi';
import { GenderType, GenderTypeArray } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetInquiryPreferenceQuery } from 'src/redux/student/inquiry-preference/inquiry-preference-api';
import {
  useAddStudentInquiryMutation,
  useUpdateStudentInquiryMutation,
} from 'src/redux/student/inquiry/inquiry-api';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

import type { IInquiryData } from '.';

const validationSchema = Yup.object().shape({
  inquiryNumber: Yup.string().required('Inquiry number is required'),
  organization: Yup.string().required('Organization is required'),
  academicYear: Yup.string().required('Academic Year is required'),
  class: Yup.string().required('Class is required'),
  lastName: Yup.string().required('Last name is required'),
  firstName: Yup.string().required('First name is required'),
  middleName: Yup.string(),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  age: Yup.number()
    .positive('Age must be positive')
    .integer('Age must be an integer')
    .required('Age is required'),
  dateOfInquiry: Yup.date().required('Date of inquiry is required'),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .required('Gender is required'),
  address: Yup.string().required('Address is required'),
  parentsContactNo: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(10, 'Must be at least 10 digits')
    .required('Parents contact number is required'),
  alternateContactDetails: Yup.string(),
  previousSchool: Yup.string(),
  inquiryPreferences: Yup.string(),
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
    age: editData?.age || '',
    dateOfInquiry: editData?.dateOfInquiry ? dayjs(editData?.dateOfInquiry) : dayjs(new Date()),
    gender: editData?.genderType || GenderType.Male,
    address: editData?.address || '',
    parentsContactNo: editData?.parentContactNumber || '',
    alternateContactDetails: editData?.alternativeContactNumber || '',
    previousSchool: editData?.previousSchoolName || '',
    inquiryPreferences: editData?.inquiryPreferenceId || '',
    formNo: editData?.formNumber || '',
  };
  const { data: inquiryPreference, isLoading: inquiryPrefrenceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
  });
  const { data: classes, isLoading: classLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
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
                  dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD') || '',
                  age: values.age,
                  dateOfInquiry: values.dateOfInquiry?.format('YYYY-MM-DD') || '',
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
                },
              });
            } else {
              await addInquiry({
                firstName: values.firstName,
                middleName: values.middleName,
                lastName: values.lastName,
                formNumber: values.formNo,
                previousSchoolName: values.previousSchool,
                dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD') || '',
                age: values.age,
                dateOfInquiry: values.dateOfInquiry?.format('YYYY-MM-DD') || '',
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
              });
            }
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
                    name="medium"
                    label="Medium"
                    options={[]}
                    value={values.medium}
                    onChange={(value) => setFieldValue('medium', value)}
                    error={!!(touched.medium && errors.medium) || false}
                    helperText={(touched.medium && errors.medium) || ''}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <CustomSelect
                    name="academicYear"
                    label="Academic Year"
                    options={[]}
                    value={values.academicYear}
                    onChange={(value) => setFieldValue('academicYear', value)}
                    error={!!(touched.academicYear && errors.academicYear) || false}
                    helperText={(touched.academicYear && errors.academicYear) || ''}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </Grid>

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
                  <Field
                    as={TextField}
                    fullWidth
                    size="small"
                    name="parentsContactNo"
                    label="Parents Co. No."
                    error={touched.parentsContactNo && errors.parentsContactNo}
                    helperText={touched.parentsContactNo && errors.parentsContactNo}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    size="small"
                    name="alternateContactDetails"
                    label="Alternate Contact Details"
                    error={touched.alternateContactDetails && errors.alternateContactDetails}
                    helperText={touched.alternateContactDetails && errors.alternateContactDetails}
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
