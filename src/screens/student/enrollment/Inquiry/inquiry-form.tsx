import type { FastFieldProps } from 'formik';
import type { Board } from 'src/types/school';

import { useDispatch } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { isEqual, cloneDeep, capitalize } from 'lodash';
import { Form, Field, Formik, FastField } from 'formik';

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

import { GlobalIcons } from 'src/utils/icons';
import calculateAge from 'src/utils/calculate-age';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import { GenderType, GenderTypeArray } from 'src/enums/gender';
import { FollowUpStatusType } from 'src/enums/inquiry-status-type';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
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
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import { inquiryInitialValues } from './initialvalues';
import { inquiryValidationSchema } from './validationSchema';
import { InquiryPreferenceForm } from '../setting/inquiryPreference';

import type { IInquiryData } from '.';
import type { IInquiryFormValues } from './type';

/**
 * InquiryForm Component
 *
 * This component renders a form for managing student inquiries. It supports both adding new inquiries
 * and editing existing ones. The form is built using Formik for form state management and validation.
 *
 * @param {Object} props - The props for the InquiryForm component.
 * @param {(e: any, isSubmit?: boolean) => void} props.handleClose - Function to handle closing the form dialog.
 * @param {IInquiryData | null} props.editData - Data for editing an existing inquiry. If null, the form is for adding a new inquiry.
 *
 * @returns {JSX.Element} The rendered InquiryForm component.
 */
const InquiryForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: IInquiryData | null;
}) => {
  const dialog = useBoolean();

  const initialValues: IInquiryFormValues = useMemo(
    () => inquiryInitialValues(editData),
    [editData]
  );

  /**
   * Hook to fetch inquiry preference data
   */
  const { data: inquiryPreference, isLoading: inquiryPrefrenceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
  });

  /**
   * Hook to get classes by medium
   */
  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  /**
   * Hook to fetch academic year data
   */
  const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });

  /**
   * Hook to fetch board data
   */
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  /**
   * Hook to add new student inquiry
   */
  const [addInquiry, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentInquiryMutation,
  });

  /**
   * Hook to update existing student inquiry
   */
  const [updateInquiry, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentInquiryMutation,
  });

  /**
   * State to store filtered boards based on academic year
   */
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    if (editData) {
      // Filter boards based on academic year ID from edit data
      const findBoards = board?.items.filter(
        (item: Board) => item.academicYearId === editData.academicYearId
      );
      setBoards(findBoards);

      // Fetch classes if education medium ID exists in edit data
      if (editData.educationMediumId) {
        getClassByMedium(editData.educationMediumId);
      }
    }
  }, [board?.items, editData, getClassByMedium]);

  /**
   * Handles form submission for both adding and updating student inquiries
   * @param values - Form values containing student inquiry details
   * @param setSubmitting - Function to set form submission state
   * @returns Promise<void>
   */
  const onSubmit = async (values: IInquiryFormValues) => {
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
            dateOfInquiry: dateConvertor(values.dateOfInquiry?.format(dateFormat) || '') || '',
            genderType: values.gender,
            parentContactNumber: values.parentsContactNo,
            alternativeContactNumber: values.alternateContactDetails,
            city: values?.city?.name,
            state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
            country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
            pinCode: values.pinCode,
            addressLine1: values.addressLine1,
            addressLine2: values.addressLine2,
            addressLine3: values.addressLine3,
            inquiryStatusType: 0,
            educationMediumId: values.medium,
            academicYearId: values.academicYear,
            standardId: values.class,
            inquiryPreferenceId: values.inquiryPreferences,
            email: values.email,
            educationBoardId: values.board,
            village: values.village,
          },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Inquiry updated successfully' });
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
          city: values?.city?.name,
          state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
          country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
          pinCode: values.pinCode,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2,
          addressLine3: values.addressLine3,
          inquiryStatusType: FollowUpStatusType.Pending,
          educationMediumId: values.medium,
          academicYearId: values.academicYear,
          standardId: values.class,
          inquiryPreferenceId: values.inquiryPreferences,
          educationBoardId: values.board,
          email: values.email,
          village: values.village,
        }).unwrap();
        shikshaMitraToast.success({ message: 'Inquiry added successfully' });
      }
      handleClose(null, true);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
      <Formik
        initialValues={initialValues}
        validationSchema={inquiryValidationSchema}
        onSubmit={onSubmit}
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
            {console.log(errors, 'errors')}
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
                <SectionCard title="Basic Details">
                  <Grid item xs={12} md={4}>
                    <ShakingTextField
                      error={!!(touched.academicYear && errors.academicYear) || false}
                    >
                      <CustomSelect
                        name="academicYear"
                        label="Academic Year *"
                        isLoading={yearLoading}
                        options={academicYear?.items || []}
                        value={values.academicYear}
                        labelKey="name"
                        valueKey="id"
                        autoFocus
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
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ShakingTextField error={!!(touched.board && errors.board) || false}>
                      <CustomSelect
                        name="board"
                        label="Board *"
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
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ShakingTextField error={!!(touched.medium && errors.medium) || false}>
                      <CustomSelect
                        name="medium"
                        label="Medium *"
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
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ShakingTextField error={!!(touched.class && errors.class) || false}>
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
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={4}>
                    <ShakingTextField error={!!(touched.firstName && errors.firstName) || false}>
                      <TextField
                        fullWidth
                        size="small"
                        name="firstName"
                        label="First Name *"
                        error={touched.firstName && Boolean(errors.firstName)}
                        helperText={touched.firstName && errors.firstName}
                        value={values.firstName}
                        onChange={(e) => {
                          const value = capitalize(e.target.value);
                          setFieldValue('firstName', value);
                        }}
                      />
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={4}>
                    <ShakingTextField error={!!(touched.middleName && errors.middleName) || false}>
                      <TextField
                        fullWidth
                        size="small"
                        name="middleName"
                        label="Middle Name *"
                        error={touched.middleName && Boolean(errors.middleName)}
                        helperText={touched.middleName && errors.middleName}
                        value={values.middleName}
                        onChange={(e) => {
                          const value = capitalize(e.target.value);
                          setFieldValue('middleName', value);
                        }}
                      />
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={4}>
                    <ShakingTextField error={!!(touched.lastName && errors.lastName) || false}>
                      <FastField name="lastName">
                        {({ field, form, meta }: FastFieldProps) => (
                          <TextField
                            fullWidth
                            size="small"
                            name="lastName"
                            label="Last Name *"
                            error={meta.touched && Boolean(meta.error)}
                            helperText={meta.touched && meta.error}
                            value={field.value}
                            onChange={(e) => {
                              const value = capitalize(e.target.value);
                              form.setFieldValue('lastName', value);
                            }}
                          />
                        )}
                      </FastField>
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ShakingTextField
                      error={!!(touched.dateOfBirth && errors.dateOfBirth) || false}
                    >
                      <DatePicker
                        label="Date of Birth *"
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
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ShakingTextField error={!!(touched.gender && errors.gender) || false}>
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
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ShakingTextField
                      error={!!(touched.previousSchool && errors.previousSchool) || false}
                    >
                      <Field
                        as={TextField}
                        fullWidth
                        size="small"
                        name="previousSchool"
                        label="Previous School"
                        error={touched.previousSchool && errors.previousSchool}
                        helperText={touched.previousSchool && errors.previousSchool}
                      />
                    </ShakingTextField>
                  </Grid>
                </SectionCard>

                <SectionCard title="Inquiry Details">
                  <Grid item xs={12} md={4}>
                    <ShakingTextField
                      error={!!(touched.dateOfInquiry && errors.dateOfInquiry) || false}
                    >
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
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ShakingTextField>
                      <CustomSelect
                        label="Inquiry Type"
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
                    </ShakingTextField>
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
                      add Inquiry Type
                    </Typography>
                  </Grid>
                </SectionCard>

                <SectionCard title="Contact Information">
                  <Grid item xs={12} md={4}>
                    <ShakingTextField error={!!(touched.email && errors.email) || false}>
                      <TextField
                        value={values.email}
                        fullWidth
                        size="small"
                        name="email"
                        label="Email *"
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
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ShakingTextField
                      error={!!(touched.parentsContactNo && errors.parentsContactNo) || false}
                    >
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
                        label="Parents Contact No. *"
                        size="small"
                      />
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ShakingTextField
                      error={
                        !!(touched.alternateContactDetails && errors.alternateContactDetails) ||
                        false
                      }
                    >
                      <PhoneInput
                        name="alternateContactDetails"
                        value={values.alternateContactDetails}
                        onChange={(value) => {
                          setFieldValue('alternateContactDetails', value);
                        }}
                        placeholder="Alternate Contact No."
                        error={
                          touched.alternateContactDetails && Boolean(errors.alternateContactDetails)
                        }
                        helperText={
                          touched.alternateContactDetails && errors.alternateContactDetails
                        }
                        variant="outlined"
                        label="Alternate Contact No."
                        onBlur={handleBlur}
                      />
                    </ShakingTextField>
                  </Grid>
                </SectionCard>
                <SectionCard title="Address">
                  <Grid item xs={12} md={4}>
                    <ShakingTextField
                      error={!!(touched.addressLine1 && errors.addressLine1) || false}
                    >
                      <TextField
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
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ShakingTextField
                      error={!!(touched.addressLine2 && errors.addressLine2) || false}
                    >
                      <TextField
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
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ShakingTextField
                      error={!!(touched.addressLine3 && errors.addressLine3) || false}
                    >
                      <TextField
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
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={4}>
                    <ShakingTextField error={!!(touched.country && errors.country) || false}>
                      <CountryComponent
                        value={values.country}
                        onChange={(_e, value) => {
                          setFieldValue('state', null);
                          setFieldValue('country', value);
                        }}
                        error={touched.country && Boolean(errors?.country?.name)}
                        helperText={(touched.country && errors?.country?.name) || ''}
                        label="Country *"
                      />
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={4}>
                    <ShakingTextField error={!!(touched.state && errors?.state?.name) || false}>
                      <StateComponent
                        value={values.state}
                        onChange={(_e, value) => {
                          setFieldValue('city', null);
                          setFieldValue('state', value);
                        }}
                        error={touched.state && Boolean(errors?.state?.name)}
                        helperText={touched.state && errors?.state?.name}
                        countryValue={values.country}
                        label="State *"
                      />
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={4}>
                    <ShakingTextField error={!!(touched.city && errors.city) || false}>
                      <CityComponent
                        value={values.city}
                        onChange={(_e, value) => setFieldValue('city', value)}
                        error={touched.city && Boolean(errors?.city?.name)}
                        helperText={touched.city && errors?.city?.name}
                        stateValue={values.state}
                        label="City *"
                      />
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={4}>
                    <ShakingTextField error={!!(touched.village && errors.village) || false}>
                      <TextField
                        name="village"
                        value={values.village}
                        onChange={handleChange}
                        error={touched.village && Boolean(errors.village)}
                        helperText={touched.village && errors.village}
                        fullWidth
                        placeholder="Town/District"
                        size="small"
                        label="Town/District"
                      />
                    </ShakingTextField>
                  </Grid>
                  <Grid item xs={4}>
                    <ShakingTextField error={!!(touched.pinCode && errors.pinCode) || false}>
                      <TextField
                        name="pinCode"
                        value={values.pinCode}
                        onChange={handleChange}
                        error={touched.pinCode && Boolean(errors.pinCode)}
                        helperText={touched.pinCode && errors.pinCode}
                        fullWidth
                        placeholder="Pincode *"
                        size="small"
                        label="Pincode *"
                      />
                    </ShakingTextField>
                  </Grid>
                </SectionCard>

                {/* <Grid item xs={12} md={4}>
                    <ShakingTextField>
                      <TextField
                        value={values.age}
                        fullWidth
                        size="small"
                        name="age"
                        label="Age"
                        disabled
                      />
                    </ShakingTextField>
                  </Grid> */}
              </Scrollbar>
              <DialogActions sx={{ flexShrink: 0, p: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon={GlobalIcons.cancel} />}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <LoadingButton
                  loading={isAddLoading || isUpdateLoading}
                  type="submit"
                  variant="contained"
                  startIcon={<Iconify icon={GlobalIcons.submit} />}
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
