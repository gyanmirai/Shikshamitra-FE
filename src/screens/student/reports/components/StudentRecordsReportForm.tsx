'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { useGetStudentsByDivisionQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';
import { useCreateStudentReportExportMutation } from 'src/redux/student/student-report/student-report-api';
import {
  StudentRecordsReportTitle,
  StudentRecordsReportTitleOptions,
} from 'src/enums/studentRecordsReports';

import { useReportOptions } from '../hooks/useReportOptions';
import StudentRecordsReportPreviewDrawer from './StudentRecordsReportPreviewDrawer';
import { buildStudentRecordsReportPayload } from '../utils/buildStudentRecordsReportPayload';
import { getStudentRecordsReportValidationSchema } from '../utils/getStudentRecordsReportValidationSchema';

// ─── Field visibility map ─────────────────────────────────────────────────────
/**
 * Lists which form fields are rendered for each Student Records report.
 * All reports always show `organization`.
 */
const StudentRecordsReportFieldsMap: Record<number, string[]> = {
  // ── Student Lists ──────────────────────────────────────────────────────────
  [StudentRecordsReportTitle.AddressLabelReport]: ['organization', 'classIds', 'divisionIds'],
  [StudentRecordsReportTitle.StudentContactList]: ['organization', 'classIds', 'divisionIds'],
  [StudentRecordsReportTitle.StudentDetailInformationForm]: [
    'organization',
    'classIds',
    'divisionIds',
    'studentId',
  ],
  [StudentRecordsReportTitle.StudentListDivisionWiseSerialNo]: [
    'organization',
    'classIds',
    'divisionIds',
  ],
  [StudentRecordsReportTitle.StudentListIDNoWise]: ['organization', 'classIds'],
  [StudentRecordsReportTitle.StudentRegister]: ['organization', 'classIds', 'divisionIds'],
  [StudentRecordsReportTitle.StudentRegisterWithAddress]: [
    'organization',
    'classIds',
    'divisionIds',
  ],
  [StudentRecordsReportTitle.NewStudentAdmissionReport]: [
    'organization',
    'classIds',
    'admissionDateFrom',
    'admissionDateTo',
  ],

  // ── Birthday & Dates ───────────────────────────────────────────────────────
  [StudentRecordsReportTitle.AllBirthdayWishListReport]: [
    'organization',
    'classIds',
    'divisionIds',
    'month',
  ],
  [StudentRecordsReportTitle.LeftStudentList]: [
    'organization',
    'classIds',
    'divisionIds',
    'leftDateFrom',
    'leftDateTo',
  ],

  // ── Summaries ──────────────────────────────────────────────────────────────
  [StudentRecordsReportTitle.StudentStrengthDivisionWiseSummary]: [
    'organization',
    'classIds',
    'divisionIds',
  ],
  [StudentRecordsReportTitle.AgeWiseSummary]: ['organization', 'classIds', 'divisionIds'],
  [StudentRecordsReportTitle.AgewiseList]: [
    'organization',
    'classIds',
    'ageRangeFrom',
    'ageRangeTo',
  ],
  [StudentRecordsReportTitle.GenderwiseStudentStrengthSummary]: [
    'organization',
    'classIds',
    'divisionIds',
  ],
  [StudentRecordsReportTitle.GenderwiseSummary]: ['organization', 'classIds', 'divisionIds'],
  [StudentRecordsReportTitle.AdmissionCategorywiseList]: [
    'organization',
    'classIds',
    'admissionCategory',
  ],
  [StudentRecordsReportTitle.VerifyStudentData]: [
    'organization',
    'classIds',
    'divisionIds',
    'verificationStatus',
  ],

  // ── Attendance ─────────────────────────────────────────────────────────────
  [StudentRecordsReportTitle.DailyStrengthGenderWiseSummary]: [
    'organization',
    'attendanceDate',
    'classIds',
    'divisionIds',
  ],
  [StudentRecordsReportTitle.DailyStrengthAttendanceSummary]: [
    'organization',
    'attendanceDate',
    'classIds',
    'divisionIds',
  ],
  [StudentRecordsReportTitle.MonthlyAttendanceSummary]: [
    'organization',
    'month',
    'classIds',
    'divisionIds',
  ],
  [StudentRecordsReportTitle.MonthlyAttendanceRegister]: [
    'organization',
    'month',
    'classIds',
    'divisionIds',
  ],
  [StudentRecordsReportTitle.MonthlyStrengthSummary]: [
    'organization',
    'month',
    'classIds',
    'divisionIds',
  ],
  [StudentRecordsReportTitle.StudentAbsentDaysReport]: [
    'organization',
    'classIds',
    'divisionIds',
    'studentId',
    'fromDate',
    'toDate',
  ],
  [StudentRecordsReportTitle.AbsentDaysReportDateRange]: [
    'organization',
    'classIds',
    'divisionIds',
    'fromDate',
    'toDate',
  ],
  [StudentRecordsReportTitle.MonthlyStrengthReportDateRange]: [
    'organization',
    'classIds',
    'divisionIds',
    'fromDate',
    'toDate',
  ],

  // ── Demographics ───────────────────────────────────────────────────────────
  [StudentRecordsReportTitle.ReligionWiseReport]: ['organization', 'classIds', 'religion'],
  [StudentRecordsReportTitle.CasteCategoryWiseReport]: [
    'organization',
    'classIds',
    'casteCategory',
  ],
  [StudentRecordsReportTitle.BloodGroupWiseReport]: ['organization', 'classIds', 'bloodGroup'],
  [StudentRecordsReportTitle.MotherTongueWiseReport]: ['organization', 'classIds', 'motherTongue'],
};

