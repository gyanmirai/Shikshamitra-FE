'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';
import {
  HomeworkAssignmentAnalyticReportTitle,
  HomeworkAssignmentAnalyticReportTitleOptions,
} from 'src/enums/homeworkAssignmentAnalytic-report';

import { getHomeworkAssignmentAnalyticsValidationSchema } from './AnalyticsReportsValidation';

const commonFields = ['organization', 'class', 'divisions'];

const HomeworkAssignmentAnalyticReportFieldsMap = {
  HomeworkLoadAnalysisReport: [...commonFields, 'subjects', 'fromDate', 'toDate'],

  AssignmentLoadAnalysisReport: [...commonFields, 'subjects', 'fromDate', 'toDate'],

  TeacherPerformanceInHomeworkEvaluationReport: [
    ...commonFields,
    'teachers',
    'subjects',
    'fromDate',
    'toDate',
  ],

  StudentPerformanceTrendReport: [...commonFields, 'students', 'subjects', 'fromDate', 'toDate'],

  ClasswiseOverallHomeworkAssignmentReport: [...commonFields],
};

// ----------------------------------------------------------------------

const analyticsInitialValues = {
  report: '' as unknown as HomeworkAssignmentAnalyticReportTitle,
  organization: '',
  class: '',
  divisions: [],
  subjects: [],
  teachers: [],
  students: [] as any,
  fromDate: null,
  toDate: null,
};

// ----------------------------------------------------------------------

