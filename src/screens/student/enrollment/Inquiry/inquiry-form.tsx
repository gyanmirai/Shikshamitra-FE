import type { Dayjs } from 'dayjs';
import type { Board } from 'src/types/school';
import type { ICity, IState, ICountry } from 'country-state-city';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { Form, Field, Formik } from 'formik';
import { matchIsValidTel } from 'mui-tel-input';
import { useMemo, useState, useEffect } from 'react';
import { isEqual, cloneDeep, capitalize } from 'lodash';

import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Card,
  Button,
  Select,
  Divider,
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
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetInquiryPreferenceQuery } from 'src/redux/student/inquiry-preference/inquiry-preference-api';
import {
  useAddStudentInquiryMutation,
  useUpdateStudentInquiryMutation,
} from 'src/redux/student/inquiry/inquiry-api';

import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
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
  email: Yup.string().email('Invalid email').required('Email is required'),
  gender: Yup.string()
    // .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .required('Gender is required'),
  address: Yup.string(),
  parentsContactNo: Yup.string()
    .test('Mobile NO', 'Parents ContactNo is not valid', (value) =>
      matchIsValidTel((value || '') as string)
    )
    .required('Parents contact number is required'),
  alternateContactDetails: Yup.string()
    .test('Mobile NO', 'ContactNo is not valid', (value) =>
      value ? matchIsValidTel(value as string) : true
    )
    .test(
      'unique',
      'Alternate contact number cannot be same as parents contact number',
      function (value) {
        return !value || value !== this.parent.parentsContactNo;
      }
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
  country?: ICountry;
  city?: ICity;
  state?: IState;
  pinCode: number;
  medium: string;
  formNo: string | undefined;
  board: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  email: string;
}

const InquiryForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: IInquiryData | null;
}) => {
  const dialog = useBoolean();

  const initialValues: FormikValues = useMemo(
    () => ({
      medium: editData?.educationMediumId || '',
      academicYear: editData?.academicYearId || '',
      class: editData?.standardId || '',
      lastName: editData?.lastName || '',
      city: editData?.city || undefined,
      state: editData?.state || undefined,
      pinCode: editData?.pinCode || 0,
      firstName: editData?.firstName || '',
      middleName: editData?.middleName || '',
      dateOfBirth: editData?.dateOfBirth ? dayjs(editData?.dateOfBirth) : null,
      age: editData?.dateOfBirth ? calculateAge(dayjs(editData?.dateOfBirth).format()) : '',

      dateOfInquiry: editData?.dateOfInquiry ? dayjs(editData?.dateOfInquiry) : dayjs(new Date()),
      gender: editData?.genderType || GenderType.Male,
      address: editData?.address || '',
      parentsContactNo: editData?.parentContactNumber || '',
      alternateContactDetails: editData?.alternativeContactNumber || '',
      previousSchool: editData?.previousSchoolName || '',
      inquiryPreferences: editData?.inquiryPreferenceId || '',
      board: editData?.educationBoardId || '',
      formNo: editData?.formNumber || undefined,
      country: editData?.country || undefined,
      addressLine1: editData?.addressLine1 || '',
      addressLine2: editData?.addressLine2 || '',
      addressLine3: editData?.addressLine3 || '',
      email: editData?.email || '',
      // organization: editData?. || '',
    }),
    [editData]
  );
  const { RenderCountry, RenderState, RenderCity } = useStandardAddress();
  const { data: inquiryPreference, isLoading: inquiryPrefrenceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
  });

  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
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

  const [boards, setBoards] = useState([]);

  useEffect(() => {
    if (editData) {
      const findBoards = board?.items.filter(
        (item: Board) => item.academicYearId === editData.academicYearId
      );
      setBoards(findBoards);
    }
  }, [board?.items, editData]);
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
        {({
          errors,
          touched,
          handleChange,
          isSubmitting,
          setFieldValue,
          values,
          handleSubmit,
          handleBlur,
        }) => (
          <CheckIsChanges initialValues={initialValues} currentValue={values}>
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
                  <Grid item xs={12} md={4}>
                    <CustomSelect
                      name="academicYear"
                      label="Academic Year"
                      isLoading={yearLoading}
                      options={academicYear?.items || []}
                      value={values.academicYear}
                      labelKey="name"
                      valueKey="id"
                      onChange={(value) => {
                        const findBoards = board?.items.filter(
                          (item: Board) => item.academicYearId === value
                        );
                        setBoards(findBoards);
                        setFieldValue('board', '');
                        setFieldValue('academicYear', value);
                      }}
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
                      options={boards || []}
                      labelKey="name"
                      valueKey="id"
                      value={values.board}
                      onChange={(value) => {
                        setFieldValue('medium', '');

                        setFieldValue('board', value);
                      }}
                      error={!!(touched.board && errors.board) || false}
                      helperText={(touched.board && errors.board) || ''}
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      disabled={!values.academicYear}
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
                      onChange={async (value) => {
                        await getClassByMedium(value);
                        setFieldValue('medium', value);
                      }}
                      error={!!(touched.medium && errors.medium) || false}
                      helperText={(touched.medium && errors.medium) || ''}
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      size="small"
                      name="lastName"
                      label="Last Name"
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                      value={values.lastName}
                      onChange={(e) => {
                        const value = capitalize(e.target.value);

                        setFieldValue('lastName', value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      size="small"
                      name="firstName"
                      label="First Name"
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                      value={values.firstName}
                      onChange={(e) => {
                        const value = capitalize(e.target.value);

                        setFieldValue('firstName', value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      size="small"
                      name="middleName"
                      label="Middle Name"
                      error={touched.middleName && Boolean(errors.middleName)}
                      helperText={touched.middleName && errors.middleName}
                      value={values.middleName}
                      onChange={(e) => {
                        const value = capitalize(e.target.value);

                        setFieldValue('middleName', value);
                      }}
                    />
                  </Grid>
                  {editData && (
                    <Grid item xs={12} md={4}>
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
                  )}
                  <Grid item xs={12} md={4}>
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
                  <Grid item xs={12} md={4}>
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
                  <Grid item xs={12} md={4}>
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
                      disableFuture
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
                  <Grid item xs={12} md={4}>
                    <TextField
                      value={values.age}
                      fullWidth
                      size="small"
                      name="age"
                      label="Age"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
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
                  <Grid item xs={12} md={4}>
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
                  <Grid item xs={12} md={4}>
                    <TextField
                      value={values.email}
                      fullWidth
                      size="small"
                      name="email"
                      label="Email"
                      onChange={handleChange}
                      placeholder="Email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        startAdornment: (
                          <>
                            <Iconify icon="mdi-light:email" />{' '}
                            <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                          </>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
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
                      label="Parents Contact No."
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
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
                      onBlur={handleBlur}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
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
                    <RenderCountry
                      onChange={(_e, value) => {
                        setFieldValue('state', null);
                        setFieldValue('country', value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <RenderState
                      onChange={(_e, value) => {
                        setFieldValue('city', null);
                        setFieldValue('state', value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <RenderCity onChange={(_e, value) => setFieldValue('city', value)} />
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
          </CheckIsChanges>
        )}
      </Formik>
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Inquiry Preference">
        <InquiryPreferenceForm handleClose={dialog.onFalse} editData={null} />
      </CustomDialog>
    </Card>
  );
};

export default InquiryForm;

const CheckIsChanges = ({ initialValues, currentValue, children }: Record<string, any>) => {
  const isEqualValue = useMemo(
    () => isEqual(cloneDeep(initialValues), cloneDeep(currentValue)),
    [currentValue, initialValues]
  );

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setIsChanges(!isEqualValue));
  }, [dispatch, isEqualValue]);

  return children;
};
