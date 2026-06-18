'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { useMemo, useState, useEffect } from 'react';
import { ReligionTypeArray } from 'src/enums/religion';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Card, Button, TextField } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { StudentReportTitle, StudentReportTitleOptions } from 'src/enums/student-reports';
import { useCreateStudentReportExportMutation } from 'src/redux/student/student-report/student-report-api';

import StudentReportPreviewDrawer from './StudentReportPreviewDrawer';
import { buildStudentReportPayload } from '../utils/buildStudentReportPayload';
import { getStudentReportValidationSchema } from '../utils/getStudentReportValidationSchema';

// ─── Static option arrays ─────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  { id: 'all', name: 'All' },
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
];

const MONTH_OPTIONS = [
  { id: '1', name: 'January' },
  { id: '2', name: 'February' },
  { id: '3', name: 'March' },
  { id: '4', name: 'April' },
  { id: '5', name: 'May' },
  { id: '6', name: 'June' },
  { id: '7', name: 'July' },
  { id: '8', name: 'August' },
  { id: '9', name: 'September' },
  { id: '10', name: 'October' },
  { id: '11', name: 'November' },
  { id: '12', name: 'December' },
];

const VERIFICATION_STATUS_OPTIONS = [
  { id: 'verified', name: 'Verified' },
  { id: 'pending', name: 'Pending' },
  { id: 'failed', name: 'Failed' },
  { id: 'not_submitted', name: 'Not Submitted' },
];

const STUDENT_STATUS_OPTIONS = [
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
  { id: 'transferred', name: 'Transferred' },
  { id: 'withdrawn', name: 'Withdrawn' },
  { id: 'alumni', name: 'Alumni' },
];

const BLOOD_GROUP_OPTIONS = [
  { id: 'A+', name: 'A+' },
  { id: 'A-', name: 'A-' },
  { id: 'B+', name: 'B+' },
  { id: 'B-', name: 'B-' },
  { id: 'AB+', name: 'AB+' },
  { id: 'AB-', name: 'AB-' },
  { id: 'O+', name: 'O+' },
  { id: 'O-', name: 'O-' },
];

// ─── Field visibility map ─────────────────────────────────────────────────────
/**
 * Lists which form fields are rendered for each report type.
 * Only fields listed here will be visible in the form.
 */
const StudentReportFieldsMap: Record<number, string[]> = {
  // ── Student List ────────────────────────────────────────────────────────────
  [StudentReportTitle.StudentList]: ['organization', 'classIds', 'divisionIds', 'studentStatus'],
  [StudentReportTitle.StudentDirectory]: [
    'organization',
    'classIds',
    'divisionIds',
    'studentStatus',
  ],
  [StudentReportTitle.ClassWiseStudentList]: ['organization', 'classIds', 'divisionIds'],
  [StudentReportTitle.ActiveStudentReport]: ['organization', 'classIds'],
  [StudentReportTitle.InactiveStudentReport]: ['organization', 'classIds', 'studentStatus'],

  // ── Demographics ────────────────────────────────────────────────────────────
  [StudentReportTitle.ReligionWiseReport]: ['organization', 'classIds', 'religion'],
  [StudentReportTitle.CasteCategoryWiseReport]: ['organization', 'classIds', 'casteCategory'],
  [StudentReportTitle.GenderWiseDistributionReport]: ['organization', 'classIds', 'gender'],
  [StudentReportTitle.DateOfBirthReport]: [
    'organization',
    'classIds',
    'month',
    'fromDate',
    'toDate',
  ],
  [StudentReportTitle.BloodGroupDistributionReport]: ['organization', 'classIds', 'bloodGroup'],
  [StudentReportTitle.PinCodeWiseDistributionReport]: [
    'organization',
    'classIds',
    'country',
    'state',
    'city',
    'pinCode',
  ],

  // ── Admission ───────────────────────────────────────────────────────────────
  [StudentReportTitle.AdmissionSourceReport]: [
    'organization',
    'classIds',
    'admissionSource',
    'fromDate',
    'toDate',
  ],
  [StudentReportTitle.PreviousSchoolReport]: ['organization', 'classIds', 'fromDate', 'toDate'],
  [StudentReportTitle.MonthlyAdmissionTrendReport]: [
    'organization',
    'classIds',
    'fromDate',
    'toDate',
  ],
  [StudentReportTitle.AdmissionComparisonReport]: [
    'organization',
    'classIds',
    'fromDate',
    'toDate',
  ],
  [StudentReportTitle.ClassWiseAdmissionReport]: ['organization', 'classIds', 'fromDate', 'toDate'],

  // ── Verification ────────────────────────────────────────────────────────────
  [StudentReportTitle.AadhaarVerificationReport]: [
    'organization',
    'classIds',
    'verificationStatus',
  ],
  [StudentReportTitle.ContactInformationReport]: ['organization', 'classIds'],
  [StudentReportTitle.DocumentVerificationReport]: [
    'organization',
    'classIds',
    'verificationStatus',
  ],
};