const HomeworkAssignmentAnalyticsReports = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [getStudents, { data: StudentsData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [dynamicSchema, setDynamicSchema] = useState(
    getHomeworkAssignmentAnalyticsValidationSchema([], currentYear)
  );

  // ---------------- Formik Setup ----------------

  const formik = useFormik({
    initialValues: analyticsInitialValues,
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (val, { setSubmitting }) => {
      window.alert('Homework/Assignment Analytics Report Generated');
      setSubmitting(false);
    },
  });

  // ---------------- Dynamic Fields ----------------

  const currentFields = useMemo(() => {
    const key =
      typeof formik.values.report === 'number'
        ? HomeworkAssignmentAnalyticReportTitle[formik.values.report]
        : formik.values.report;

    return (
      HomeworkAssignmentAnalyticReportFieldsMap[
        key as keyof typeof HomeworkAssignmentAnalyticReportFieldsMap
      ] || []
    );
  }, [formik.values.report]);

  useEffect(() => {
    const newSchema = getHomeworkAssignmentAnalyticsValidationSchema(currentFields, currentYear);
    setDynamicSchema(newSchema);
  }, [currentFields, currentYear]);

  // ---------------- Data Loading ----------------

  useEffect(() => {
    setAllOrganization(cloneDeep(medium?.educationMediumStages || []));
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    const standards =
      allOrganization.find((org) => org?.id === formik.values.organization)?.standards || [];
    setAllClass(standards);
  }, [allOrganization, formik.values.organization]);

  const showField = (field: string) => currentFields.includes(field);

  useEffect(() => {
    if (formik.values.class && formik.values.divisions) {
      getStudents({
        classIds: formik.values.class,
        divisionIds: [formik.values.divisions],
      });
    }
  }, [formik.values.class, formik.values.divisions, getStudents]);

  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((s: any) => ({
        ...s,
        name: `${s.firstName} ${s.lastName} ${s.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  useEffect(() => {
    if (!formik.values.class) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    const selected = allClass.find((cls) => cls.id === formik.values.class);
    const divs = selected?.divisions || [];

    setAllDivision(divs);
    formik.setFieldValue(
      'divisions',
      divs.map((d) => d.id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.class, allClass]);

  // ---------------- UI ----------------

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Report Dropdown */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ShakingTextField error={!!(formik.touched.report && formik.errors.report)}>
                  <CustomTooltip
                    placement="top"
                    title={HomeworkAssignmentAnalyticReportTitle[formik.values.report]}
                  >
                    <Autocomplete
                      options={HomeworkAssignmentAnalyticReportTitleOptions}
                      getOptionLabel={(o: any) => o.label}
                      isOptionEqualToValue={(opt, val) => opt.name === val.name}
                      value={
                        HomeworkAssignmentAnalyticReportTitleOptions.find(
                          (opt) => opt.name === formik.values.report
                        ) || null
                      }
                      onChange={(event, newValue) => {
                        formik.setValues({
                          ...analyticsInitialValues,
                          report: newValue?.name as HomeworkAssignmentAnalyticReportTitle,
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Report *"
                          size="small"
                          fullWidth
                          error={formik.touched.report && Boolean(formik.errors.report)}
                          helperText={(formik.touched.report && formik.errors.report) as string}
                        />
                      )}
                    />
                  </CustomTooltip>
                </ShakingTextField>
              </Grid>

              {/* Organization */}
              {showField('organization') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.organization && formik.errors.organization)}
                  >
                    <CustomSelect
                      options={allOrganization}
                      label="Organization *"
                      value={formik.values.organization}
                      onChange={(val) => {
                        formik.setFieldValue('organization', val);
                        formik.setFieldValue('class', '');
                        formik.setFieldValue('divisions', []);
                        formik.setFieldValue('subjects', []);
                        formik.setFieldValue('teachers', []);
                        formik.setFieldValue('students', []);
                        formik.setFieldValue('homeworks', []);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                      }}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { width: '100%' } }}
                      error={formik.touched.organization && Boolean(formik.errors.organization)}
                      helperText={
                        (formik.touched.organization && formik.errors.organization) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Class */}
              {showField('class') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.class && formik.errors.class)}>
                    <CustomSelect
                      options={allClass}
                      label="Class *"
                      value={formik.values.class}
                      onChange={(val) => {
                        formik.setFieldValue('class', val);
                        formik.setFieldValue('divisions', []);
                        formik.setFieldValue('subjects', []);
                        formik.setFieldValue('teachers', []);
                        formik.setFieldValue('students', []);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                      }}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { width: '100%' } }}
                      error={formik.touched.class && Boolean(formik.errors.class)}
                      helperText={(formik.touched.class && formik.errors.class) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Divisions */}
              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
                    <CustomSelect
                      multiple
                      options={allDivision}
                      label="Division *"
                      value={formik.values.divisions}
                      onChange={(val) => {
                        formik.setFieldValue('divisions', val);
                        formik.setFieldValue('subjects', []);
                        formik.setFieldValue('teachers', []);
                        formik.setFieldValue('students', []);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                      }}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { width: '100%' } }}
                      error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Subjects */}
              {showField('subjects') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.subjects && formik.errors.subjects)}>
                    <ResponsiveMultiSelect
                      label="Subjects *"
                      options={[
                        { id: 'all', name: 'All' },
                        ...[
                          { id: 'english', name: 'English' },
                          { id: 'math', name: 'Mathematics' },
                          { id: 'science', name: 'Science' },
                          { id: 'computer', name: 'Computer' },
                          { id: 'social', name: 'Social Studies' },
                        ],
                      ]}
                      value={formik.values.subjects}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      disabled={formik.values.divisions.length === 0}
                      onChange={(selectedValues) => {
                        const allActualSubjects = [
                          { id: 'english', name: 'English' },
                          { id: 'math', name: 'Mathematics' },
                          { id: 'science', name: 'Science' },
                          { id: 'computer', name: 'Computer' },
                          { id: 'social', name: 'Social Studies' },
                        ];
                        const allRealIds = allActualSubjects.map((s) => s.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = (
                          formik.values.subjects as string[]
                        ).includes('all');
                        let finalValues: string[] = [];

                        if (hasAllInSelection && !wasAllPreviouslySelected) {
                          finalValues = ['all', ...allRealIds];
                        } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = [];
                        } else if (hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = selectedValues.filter((id) => id !== 'all');
                        } else {
                          const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                          if (
                            selectedRealIds.length === allRealIds.length &&
                            allRealIds.every((id) => selectedRealIds.includes(id))
                          ) {
                            finalValues = ['all', ...allRealIds];
                          } else {
                            finalValues = selectedRealIds;
                          }
                        }
                        formik.setFieldValue('subjects', finalValues);
                        formik.setFieldValue('teachers', []);
                        formik.setFieldValue('students', []);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                      }}
                      // onBlur={() => formik.setFieldTouched('subjects', true)}
                      error={formik.touched.subjects && Boolean(formik.errors.subjects)}
                      helperText={(formik.touched.subjects && formik.errors.subjects) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Teachers */}
              {showField('teachers') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.teachers && formik.errors.teachers)}>
                    <ResponsiveMultiSelect
                      label="Teachers *"
                      options={[
                        { id: 'all', name: 'All' },
                        ...[
                          { id: 't1', name: 'Priya Sharma' },
                          { id: 't2', name: 'Rajesh Kumar' },
                          { id: 't3', name: 'Anjali Singh' },
                          { id: 't4', name: 'Sanjay Gupta' },
                          { id: 't5', name: 'Meena Devi' },
                        ],
                      ]}
                      value={formik.values.teachers}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      disabled={formik.values.divisions.length === 0}
                      onChange={(selectedValues) => {
                        const allActualTeachers = [
                          { id: 't1', name: 'Priya Sharma' },
                          { id: 't2', name: 'Rajesh Kumar' },
                          { id: 't3', name: 'Anjali Singh' },
                          { id: 't4', name: 'Sanjay Gupta' },
                          { id: 't5', name: 'Meena Devi' },
                        ];
                        const allRealIds = allActualTeachers.map((t) => t.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = (
                          formik.values.teachers as string[]
                        ).includes('all');
                        let finalValues: string[] = [];

                        if (hasAllInSelection && !wasAllPreviouslySelected) {
                          finalValues = ['all', ...allRealIds];
                        } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = [];
                        } else if (hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = selectedValues.filter((id) => id !== 'all');
                        } else {
                          const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                          if (
                            selectedRealIds.length === allRealIds.length &&
                            allRealIds.every((id) => selectedRealIds.includes(id))
                          ) {
                            finalValues = ['all', ...allRealIds];
                          } else {
                            finalValues = selectedRealIds;
                          }
                        }
                        formik.setFieldValue('teachers', finalValues);
                        formik.setFieldValue('students', []);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                      }}
                      // onBlur={() => formik.setFieldTouched('teachers', true)}
                      error={formik.touched.teachers && Boolean(formik.errors.teachers)}
                      helperText={(formik.touched.teachers && formik.errors.teachers) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Students */}
              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.students && formik.errors.students)}>
                    <ResponsiveMultiSelect
                      label="Students *"
                      options={[{ id: 'all', name: 'All' }, ...(tableData || [])]}
                      value={formik.values.students}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      disabled={formik.values.divisions.length === 0}
                      onChange={(selectedValues) => {
                        const allActualStudents = tableData || [];
                        const allRealIds = allActualStudents.map((s: any) => s.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = (
                          formik.values.students as string[]
                        ).includes('all');
                        let finalValues: string[] = [];

                        if (hasAllInSelection && !wasAllPreviouslySelected) {
                          finalValues = ['all', ...allRealIds];
                        } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = [];
                        } else if (hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = selectedValues.filter((id) => id !== 'all');
                        } else {
                          const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                          if (
                            selectedRealIds.length === allRealIds.length &&
                            allRealIds.every((id: any) => selectedRealIds.includes(id))
                          ) {
                            finalValues = ['all', ...allRealIds];
                          } else {
                            finalValues = selectedRealIds;
                          }
                        }
                        formik.setFieldValue('students', finalValues);
                      }}
                      // onBlur={() => formik.setFieldTouched('students', true)}
                      error={formik.touched.students && Boolean(formik.errors.students)}
                      helperText={(formik.touched.students && formik.errors.students) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* From Date */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.fromDate && formik.errors.fromDate)}>
                    <DatePicker
                      label="From Date"
                      value={formik.values.fromDate}
                      onChange={(v) => formik.setFieldValue('fromDate', v)}
                      format="DD/MM/YYYY"
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

              {/* To Date */}
              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.toDate && formik.errors.toDate)}>
                    <DatePicker
                      label="To Date"
                      value={formik.values.toDate}
                      onChange={(v) => formik.setFieldValue('toDate', v)}
                      format="DD/MM/YYYY"
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

              {/* Submit */}
              <Grid size={12} display="flex" justifyContent="flex-end">
                <Button
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  variant="contained"
                  size="small"
                  type="submit"
                  disabled={
                    formik.values.report ===
                      ('' as unknown as HomeworkAssignmentAnalyticReportTitle) ||
                    formik.values.report === null ||
                    formik.values.report === undefined
                  }
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

export default HomeworkAssignmentAnalyticsReports;
