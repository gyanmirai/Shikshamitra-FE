'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { cloneDeep } from 'lodash';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { Box, Grid, Card, TextField } from '@mui/material';
import { convertBase64Format } from 'src/utils/base64Formate';
import React, { useState, useEffect, useCallback } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGenerateReportMutation } from 'src/redux/student/student-enrollment-report/student-enrollemt-report';
import {
  StudentEnrollmentReportTitle,
  StudentEnrollmentReportTitleOptions,
} from 'src/enums/studentEnrollmentReport';

import { getValidationSchema } from './validationSchema';

// Initial values for all possible form fields
const initialValues = {
  report: '',
  viewMode: 'pdf',
  department: 'all',
  class: [],
  fromInquiryNumber: '',
  toInquiryNumber: '',
  fromDate: null,
  toDate: null,
  gender: 'all',
  inquiryStatus: 'all',
  enrollmentNo: '',
  enrollmentDate: null,
  name: '',
  dob: null,
  religion: '',
  cast: '',
  inquiryPreference: '',
  previousSchoolName: '',
  contactNo: null,
  primaryContactNo: null,
  secondaryContactNo: null,
  email: '',
  studentCount: null,
  classAdmitted: '',
  lastClassPassed: '',
  admissionDate: null,
  pincode: null,
  cityArea: '',
  studentName: '',
  age: null,
  section: '',
  noOfBoys: null,
  noOfGirls: null,
  totalStudent: null,
  month: '',
  numberOfNewAdmission: null,
  withdrawals: null,
  netIncrease: null,
  totalStudents: null,
  totalEnrollments: null,
  newAdmissions: null,
  retentionRate: '',
};

// Mapping of report types to their required fields
const reportFieldsMap = {
  [StudentEnrollmentReportTitle.ClassWiseStudentEnrollmentReport]: [
    'class',
    'totalStudent',
    'gender',
    'inquiryStatus',
  ],
  [StudentEnrollmentReportTitle.StudentEnrollmentList]: [
    'enrollmentNo',
    'board',
    'medium',
    'class',
    'enrollmentDate',
    'name',
    'gender',
    'dob',
    'religion',
    'cast',
    'inquiryPreference',
    'previousSchoolName',
    'contactNo',
  ],
  [StudentEnrollmentReportTitle.AadharVerificationReport]: [
    'enrollmentNo',
    'name',
    'board',
    'medium',
    'class',
    'adharNo',
  ],
  [StudentEnrollmentReportTitle.ContactInformationReport]: [
    'enrollmentNo',
    'board',
    'medium',
    'class',
    'name',
    'primaryContactNo',
    'secondaryContactNo',
    'email',
  ],
  [StudentEnrollmentReportTitle.ReligionWiseStudentReport]: [
    'religion',
    'studentCount',
    'gender',
    'class',
  ],
  [StudentEnrollmentReportTitle.CasteCategoryWiseReport]: [
    'cast',
    'studentCount',
    'gender',
    'familyCaste',
    'class',
  ],
  [StudentEnrollmentReportTitle.PreviousSchoolRepot]: [
    'studentName',
    'classAdmitted',
    'previousSchoolName',
    'lastClassPassed',
    'admissionDate',
  ],
  [StudentEnrollmentReportTitle.PinCodeWiseStudentDistribution]: [
    'pincode',
    'studentCount',
    'class',
    'cityArea',
    'gender',
  ],
  [StudentEnrollmentReportTitle.AdmissionSourceReport]: [
    'inqueryNo',
    'studentName',
    'inquiryPreference',
    'class',
    'admissionStatus',
    'dateOfEnrollment',
  ],
  [StudentEnrollmentReportTitle.DateOfBirthReport]: [
    'enrollmentNo',
    'studentName',
    'dob',
    'age',
    'class',
    'gender',
  ],
  [StudentEnrollmentReportTitle.GenderWiseStudentDistributionReport]: [
    'class',
    'section',
    'noOfBoys',
    'noOfGirls',
    'totalStudent',
  ],
  [StudentEnrollmentReportTitle.MonthlyAdmissionTrendReport]: [
    'month',
    'numberOfNewAdmission',
    'withdrawals',
    'netIncrease',
    'totalStudents',
  ],
  [StudentEnrollmentReportTitle.AcademicYearComparisonReport]: [
    'totalEnrollments',
    'newAdmissions',
    'withdrawals',
    'retentionRate',
  ],
};