// ─── Required fields map ──────────────────────────────────────────────────────
/**
 * Fields that MUST have a value before the form can be submitted.
 */
const StudentReportRequiredFieldsMap: Record<number, string[]> = {
  // Student List
  [StudentReportTitle.StudentList]: ['organization'],
  [StudentReportTitle.StudentDirectory]: ['organization'],
  [StudentReportTitle.ClassWiseStudentList]: ['organization'],
  [StudentReportTitle.ActiveStudentReport]: ['organization'],
  [StudentReportTitle.InactiveStudentReport]: ['organization'],

  // Demographics
  [StudentReportTitle.ReligionWiseReport]: ['organization', 'religion'],
  [StudentReportTitle.CasteCategoryWiseReport]: ['organization', 'casteCategory'],
  [StudentReportTitle.GenderWiseDistributionReport]: ['organization', 'gender'],
  [StudentReportTitle.DateOfBirthReport]: ['organization', 'month'],
  [StudentReportTitle.BloodGroupDistributionReport]: ['organization'],
  [StudentReportTitle.PinCodeWiseDistributionReport]: ['organization', 'country'],

  // Admission
  [StudentReportTitle.AdmissionSourceReport]: ['organization'],
  [StudentReportTitle.PreviousSchoolReport]: ['organization'],
  [StudentReportTitle.MonthlyAdmissionTrendReport]: ['organization'],
  [StudentReportTitle.AdmissionComparisonReport]: ['organization'],
  [StudentReportTitle.ClassWiseAdmissionReport]: ['organization'],

  // Verification
  [StudentReportTitle.AadhaarVerificationReport]: ['organization'],
  [StudentReportTitle.ContactInformationReport]: ['organization'],
  [StudentReportTitle.DocumentVerificationReport]: ['organization'],
};

// ─── Initial values ───────────────────────────────────────────────────────────

interface StudentReportInitialValues {
  report: StudentReportTitle;
  organization: string;
  // Shared
  classIds: string[];
  divisionIds: string[];
  fromDate: string | null;
  toDate: string | null;
  // Student List
  studentStatus: string;
  // Demographics
  religion: string[];
  casteCategory: string[];
  gender: string;
  bloodGroup: string;
  country: { name: string; isoCode: string } | null;
  state: { name: string; isoCode: string } | null;
  city: { name: string } | null;
  pinCode: string;
  month: string;
  // Admission
  admissionSource: string;
  previousSchoolId: string;
  // Verification
  verificationStatus: string;
}