// ─── Required fields map ──────────────────────────────────────────────────────
/**
 * Fields that MUST have a value before the form can be submitted.
 */
const StudentRecordsReportRequiredFieldsMap: Record<number, string[]> = {
  [StudentRecordsReportTitle.AddressLabelReport]: ['organization'],
  [StudentRecordsReportTitle.StudentContactList]: ['organization'],
  [StudentRecordsReportTitle.StudentDetailInformationForm]: [
    'organization',
    'classIds',
    'divisionIds',
    'studentId',
  ],
  [StudentRecordsReportTitle.StudentListDivisionWiseSerialNo]: ['organization'],
  [StudentRecordsReportTitle.StudentListIDNoWise]: ['organization'],
  [StudentRecordsReportTitle.StudentRegister]: ['organization'],
  [StudentRecordsReportTitle.StudentRegisterWithAddress]: ['organization'],
  [StudentRecordsReportTitle.NewStudentAdmissionReport]: ['organization'],

  // ── Birthday & Dates ───────────────────────────────────────────────────────
  [StudentRecordsReportTitle.AllBirthdayWishListReport]: ['organization'],
  [StudentRecordsReportTitle.LeftStudentList]: ['organization', 'leftDateFrom', 'leftDateTo'],

  // ── Summaries ──────────────────────────────────────────────────────────────
  [StudentRecordsReportTitle.StudentStrengthDivisionWiseSummary]: ['organization'],
  [StudentRecordsReportTitle.AgeWiseSummary]: ['organization'],
  [StudentRecordsReportTitle.AgewiseList]: ['organization', 'ageRangeFrom', 'ageRangeTo'],
  [StudentRecordsReportTitle.GenderwiseStudentStrengthSummary]: ['organization'],
  [StudentRecordsReportTitle.GenderwiseSummary]: ['organization'],
  [StudentRecordsReportTitle.AdmissionCategorywiseList]: ['organization'],
  [StudentRecordsReportTitle.VerifyStudentData]: ['organization'],

  // ── Attendance ─────────────────────────────────────────────────────────────
  [StudentRecordsReportTitle.DailyStrengthGenderWiseSummary]: ['organization', 'attendanceDate'],
  [StudentRecordsReportTitle.DailyStrengthAttendanceSummary]: ['organization', 'attendanceDate'],
  [StudentRecordsReportTitle.MonthlyAttendanceSummary]: ['organization', 'month'],
  [StudentRecordsReportTitle.MonthlyAttendanceRegister]: ['organization', 'month'],
  [StudentRecordsReportTitle.MonthlyStrengthSummary]: ['organization', 'month'],
  [StudentRecordsReportTitle.StudentAbsentDaysReport]: ['organization', 'studentId'],
  [StudentRecordsReportTitle.AbsentDaysReportDateRange]: ['organization'],
  [StudentRecordsReportTitle.MonthlyStrengthReportDateRange]: ['organization'],

  // ── Demographics ───────────────────────────────────────────────────────────
  // [StudentRecordsReportTitle.GenderWiseReport]: ['organization', 'classIds', 'genderIds'],
  [StudentRecordsReportTitle.ReligionWiseReport]: ['organization'],
  [StudentRecordsReportTitle.CasteCategoryWiseReport]: ['organization', 'casteCategory'],
  [StudentRecordsReportTitle.BloodGroupWiseReport]: ['organization', 'bloodGroup'],
  [StudentRecordsReportTitle.MotherTongueWiseReport]: ['organization', 'motherTongue'],
};

