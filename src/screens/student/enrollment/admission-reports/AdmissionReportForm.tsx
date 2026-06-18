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
import { ReligionTypeArray } from 'src/enums/religion';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Card, Button, TextField } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { useCreateAcademicReportExportMutation } from 'src/redux/academicAPI/AcademicReportApi';
import { useGetInquiryPreferenceQuery } from 'src/redux/student/inquiry-preference/inquiry-preference-api';
import {
  AdmissionReportTitle,
  AdmissionReportApiTypeMap,
  AdmissionReportTitleOptions,
} from 'src/enums/admission-reports';

import AdmissionReportPreviewDrawer from './AdmissionReportPreviewDrawer';
import { getAdmissionReportsValidationSchema } from './getAdmissionReportsValidationSchema';

// ─── Static option arrays ────────────────────────────────────────────────────

const ADMISSION_STATUS_OPTIONS = [
  { id: 'pending', name: 'Pending' },
  { id: 'approved', name: 'Approved' },
  { id: 'rejected', name: 'Rejected' },
  { id: 'waitlisted', name: 'Waitlisted' },
  { id: 'cancelled', name: 'Cancelled' },
];

const VERIFICATION_STATUS_OPTIONS = [
  { id: 'verified', name: 'Verified' },
  { id: 'pending', name: 'Pending' },
  { id: 'failed', name: 'Failed' },
  { id: 'not_submitted', name: 'Not Submitted' },
];

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

// ─── Field visibility map ─────────────────────────────────────────────────────

const AdmissionReportFieldsMap: Record<number, string[]> = {
  // Inquiry Reports
  [AdmissionReportTitle.InquirySummaryReport]: [
    'organization',
    'dateFrom',
    'dateTo',
    'inquirySource',
  ],
  [AdmissionReportTitle.InquirySourceAnalysisReport]: ['organization', 'dateFrom', 'dateTo'],

  // Registration Form Issued Reports
  [AdmissionReportTitle.RegistrationFormIssuedReport]: [
    'organization',
    'dateFrom',
    'dateTo',
    'classAppliedFor',
  ],
  [AdmissionReportTitle.UnusedRegistrationFormsReport]: ['organization', 'dateFrom', 'dateTo'],

  // Registration Reports
  [AdmissionReportTitle.RegistrationSummaryReport]: [
    'organization',
    'dateFrom',
    'dateTo',
    'classAppliedFor',
  ],
  [AdmissionReportTitle.RegistrationConversionReport]: ['organization', 'dateFrom', 'dateTo'],

  // Entrance Exam Reports
  [AdmissionReportTitle.EntranceExamAttendanceReport]: [
    'organization',
    'exam',
    'dateFrom',
    'dateTo',
  ],
  [AdmissionReportTitle.EntranceExamResultReport]: ['organization', 'exam', 'classAppliedFor'],
  [AdmissionReportTitle.EntranceExamMeritList]: ['organization', 'exam', 'classAppliedFor'],

  // Admission Reports
  [AdmissionReportTitle.AdmissionSummaryReport]: [
    'organization',
    'classAppliedFor',
    'dateFrom',
    'dateTo',
  ],
  [AdmissionReportTitle.AdmissionStatusReport]: ['organization', 'status'],
  [AdmissionReportTitle.InquiryToAdmissionConversionReport]: ['organization', 'dateFrom', 'dateTo'],

  // Demographic Reports
  [AdmissionReportTitle.ReligionWiseReport]: [
    'organization',
    'classAppliedForMultiple',
    'religion',
  ],
  [AdmissionReportTitle.CasteCategoryWiseReport]: [
    'organization',
    'classAppliedForMultiple',
    'casteCategory',
  ],
  [AdmissionReportTitle.PinCodeWiseDistributionReport]: [
    'organization',
    'country',
    'state',
    'city',
    'pinCode',
  ],
  [AdmissionReportTitle.DateOfBirthReport]: [
    'organization',
    'classAppliedFor',
    'month',
    'dateFrom',
    'dateTo',
  ],
  [AdmissionReportTitle.GenderWiseDistributionReport]: [
    'organization',
    'classAppliedFor',
    'gender',
  ],
  [AdmissionReportTitle.PreviousSchoolReport]: [
    'organization',
    'classAppliedForMultiple',
    'dateFrom',
    'dateTo',
  ],
  [AdmissionReportTitle.AdmissionSourceReport]: [
    'organization',
    'classAppliedForMultiple',
    'dateFrom',
    'dateTo',
  ],
  [AdmissionReportTitle.MonthlyAdmissionTrendReport]: [
    'organization',
    'classAppliedForMultiple',
    'dateFrom',
    'dateTo',
  ],
  [AdmissionReportTitle.AdmissionComparisonReport]: [
    'organization',
    'classAppliedForMultiple',
    'dateFrom',
    'dateTo',
  ],
  [AdmissionReportTitle.ClassWiseAdmissionReport]: ['organization', 'dateFrom', 'dateTo'],
  [AdmissionReportTitle.AadhaarVerificationReport]: [
    'organization',
    'classAppliedForMultiple',
    'verificationStatus',
  ],
  [AdmissionReportTitle.ContactInformationReport]: ['organization', 'classAppliedForMultiple'],
  [AdmissionReportTitle.DocumentVerificationReport]: [
    'organization',
    'classAppliedForMultiple',
    'verificationStatus',
  ],
};