const initialValues: StudentReportInitialValues = {
  report: '' as unknown as StudentReportTitle,
  organization: '',
  classIds: [],
  divisionIds: [],
  fromDate: null,
  toDate: null,
  studentStatus: '',
  religion: [],
  casteCategory: [],
  gender: '',
  bloodGroup: '',
  country: { name: '', isoCode: '' },
  state: { name: '', isoCode: '' },
  city: { name: '' },
  pinCode: '',
  month: '',
  admissionSource: '',
  previousSchoolId: '',
  verificationStatus: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

const StudentReportForm = ({
  report,
  onSuccess,
}: {
  report: StudentReportTitle;
  onSuccess?: () => void;
}) => {
  const { currentMedium, currentYear } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportRequest, setReportRequest] = useState<any>(null);
  const [submitType, setSubmitType] = useState<'preview' | 'export'>('preview');

  const [dynamicSchema, setDynamicSchema] = useState(getStudentReportValidationSchema([], []));

  const [createExport, { isLoading: isExportCreating }] = useQueryAndMutation<
    typeof useCreateStudentReportExportMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: useCreateStudentReportExportMutation,
    popupConfig: { error: true, errorMessage: 'Failed to initiate export' },
  });

  // ─── Derived field lists ───────────────────────────────────────────────────
  const currentFields = useMemo(() => StudentReportFieldsMap[report as number] || [], [report]);

  const currentRequiredFields = useMemo(
    () => StudentReportRequiredFieldsMap[report as number] || [],
    [report]
  );

  const showField = (fieldName: string) => currentFields.includes(fieldName);
  const isRequired = (fieldName: string) => currentRequiredFields.includes(fieldName);

  // ─── Formik ────────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: {
      ...initialValues,
      report: report as unknown as StudentReportTitle,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const requestPayload = buildStudentReportPayload(report, values, currentYear?.id);

      if (submitType === 'preview') {
        setReportRequest(requestPayload);
        setPreviewOpen(true);
      } else if (submitType === 'export') {
        try {
          const res = await createExport({ ...requestPayload, format: 'pdf' }).unwrap();
          toast.success(`Export job queued successfully! Status: ${res.status || 'Queued'}`);
          if (onSuccess) {
            onSuccess();
          }
        } catch {
          // Error handled by popupConfig
        }
      }
      setSubmitting(false);
    },
  });

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    setDynamicSchema(getStudentReportValidationSchema(currentFields, currentRequiredFields));
  }, [currentFields, currentRequiredFields]);

  useEffect(() => {
    setAllOrganization(cloneDeep(currentMedium?.educationMediumStages || []));
  }, [currentMedium?.educationMediumStages]);

  useEffect(() => {
    const standards =
      allOrganization.find((org: any) => org?.id === formik.values.organization)?.standards || [];
    setAllClass(standards);
  }, [allOrganization, formik.values.organization]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Organisation */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.organization && formik.errors.organization)}
                >
                  <CustomSelect
                    options={allOrganization}
                    label="Organization *"
                    value={formik.values.organization}
                    onChange={(val) => {
                      formik.setFieldValue('organization', val);
                      formik.setFieldValue('classIds', []);
                      formik.setFieldValue('divisionIds', []);
                    }}
                    onBlur={() => formik.setFieldTouched('organization', true)}
                    error={formik.touched.organization && Boolean(formik.errors.organization)}
                    helperText={
                      (formik.touched.organization && formik.errors.organization) as string
                    }
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    disabled={!currentMedium}
                  />
                </ShakingTextField>
              </Grid>

              {/* Class (multi-select) */}
              {showField('classIds') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.classIds && formik.errors.classIds)}>
                    <CustomSelect
                      options={allClass}
                      label={`Class${isRequired('classIds') ? ' *' : ''}`}
                      multiple
                      value={formik.values.classIds}
                      onChange={(val) => formik.setFieldValue('classIds', val)}
                      onBlur={() => formik.setFieldTouched('classIds', true)}
                      error={formik.touched.classIds && Boolean(formik.errors.classIds)}
                      helperText={(formik.touched.classIds && formik.errors.classIds) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!formik.values.organization}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Division (multi-select) */}
              {showField('divisionIds') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.divisionIds && formik.errors.divisionIds)}
                  >
                    <CustomSelect
                      options={[]}
                      label={`Division${isRequired('divisionIds') ? ' *' : ''}`}
                      multiple
                      value={formik.values.divisionIds}
                      onChange={(val) => formik.setFieldValue('divisionIds', val)}
                      onBlur={() => formik.setFieldTouched('divisionIds', true)}
                      error={formik.touched.divisionIds && Boolean(formik.errors.divisionIds)}
                      helperText={
                        (formik.touched.divisionIds && formik.errors.divisionIds) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!formik.values.organization}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Student Status */}
              {showField('studentStatus') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.studentStatus && formik.errors.studentStatus)}
                  >
                    <CustomSelect
                      options={STUDENT_STATUS_OPTIONS}
                      label={`Student Status${isRequired('studentStatus') ? ' *' : ''}`}
                      value={formik.values.studentStatus}
                      onChange={(val) => formik.setFieldValue('studentStatus', val as string)}
                      onBlur={() => formik.setFieldTouched('studentStatus', true)}
                      error={formik.touched.studentStatus && Boolean(formik.errors.studentStatus)}
                      helperText={
                        (formik.touched.studentStatus && formik.errors.studentStatus) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* From Date */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.fromDate && formik.errors.fromDate)}>
                    <DatePicker
                      label={`From Date${isRequired('fromDate') ? ' *' : ''}`}
                      value={formik.values.fromDate ? dayjs(formik.values.fromDate) : null}
                      onChange={(date) =>
                        formik.setFieldValue('fromDate', date ? date.toISOString() : null)
                      }
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: formik.touched.fromDate && Boolean(formik.errors.fromDate),
                          helperText: (formik.touched.fromDate && formik.errors.fromDate) as string,
                          onBlur: () => formik.setFieldTouched('fromDate', true),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* To Date */}
              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.toDate && formik.errors.toDate)}>
                    <DatePicker
                      label={`To Date${isRequired('toDate') ? ' *' : ''}`}
                      value={formik.values.toDate ? dayjs(formik.values.toDate) : null}
                      onChange={(date) =>
                        formik.setFieldValue('toDate', date ? date.toISOString() : null)
                      }
                      minDate={formik.values.fromDate ? dayjs(formik.values.fromDate) : undefined}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: formik.touched.toDate && Boolean(formik.errors.toDate),
                          helperText: (formik.touched.toDate && formik.errors.toDate) as string,
                          onBlur: () => formik.setFieldTouched('toDate', true),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Religion */}
              {showField('religion') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.religion && formik.errors.religion)}>
                    <CustomSelect
                      labelId="religion-label"
                      value={formik.values.religion}
                      onChange={(value) => formik.setFieldValue('religion', value)}
                      size="small"
                      multiple
                      onBlur={() => formik.setFieldTouched('religion', true)}
                      label={`Religion${isRequired('religion') ? ' *' : ''}`}
                      name="religion"
                      options={ReligionTypeArray}
                      valueKey="label"
                      labelKey="label"
                      error={formik.touched.religion && Boolean(formik.errors.religion)}
                      helperText={(formik.touched.religion && formik.errors.religion) as string}
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Caste Category */}
              {showField('casteCategory') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.casteCategory && formik.errors.casteCategory)}
                  >
                    <CustomSelect
                      labelId="castCategory-label"
                      value={formik.values.casteCategory}
                      onChange={(val) => formik.setFieldValue('casteCategory', val)}
                      size="small"
                      multiple
                      onBlur={() => formik.setFieldTouched('casteCategory', true)}
                      label={`Caste Category${isRequired('casteCategory') ? ' *' : ''}`}
                      name="casteCategory"
                      error={formik.touched.casteCategory && Boolean(formik.errors.casteCategory)}
                      helperText={
                        (formik.touched.casteCategory && formik.errors.casteCategory) as string
                      }
                      options={EmployeeCastTypeArray.map((_, index) => ({
                        value: (EmployeeCastType as any)[index],
                        label: (EmployeeCastType as any)[index],
                      }))}
                      valueKey="value"
                      labelKey="label"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Gender */}
              {showField('gender') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.gender && formik.errors.gender)}>
                    <CustomSelect
                      options={GENDER_OPTIONS}
                      label={`Gender${isRequired('gender') ? ' *' : ''}`}
                      value={formik.values.gender}
                      onChange={(val) => formik.setFieldValue('gender', val as string)}
                      onBlur={() => formik.setFieldTouched('gender', true)}
                      error={formik.touched.gender && Boolean(formik.errors.gender)}
                      helperText={(formik.touched.gender && formik.errors.gender) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Blood Group */}
              {showField('bloodGroup') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.bloodGroup && formik.errors.bloodGroup)}
                  >
                    <CustomSelect
                      options={BLOOD_GROUP_OPTIONS}
                      label={`Blood Group${isRequired('bloodGroup') ? ' *' : ''}`}
                      value={formik.values.bloodGroup}
                      onChange={(val) => formik.setFieldValue('bloodGroup', val as string)}
                      onBlur={() => formik.setFieldTouched('bloodGroup', true)}
                      error={formik.touched.bloodGroup && Boolean(formik.errors.bloodGroup)}
                      helperText={(formik.touched.bloodGroup && formik.errors.bloodGroup) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Month */}
              {showField('month') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.month && formik.errors.month)}>
                    <CustomSelect
                      options={MONTH_OPTIONS}
                      label={`Month${isRequired('month') ? ' *' : ''}`}
                      value={formik.values.month}
                      onChange={(val) => formik.setFieldValue('month', val as string)}
                      onBlur={() => formik.setFieldTouched('month', true)}
                      error={formik.touched.month && Boolean(formik.errors.month)}
                      helperText={(formik.touched.month && formik.errors.month) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Country */}
              {showField('country') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.country && formik.errors.country)}>
                    <CountryComponent
                      value={formik.values.country as any}
                      onChange={(_, value) => {
                        formik.setFieldValue('state', { name: '', isoCode: '' });
                        formik.setFieldValue('city', { name: '' });
                        formik.setFieldValue('country', {
                          name: value?.name,
                          isoCode: value?.isoCode,
                        });
                      }}
                      name="country"
                      onBlur={() => formik.setFieldTouched('country', true)}
                      error={
                        formik.touched.country && Boolean((formik.errors as any)?.country?.name)
                      }
                      helperText={
                        (formik.touched.country && (formik.errors as any)?.country?.name) as string
                      }
                      textFieldProps={{ label: `Country${isRequired('country') ? ' *' : ''}` }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* State */}
              {showField('state') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.state && formik.errors.state)}>
                    <StateComponent
                      value={formik.values.state as any}
                      onChange={(_, value) => {
                        formik.setFieldValue('state', {
                          ...(value || {}),
                          name: value?.name,
                          isoCode: value?.isoCode,
                        });
                        formik.setFieldValue('city', { name: '' });
                      }}
                      onBlur={() => formik.setFieldTouched('state', true)}
                      countryValue={formik.values.country as any}
                      error={formik.touched.state && Boolean((formik.errors as any)?.state?.name)}
                      helperText={
                        (formik.touched.state && (formik.errors as any)?.state?.name) as string
                      }
                      disabled={!formik.values.country?.name}
                      textFieldProps={{ label: `State${isRequired('state') ? ' *' : ''}` }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* City */}
              {showField('city') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.city && formik.errors.city)}>
                    <CityComponent
                      value={formik.values.city as any}
                      onChange={(_, value) => {
                        formik.setFieldValue('city', { name: value?.name });
                      }}
                      onBlur={() => formik.setFieldTouched('city', true)}
                      stateValue={formik.values.state as any}
                      countryValue={formik.values.country as any}
                      error={formik.touched.city && Boolean((formik.errors as any)?.city?.name)}
                      helperText={
                        (formik.touched.city && (formik.errors as any)?.city?.name) as string
                      }
                      disabled={!formik.values.state?.name}
                      textFieldProps={{ label: `City${isRequired('city') ? ' *' : ''}` }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Pin Code */}
              {showField('pinCode') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.pinCode && formik.errors.pinCode)}>
                    <TextField
                      label={`Pin Code${isRequired('pinCode') ? ' *' : ''}`}
                      name="pinCode"
                      value={formik.values.pinCode}
                      onChange={formik.handleChange}
                      onBlur={() => formik.setFieldTouched('pinCode', true)}
                      error={formik.touched.pinCode && Boolean(formik.errors.pinCode)}
                      helperText={(formik.touched.pinCode && formik.errors.pinCode) as string}
                      size="small"
                      fullWidth
                      type="number"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Admission Source */}
              {showField('admissionSource') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.admissionSource && formik.errors.admissionSource)}
                  >
                    <CustomSelect
                      options={[]}
                      label={`Admission Source${isRequired('admissionSource') ? ' *' : ''}`}
                      value={formik.values.admissionSource}
                      onChange={(val) => formik.setFieldValue('admissionSource', val as string)}
                      onBlur={() => formik.setFieldTouched('admissionSource', true)}
                      error={
                        formik.touched.admissionSource && Boolean(formik.errors.admissionSource)
                      }
                      helperText={
                        (formik.touched.admissionSource && formik.errors.admissionSource) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Verification Status */}
              {showField('verificationStatus') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.verificationStatus && formik.errors.verificationStatus)
                    }
                  >
                    <CustomSelect
                      options={VERIFICATION_STATUS_OPTIONS}
                      label={`Verification Status${isRequired('verificationStatus') ? ' *' : ''}`}
                      value={formik.values.verificationStatus}
                      onChange={(val) => formik.setFieldValue('verificationStatus', val as string)}
                      onBlur={() => formik.setFieldTouched('verificationStatus', true)}
                      error={
                        formik.touched.verificationStatus &&
                        Boolean(formik.errors.verificationStatus)
                      }
                      helperText={
                        (formik.touched.verificationStatus &&
                          formik.errors.verificationStatus) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Submit buttons */}
              <Grid size={12} justifyContent="flex-end" display="flex" gap={1.5}>
                <Button
                  startIcon={<Iconify icon="mdi:eye-outline" />}
                  type="submit"
                  variant="outlined"
                  size="small"
                  onClick={() => setSubmitType('preview')}
                >
                  Preview
                </Button>
                <Button
                  startIcon={<Iconify icon="mdi:tray-arrow-down" />}
                  type="submit"
                  variant="contained"
                  size="small"
                  loading={isExportCreating}
                  onClick={() => setSubmitType('export')}
                >
                  Queue Export
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Card>

      <StudentReportPreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reportRequest={reportRequest}
        reportTitle={StudentReportTitleOptions.find((opt) => opt.name === report)?.label || ''}
      />
    </Box>
  );
};

export default StudentReportForm;
