'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Box, Grid, Card, Button, Checkbox, TextField, Autocomplete } from '@mui/material';
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

  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
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
                  <CustomSelect
                    options={allOrganization}
                    label="Organization *"
                    value={formik.values.organization}
                    onChange={(v) => formik.setFieldValue('organization', v)}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </Grid>
              )}

              {/* Class */}
              {showField('class') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    options={allClass}
                    label="Class *"
                    value={formik.values.class}
                    onChange={(v) => formik.setFieldValue('class', v)}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </Grid>
              )}

              {/* Divisions */}
              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    multiple
                    options={allDivision}
                    label="Division *"
                    value={formik.values.divisions}
                    onChange={(v) => formik.setFieldValue('divisions', v)}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </Grid>
              )}

              {/* Subjects */}
              {showField('subjects') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    multiple
                    label="Subjects *"
                    value={formik.values.subjects}
                    onChange={(v) => formik.setFieldValue('subjects', v)}
                    options={[
                      { id: 'english', name: 'English' },
                      { id: 'math', name: 'Math' },
                      { id: 'science', name: 'Science' },
                      { id: 'computer', name: 'Computer' },
                      { id: 'social', name: 'Social Studies' },
                    ]}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </Grid>
              )}

              {/* Teachers */}
              {showField('teachers') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    multiple
                    label="Teachers *"
                    value={formik.values.teachers}
                    onChange={(v) => formik.setFieldValue('teachers', v)}
                    options={[
                      { id: 't1', name: 'Teacher 1' },
                      { id: 't2', name: 'Teacher 2' },
                      { id: 't3', name: 'Teacher 3' },
                    ]}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </Grid>
              )}

              {/* Students */}
              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Autocomplete
                    loading={isLoading}
                    multiple
                    fullWidth
                    value={formik.values.students}
                    options={tableData}
                    disabled={!formik.values.divisions}
                    disableCloseOnSelect
                    onChange={(e, val) => formik.setFieldValue('students', val)}
                    getOptionLabel={(o: any) => o.name}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    renderOption={(props, opt, { selected }) => (
                      <li {...props} key={opt.id}>
                        <Checkbox
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={<CheckBoxIcon />}
                          checked={selected}
                          sx={{ mr: 1 }}
                        />
                        {opt.name}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} label="Students *" size="small" fullWidth />
                    )}
                  />
                </Grid>
              )}

              {/* From Date */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DatePicker
                    label="From Date *"
                    value={formik.values.fromDate}
                    onChange={(v) => formik.setFieldValue('fromDate', v)}
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Grid>
              )}

              {/* To Date */}
              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DatePicker
                    label="To Date *"
                    value={formik.values.toDate}
                    onChange={(v) => formik.setFieldValue('toDate', v)}
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Grid>
              )}

              {/* Submit */}
              <Grid size={12} display="flex" justifyContent="flex-end">
                <Button
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  variant="contained"
                  size="small"
                  type="submit"
                  disabled={!formik.values.report}
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