// ─── Required field map ───────────────────────────────────────────────────────
/**
 * Fields that MUST have a value before the form can be submitted.
 * All other visible fields are optional.
 */
const AdmissionReportRequiredFieldsMap: Record<number, string[]> = {
  [AdmissionReportTitle.InquirySummaryReport]: ['organization'],
  [AdmissionReportTitle.InquirySourceAnalysisReport]: ['organization'],
  [AdmissionReportTitle.RegistrationFormIssuedReport]: ['organization'],
  [AdmissionReportTitle.UnusedRegistrationFormsReport]: ['organization'],
  [AdmissionReportTitle.RegistrationSummaryReport]: ['organization'],
  [AdmissionReportTitle.RegistrationConversionReport]: ['organization'],
  [AdmissionReportTitle.EntranceExamAttendanceReport]: ['organization'],
  [AdmissionReportTitle.EntranceExamResultReport]: ['organization'],
  [AdmissionReportTitle.EntranceExamMeritList]: ['organization'],
  [AdmissionReportTitle.AdmissionSummaryReport]: ['organization'],
  [AdmissionReportTitle.AdmissionStatusReport]: ['organization'],
  [AdmissionReportTitle.InquiryToAdmissionConversionReport]: ['organization'],

  // Demographic Reports
  [AdmissionReportTitle.ReligionWiseReport]: [
    'organization',
    'classAppliedForMultiple',
    'religion',
  ],
  [AdmissionReportTitle.CasteCategoryWiseReport]: [
    'organization',
    'classAppliedForMultiple',
    'casteCategory',
  ],
  [AdmissionReportTitle.PinCodeWiseDistributionReport]: ['organization', 'country'],
  [AdmissionReportTitle.DateOfBirthReport]: ['organization', 'classAppliedFor', 'month'],
  [AdmissionReportTitle.GenderWiseDistributionReport]: [
    'organization',
    'classAppliedFor',
    'gender',
  ],
  [AdmissionReportTitle.PreviousSchoolReport]: ['organization'],
  [AdmissionReportTitle.AdmissionSourceReport]: ['organization'],
  [AdmissionReportTitle.MonthlyAdmissionTrendReport]: ['organization'],
  [AdmissionReportTitle.AdmissionComparisonReport]: ['organization'],
  [AdmissionReportTitle.ClassWiseAdmissionReport]: ['organization'],
  [AdmissionReportTitle.AadhaarVerificationReport]: ['organization'],
  [AdmissionReportTitle.ContactInformationReport]: ['organization'],
  [AdmissionReportTitle.DocumentVerificationReport]: ['organization'],
};

// ─── Initial values ───────────────────────────────────────────────────────────
interface AdmissionReportInitialValues {
  report: AdmissionReportTitle;
  organization: string;
  dateFrom: string | null;
  dateTo: string | null;
  classAppliedFor: string;
  classAppliedForMultiple: string[];
  inquirySource: string;
  exam: string;
  status: string;
  religion: string[];
  casteCategory: string[];
  country: { name: string; isoCode: string } | null;
  state: { name: string; isoCode: string } | null;
  city: { name: string } | null;
  pinCode: string;
  month: string;
  gender: string;
  verificationStatus: string;
}

