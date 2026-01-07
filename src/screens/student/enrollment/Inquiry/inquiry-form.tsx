import type { Board, AcademicYear } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import calculateAge from 'src/utils/calculate-age';
import PhoneInput from 'src/components/phone-input';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetInquiryPreferenceQuery } from 'src/redux/student/inquiry-preference/inquiry-preference-api';
import {
  useAddStudentInquiryMutation,
  useGetStudentInquiryByIdQuery,
  useUpdateStudentInquiryMutation,
} from 'src/redux/student/inquiry/inquiry-api';
import {
  Box,
  Grid,
  Chip,
  Radio,
  Button,
  Divider,
  Skeleton,
  FormLabel,
  TextField,
  Accordion,
  RadioGroup,
  Typography,
  FormControl,
  DialogActions,
  InputAdornment,
  FormHelperText,
  FormControlLabel,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { inquiryInitialValues } from './initialvalues';
import { inquiryValidationSchema } from './validationSchema';
import { InquiryPreferenceForm } from '../setting/inquiryPreference';

import type { IInquiryResponse, IInquiryFormValues } from './type';

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

// --- New Collapsible Section Component ---
const CollapsibleFormSection = ({
  title,
  children,
  defaultExpanded = false,
  step,
  error = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  step?: string;
  error?: boolean;
}) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    sx={{
      mb: 2,
      borderRadius: '12px !important',
      boxShadow: (theme) => theme.customShadows.z1,
      '&:before': { display: 'none' }, // Hide default divider
      overflow: 'hidden',
      border: (theme) =>
        error ? `1px solid ${theme.palette.error.main}` : `1px solid transparent`,
      transition: 'all 0.3s ease-in-out',
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon sx={{ color: error ? 'error.main' : 'text.secondary' }} />}
      sx={{
        backgroundColor: (theme) =>
          error
            ? varAlpha(theme.palette.error.mainChannel, 0.1)
            : varAlpha(theme.palette.grey['500Channel'], 0.2), // Soft green/blue accent
        borderBottom: (theme) =>
          `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
        '&.Mui-expanded': { minHeight: 48 },
        minHeight: 48,
        transition: 'background-color 0.3s ease-in-out',
      }}
    >
      <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          color={error ? 'error.main' : 'text.primary'}
          sx={{ transition: 'color 0.3s ease' }}
        >
          {title}
        </Typography>
        {step && (
          <Chip
            label={step}
            size="small"
            color={error ? 'error' : 'default'} // Highlight step if error
            variant="soft"
            sx={{ mr: 2, fontWeight: 'bold', transition: 'all 0.3s ease' }}
          />
        )}
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {children}
      </Grid>
    </AccordionDetails>
  </Accordion>
);

const InquiryForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: IInquiryResponse | null;
}) => {
  const dialog = useBoolean();
  const { currentYear } = useSelector((state: any) => state.globalState);

  /**
   * Hook to fetch inquiry preference data
   */
  const { data: inquiryPreference, isLoading: inquiryPrefrenceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
    params: {
      academicYearId: currentYear?.id,
    },
    options: {
      skip: !currentYear?.id,
    },
  });

  /**
   * Hook to get classes by medium
   */
  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  const [boards, setBoards] = useState([]);

  /**
   * Hook to fetch academic year data
   */
  const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });

  const initialInquiryValues: IInquiryFormValues = useMemo(() => {
    const latestYearId = academicYear?.items?.length
      ? academicYear.items[academicYear.items.length - 1].id
      : undefined;
    const findBoards = board?.items.filter((item: Board) => item.academicYearId === latestYearId);
    setBoards(findBoards);
    return inquiryInitialValues(editData, latestYearId);
  }, [academicYear.items, board?.items, editData]);

  const isSaveAndNewRef = useRef(false);

  /**
   * Handles form submission for both adding and updating student inquiries
   * @param values - Form values containing student inquiry details
   * @param formikHelpers - Formik helpers to reset form
   * @returns Promise<void>
   */
  const onSubmit = async (values: IInquiryFormValues, { resetForm }: any) => {
    try {
      if (editData) {
        await updateInquiry({
          id: editData.studentId,
          body: {
            firstName: values.firstName || undefined,
            middleName: values.middleName || undefined,
            lastName: values.lastName || undefined,
            previousSchool: values.previousSchool || undefined,
            dateOfBirth: dateConvertor(values.dateOfBirth?.format(dateFormat) || '') || '',
            dateOfInquiry: dateConvertor(values.dateOfInquiry?.format(dateFormat) || '') || '',
            gender: +values.gender,
            primaryContactNo: values.primaryContactNumber || undefined,
            secondaryContactNo: values.secondaryContactNumber || undefined,
            city: values?.city?.name || undefined,
            state: values?.state?.name
              ? { name: values?.state?.name, isoCode: values?.state?.isoCode }
              : undefined,
            country: values?.country?.name
              ? { name: values?.country?.name, isoCode: values?.country?.isoCode }
              : undefined,
            pinCode: values.pinCode || undefined,
            address1: values.addressLine1 || undefined,
            address2: values.addressLine2 || undefined,
            address3: values.addressLine3 || undefined,
            academicMediumId: values.medium || undefined,
            // academicYearId: values.academicYear || undefined,
            standardId: values.class || undefined,
            inquiryPreferenceId: values.inquiryPreferences || undefined,
            // educationBoardId: values.board || undefined,
            email: values.email || undefined,
          },
        }).unwrap();
        shikshaMitraToast.success({
          message: `Inquiry for ${values.firstName} ${values.lastName} updated successfully for ${selectedAcademicYear}`,
        });
      } else {
        await addInquiry({
          firstName: values.firstName || undefined,
          middleName: values.middleName || undefined,
          lastName: values.lastName || undefined,
          previousSchool: values.previousSchool || undefined,
          dateOfBirth: dateConvertor(values.dateOfBirth?.format(dateFormat) || '') || '',
          dateOfInquiry: dateConvertor(values.dateOfInquiry?.format(dateFormat) || '') || '',
          gender: +values.gender,
          primaryContactNo: values.primaryContactNumber || undefined,
          secondaryContactNo: values.secondaryContactNumber || undefined,
          city: values?.city?.name || undefined,
          state: values?.state?.name
            ? { name: values?.state?.name, isoCode: values?.state?.isoCode }
            : undefined,
          country: values?.country?.name
            ? { name: values?.country?.name, isoCode: values?.country?.isoCode }
            : undefined,
          pinCode: values.pinCode || undefined,
          address1: values.addressLine1 || undefined,
          address2: values.addressLine2 || undefined,
          address3: values.addressLine3 || undefined,
          academicMediumId: values.medium || undefined,
          // academicYearId: values.academicYear || undefined,
          standardId: values.class || undefined,
          inquiryPreferenceId: values.inquiryPreferences || undefined,
          // educationBoardId: values.board || undefined,
          email: values.email || undefined,
        }).unwrap();
        shikshaMitraToast.success({
          message: `Inquiry for ${values.firstName} ${values.lastName} added successfully for ${selectedAcademicYear}`,
        });
      }

      if (isSaveAndNewRef.current && !editData) {
        resetForm();
        setFieldValue('academicYear', currentYear?.id);
        // We might want to retain Board/Class selections or clear them.
        // For now, resetForm clears everything, so we might need to re-initialize some defaults if desired.
        // But resetForm uses initialValues. initialValues depends on 'editData'.
        // If !editData, initialValues are empty.
        // Let's verify if we need to explicitly set academicYear again.
        // initialInquiryValues sets it if editData is null?
      } else {
        handleClose(null, true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const {
    errors,
    touched,
    handleChange,
    setFieldValue,
    values,
    handleSubmit,
    setFieldTouched,
    initialValues,
    resetForm,
  } = useFormik({
    initialValues: initialInquiryValues,
    validationSchema: inquiryValidationSchema,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
  });

  /**
   * Custom hook to check for changes in form values
   * @param initialValues - Initial form values
   * @param currentValue - Current form values

  /**
   * Custom hook to check for changes in form values
   * @param initialValues - Initial form values
   * @param currentValue - Current form values

  /**
   * Hook to add new student inquiry
   */
  const [addInquiry, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentInquiryMutation,
  });
  // Keep empty string as a safe UI-friendly default
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(''); /**
   * Hook to update existing student inquiry
   */
  const [updateInquiry, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentInquiryMutation,
  });
  const { data: inquiryData, isLoading: isGetLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentInquiryByIdQuery,
    params: {
      studentId: editData?.studentId,
    },
    options: {
      skip: !editData?.studentId,
    },
  });

  useEffect(() => {
    if (inquiryData?.data) {
      resetForm({ values: inquiryInitialValues(inquiryData.data, selectedAcademicYear) });
    }
  }, [inquiryData?.data, resetForm, selectedAcademicYear]);

  useEffect(() => {
    // Find and set selected academic year name
    const year = academicYear?.items?.find((item: AcademicYear) => item.id === values.academicYear);
    setSelectedAcademicYear(year?.name ?? '');

    // Filter and set boards based on academic year
    if (board?.items) {
      const findBoards = board.items.filter(
        (item: Board) => item.academicYearId === (editData?.academicYearId ?? values.academicYear)
      );
      setBoards(findBoards);
    }

    // Get classes by medium if editing existing data
    if (editData?.academicMediumId) {
      getClassByMedium(editData.academicMediumId);
    }
  }, [academicYear?.items, board?.items, editData, getClassByMedium, values.academicYear]);

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <Box
        display="flex"
        component="form"
        onSubmit={handleSubmit}
        flexDirection="column"
        height="100%"
      >
        <Scrollbar
          sx={{
            p: 2,
            height: '100%',
            '& .simplebar-wrapper': {
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {/** Error Calculation helper vars */}
          {(() => {
            const basicDetailsError =
              (!!touched.academicYear && !!errors.academicYear) ||
              (!!touched.board && !!errors.board) ||
              (!!touched.medium && !!errors.medium) ||
              (!!touched.class && !!errors.class) ||
              (!!touched.firstName && !!errors.firstName) ||
              (!!touched.lastName && !!errors.lastName) ||
              (!!touched.dateOfBirth && !!errors.dateOfBirth) ||
              (!!touched.gender && !!errors.gender);

            const inquiryDetailsError =
              (!!touched.dateOfInquiry && !!errors.dateOfInquiry) ||
              (!!touched.inquiryPreferences && !!errors.inquiryPreferences);

            const contactError =
              (!!touched.primaryContactNumber && !!errors.primaryContactNumber) ||
              (!!touched.secondaryContactNumber && !!errors.secondaryContactNumber) ||
              (!!touched.email && !!errors.email);

            const addressError =
              (!!touched.addressLine1 && !!errors.addressLine1) ||
              (!!touched.country && !!(errors.country as any)?.name) ||
              (!!touched.state && !!(errors.state as any)?.name) ||
              (!!touched.city && !!(errors.city as any)?.name) ||
              (!!touched.pinCode && !!errors.pinCode);

            return (
              <>
                {/** Basic Details Section */}
                <CollapsibleFormSection
                  title="Basic Student Details"
                  defaultExpanded
                  step="Step 1 of 4"
                  error={basicDetailsError}
                >
                  {isGetLoading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <Grid key={index} size={{ xs: 12, md: 4 }}>
                        <Skeleton variant="rounded" height={40} animation="wave" />
                      </Grid>
                    ))
                  ) : (
                    <>
                      <Grid size={{ xs: 12, md: 3 }}>
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
                            // Read-only/Auto-filled behavior - effectively disabled but visible
                            disabled
                            onChange={(value) => {
                              // Keep logic just in case, but it's disabled
                              const findBoards = board?.items.filter(
                                (item: Board) => item.academicYearId === value
                              );
                              setBoards(findBoards);
                              setFieldValue('board', '');
                              setFieldValue('medium', '');
                              setFieldValue('class', '');
                              setFieldValue('academicYear', value);
                            }}
                            error={!!(touched.academicYear && errors.academicYear) || false}
                            helperText={
                              (touched.academicYear && errors.academicYear) || 'Auto-filled'
                            }
                            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
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
                              setFieldValue('class', '');
                              setFieldValue('board', value);
                            }}
                            error={!!(touched.board && errors.board) || false}
                            helperText={(touched.board && errors.board) || ''}
                            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                            disabled={!values.academicYear}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
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
                              setFieldValue('medium', value);
                              setFieldValue('class', '');
                              setFieldTouched('medium', false);
                              await getClassByMedium(value);
                            }}
                            error={!!(touched.medium && errors.medium) || false}
                            helperText={(touched.medium && errors.medium) || ''}
                            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <ShakingTextField error={!!(touched.class && errors.class) || false}>
                          <CustomSelect
                            name="class"
                            label="Class Seeking Admission *"
                            disabled={!values.medium}
                            isLoading={classLoading}
                            labelKey="name"
                            valueKey="id"
                            options={classes || []}
                            value={values.class}
                            onChange={(value) => {
                              setFieldValue('class', value);
                            }}
                            error={!!(touched.class && errors.class) || false}
                            helperText={(touched.class && errors.class) || ''}
                            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                          />
                        </ShakingTextField>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                          Student Name
                        </Typography>
                        <Box display="flex" gap={2}>
                          <Box flex={1}>
                            <ShakingTextField
                              error={!!(touched.firstName && errors.firstName) || false}
                            >
                              <TextField
                                fullWidth
                                size="small"
                                name="firstName"
                                label="First Name *"
                                error={!!(touched.firstName && errors.firstName) || false}
                                helperText={(touched.firstName && errors.firstName) || ''}
                                value={values.firstName}
                                onChange={(e) => {
                                  const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                  const capitalized = capitalize(onlyLetters);
                                  if (capitalized.length <= 30)
                                    setFieldValue('firstName', capitalized);
                                }}
                                inputProps={{ maxLength: 30 }}
                              />
                            </ShakingTextField>
                          </Box>
                          <Box flex={1}>
                            <ShakingTextField
                              error={!!(touched.middleName && errors.middleName) || false}
                            >
                              <TextField
                                fullWidth
                                size="small"
                                name="middleName"
                                label="Middle Name"
                                error={touched.middleName && Boolean(errors.middleName)}
                                helperText={touched.middleName && errors.middleName}
                                value={values.middleName}
                                onChange={(e) => {
                                  const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                  const capitalized = capitalize(onlyLetters);
                                  if (capitalized.length <= 30)
                                    setFieldValue('middleName', capitalized);
                                }}
                                inputProps={{ maxLength: 30 }}
                              />
                            </ShakingTextField>
                          </Box>
                          <Box flex={1}>
                            <ShakingTextField
                              error={!!(touched.lastName && errors.lastName) || false}
                            >
                              <TextField
                                fullWidth
                                size="small"
                                name="lastName"
                                label="Last Name *"
                                error={touched.lastName && Boolean(errors.lastName)}
                                helperText={touched.lastName && errors.lastName}
                                value={values.lastName}
                                onChange={(e) => {
                                  const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                  const capitalized = capitalize(onlyLetters);
                                  if (capitalized.length <= 30)
                                    setFieldValue('lastName', capitalized);
                                }}
                                inputProps={{ maxLength: 30 }}
                              />
                            </ShakingTextField>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, md: 4 }}>
                        <ShakingTextField
                          error={!!(touched.dateOfBirth && errors.dateOfBirth) || false}
                        >
                          <DatePicker
                            label="Date of Birth *"
                            name="dateOfBirth"
                            value={values.dateOfBirth}
                            format="DD-MM-YYYY"
                            onChange={(newValue) => {
                              const date = newValue?.format();
                              if (date) {
                                const age = calculateAge(date);
                                setFieldValue('age', age);
                              }
                              setFieldValue('dateOfBirth', newValue);
                            }}
                            disableFuture
                            minDate={dayjs('1947-01-01')}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                error: !!(touched.dateOfBirth && errors.dateOfBirth) || false,
                                helperText: (touched.dateOfBirth && errors.dateOfBirth) || '',
                              },
                            }}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <ShakingTextField error={!!(touched.gender && errors.gender) || false}>
                          <Box>
                            <FormControl
                              component="fieldset"
                              fullWidth
                              sx={{
                                border: (theme) =>
                                  `1px solid ${touched.gender && errors.gender ? theme.palette.error.main : theme.palette.divider}`,
                                borderRadius: 1,
                                // p: 1,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                              error={!!(touched.gender && errors.gender) || false}
                            >
                              <FormLabel
                                id="gender-radio-group"
                                sx={{
                                  mr: 2,
                                  fontSize: '0.875rem',
                                }}
                              >
                                Gender *
                              </FormLabel>
                              <RadioGroup
                                row
                                aria-labelledby="gender-radio-group"
                                name="gender"
                                value={values.gender}
                                onChange={handleChange}
                              >
                                <FormControlLabel
                                  value={0}
                                  control={<Radio size="small" />}
                                  label="Male"
                                />
                                <FormControlLabel
                                  value={1}
                                  control={<Radio size="small" />}
                                  label="Female"
                                />
                              </RadioGroup>
                            </FormControl>
                            {!!(touched.gender && errors.gender) && (
                              <FormHelperText
                                error
                                sx={{
                                  px: 1,
                                  bottom: '10px !important',
                                  marginLeft: '0 !important',
                                }}
                              >
                                {errors.gender}
                              </FormHelperText>
                            )}
                          </Box>
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <ShakingTextField
                          error={!!(touched.previousSchool && errors.previousSchool) || false}
                        >
                          <TextField
                            fullWidth
                            value={values.previousSchool}
                            onChange={(e) => {
                              const onlyLetters = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                              if (onlyLetters.length <= 50)
                                setFieldValue('previousSchool', onlyLetters);
                            }}
                            inputProps={{ maxLength: 50 }}
                            size="small"
                            name="previousSchool"
                            label="Previous School (Optional)"
                            placeholder="e.g. St. Xavier's High School"
                            error={!!touched.previousSchool && !!errors.previousSchool}
                            helperText={touched.previousSchool && errors.previousSchool}
                          />
                        </ShakingTextField>
                      </Grid>
                    </>
                  )}
                </CollapsibleFormSection>
                {/** Inquiry Details Section */}
                <CollapsibleFormSection
                  title="Inquiry Details"
                  step="Step 2 of 4"
                  error={inquiryDetailsError}
                >
                  {isGetLoading ? (
                    Array.from({ length: 2 }).map((_, index) => (
                      <Grid key={index} size={{ xs: 12, md: 4 }} mb={1}>
                        <Skeleton variant="rounded" height={40} animation="wave" />
                      </Grid>
                    ))
                  ) : (
                    <>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <ShakingTextField
                          error={!!(touched.dateOfInquiry && errors.dateOfInquiry) || false}
                        >
                          <DatePicker
                            label="Date of Inquiry"
                            name="dateOfInquiry"
                            value={values.dateOfInquiry}
                            format="DD-MM-YYYY"
                            readOnly // Read-only as requested
                            onChange={(newValue) => {
                              setFieldValue('dateOfInquiry', newValue);
                              setFieldTouched('dateOfInquiry', true);
                            }}
                            slotProps={{
                              textField: {
                                size: 'small',
                                fullWidth: true,
                                helperText:
                                  touched.dateOfInquiry && (errors.dateOfInquiry as string),
                                error: touched.dateOfInquiry && Boolean(errors.dateOfInquiry),
                              },
                            }}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <CustomSelect
                          label="Inquiry Source / Preference"
                          name="inquiryPreferences"
                          isLoading={inquiryPrefrenceLoading}
                          options={inquiryPreference?.items || []}
                          value={values.inquiryPreferences}
                          labelKey="preferenceName"
                          valueKey="id"
                          onChange={(value) => {
                            setFieldValue('inquiryPreferences', value);
                            setFieldTouched('inquiryPreferences', true);
                          }}
                          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                          addOtherItemOnClick={dialog.onTrue}
                        />
                      </Grid>
                    </>
                  )}
                </CollapsibleFormSection>
                {/** Contact Information Section */}
                <CollapsibleFormSection
                  title="Contact Information"
                  step="Step 3 of 4"
                  error={contactError}
                >
                  {isGetLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Grid key={index} size={{ xs: 12, md: 4 }}>
                        <Skeleton variant="rounded" height={40} animation="wave" />
                      </Grid>
                    ))
                  ) : (
                    <>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <ShakingTextField
                          error={
                            !!(touched.primaryContactNumber && errors.primaryContactNumber) || false
                          }
                        >
                          <PhoneInput
                            name="primaryContactNumber"
                            value={values.primaryContactNumber}
                            onChange={(value) => {
                              setFieldValue('primaryContactNumber', value);
                            }}
                            error={
                              touched.primaryContactNumber && Boolean(errors.primaryContactNumber)
                            }
                            helperText={touched.primaryContactNumber && errors.primaryContactNumber}
                            variant="outlined"
                            label="Primary Contact No. *"
                            size="small"
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <ShakingTextField
                          error={
                            !!(touched.secondaryContactNumber && errors.secondaryContactNumber) ||
                            false
                          }
                        >
                          <PhoneInput
                            name="secondaryContactNumber"
                            value={values.secondaryContactNumber}
                            onChange={(value) => {
                              setFieldValue('secondaryContactNumber', value || '');
                            }}
                            error={Boolean(
                              touched.secondaryContactNumber && errors.secondaryContactNumber
                            )}
                            helperText={
                              touched.secondaryContactNumber && errors.secondaryContactNumber
                                ? errors.secondaryContactNumber
                                : ''
                            }
                            variant="outlined"
                            label="Secondary Contact No."
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <ShakingTextField error={!!(touched.email && errors.email) || false}>
                          <TextField
                            value={values.email}
                            fullWidth
                            size="small"
                            name="email"
                            label="Email"
                            onChange={(e) => {
                              const { value } = e.target;
                              if (value.length <= 35) {
                                setFieldValue('email', value);
                              }
                            }}
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                            inputProps={{ maxLength: 35 }}
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
                    </>
                  )}
                </CollapsibleFormSection>
                {/** Address Details Section */}
                <CollapsibleFormSection
                  title="Address Details"
                  step="Step 4 of 4"
                  error={addressError}
                >
                  {isGetLoading ? (
                    Array.from({ length: 7 }).map((_, index) => (
                      <Grid key={index} size={{ xs: index > 2 ? 4 : 12, md: index > 2 ? 4 : 12 }}>
                        <Skeleton variant="rounded" height={40} animation="wave" />
                      </Grid>
                    ))
                  ) : (
                    <>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <ShakingTextField
                          error={!!(touched.addressLine1 && errors.addressLine1) || false}
                        >
                          <TextField
                            name="addressLine1"
                            label="House / Building / Flat"
                            value={values.addressLine1}
                            onChange={(e) => {
                              const { value } = e.target;
                              if (value.length <= 50) {
                                setFieldValue('addressLine1', value);
                              }
                            }}
                            inputProps={{ maxLength: 50 }}
                            error={touched.addressLine1 && Boolean(errors.addressLine1)}
                            helperText={touched.addressLine1 && errors.addressLine1}
                            fullWidth
                            size="small"
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <ShakingTextField
                          error={!!(touched.addressLine2 && errors.addressLine2) || false}
                        >
                          <TextField
                            name="addressLine2"
                            label="Area / Locality / Road Name"
                            value={values.addressLine2}
                            onChange={(e) => {
                              const { value } = e.target;
                              if (value.length <= 50) {
                                setFieldValue('addressLine2', value);
                              }
                            }}
                            inputProps={{ maxLength: 50 }}
                            error={touched.addressLine2 && Boolean(errors.addressLine2)}
                            helperText={(touched.addressLine2 && errors.addressLine2) || ''}
                            fullWidth
                            size="small"
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <ShakingTextField
                          error={!!(touched.addressLine3 && errors.addressLine3) || false}
                        >
                          <TextField
                            name="addressLine3"
                            label="Landmark (Optional)"
                            value={values.addressLine3}
                            onChange={(e) => {
                              const { value } = e.target;
                              if (value.length <= 50) {
                                setFieldValue('addressLine3', value);
                              }
                            }}
                            inputProps={{ maxLength: 50 }}
                            error={touched.addressLine3 && Boolean(errors.addressLine3)}
                            helperText={(touched.addressLine3 && errors.addressLine3) || ''}
                            fullWidth
                            size="small"
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={4}>
                        <ShakingTextField error={!!(touched.country && errors.country) || false}>
                          <CountryComponent
                            value={values.country}
                            onChange={(_e: any, value: any) => {
                              setFieldValue('state', { name: '', isoCode: '' });
                              setFieldValue('country', {
                                name: value?.name,
                                isoCode: value?.isoCode,
                              });
                            }}
                            error={touched.country && Boolean(errors?.country?.name)}
                            helperText={(touched.country && errors?.country?.name) || ''}
                            textFieldProps={{ label: 'Country' }}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={4}>
                        <ShakingTextField error={!!(touched.state && errors?.state) || false}>
                          <StateComponent
                            value={values.state}
                            onChange={(_e: any, value: any) => {
                              setFieldValue('state', {
                                ...(value || {}),
                                name: value?.name,
                                isoCode: value?.isoCode,
                              });
                              setFieldValue('city', { name: '' });
                            }}
                            error={touched.state && Boolean(errors?.state?.name)}
                            helperText={touched.state && errors?.state?.name}
                            countryValue={values.country}
                            textFieldProps={{ label: 'State' }}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={4}>
                        <ShakingTextField error={!!(touched.city && errors.city) || false}>
                          <CityComponent
                            value={values.city}
                            onChange={(_e: any, value: any) => {
                              setFieldValue('city', { name: value?.name });
                            }}
                            error={touched.city && Boolean(errors?.city?.name)}
                            helperText={touched.city && errors?.city?.name}
                            stateValue={values.state}
                            textFieldProps={{ label: 'City' }}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={4}>
                        <ShakingTextField error={!!(touched.pinCode && errors.pinCode) || false}>
                          <TextField
                            name="pinCode"
                            value={values.pinCode}
                            onChange={(e) => {
                              const { value } = e.target;
                              if (value.length <= 6) {
                                setFieldValue('pinCode', value);
                              }
                            }}
                            type="number"
                            error={touched.pinCode && Boolean(errors.pinCode)}
                            helperText={touched.pinCode && errors.pinCode}
                            fullWidth
                            onKeyDown={(e) => {
                              if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            size="small"
                            label="PIN Code"
                            inputProps={{ maxLength: 6, min: 0 }}
                          />
                        </ShakingTextField>
                      </Grid>
                    </>
                  )}
                </CollapsibleFormSection>
              </>
            );
          })()}
        </Scrollbar>

        <DialogActions sx={{ flexShrink: 0, p: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={handleClose}
            size="small"
          >
            Cancel
          </Button>
          <LoadingButton
            loading={isAddLoading || isUpdateLoading}
            type="submit"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            size="small"
          >
            Submit Inquiry
          </LoadingButton>
        </DialogActions>
      </Box>
      <CustomDialog
        open={dialog.value}
        handleClose={dialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Inquiry Preference</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Configure and manage inquiry preferences to categorize and track student inquiries effectively."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <InquiryPreferenceForm handleClose={dialog.onFalse} editData={null} />
      </CustomDialog>
    </BackPopUpChecked>
  );
};

export default InquiryForm;

// const CheckIsChanges = ({ initialValues, currentValue, children }: Record<string, any>) => {
//   const isEqualValue = useMemo(
//     () => isEqual(cloneDeep(initialValues), cloneDeep(currentValue)),
//     [currentValue, initialValues]
//   );

//   const dispatch = useDispatch();
//   useEffect(() => {
//     dispatch(setIsChanges(!isEqualValue));
//   }, [dispatch, isEqualValue]);

//   return children;
// };
