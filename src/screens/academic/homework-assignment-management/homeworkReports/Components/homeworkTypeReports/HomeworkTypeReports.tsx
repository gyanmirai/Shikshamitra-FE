'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { HomeworkReportTitle, HomeworkReportTitleOptions } from 'src/enums/homework-wise-reports';
import {
  Box,
  Card,
  Grid,
  Button,
  TextField,
  Typography,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { getHomeworkValidationSchema } from './HomeworkTypeReportValidation';

const commonFields = ['organization', 'class', 'divisions'];

export const HomeworkReportFieldsMap: Record<string, string[]> = {
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
  report: null as unknown as HomeworkReportTitle,
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
  const theme = useTheme();

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [dynamicSchema, setDynamicSchema] = useState(getHomeworkValidationSchema([], currentYear));
  const [searchQuery, setSearchQuery] = useState('');

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
    const reportKey = HomeworkReportTitle[formik.values.report] ?? formik.values.report;

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Grid container spacing={3}>
        {/* Left Sidebar - Report Selection */}
        <Grid size={{ xs: 12, md: 2, lg: 3 }}>
          <Card sx={{ p: 2, height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Report
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Scrollbar sx={{ height: '380px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {HomeworkReportTitleOptions.filter((option) =>
                  option.label.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((option) => {
                  const isSelected = formik.values.report === option.name;
                  return (
                    <Card
                      key={option.name}
                      onClick={() => {
                        formik.setValues({
                          ...formik.values,
                          report: option.name as HomeworkReportTitle,
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
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: isSelected
                          ? varAlpha(theme.palette.primary.mainChannel, 0.2)
                          : undefined,
                        color: isSelected ? theme.palette.primary.dark : undefined,
                        borderLeft: isSelected
                          ? `4px solid ${theme.palette.primary.main}`
                          : '4px solid transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: theme.palette.action.hover,
                        },
                        ml: '0.4px',
                        mr: '0.4px',
                      }}
                    >
                      <Typography variant="subtitle2">{option.label}</Typography>
                    </Card>
                  );
                })}
              </Box>
            </Scrollbar>
          </Card>
        </Grid>

        {/* Right Panel - Form Fields */}

        <Grid size={{ xs: 12, md: 8 }}>
          <form onSubmit={formik.handleSubmit}>
            <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
              {formik.values.report === null ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 400,
                    color: 'text.secondary',
                  }}
                >
                  <Iconify
                    icon="mdi:file-document-outline"
                    width={64}
                    sx={{ mb: 2, opacity: 0.5 }}
                  />
                  <Typography variant="h6">Select a report to get started</Typography>
                  <Typography variant="body2">
                    Choose a report type from the list on the left
                  </Typography>
                </Box>
              ) : (
                <>
                  <Scrollbar sx={{ p: 2, height: '450px' }}>
                    <Grid container spacing={3}>
                      <Grid size={12}>
                        <Typography variant="h6" color="primary">
                          {
                            HomeworkReportTitleOptions.find((o) => o.name === formik.values.report)
                              ?.label
                          }
                        </Typography>
                      </Grid>

                      {/* Organization */}
                      {showField('organization') && (
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
                              error={
                                formik.touched.organization && Boolean(formik.errors.organization)
                              }
                              helperText={
                                (formik.touched.organization &&
                                  formik.errors.organization) as string
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
                        <Grid size={{ xs: 12, sm: 6 }}>
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
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField
                            error={!!(formik.touched.divisions && formik.errors.divisions)}
                          >
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
                              helperText={
                                (formik.touched.divisions && formik.errors.divisions) as string
                              }
                              labelKey="name"
                              valueKey="id"
                              formControlProps={{ sx: { width: '100%' } }}
                            />
                          </ShakingTextField>
                        </Grid>
                      )}

                      {/* Subjects */}
                      {showField('subjects') && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField
                            error={!!(formik.touched.subjects && formik.errors.subjects)}
                          >
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
                                  const selectedRealIds = selectedValues.filter(
                                    (id) => id !== 'all'
                                  );
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
                              helperText={
                                (formik.touched.subjects && formik.errors.subjects) as string
                              }
                            />
                          </ShakingTextField>
                        </Grid>
                      )}

                      {/* Teachers */}
                      {showField('teachers') && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField
                            error={!!(formik.touched.teachers && formik.errors.teachers)}
                          >
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
                                  const selectedRealIds = selectedValues.filter(
                                    (id) => id !== 'all'
                                  );
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
                              helperText={
                                (formik.touched.teachers && formik.errors.teachers) as string
                              }
                            />
                          </ShakingTextField>
                        </Grid>
                      )}

                      {/* Homeworks */}
                      {(formik.values.teachers.length > 1 || formik.values.subjects.length > 1) && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField
                            error={!!(formik.touched.homeworks && formik.errors.homeworks)}
                          >
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
                                  const selectedRealIds = selectedValues.filter(
                                    (id) => id !== 'all'
                                  );
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
                              helperText={
                                (formik.touched.homeworks && formik.errors.homeworks) as string
                              }
                            />
                          </ShakingTextField>
                        </Grid>
                      )}

                      {/* Students */}
                      {showField('students') && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField
                            error={!!(formik.touched.students && formik.errors.students)}
                          >
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
                                  const selectedRealIds = selectedValues.filter(
                                    (id) => id !== 'all'
                                  );
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
                              helperText={
                                (formik.touched.students && formik.errors.students) as string
                              }
                            />
                          </ShakingTextField>
                        </Grid>
                      )}

                      {/* From Date */}
                      {showField('fromDate') && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField
                            error={!!(formik.touched.fromDate && formik.errors.fromDate)}
                          >
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
                                  helperText: (formik.touched.fromDate &&
                                    formik.errors.fromDate) as string,
                                },
                              }}
                            />
                          </ShakingTextField>
                        </Grid>
                      )}

                      {/* To Date */}
                      {showField('toDate') && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField
                            error={!!(formik.touched.toDate && formik.errors.toDate)}
                          >
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
                                  helperText: (formik.touched.toDate &&
                                    formik.errors.toDate) as string,
                                },
                              }}
                            />
                          </ShakingTextField>
                        </Grid>
                      )}
                    </Grid>
                  </Scrollbar>
                  <DialogActions>
                    {' '}
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
                  </DialogActions>
                </>
              )}

              {/* Submit */}
            </Card>
          </form>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomeworkManagementReports;