const initialValues: AdmissionReportInitialValues = {
  report: '' as unknown as AdmissionReportTitle,
  organization: '',
  dateFrom: null,
  dateTo: null,
  classAppliedFor: '',
  classAppliedForMultiple: [],
  inquirySource: '',
  exam: '',
  status: '',
  religion: [],
  casteCategory: [],
  country: { name: '', isoCode: '' },
  state: { name: '', isoCode: '' },
  city: { name: '' },
  pinCode: '',
  month: '',
  gender: '',
  verificationStatus: '',
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdmissionReportForm = ({
  report,
  onSuccess,
}: {
  report: AdmissionReportTitle;
  onSuccess?: () => void;
}) => {
  const { currentMedium, currentYear } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportRequest, setReportRequest] = useState<any>(null);
  const [submitType, setSubmitType] = useState<'preview' | 'export'>('preview');

  const [dynamicSchema, setDynamicSchema] = useState(getAdmissionReportsValidationSchema([], []));

  const [createExport, { isLoading: isExportCreating }] = useQueryAndMutation<
    typeof useCreateAcademicReportExportMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: useCreateAcademicReportExportMutation,
    popupConfig: { error: true, errorMessage: 'Failed to initiate export' },
  });

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

  // ─── Formik ─────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: {
      ...initialValues,
      report: report as unknown as AdmissionReportTitle,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const classIds =
        values.classAppliedForMultiple && values.classAppliedForMultiple.length > 0
          ? values.classAppliedForMultiple
          : values.classAppliedFor
            ? [values.classAppliedFor]
            : [];

      const requestPayload: any = {
        reportType: AdmissionReportApiTypeMap[report],
        filters: {
          academicYearId: currentYear?.id || null,
          classIds: classIds.length > 0 ? classIds : null,
          dateFrom: values.dateFrom ? dayjs(values.dateFrom).format('YYYY-MM-DD') : null,
          dateTo: values.dateTo ? dayjs(values.dateTo).format('YYYY-MM-DD') : null,
          inquirySource: values.inquirySource || null,
          examId: values.exam || null,
          status: values.status || null,
          religion: values.religion.length > 0 ? values.religion : null,
          casteCategory: values.casteCategory.length > 0 ? values.casteCategory : null,
          country: values.country?.name || null,
          state: values.state?.name || null,
          city: values.city?.name || null,
          pinCode: values.pinCode || null,
          month: values.month || null,
          gender: values.gender || null,
          verificationStatus: values.verificationStatus || null,
        },
      };

      if (report === AdmissionReportTitle.MonthlyAdmissionTrendReport) {
        requestPayload.chart = {
          type: 'line',
          title: 'Monthly Admissions Trend',
          categoryField: 'Month',
          valueField: 'Admissions Count',
        };
      }

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

  // ─── Derived field lists ─────────────────────────────────────────────────
  const currentFields = useMemo(() => AdmissionReportFieldsMap[report as number] || [], [report]);

  const currentRequiredFields = useMemo(
    () => AdmissionReportRequiredFieldsMap[report as number] || [],
    [report]
  );

  const showField = (fieldName: string) => currentFields.includes(fieldName);
  const isRequired = (fieldName: string) => currentRequiredFields.includes(fieldName);

  // ─── Effects ─────────────────────────────────────────────────────────────

  // Rebuild validation schema when field sets change
  useEffect(() => {
    setDynamicSchema(getAdmissionReportsValidationSchema(currentFields, currentRequiredFields));
  }, [currentFields, currentRequiredFields]);

  // Sync organisation list from medium
  useEffect(() => {
    setAllOrganization(cloneDeep(currentMedium?.educationMediumStages || []));
  }, [currentMedium?.educationMediumStages]);

  // Sync class list from selected organisation
  useEffect(() => {
    const standards =
      allOrganization.find((org: any) => org?.id === formik.values.organization)?.standards || [];
    setAllClass(standards);
  }, [allOrganization, formik.values.organization]);

  // ─── Render ──────────────────────────────────────────────────────────────
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
                      formik.setFieldValue('classAppliedFor', '');
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

              {/* Date From */}
              {showField('dateFrom') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.dateFrom && formik.errors.dateFrom)}>
                    <DatePicker
                      label={`From Date${isRequired('dateFrom') ? ' *' : ''}`}
                      value={formik.values.dateFrom ? dayjs(formik.values.dateFrom) : null}
                      onChange={(date) =>
                        formik.setFieldValue('dateFrom', date ? date.toISOString() : null)
                      }
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: formik.touched.dateFrom && Boolean(formik.errors.dateFrom),
                          helperText: (formik.touched.dateFrom && formik.errors.dateFrom) as string,
                          onBlur: () => formik.setFieldTouched('dateFrom', true),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Date To */}
              {showField('dateTo') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.dateTo && formik.errors.dateTo)}>
                    <DatePicker
                      label={`To Date${isRequired('dateTo') ? ' *' : ''}`}
                      value={formik.values.dateTo ? dayjs(formik.values.dateTo) : null}
                      onChange={(date) =>
                        formik.setFieldValue('dateTo', date ? date.toISOString() : null)
                      }
                      minDate={formik.values.dateFrom ? dayjs(formik.values.dateFrom) : undefined}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: formik.touched.dateTo && Boolean(formik.errors.dateTo),
                          helperText: (formik.touched.dateTo && formik.errors.dateTo) as string,
                          onBlur: () => formik.setFieldTouched('dateTo', true),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Class Applied For */}
              {showField('classAppliedFor') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.classAppliedFor && formik.errors.classAppliedFor)}
                  >
                    <CustomSelect
                      options={allClass}
                      label={`Class Applied For${isRequired('classAppliedFor') ? ' *' : ''}`}
                      value={formik.values.classAppliedFor}
                      onChange={(val) => formik.setFieldValue('classAppliedFor', val as string)}
                      onBlur={() => formik.setFieldTouched('classAppliedFor', true)}
                      error={
                        formik.touched.classAppliedFor && Boolean(formik.errors.classAppliedFor)
                      }
                      helperText={
                        (formik.touched.classAppliedFor && formik.errors.classAppliedFor) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!formik.values.organization}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Inquiry Source */}
              {showField('inquirySource') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.inquirySource && formik.errors.inquirySource)}
                  >
                    <CustomSelect
                      options={inquiryPreference?.items || []}
                      isLoading={inquiryPrefrenceLoading}
                      label={`Inquiry Source${isRequired('inquirySource') ? ' *' : ''}`}
                      value={formik.values.inquirySource}
                      onChange={(val) => formik.setFieldValue('inquirySource', val as string)}
                      onBlur={() => formik.setFieldTouched('inquirySource', true)}
                      error={formik.touched.inquirySource && Boolean(formik.errors.inquirySource)}
                      helperText={
                        (formik.touched.inquirySource && formik.errors.inquirySource) as string
                      }
                      labelKey="preferenceName"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Exam */}
              {showField('exam') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.exam && formik.errors.exam)}>
                    <CustomSelect
                      options={[]}
                      label={`Exam${isRequired('exam') ? ' *' : ''}`}
                      value={formik.values.exam}
                      onChange={(val) => formik.setFieldValue('exam', val as string)}
                      onBlur={() => formik.setFieldTouched('exam', true)}
                      error={formik.touched.exam && Boolean(formik.errors.exam)}
                      helperText={(formik.touched.exam && formik.errors.exam) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!formik.values.organization}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Admission Status */}
              {showField('status') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.status && formik.errors.status)}>
                    <CustomSelect
                      options={ADMISSION_STATUS_OPTIONS}
                      label={`Status${isRequired('status') ? ' *' : ''}`}
                      value={formik.values.status}
                      onChange={(val) => formik.setFieldValue('status', val as string)}
                      onBlur={() => formik.setFieldTouched('status', true)}
                      error={formik.touched.status && Boolean(formik.errors.status)}
                      helperText={(formik.touched.status && formik.errors.status) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Class Applied For (Multiple) */}
              {showField('classAppliedForMultiple') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={
                      !!(
                        formik.touched.classAppliedForMultiple &&
                        formik.errors.classAppliedForMultiple
                      )
                    }
                  >
                    <CustomSelect
                      options={allClass}
                      label={`Class Applied For${isRequired('classAppliedForMultiple') ? ' *' : ''}`}
                      multiple
                      value={formik.values.classAppliedForMultiple}
                      onChange={(val) => formik.setFieldValue('classAppliedForMultiple', val)}
                      onBlur={() => formik.setFieldTouched('classAppliedForMultiple', true)}
                      error={
                        formik.touched.classAppliedForMultiple &&
                        Boolean(formik.errors.classAppliedForMultiple)
                      }
                      helperText={
                        (formik.touched.classAppliedForMultiple &&
                          formik.errors.classAppliedForMultiple) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!formik.values.organization}
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
                      onChange={(value) => {
                        formik.setFieldValue('religion', value);
                      }}
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
                      onChange={(val) => {
                        formik.setFieldValue('casteCategory', val);
                      }}
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
      <AdmissionReportPreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reportRequest={reportRequest}
        reportTitle={AdmissionReportTitleOptions.find((opt) => opt.name === report)?.label || ''}
      />
    </Box>
  );
};

export default AdmissionReportForm;