// ─── Multi-select config ──────────────────────────────────────────────────────
/**
 * Reports that allow multiple class selections.
 * Others use single-select (rendered as multiple=false).
 */
const MULTI_CLASS_REPORTS = new Set<StudentRecordsReportTitle>([
  StudentRecordsReportTitle.AddressLabelReport,
  StudentRecordsReportTitle.StudentContactList,
  StudentRecordsReportTitle.StudentRegisterWithAddress,
  StudentRecordsReportTitle.NewStudentAdmissionReport,
  StudentRecordsReportTitle.AllBirthdayWishListReport,
  StudentRecordsReportTitle.LeftStudentList,
  StudentRecordsReportTitle.StudentStrengthDivisionWiseSummary,
  StudentRecordsReportTitle.AgeWiseSummary,
  StudentRecordsReportTitle.AgewiseList,
  StudentRecordsReportTitle.GenderwiseStudentStrengthSummary,
  StudentRecordsReportTitle.GenderwiseSummary,
  StudentRecordsReportTitle.AdmissionCategorywiseList,
  StudentRecordsReportTitle.VerifyStudentData,
  StudentRecordsReportTitle.DailyStrengthGenderWiseSummary,
  StudentRecordsReportTitle.DailyStrengthAttendanceSummary,
  StudentRecordsReportTitle.MonthlyAttendanceSummary,
  StudentRecordsReportTitle.AbsentDaysReportDateRange,
  StudentRecordsReportTitle.MonthlyStrengthReportDateRange,
  StudentRecordsReportTitle.ReligionWiseReport,
  StudentRecordsReportTitle.CasteCategoryWiseReport,
  StudentRecordsReportTitle.BloodGroupWiseReport,
  StudentRecordsReportTitle.MotherTongueWiseReport,
]);

/**
 * Reports that allow multiple division selections.
 */
const MULTI_DIVISION_REPORTS = new Set<StudentRecordsReportTitle>([
  StudentRecordsReportTitle.AddressLabelReport,
  StudentRecordsReportTitle.StudentContactList,
  StudentRecordsReportTitle.StudentRegisterWithAddress,
  StudentRecordsReportTitle.AllBirthdayWishListReport,
  StudentRecordsReportTitle.LeftStudentList,
  StudentRecordsReportTitle.StudentStrengthDivisionWiseSummary,
  StudentRecordsReportTitle.AgeWiseSummary,
  StudentRecordsReportTitle.GenderwiseStudentStrengthSummary,
  StudentRecordsReportTitle.GenderwiseSummary,
  StudentRecordsReportTitle.VerifyStudentData,
  StudentRecordsReportTitle.DailyStrengthGenderWiseSummary,
  StudentRecordsReportTitle.DailyStrengthAttendanceSummary,
  StudentRecordsReportTitle.MonthlyAttendanceSummary,
  StudentRecordsReportTitle.AbsentDaysReportDateRange,
  StudentRecordsReportTitle.MonthlyStrengthReportDateRange,
]);

// ─── Initial values ───────────────────────────────────────────────────────────

