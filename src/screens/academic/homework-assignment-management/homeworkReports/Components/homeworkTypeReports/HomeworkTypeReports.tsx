'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
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
import { HomeworkReportTitle, HomeworkReportTitleOptions } from 'src/enums/homework-wise-reports';

import { getHomeworkValidationSchema } from './HomeworkTypeReportValidation';

const commonFields = ['organization', 'class', 'divisions'];

const HomeworkReportFieldsMap = {
  DailyHomeworkReport: [...commonFields, 'subjects', 'teachers', 'students', 'fromDate', 'toDate'],
  ClassWiseHomeworkReport: [...commonFields, 'subjects', 'fromDate', 'toDate'],
  SubjectWiseHomeworkReport: [...commonFields, 'subjects', 'fromDate', 'toDate', 'homeworks'],
  TeacherWiseHomeworkReport: [...commonFields, 'teachers', 'fromDate', 'toDate', 'homeworks'],
  StudentWiseHomeworkSummaryReport: [
    ...commonFields,
    'subjects',
    'students',
    'fromDate',
    'toDate',
    'homeworks',
  ],
  HomeworkCompletionStatusReport: [...commonFields, 'subjects', 'fromDate', 'toDate', 'homeworks'],
  PendingHomeworkReport: [
    ...commonFields,
    'subjects',
    'teachers',
    'fromDate',
    'toDate',
    'homeworks',
  ],
  OverdueHomeworkReport: [
    ...commonFields,
    'subjects',
    'students',
    'fromDate',
    'toDate',
    'homeworks',
  ],
  HomeworkSubmissionHistoryReport: [
    ...commonFields,
    'subjects',
    'teachers',
    'students',
    'fromDate',
    'toDate',
    'homeworks',
  ],
  HomeworkWithAttachmentsReport: [...commonFields, 'subjects', 'fromDate', 'toDate', 'homeworks'],
  HomeworkAcknowledgementReport: [...commonFields, 'students', 'fromDate', 'toDate', 'homeworks'],
};

const homeworkInitialValues = {
  report: '' as unknown as HomeworkReportTitle,
  organization: '',
  homeworks: [],
  class: '',
  divisions: [],
  subjects: [],
  teachers: [],
  students: [],
  fromDate: null,
  toDate: null,
};