const StudentReportsScreen = () => {
  // Redux selectors for board/medium
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Custom mutation hook for report generation
  const [generateReport, { isLoading }] = useQueryAndMutation({
    currentQueryAndMutation: useGenerateReportMutation,
    type: 'mutation',
  });

  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [currentFieldsState, setCurrentFieldsState] = useState<string[]>([]);
  const [dynamicSchema, setDynamicSchema] = useState(getValidationSchema([]));

  // Formik for form state and validation
  const formik = useFormik({
    initialValues,
    validationSchema: dynamicSchema,
    onSubmit: async (values) => {
      const resp = await generateReport(values.report).unwrap();
      setPdfBase64(convertBase64Format(resp.fileContent));
    },
  });

  // Update fields when report changes
  useEffect(() => {
    if (formik.values.report !== '') {
      const fields =
        reportFieldsMap[formik.values.report as unknown as StudentEnrollmentReportTitle] || [];
      setCurrentFieldsState(fields);
      setDynamicSchema(getValidationSchema(fields));
    } else {
      setCurrentFieldsState([]);
      setDynamicSchema(getValidationSchema([]));
    }
  }, [formik.values.report]);

  useEffect(() => {
    setAllOrganization(cloneDeep(medium?.educationMediumStages || []));
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    if (!allClasses.some((std: Standards) => std.id === 'all')) {
      allClasses.unshift({
        id: 'all',
        name: 'All',
        creationTime: '',
        creatorId: '',
        lastModificationTime: '',
        lastModifierId: '',
        educationMediumStageId: '',
        divisions: [],
      });
    }
    setAllClass(allClasses);
  }, [medium?.educationMediumStages]);

  const showField = useCallback(
    (field: string) => currentFieldsState.includes(field),
    [currentFieldsState]
  );

  return (
    <Box sx={{ height: '100%' }}>
      <CustomBreadcrumbs
        heading="Reports"
        description="Streamline admission management through reports offering in-depth statistics, enrollment trends, and registration data."
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Student Enrollment', href: '/student/enrollment/reports/' },
          { name: 'Reports' },
        ]}
        sx={{ mb: 2 }}
      />

      <Card>
        {/* Main dynamic report form */}
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Report Selection Field - Required */}
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <ShakingTextField
                  error={!!(formik.touched.report && formik.errors.report) || false}
                >
                  <CustomSelect
                    options={StudentEnrollmentReportTitleOptions}
                    label="Report *"
                    labelKey="label"
                    valueKey="name"
                    value={formik.values.report}
                    onChange={(val) => {
                      formik.setFieldValue('report', val);
                    }}
                    error={formik.touched.report && Boolean(formik.errors.report)}
                    helperText={(formik.touched.report && formik.errors.report) as string}
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Class Selection Field - Multi-select with "All" option */}
              {showField('class') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.class && formik.errors.class) || false}
                  >
                    <CustomSelect
                      options={allClass}
                      label="Class *"
                      multiple
                      value={formik.values.class}
                      onChange={(val) => {
                        const value = val as string[];
                        formik.handleChange({ target: { name: 'class', value: val } });
                        const allClassIds =
                          allClass?.filter((cls) => cls.id !== 'all').map((cls) => cls.id) || [];
                        const isAllClicked = value.includes('all');
                        const wasAllPreviouslySelected = (formik.values.class as string[]).includes(
                          'all'
                        );
                        if (isAllClicked && !wasAllPreviouslySelected) {
                          formik.setFieldValue('class', ['all', ...allClassIds]);
                        } else if (!isAllClicked && wasAllPreviouslySelected) {
                          formik.setFieldValue('class', []);
                        } else if (isAllClicked && wasAllPreviouslySelected) {
                          const selectedWithoutAll = value.filter((id) => id !== 'all');
                          if (selectedWithoutAll.length === allClassIds.length) {
                            formik.setFieldValue('class', ['all', ...allClassIds]);
                          } else {
                            formik.setFieldValue('class', selectedWithoutAll);
                          }
                        } else {
                          const selectedWithoutAll = value.filter((id) => id !== 'all');
                          if (selectedWithoutAll.length === allClassIds.length) {
                            formik.setFieldValue('class', ['all', ...allClassIds]);
                          } else {
                            formik.setFieldValue('class', selectedWithoutAll);
                          }
                        }
                      }}
                      error={formik.touched.class && Boolean(formik.errors.class)}
                      helperText={(formik.touched.class && formik.errors.class) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Inquiry Number Range Fields */}
              {showField('fromInquiryNumber') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.fromInquiryNumber && formik.errors.fromInquiryNumber) ||
                      false
                    }
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="From Inquiry Number *"
                      type="number"
                      value={formik.values.fromInquiryNumber}
                      onChange={(val) =>
                        formik.handleChange({ target: { name: 'fromInquiryNumber', value: val } })
                      }
                      error={
                        formik.touched.fromInquiryNumber && Boolean(formik.errors.fromInquiryNumber)
                      }
                      helperText={
                        (formik.touched.fromInquiryNumber &&
                          formik.errors.fromInquiryNumber) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('toInquiryNumber') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.toInquiryNumber && formik.errors.toInquiryNumber) || false
                    }
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="To Inquiry Number *"
                      type="number"
                      value={formik.values.toInquiryNumber}
                      onChange={(val) =>
                        formik.handleChange({ target: { name: 'toInquiryNumber', value: val } })
                      }
                      error={
                        formik.touched.toInquiryNumber && Boolean(formik.errors.toInquiryNumber)
                      }
                      helperText={
                        (formik.touched.toInquiryNumber && formik.errors.toInquiryNumber) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Gender Selection Field */}
              {showField('gender') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.gender && formik.errors.gender) || false}
                  >
                    <CustomSelect
                      options={[
                        { id: 'male', name: 'Male' },
                        { id: 'female', name: 'Female' },
                      ]}
                      label="Gender"
                      value={formik.values.gender}
                      onChange={(val) => {
                        formik.handleChange({ target: { name: 'gender', value: val } });
                        formik.setFieldTouched('gender', true);
                        formik.setFieldValue('gender', val);
                      }}
                      error={formik.touched.gender && Boolean(formik.errors.gender)}
                      helperText={(formik.touched.gender && formik.errors.gender) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Inquiry Status Field */}
              {showField('inquiryStatus') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.inquiryStatus && formik.errors.inquiryStatus) || false}
                  >
                    <CustomSelect
                      options={[
                        { id: 'interest', name: 'Interest' },
                        { id: 'pending', name: 'Pending' },
                        { id: 'notinterest', name: 'Not Interest' },
                      ]}
                      label="Inquiry Status"
                      value={formik.values.inquiryStatus}
                      onChange={(val) =>
                        formik.handleChange({ target: { name: 'inquiryStatus', value: val } })
                      }
                      error={formik.touched.inquiryStatus && Boolean(formik.errors.inquiryStatus)}
                      helperText={
                        (formik.touched.inquiryStatus && formik.errors.inquiryStatus) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Enrollment Number Field */}
              {showField('enrollmentNo') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.enrollmentNo && formik.errors.enrollmentNo) || false}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      name="enrollmentNo"
                      label="Enrollment No *"
                      value={formik.values.enrollmentNo}
                      onChange={(e) =>
                        formik.handleChange({
                          target: {
                            name: 'enrollmentNo',
                            value: e.target.value,
                          },
                        })
                      }
                      error={formik.touched.enrollmentNo && Boolean(formik.errors.enrollmentNo)}
                      helperText={
                        (formik.touched.enrollmentNo && formik.errors.enrollmentNo) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Date Range Fields */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.fromDate && formik.errors.fromDate) || false}
                  >
                    <DatePicker
                      label="From Date *"
                      value={formik.values.fromDate}
                      onChange={(date) => formik.setFieldValue('fromDate', date)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: formik.touched.fromDate && Boolean(formik.errors.fromDate),
                          helperText: formik.touched.fromDate && formik.errors.fromDate,
                          fullWidth: true,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('toDate') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.toDate && formik.errors.toDate) || false}
                  >
                    <DatePicker
                      label="To Date *"
                      value={formik.values.toDate}
                      onChange={(date) => formik.setFieldValue('toDate', date)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: formik.touched.toDate && Boolean(formik.errors.toDate),
                          helperText: formik.touched.toDate && formik.errors.toDate,
                          fullWidth: true,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Enrollment Date Field */}
              {showField('enrollmentDate') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.enrollmentDate && formik.errors.enrollmentDate) || false
                    }
                  >
                    <DatePicker
                      label="Enrollment Date *"
                      value={formik.values.enrollmentDate}
                      onChange={(date) => formik.setFieldValue('enrollmentDate', date)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error:
                            formik.touched.enrollmentDate && Boolean(formik.errors.enrollmentDate),
                          helperText: formik.touched.enrollmentDate && formik.errors.enrollmentDate,
                          fullWidth: true,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Date of Birth Field */}
              {showField('dob') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField error={!!(formik.touched.dob && formik.errors.dob) || false}>
                    <DatePicker
                      label="Date of Birth *"
                      value={formik.values.dob}
                      onChange={(date) => formik.setFieldValue('dob', date)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: formik.touched.dob && Boolean(formik.errors.dob),
                          helperText: formik.touched.dob && formik.errors.dob,
                          fullWidth: true,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Student Information Fields */}
              {showField('name') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField error={!!(formik.touched.name && formik.errors.name) || false}>
                    <TextField
                      name="name"
                      label="Name *"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('religion') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.religion && formik.errors.religion) || false}
                  >
                    <TextField
                      name="religion"
                      label="Religion *"
                      value={formik.values.religion}
                      onChange={formik.handleChange}
                      error={formik.touched.religion && Boolean(formik.errors.religion)}
                      helperText={formik.touched.religion && formik.errors.religion}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('cast') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField error={!!(formik.touched.cast && formik.errors.cast) || false}>
                    <TextField
                      name="cast"
                      label="Caste *"
                      value={formik.values.cast}
                      onChange={formik.handleChange}
                      error={formik.touched.cast && Boolean(formik.errors.cast)}
                      helperText={formik.touched.cast && formik.errors.cast}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('inquiryPreference') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.inquiryPreference && formik.errors.inquiryPreference) ||
                      false
                    }
                  >
                    <TextField
                      name="inquiryPreference"
                      label="Inquiry Preference *"
                      value={formik.values.inquiryPreference}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.inquiryPreference && Boolean(formik.errors.inquiryPreference)
                      }
                      helperText={
                        formik.touched.inquiryPreference && formik.errors.inquiryPreference
                      }
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('previousSchoolName') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.previousSchoolName && formik.errors.previousSchoolName) ||
                      false
                    }
                  >
                    <TextField
                      name="previousSchoolName"
                      label="Previous School Name *"
                      value={formik.values.previousSchoolName}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.previousSchoolName &&
                        Boolean(formik.errors.previousSchoolName)
                      }
                      helperText={
                        formik.touched.previousSchoolName && formik.errors.previousSchoolName
                      }
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Contact Information Fields */}
              {showField('contactNo') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.contactNo && formik.errors.contactNo) || false}
                  >
                    <TextField
                      name="contactNo"
                      label="Contact No *"
                      value={formik.values.contactNo}
                      onChange={formik.handleChange}
                      error={formik.touched.contactNo && Boolean(formik.errors.contactNo)}
                      helperText={formik.touched.contactNo && formik.errors.contactNo}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('primaryContactNo') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.primaryContactNo && formik.errors.primaryContactNo) || false
                    }
                  >
                    <TextField
                      name="primaryContactNo"
                      label="Primary Contact No *"
                      value={formik.values.primaryContactNo}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.primaryContactNo && Boolean(formik.errors.primaryContactNo)
                      }
                      helperText={formik.touched.primaryContactNo && formik.errors.primaryContactNo}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('secondaryContactNo') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.secondaryContactNo && formik.errors.secondaryContactNo) ||
                      false
                    }
                  >
                    <TextField
                      name="secondaryContactNo"
                      label="Secondary Contact No *"
                      value={formik.values.secondaryContactNo}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.secondaryContactNo &&
                        Boolean(formik.errors.secondaryContactNo)
                      }
                      helperText={
                        formik.touched.secondaryContactNo && formik.errors.secondaryContactNo
                      }
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('email') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.email && formik.errors.email) || false}
                  >
                    <TextField
                      name="email"
                      label="Email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Statistical Fields */}
              {showField('studentCount') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.studentCount && formik.errors.studentCount) || false}
                  >
                    <TextField
                      name="studentCount"
                      label="Student Count *"
                      type="number"
                      value={formik.values.studentCount}
                      onChange={formik.handleChange}
                      error={formik.touched.studentCount && Boolean(formik.errors.studentCount)}
                      helperText={formik.touched.studentCount && formik.errors.studentCount}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Admission Related Fields */}
              {showField('classAdmitted') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.classAdmitted && formik.errors.classAdmitted) || false}
                  >
                    <TextField
                      name="classAdmitted"
                      label="Class Admitted *"
                      value={formik.values.classAdmitted}
                      onChange={formik.handleChange}
                      error={formik.touched.classAdmitted && Boolean(formik.errors.classAdmitted)}
                      helperText={formik.touched.classAdmitted && formik.errors.classAdmitted}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('lastClassPassed') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.lastClassPassed && formik.errors.lastClassPassed) || false
                    }
                  >
                    <TextField
                      name="lastClassPassed"
                      label="Last Class Passed *"
                      value={formik.values.lastClassPassed}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.lastClassPassed && Boolean(formik.errors.lastClassPassed)
                      }
                      helperText={formik.touched.lastClassPassed && formik.errors.lastClassPassed}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('admissionDate') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.admissionDate && formik.errors.admissionDate) || false}
                  >
                    <DatePicker
                      label="Admission Date *"
                      value={formik.values.admissionDate}
                      onChange={(date) => formik.setFieldValue('admissionDate', date)}
                      onClose={() => formik.setFieldTouched('admissionDate', true)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error:
                            formik.touched.admissionDate && Boolean(formik.errors.admissionDate),
                          helperText: formik.touched.admissionDate && formik.errors.admissionDate,
                          fullWidth: true,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Location Fields */}
              {showField('pincode') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.pincode && formik.errors.pincode) || false}
                  >
                    <TextField
                      name="pincode"
                      label="Pin Code *"
                      value={formik.values.pincode}
                      onChange={formik.handleChange}
                      error={formik.touched.pincode && Boolean(formik.errors.pincode)}
                      helperText={formik.touched.pincode && formik.errors.pincode}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('cityArea') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.cityArea && formik.errors.cityArea) || false}
                  >
                    <TextField
                      name="cityArea"
                      label="City Area *"
                      value={formik.values.cityArea}
                      onChange={formik.handleChange}
                      error={formik.touched.cityArea && Boolean(formik.errors.cityArea)}
                      helperText={formik.touched.cityArea && formik.errors.cityArea}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Student Details Fields */}
              {showField('studentName') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.studentName && formik.errors.studentName) || false}
                  >
                    <TextField
                      name="studentName"
                      label="Student Name *"
                      value={formik.values.studentName}
                      onChange={formik.handleChange}
                      error={formik.touched.studentName && Boolean(formik.errors.studentName)}
                      helperText={formik.touched.studentName && formik.errors.studentName}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('age') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField error={!!(formik.touched.age && formik.errors.age) || false}>
                    <TextField
                      name="age"
                      label="Age *"
                      type="number"
                      value={formik.values.age}
                      onChange={formik.handleChange}
                      error={formik.touched.age && Boolean(formik.errors.age)}
                      helperText={formik.touched.age && formik.errors.age}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('section') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.section && formik.errors.section) || false}
                  >
                    <TextField
                      name="section"
                      label="Section *"
                      value={formik.values.section}
                      onChange={formik.handleChange}
                      error={formik.touched.section && Boolean(formik.errors.section)}
                      helperText={formik.touched.section && formik.errors.section}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Gender Distribution Fields */}
              {showField('noOfBoys') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.noOfBoys && formik.errors.noOfBoys) || false}
                  >
                    <TextField
                      name="noOfBoys"
                      label="No. of Boys *"
                      type="number"
                      value={formik.values.noOfBoys}
                      onChange={formik.handleChange}
                      error={formik.touched.noOfBoys && Boolean(formik.errors.noOfBoys)}
                      helperText={formik.touched.noOfBoys && formik.errors.noOfBoys}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('noOfGirls') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.noOfGirls && formik.errors.noOfGirls) || false}
                  >
                    <TextField
                      name="noOfGirls"
                      label="No. of Girls *"
                      type="number"
                      value={formik.values.noOfGirls}
                      onChange={formik.handleChange}
                      error={formik.touched.noOfGirls && Boolean(formik.errors.noOfGirls)}
                      helperText={formik.touched.noOfGirls && formik.errors.noOfGirls}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('totalStudent') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.totalStudent && formik.errors.totalStudent) || false}
                  >
                    <TextField
                      name="totalStudent"
                      label="Total Student *"
                      type="number"
                      value={formik.values.totalStudent}
                      onChange={formik.handleChange}
                      error={formik.touched.totalStudent && Boolean(formik.errors.totalStudent)}
                      helperText={formik.touched.totalStudent && formik.errors.totalStudent}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Trend Analysis Fields */}
              {showField('month') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.month && formik.errors.month) || false}
                  >
                    <TextField
                      name="month"
                      label="Month *"
                      value={formik.values.month}
                      onChange={formik.handleChange}
                      error={formik.touched.month && Boolean(formik.errors.month)}
                      helperText={formik.touched.month && formik.errors.month}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('numberOfNewAdmission') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={
                      !!(
                        formik.touched.numberOfNewAdmission && formik.errors.numberOfNewAdmission
                      ) || false
                    }
                  >
                    <TextField
                      name="numberOfNewAdmission"
                      label="Number of New Admission *"
                      type="number"
                      value={formik.values.numberOfNewAdmission}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.numberOfNewAdmission &&
                        Boolean(formik.errors.numberOfNewAdmission)
                      }
                      helperText={
                        formik.touched.numberOfNewAdmission && formik.errors.numberOfNewAdmission
                      }
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('withdrawals') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.withdrawals && formik.errors.withdrawals) || false}
                  >
                    <TextField
                      name="withdrawals"
                      label="Withdrawals *"
                      type="number"
                      value={formik.values.withdrawals}
                      onChange={formik.handleChange}
                      error={formik.touched.withdrawals && Boolean(formik.errors.withdrawals)}
                      helperText={formik.touched.withdrawals && formik.errors.withdrawals}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('netIncrease') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.netIncrease && formik.errors.netIncrease) || false}
                  >
                    <TextField
                      name="netIncrease"
                      label="Net Increase"
                      type="number"
                      value={formik.values.netIncrease}
                      onChange={formik.handleChange}
                      error={formik.touched.netIncrease && Boolean(formik.errors.netIncrease)}
                      helperText={formik.touched.netIncrease && formik.errors.netIncrease}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('totalStudents') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.totalStudents && formik.errors.totalStudents) || false}
                  >
                    <TextField
                      name="totalStudents"
                      label="Total Students *"
                      type="number"
                      value={formik.values.totalStudents}
                      onChange={formik.handleChange}
                      error={formik.touched.totalStudents && Boolean(formik.errors.totalStudents)}
                      helperText={formik.touched.totalStudents && formik.errors.totalStudents}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Enrollment Metrics Fields */}
              {showField('totalEnrollments') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.totalEnrollments && formik.errors.totalEnrollments) || false
                    }
                  >
                    <TextField
                      name="totalEnrollments"
                      label="Total Enrollments *"
                      type="number"
                      value={formik.values.totalEnrollments}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.totalEnrollments && Boolean(formik.errors.totalEnrollments)
                      }
                      helperText={formik.touched.totalEnrollments && formik.errors.totalEnrollments}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('newAdmissions') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.newAdmissions && formik.errors.newAdmissions) || false}
                  >
                    <TextField
                      name="newAdmissions"
                      label="New Admissions *"
                      type="number"
                      value={formik.values.newAdmissions}
                      onChange={formik.handleChange}
                      error={formik.touched.newAdmissions && Boolean(formik.errors.newAdmissions)}
                      helperText={formik.touched.newAdmissions && formik.errors.newAdmissions}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('retentionRate') && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.retentionRate && formik.errors.retentionRate) || false}
                  >
                    <TextField
                      name="retentionRate"
                      label="Retention Rate *"
                      type="number"
                      value={formik.values.retentionRate}
                      onChange={formik.handleChange}
                      error={formik.touched.retentionRate && Boolean(formik.errors.retentionRate)}
                      helperText={formik.touched.retentionRate && formik.errors.retentionRate}
                      fullWidth
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Submit Button */}
              <Grid size={12} justifyContent="flex-end" display="flex">
                <LoadingButton
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  loading={isLoading}
                  type="submit"
                  variant="contained"
                >
                  Generate Report
                </LoadingButton>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Card>

      {pdfBase64 && <iframe src={pdfBase64} width="100%" height="100%" title="Generated Report" />}
    </Box>
  );
};
export default StudentReportsScreen;