interface StudentRecordsReportInitialValues {
  report: StudentRecordsReportTitle;
  organization: string;
  classIds: string[];
  divisionIds: string[];
  studentId: string;
  admissionDateFrom: string | null;
  admissionDateTo: string | null;
  month: string;
  leftDateFrom: string | null;
  leftDateTo: string | null;
  attendanceDate: string | null;
  fromDate: string | null;
  toDate: string | null;
  ageRangeFrom: number | null;
  ageRangeTo: number | null;
  admissionCategory: string;
  verificationStatus: string;
  religion: string;
  casteCategory: string;
  bloodGroup: string;
  motherTongue: string;
}

const initialValues: StudentRecordsReportInitialValues = {
  report: '' as unknown as StudentRecordsReportTitle,
  organization: '',
  classIds: [],
  divisionIds: [],
  studentId: '',
  admissionDateFrom: null,
  admissionDateTo: null,
  month: '',
  leftDateFrom: null,
  leftDateTo: null,
  attendanceDate: null,
  fromDate: null,
  toDate: null,
  ageRangeFrom: null,
  ageRangeTo: null,
  admissionCategory: '',
  verificationStatus: '',
  religion: '',
  casteCategory: '',
  bloodGroup: '',
  motherTongue: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

const StudentRecordsReportForm = ({
  report,
  onSuccess,
}: {
  report: StudentRecordsReportTitle;
  onSuccess?: () => void;
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const {
    monthOptions,
    genderOptions,
    religionOptions,
    categoryOptions,
    bloodGroupOptions,
    motherTongueOptions,
    admissionCategoryOptions,
    verificationStatusOptions,
  } = useReportOptions();

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportRequest, setReportRequest] = useState<any>(null);
  const [submitType, setSubmitType] = useState<'preview' | 'export'>('preview');

  const [dynamicSchema, setDynamicSchema] = useState(
    getStudentRecordsReportValidationSchema([], [])
  );

  const [createExport, { isLoading: isExportCreating }] = useQueryAndMutation<
    typeof useCreateStudentReportExportMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: useCreateStudentReportExportMutation,
    popupConfig: { error: true, errorMessage: 'Failed to initiate export' },
  });

  // ─── Derived field lists ─────────────────────────────────────────────────────
  const currentFields = useMemo(
    () => StudentRecordsReportFieldsMap[report as number] || [],
    [report]
  );

  const currentRequiredFields = useMemo(
    () => StudentRecordsReportRequiredFieldsMap[report as number] || [],
    [report]
  );

  const showField = (fieldName: string) => currentFields.includes(fieldName);
  const isRequired = (fieldName: string) => currentRequiredFields.includes(fieldName);
  const isMultiClass = MULTI_CLASS_REPORTS.has(report);
  const isMultiDivision = MULTI_DIVISION_REPORTS.has(report);

  // ─── Render ──────────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: {
      ...initialValues,
      report: report as unknown as StudentRecordsReportTitle,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const requestPayload = buildStudentRecordsReportPayload(report, values);

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

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    setDynamicSchema(getStudentRecordsReportValidationSchema(currentFields, currentRequiredFields));
  }, [currentFields, currentRequiredFields]);

  useEffect(() => {
    setAllOrganization(cloneDeep(currentMedium?.educationMediumStages || []));
  }, [currentMedium?.educationMediumStages]);

  useEffect(() => {
    const standards =
      allOrganization.find((org: any) => org?.id === formik.values.organization)?.standards || [];
    setAllClass(standards);
    // Reset class & division when organization changes
    formik.setFieldValue('classIds', []);
    formik.setFieldValue('divisionIds', []);
    setAllDivision([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOrganization, formik.values.organization]);

  useEffect(() => {
    // Only reset if report type actually changes
    if (formik.values.report !== report) {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, dynamicSchema]);

  // ─── Student Search API ─────────────────────────────────────────────────────
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // We only enable the query if a division is selected (using the first selected division)
  const queryDivisionId = formik.values?.divisionIds?.[0];
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentsByDivisionQuery(
    {
      divisionId: queryDivisionId,
      skipCount: 0,
      maxResultCount: 50,
      searchTerm: studentSearchTerm,
    },
    { skip: !queryDivisionId || !showField('studentId') }
  );

  const studentOptions: { id: string; name: string }[] =
    studentsData?.items?.map((student: any) => ({
      id: student.studentId,
      name:
        student.studentName ||
        [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
    })) || [];

  useEffect(() => {
    // Derive available divisions from all currently selected classes
    const selectedIds = formik.values.classIds;
    if (selectedIds.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisionIds', []);
      return;
    }
    const divisions = allClass
      .filter((cls) => selectedIds.includes(cls.id))
      .flatMap((cls) => cls.divisions || []);
    // De-duplicate in case of overlapping IDs
    const seen = new Set<string>();
    const uniqueDivisions = divisions.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
    setAllDivision(uniqueDivisions);
    // Reset division selection whenever class changes
    formik.setFieldValue('divisionIds', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.classIds]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Organisation — always shown */}
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

              {/* Class */}
              {showField('classIds') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.classIds && formik.errors.classIds)}>
                    <CustomSelect
                      options={allClass}
                      label={`Class${isRequired('classIds') ? ' *' : ''}`}
                      multiple={isMultiClass}
                      value={formik.values.classIds}
                      onChange={(val) => {
                        formik.setFieldValue(
                          'classIds',
                          isMultiClass ? val : val ? [val as string] : []
                        );
                      }}
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

              {/* Division */}
              {showField('divisionIds') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.divisionIds && formik.errors.divisionIds)}
                  >
                    <CustomSelect
                      options={allDivision}
                      label={`Division${isRequired('divisionIds') ? ' *' : ''}`}
                      multiple={isMultiDivision}
                      value={formik.values.divisionIds}
                      onChange={(val) =>
                        formik.setFieldValue(
                          'divisionIds',
                          isMultiDivision ? val : val ? [val as string] : []
                        )
                      }
                      onBlur={() => formik.setFieldTouched('divisionIds', true)}
                      error={formik.touched.divisionIds && Boolean(formik.errors.divisionIds)}
                      helperText={
                        (formik.touched.divisionIds && formik.errors.divisionIds) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={formik.values.classIds.length === 0}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Admission Date From */}
              {showField('admissionDateFrom') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.admissionDateFrom && formik.errors.admissionDateFrom)}
                  >
                    <DatePicker
                      label={`Admission Date From${isRequired('admissionDateFrom') ? ' *' : ''}`}
                      value={
                        formik.values.admissionDateFrom
                          ? dayjs(formik.values.admissionDateFrom)
                          : null
                      }
                      onChange={(date) =>
                        formik.setFieldValue('admissionDateFrom', date ? date.toISOString() : null)
                      }
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error:
                            formik.touched.admissionDateFrom &&
                            Boolean(formik.errors.admissionDateFrom),
                          helperText: (formik.touched.admissionDateFrom &&
                            formik.errors.admissionDateFrom) as string,
                          onBlur: () => formik.setFieldTouched('admissionDateFrom', true),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Admission Date To */}
              {showField('admissionDateTo') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.admissionDateTo && formik.errors.admissionDateTo)}
                  >
                    <DatePicker
                      label={`Admission Date To${isRequired('admissionDateTo') ? ' *' : ''}`}
                      value={
                        formik.values.admissionDateTo ? dayjs(formik.values.admissionDateTo) : null
                      }
                      onChange={(date) =>
                        formik.setFieldValue('admissionDateTo', date ? date.toISOString() : null)
                      }
                      minDate={
                        formik.values.admissionDateFrom
                          ? dayjs(formik.values.admissionDateFrom)
                          : undefined
                      }
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error:
                            formik.touched.admissionDateTo &&
                            Boolean(formik.errors.admissionDateTo),
                          helperText: (formik.touched.admissionDateTo &&
                            formik.errors.admissionDateTo) as string,
                          onBlur: () => formik.setFieldTouched('admissionDateTo', true),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Month */}
              {showField('month') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.month && formik.errors.month)}>
                    <CustomSelect
                      options={monthOptions}
                      label={`Month${isRequired('month') ? ' *' : ''}`}
                      value={formik.values.month}
                      onChange={(val) => formik.setFieldValue('month', val)}
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

              {/* Attendance Date */}
              {showField('attendanceDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DatePicker
                    label={`Attendance Date${isRequired('attendanceDate') ? ' *' : ''}`}
                    value={
                      formik.values.attendanceDate ? dayjs(formik.values.attendanceDate) : null
                    }
                    onChange={(date) =>
                      formik.setFieldValue('attendanceDate', date ? date.toISOString() : null)
                    }
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error:
                          formik.touched.attendanceDate && Boolean(formik.errors.attendanceDate),
                        helperText: (formik.touched.attendanceDate &&
                          formik.errors.attendanceDate) as string,
                        onBlur: () => formik.setFieldTouched('attendanceDate', true),
                      },
                    }}
                  />
                </Grid>
              )}

              {/* From Date */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
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
                </Grid>
              )}

              {/* To Date */}
              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DatePicker
                    label={`To Date${isRequired('toDate') ? ' *' : ''}`}
                    value={formik.values.toDate ? dayjs(formik.values.toDate) : null}
                    onChange={(date) =>
                      formik.setFieldValue('toDate', date ? date.toISOString() : null)
                    }
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
                </Grid>
              )}

              {/* Left Date From */}
              {showField('leftDateFrom') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.leftDateFrom && formik.errors.leftDateFrom)}
                  >
                    <DatePicker
                      label={`Left Date From${isRequired('leftDateFrom') ? ' *' : ''}`}
                      value={formik.values.leftDateFrom ? dayjs(formik.values.leftDateFrom) : null}
                      onChange={(date) =>
                        formik.setFieldValue('leftDateFrom', date ? date.toISOString() : null)
                      }
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: formik.touched.leftDateFrom && Boolean(formik.errors.leftDateFrom),
                          helperText: (formik.touched.leftDateFrom &&
                            formik.errors.leftDateFrom) as string,
                          onBlur: () => formik.setFieldTouched('leftDateFrom', true),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Left Date To */}
              {showField('leftDateTo') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.leftDateTo && formik.errors.leftDateTo)}
                  >
                    <DatePicker
                      label={`Left Date To${isRequired('leftDateTo') ? ' *' : ''}`}
                      value={formik.values.leftDateTo ? dayjs(formik.values.leftDateTo) : null}
                      onChange={(date) =>
                        formik.setFieldValue('leftDateTo', date ? date.toISOString() : null)
                      }
                      minDate={
                        formik.values.leftDateFrom ? dayjs(formik.values.leftDateFrom) : undefined
                      }
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: formik.touched.leftDateTo && Boolean(formik.errors.leftDateTo),
                          helperText: (formik.touched.leftDateTo &&
                            formik.errors.leftDateTo) as string,
                          onBlur: () => formik.setFieldTouched('leftDateTo', true),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Age Range From */}
              {showField('ageRangeFrom') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.ageRangeFrom && formik.errors.ageRangeFrom)}
                  >
                    <TextField
                      label={`Age From${isRequired('ageRangeFrom') ? ' *' : ''}`}
                      name="ageRangeFrom"
                      type="number"
                      value={formik.values.ageRangeFrom ?? ''}
                      onChange={formik.handleChange}
                      onBlur={() => formik.setFieldTouched('ageRangeFrom', true)}
                      error={formik.touched.ageRangeFrom && Boolean(formik.errors.ageRangeFrom)}
                      helperText={
                        (formik.touched.ageRangeFrom && formik.errors.ageRangeFrom) as string
                      }
                      size="small"
                      fullWidth
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Age Range To */}
              {showField('ageRangeTo') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.ageRangeTo && formik.errors.ageRangeTo)}
                  >
                    <TextField
                      label={`Age To${isRequired('ageRangeTo') ? ' *' : ''}`}
                      name="ageRangeTo"
                      type="number"
                      value={formik.values.ageRangeTo ?? ''}
                      onChange={formik.handleChange}
                      onBlur={() => formik.setFieldTouched('ageRangeTo', true)}
                      error={formik.touched.ageRangeTo && Boolean(formik.errors.ageRangeTo)}
                      helperText={(formik.touched.ageRangeTo && formik.errors.ageRangeTo) as string}
                      size="small"
                      fullWidth
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Admission Category */}
              {showField('admissionCategory') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.admissionCategory && formik.errors.admissionCategory)}
                  >
                    <CustomSelect
                      options={admissionCategoryOptions}
                      label={`Admission Category${isRequired('admissionCategory') ? ' *' : ''}`}
                      value={formik.values.admissionCategory}
                      onChange={(val) => formik.setFieldValue('admissionCategory', val)}
                      onBlur={() => formik.setFieldTouched('admissionCategory', true)}
                      error={
                        formik.touched.admissionCategory && Boolean(formik.errors.admissionCategory)
                      }
                      helperText={
                        (formik.touched.admissionCategory &&
                          formik.errors.admissionCategory) as string
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
                      options={verificationStatusOptions}
                      label={`Verification Status${isRequired('verificationStatus') ? ' *' : ''}`}
                      value={formik.values.verificationStatus}
                      onChange={(val) => formik.setFieldValue('verificationStatus', val)}
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

              {/* Student Autocomplete */}
              {showField('studentId') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.studentId && formik.errors.studentId)}>
                    <Autocomplete
                      options={studentOptions}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      loading={studentsLoading}
                      onInputChange={(e, newInputValue) => setStudentSearchTerm(newInputValue)}
                      onChange={(e, value) =>
                        formik.setFieldValue('studentId', value ? value.id : '')
                      }
                      onBlur={() => formik.setFieldTouched('studentId', true)}
                      disabled={!queryDivisionId}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={`Student${isRequired('studentId') ? ' *' : ''}`}
                          error={formik.touched.studentId && Boolean(formik.errors.studentId)}
                          helperText={
                            (!queryDivisionId
                              ? 'Please select a Division first.'
                              : formik.touched.studentId && formik.errors.studentId) as string
                          }
                          size="small"
                        />
                      )}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Religion */}
              {showField('religion') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.religion && formik.errors.religion)}>
                    <CustomSelect
                      options={religionOptions}
                      label={`Religion${isRequired('religion') ? ' *' : ''}`}
                      value={formik.values.religion}
                      onChange={(val) => formik.setFieldValue('religion', val)}
                      onBlur={() => formik.setFieldTouched('religion', true)}
                      error={formik.touched.religion && Boolean(formik.errors.religion)}
                      helperText={(formik.touched.religion && formik.errors.religion) as string}
                      labelKey="name"
                      valueKey="id"
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
                      options={categoryOptions}
                      label={`Caste Category${isRequired('casteCategory') ? ' *' : ''}`}
                      value={formik.values.casteCategory}
                      onChange={(val) => formik.setFieldValue('casteCategory', val)}
                      onBlur={() => formik.setFieldTouched('casteCategory', true)}
                      error={formik.touched.casteCategory && Boolean(formik.errors.casteCategory)}
                      helperText={
                        (formik.touched.casteCategory && formik.errors.casteCategory) as string
                      }
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
                      options={bloodGroupOptions}
                      label={`Blood Group${isRequired('bloodGroup') ? ' *' : ''}`}
                      value={formik.values.bloodGroup}
                      onChange={(val) => formik.setFieldValue('bloodGroup', val)}
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

              {/* Mother Tongue */}
              {showField('motherTongue') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.motherTongue && formik.errors.motherTongue)}
                  >
                    <CustomSelect
                      options={motherTongueOptions}
                      label={`Mother Tongue${isRequired('motherTongue') ? ' *' : ''}`}
                      value={formik.values.motherTongue}
                      onChange={(val) => formik.setFieldValue('motherTongue', val)}
                      onBlur={() => formik.setFieldTouched('motherTongue', true)}
                      error={formik.touched.motherTongue && Boolean(formik.errors.motherTongue)}
                      helperText={
                        (formik.touched.motherTongue && formik.errors.motherTongue) as string
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

      <StudentRecordsReportPreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reportRequest={reportRequest}
        reportTitle={
          StudentRecordsReportTitleOptions.find((opt) => opt.name === report)?.label || ''
        }
      />
    </Box>
  );
};

export default StudentRecordsReportForm;
