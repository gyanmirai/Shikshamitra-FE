'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import dayjs, { Dayjs } from 'dayjs';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Card, Button, TextField } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AttendanceReportTitle, AttendanceReportTitleOptions } from 'src/enums/attendanceReports';

import { getValidationSchema } from './validationSchema';

const initialValues = {
  report: '',
  organization: '',
  classes: [],
  divisions: [],
  rollNo: '',
  attendanceType: '',
  fromDate: null,
  toDate: null,
  gender: [],
};

const commonFields = ['organization', 'classes'];

const reportFieldsMap = {
  [AttendanceReportTitle.StudentWiseAbsentDays]: [...commonFields, 'divisions', 'rollNo'],
  [AttendanceReportTitle.DailyStrengthAndGenderWiseSummary]: [
    ...commonFields,
    'gender', // Using gender dropdown for "Boys" and "Girls"
  ],
  [AttendanceReportTitle.DailyStrengthAndAttendanceSummary]: [...commonFields],
  [AttendanceReportTitle.MonthlyStrengthSummary]: [
    ...commonFields,
    'divisions',
    'gender', // Using gender dropdown for "Boys" and "Girls"
  ],
  [AttendanceReportTitle.MonthlyStrengthAndAttendanceSummary]: [
    ...commonFields,
    'divisions',
    'gender', // Using gender dropdown for "Boys" and "Girls"
  ],
  [AttendanceReportTitle.StudentAttendanceRegisterSmall]: [...commonFields, 'divisions'],
  [AttendanceReportTitle.StudentAttendanceSheet]: [...commonFields, 'divisions'],
  [AttendanceReportTitle.MonthlyStrengthSummaryDateRange]: [
    ...commonFields,
    'divisions',
    'attendanceType',
    'fromDate',
    'toDate',
  ],
  [AttendanceReportTitle.StudentWiseAbsentDaysDateRange]: [
    'organization',
    'attendanceType',
    'rollNo',
    'fromDate',
    'toDate',
  ],
};