const HomeworkManagementReports = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [getStudents, { data: StudentsData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [dynamicSchema, setDynamicSchema] = useState(getHomeworkValidationSchema([], currentYear));

  const formik = useFormik({
    initialValues: homeworkInitialValues,
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (val, { setSubmitting }) => {
      window.alert('Homewok report submitted...');
      setSubmitting(false);
    },
  });

  const currentFields = useMemo(() => {
    const reportKey =
      typeof formik.values.report === 'number'
        ? HomeworkReportTitle[formik.values.report]
        : formik.values.report;

    return HomeworkReportFieldsMap[reportKey as keyof typeof HomeworkReportFieldsMap] || [];
  }, [formik.values.report]);

  useEffect(() => {
    const newSchema = getHomeworkValidationSchema(currentFields, currentYear);
    setDynamicSchema(newSchema);
  }, [currentFields, currentYear]);

  useEffect(() => {
    setAllOrganization(cloneDeep(medium?.educationMediumStages || []));
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    const standards =
      allOrganization.find((org: any) => org?.id === formik.values.organization)?.standards || [];
    setAllClass(standards);
  }, [allOrganization, formik.values.organization]);

  const showField = (fieldName: string) => currentFields.includes(fieldName);

  useEffect(() => {
    if (formik.values.class && formik.values.divisions) {
      const filterCriteria = {
        classIds: formik.values.class,
        divisionIds: [formik.values.divisions],
      };
      getStudents(filterCriteria);
    }
  }, [formik.values.class, formik.values.divisions, getStudents]);

  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );
  useEffect(() => {
    if (!formik.values.class) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    const selectedClass = allClass.find((cls) => cls.id === formik.values.class);

    const divisions = selectedClass?.divisions || [];

    setAllDivision(divisions);

    // Default: select ALL division ids
    formik.setFieldValue(
      'divisions',
      divisions.map((d) => d.id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.class, allClass]);

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Report Dropdown */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ShakingTextField error={!!(formik.touched.report && formik.errors.report)}>
                  <CustomTooltip placement="top" title={HomeworkReportTitle[formik.values.report]}>
                    <Autocomplete
                      options={HomeworkReportTitleOptions}
                      getOptionLabel={(option: any) => option.label || ''}
                      isOptionEqualToValue={(option, value) => option.name === value.name}
                      value={
                        HomeworkReportTitleOptions.find(
                          (opt) =>
                            opt.name === (formik.values.report as unknown as HomeworkReportTitle)
                        ) || null
                      }
                      onChange={(event, newValue) => {
                        formik.setValues({
                          ...formik.values,
                          report: newValue?.name as HomeworkReportTitle,
                          organization: '',
                          class: '',
                          divisions: [],
                          subjects: [],
                          teachers: [],
                          students: [],
                          homeworks: [],
                          fromDate: null,
                          toDate: null,
                        });
                      }}
                      onBlur={() => formik.setFieldTouched('report', true)}
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
                      onBlur={() => formik.setFieldTouched('organization', true)}
                      error={formik.touched.organization && Boolean(formik.errors.organization)}
                      helperText={
                        (formik.touched.organization && formik.errors.organization) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { width: '100%' } }}
                      disabled={!medium}
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
                      value={formik.values.class} // single value
                      multiple={false} // 🔥 SINGLE SELECT
                      onChange={(val) => {
                        formik.setFieldValue('class', val);

                        // Load divisions for this class
                        const selectedClass = allClass.find((cls) => cls.id === val);
                        const divisions = selectedClass?.divisions || [];

                        // Update division list
                        setAllDivision(divisions);

                        // Auto-select all division ids
                        formik.setFieldValue(
                          'divisions',
                          divisions.map((d) => d.id)
                        );
                        formik.setFieldValue('teachers', []);
                        formik.setFieldValue('homeworks', []);
                        formik.setFieldValue('students', []);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                      }}
                      onBlur={() => formik.setFieldTouched('class', true)}
                      error={formik.touched.class && Boolean(formik.errors.class)}
                      helperText={(formik.touched.class && formik.errors.class) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { width: '100%' } }}
                      disabled={!formik.values.organization}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Division */}
              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
                    <CustomSelect
                      options={allDivision}
                      label="Division *"
                      multiple
                      disabled={!formik.values.class}
                      value={formik.values.divisions}
                      onChange={(val) => {
                        formik.setFieldValue('divisions', val);
                        formik.setFieldValue('teachers', []);
                        formik.setFieldValue('homeworks', []);
                        formik.setFieldValue('students', []);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                      }}
                      onBlur={() => formik.setFieldTouched('divisions', true)}
                      error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { width: '100%' } }}
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
                        formik.setFieldValue('homeworks', []);
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
                      }}
                      // onBlur={() => formik.setFieldTouched('teachers', true)}
                      error={formik.touched.teachers && Boolean(formik.errors.teachers)}
                      helperText={(formik.touched.teachers && formik.errors.teachers) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Homeworks */}
              {(formik.values.teachers.length > 1 || formik.values.subjects.length > 1) && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.homeworks && formik.errors.homeworks)}>
                    <ResponsiveMultiSelect
                      label="Homeworks *"
                      options={[
                        { id: 'all', name: 'All' },
                        ...[
                          { id: 'h1', name: 'Algebra Assignment' },
                          { id: 'h2', name: 'Geometry Problems' },
                          { id: 'h3', name: 'Calculus Review' },
                          { id: 'h4', name: 'Statistics Project' },
                          { id: 'h5', name: 'Trigonometry Practice' },
                        ],
                      ]}
                      value={formik.values.homeworks}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      disabled={!formik.values.teachers.length}
                      onChange={(selectedValues) => {
                        const allActualHomeworks = [
                          { id: 'h1', name: 'Algebra Assignment' },
                          { id: 'h2', name: 'Geometry Problems' },
                          { id: 'h3', name: 'Calculus Review' },
                          { id: 'h4', name: 'Statistics Project' },
                          { id: 'h5', name: 'Trigonometry Practice' },
                        ];
                        const allRealIds = allActualHomeworks.map((h) => h.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = (
                          formik.values.homeworks as string[]
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
                        formik.setFieldValue('homeworks', finalValues);
                      }}
                      // onBlur={() => formik.setFieldTouched('homeworks', true)}
                      error={formik.touched.homeworks && Boolean(formik.errors.homeworks)}
                      helperText={(formik.touched.homeworks && formik.errors.homeworks) as string}
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
                      format="DD/MM/YYYY"
                      disableFuture
                      minDate={dayjs(currentYear?.startDate)}
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

              {/* To Date */}
              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.toDate && formik.errors.toDate)}>
                    <DatePicker
                      label="To Date"
                      format="DD/MM/YYYY"
                      disableFuture
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

              {/* Submit */}
              <Grid size={12} display="flex" justifyContent="flex-end">
                <Button
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  type="submit"
                  disabled={
                    formik.values.report === ('' as unknown as HomeworkReportTitle) ||
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

export default HomeworkManagementReports;