const AttendanceReportScreen = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [dynamicSchema, setDynamicSchema] = useState(getValidationSchema([]));

  const formik = useFormik({
    initialValues,
    validationSchema: dynamicSchema,
    enableReinitialize: true,
    onSubmit: (val, { setSubmitting }) => {
      alert(JSON.stringify(val, null, 2));
      setSubmitting(false);
    },
  });

  const currentFields = useMemo(
    () => reportFieldsMap[formik.values.report as unknown as AttendanceReportTitle] || [],
    [formik.values.report]
  );

  useEffect(() => {
    const newSchema = getValidationSchema(currentFields);
    setDynamicSchema(newSchema);
  }, [currentFields]);

  useEffect(() => {
    setAllOrganization(cloneDeep(medium?.educationMediumStages || []));
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    const standards =
      allOrganization.find((org: any) => org?.id === formik.values.organization)?.standards || [];

    if (!standards.some((std) => std.id === 'all')) {
      standards.unshift({
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
    setAllClass(standards);
  }, [allOrganization, formik.values.organization]);

  const showField = (fieldName: string) => currentFields.includes(fieldName);

  useEffect(() => {
    if (formik.values.classes.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    if (formik.values.classes.length === 1 && formik.values.classes[0] !== 'all') {
      const selectedClass = allClass.find((cls: any) => cls?.id === formik.values.classes[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);

      const divisionIds = divisions.map((div: any) => div.id);
      formik.setFieldValue('divisions', [...divisionIds]);
    } else {
      setAllDivision([
        {
          id: 'all',
          name: 'All',
          creationTime: '',
          creatorId: '',
          lastModificationTime: '',
          lastModifierId: '',
          strength: 0,
          standardId: '',
        },
      ]);
      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.classes]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Reports"
        description="Generate attendance reports for students."
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Attendance', href: '/student/attendance/dashboard/' },
          { name: 'Reports' },
        ]}
        sx={{ mb: 2 }}
      />
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ShakingTextField
                  error={!!(formik.touched.report && formik.errors.report) || false}
                >
                  <CustomSelect
                    options={AttendanceReportTitleOptions}
                    label="Report *"
                    labelKey="label"
                    valueKey="name"
                    value={formik.values.report}
                    onChange={(val) => {
                      formik.setFieldValue('report', val);
                      // Reset fields on report change
                      formik.setValues({
                        ...initialValues,
                        report: val as string,
                      });
                    }}
                    onBlur={() => formik.setFieldTouched('report', true)}
                    error={formik.touched.report && Boolean(formik.errors.report)}
                    helperText={(formik.touched.report && formik.errors.report) as string}
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                  />
                </ShakingTextField>
              </Grid>

              {showField('organization') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.organization && formik.errors.organization) || false}
                  >
                    <CustomSelect
                      options={allOrganization}
                      label="Organization *"
                      value={formik.values.organization}
                      onChange={(val) => {
                        formik.setFieldValue('organization', val);

                        const standards =
                          allOrganization.find((org: any) => org?.id === val)?.standards || [];
                        const standardIds = standards.map((standard: any) => standard.id);

                        const uniqueClassIds = ['all', ...standardIds.filter((id) => id !== 'all')];

                        formik.setFieldValue('classes', uniqueClassIds);
                      }}
                      onBlur={() => formik.setFieldTouched('organization', true)}
                      error={formik.touched.organization && Boolean(formik.errors.organization)}
                      helperText={
                        (formik.touched.organization && formik.errors.organization) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!medium}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('classes') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.classes && formik.errors.classes) || false}
                  >
                    <CustomSelect
                      options={allClass}
                      label="Class *"
                      multiple
                      value={formik.values.classes}
                      onChange={(val) => {
                        const value = val as string[];

                        const allClassIds =
                          allClass?.filter((cls) => cls.id !== 'all').map((cls) => cls.id) || [];
                        const isAllClicked = value.includes('all');
                        const wasAllPreviouslySelected = (
                          formik.values.classes as string[]
                        ).includes('all');

                        if (isAllClicked && !wasAllPreviouslySelected) {
                          formik.setFieldValue('classes', ['all', ...allClassIds]);
                        } else if (!isAllClicked && wasAllPreviouslySelected) {
                          formik.setFieldValue('classes', []);
                        } else if (isAllClicked && wasAllPreviouslySelected) {
                          const selectedWithoutAll = value.filter((id) => id !== 'all');

                          if (selectedWithoutAll.length === allClassIds.length) {
                            formik.setFieldValue('classes', ['all', ...allClassIds]);
                          } else {
                            formik.setFieldValue('classes', selectedWithoutAll);
                          }
                        } else {
                          const selectedWithoutAll = value.filter((id) => id !== 'all');

                          if (selectedWithoutAll.length === allClassIds.length) {
                            formik.setFieldValue('classes', ['all', ...allClassIds]);
                          } else {
                            formik.setFieldValue('classes', selectedWithoutAll);
                          }
                        }
                      }}
                      onBlur={() => formik.setFieldTouched('classes', true)}
                      error={formik.touched.classes && Boolean(formik.errors.classes)}
                      helperText={(formik.touched.classes && formik.errors.classes) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!formik.values.organization}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('divisions') &&
                !(formik.values.classes as string[]).includes('all') &&
                formik.values.classes.length > 0 && (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ShakingTextField
                      error={!!(formik.touched.divisions && formik.errors.divisions) || false}
                    >
                      <CustomSelect
                        options={allDivision}
                        label="Division *"
                        value={formik.values.divisions}
                        onChange={(val) => formik.setFieldValue('divisions', val)}
                        onBlur={() => formik.setFieldTouched('divisions', true)}
                        error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                        helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                        labelKey="name"
                        valueKey="id"
                        multiple={
                          !(formik.values.classes as string[]).includes('all') ||
                          formik.values.classes.length > 1
                        }
                        formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                        disabled={formik.values.classes.length === 0}
                      />
                    </ShakingTextField>
                  </Grid>
                )}

              {showField('rollNo') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.rollNo && formik.errors.rollNo) || false}
                  >
                    <TextField
                      label="Roll No *"
                      size="small"
                      fullWidth
                      value={formik.values.rollNo}
                      onChange={formik.handleChange}
                      name="rollNo"
                      error={formik.touched.rollNo && Boolean(formik.errors.rollNo)}
                      helperText={(formik.touched.rollNo && formik.errors.rollNo) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('attendanceType') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.attendanceType && formik.errors.attendanceType) || false
                    }
                  >
                    <CustomSelect
                      options={[
                        { id: 'Present', name: 'Present' },
                        { id: 'Absent', name: 'Absent' },
                        { id: 'Leave', name: 'Leave' },
                        { id: 'Late', name: 'Late' },
                      ]}
                      label="Attendance Type *"
                      value={formik.values.attendanceType}
                      onChange={(val) => formik.setFieldValue('attendanceType', val)}
                      onBlur={() => formik.setFieldTouched('attendanceType', true)}
                      error={formik.touched.attendanceType && Boolean(formik.errors.attendanceType)}
                      helperText={
                        (formik.touched.attendanceType && formik.errors.attendanceType) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('gender') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.gender && formik.errors.gender) || false}
                  >
                    <CustomSelect
                      label="Gender *"
                      options={[
                        { id: 'male', name: 'Male' },
                        { id: 'female', name: 'Female' },
                        { id: 'other', name: 'Other' },
                      ]}
                      value={formik.values.gender}
                      onChange={(val) => formik.setFieldValue('gender', val)}
                      onBlur={() => formik.setFieldTouched('gender', true)}
                      error={formik.touched.gender && Boolean(formik.errors.gender)}
                      helperText={(formik.touched.gender && formik.errors.gender) as string}
                      labelKey="name"
                      valueKey="id"
                      multiple
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.fromDate && formik.errors.fromDate) || false}
                  >
                    <DatePicker
                      label="From Date *"
                      disableFuture
                      format="DD/MM/YYYY"
                      minDate={new Dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={formik.values.fromDate}
                      onChange={(date) => formik.setFieldValue('fromDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.fromDate && Boolean(formik.errors.fromDate),
                          helperText: (formik.touched.fromDate && formik.errors.fromDate) as string,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.toDate && formik.errors.toDate) || false}
                  >
                    <DatePicker
                      label="To Date *"
                      disableFuture
                      format="DD/MM/YYYY"
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={formik.values.toDate}
                      onChange={(date) => formik.setFieldValue('toDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.toDate && Boolean(formik.errors.toDate),
                          helperText: (formik.touched.toDate && formik.errors.toDate) as string,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              <Grid size={12} justifyContent="flex-end" display="flex">
                <Button
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  type="submit"
                  disabled={
                    formik.values.report === '' ||
                    formik.values.report === null ||
                    formik.values.report === undefined
                  }
                  variant="contained"
                  size="small"
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default AttendanceReportScreen;
