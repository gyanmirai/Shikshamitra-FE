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
  AssignmentReportTitle,
  AssignmentReportTitleOptions,
} from 'src/enums/assignment-wise-report';

import { getAssignmentValidationSchema } from './AssignmentTypeReportValidation';

// --------------------------------------------------------------

const commonFields = ['organization', 'class', 'divisions'];

const AssignmentReportFieldsMap = {
  AssignmentIssuanceReport: [...commonFields, 'subjects', 'teachers', 'fromDate', 'toDate'],

  AssignmentSubmissionReport: [
    ...commonFields,
    'subjects',
    'teachers',
    'students',
    'fromDate',
    'toDate',
  ],

  AssignmentEvaluationReport: [
    ...commonFields,
    'subjects',
    'teachers',
    'students',
    'fromDate',
    'toDate',
  ],

  AssignmentMarksReport: [...commonFields, 'subjects', 'students', 'fromDate', 'toDate'],

  LateSubmissionReport: [...commonFields, 'subjects', 'students', 'fromDate', 'toDate'],

  MissingAssignmentReport: [...commonFields, 'subjects', 'students', 'fromDate', 'toDate'],

  AssignmentFeedbackReport: [
    ...commonFields,
    'subjects',
    'teachers',
    'students',
    'fromDate',
    'toDate',
  ],

  AssignmentGradeDistributionReport: [...commonFields, 'subjects'],

  AssignmentPerformanceReport: [...commonFields, 'subjects', 'students', 'fromDate', 'toDate'],
};

// --------------------------------------------------------------

const assignmentInitialValues = {
  report: '' as unknown as AssignmentReportTitle,
  organization: '',
  class: '',
  divisions: [],
  subjects: [],
  teachers: [],
  students: [],
  fromDate: null,
  toDate: null,
};

// --------------------------------------------------------------

const AssignmentManagementReports = () => {
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
    getAssignmentValidationSchema([], currentYear)
  );

  const formik = useFormik({
    initialValues: assignmentInitialValues,
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (val, { setSubmitting }) => {
      window.alert('Assignment report generated...');
      setSubmitting(false);
    },
  });

  // Pick dynamic fields based on selected report
  const currentFields = useMemo(() => {
    const reportKey =
      typeof formik.values.report === 'number'
        ? AssignmentReportTitle[formik.values.report]
        : formik.values.report;

    return AssignmentReportFieldsMap[reportKey as keyof typeof AssignmentReportFieldsMap] || [];
  }, [formik.values.report]);

  useEffect(() => {
    const newSchema = getAssignmentValidationSchema(currentFields, currentYear);
    setDynamicSchema(newSchema);
  }, [currentFields, currentYear]);

  // Load Organization
  useEffect(() => {
    setAllOrganization(cloneDeep(medium?.educationMediumStages || []));
  }, [medium?.educationMediumStages]);

  // Load Classes
  useEffect(() => {
    const standards =
      allOrganization.find((org: any) => org?.id === formik.values.organization)?.standards || [];
    setAllClass(standards);
  }, [allOrganization, formik.values.organization]);

  const showField = (fieldName: string) => currentFields.includes(fieldName);

  // Load Students when Class + Division Changes
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

  // Load division when class changes
  useEffect(() => {
    if (!formik.values.class) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    const selectedClass = allClass.find((cls) => cls.id === formik.values.class);

    const divisions = selectedClass?.divisions || [];

    setAllDivision(divisions);

    formik.setFieldValue(
      'divisions',
      divisions.map((d) => d.id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.class, allClass]);

  // --------------------------------------------------------------

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
                    title={AssignmentReportTitle[formik.values.report]}
                  >
                    <Autocomplete
                      options={AssignmentReportTitleOptions}
                      getOptionLabel={(option: any) => option.label}
                      isOptionEqualToValue={(option, value) => option.name === value.name}
                      value={
                        AssignmentReportTitleOptions.find(
                          (opt) => opt.name === formik.values.report
                        ) || null
                      }
                      onChange={(event, newValue) => {
                        formik.setValues({
                          ...formik.values,
                          report: newValue?.name as AssignmentReportTitle,
                          organization: '',
                          class: '',
                          divisions: [],
                          subjects: [],
                          teachers: [],
                          students: [],
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
                      value={formik.values.class}
                      multiple={false}
                      onChange={(val) => {
                        formik.setFieldValue('class', val);

                        const selectedClass = allClass.find((cls) => cls.id === val);
                        const divisions = selectedClass?.divisions || [];

                        setAllDivision(divisions);

                        formik.setFieldValue(
                          'divisions',
                          divisions.map((d) => d.id)
                        );
                      }}
                      onBlur={() => formik.setFieldTouched('class', true)}
                      error={formik.touched.class && Boolean(formik.errors.class)}
                      helperText={(formik.touched.class && formik.errors.class) as string}
                      labelKey="name"
                      valueKey="id"
                      disabled={!formik.values.organization}
                      formControlProps={{ sx: { width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Division */}
              {showField('divisions') && formik.values.class && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
                    <CustomSelect
                      options={allDivision}
                      label="Division *"
                      multiple
                      value={formik.values.divisions}
                      onChange={(val) => formik.setFieldValue('divisions', val)}
                      onBlur={() => formik.setFieldTouched('divisions', true)}
                      error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                      labelKey="name"
                      valueKey="id"
                      disabled={!formik.values.class}
                      formControlProps={{ sx: { width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Subjects */}
              {showField('subjects') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    label="Subjects *"
                    multiple
                    value={formik.values.subjects}
                    onChange={(val) => formik.setFieldValue('subjects', val)}
                    onBlur={() => formik.setFieldTouched('subjects', true)}
                    options={[
                      { id: 'english', name: 'English' },
                      { id: 'math', name: 'Mathematics' },
                      { id: 'science', name: 'Science' },
                      { id: 'computer', name: 'Computer' },
                      { id: 'social', name: 'Social Studies' },
                    ]}
                    labelKey="name"
                    valueKey="id"
                    error={formik.touched.subjects && Boolean(formik.errors.subjects)}
                    helperText={(formik.touched.subjects && formik.errors.subjects) as string}
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </Grid>
              )}

              {/* Teachers */}
              {showField('teachers') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    label="Teachers *"
                    multiple
                    value={formik.values.teachers}
                    onChange={(val) => formik.setFieldValue('teachers', val)}
                    onBlur={() => formik.setFieldTouched('teachers', true)}
                    options={[
                      { id: 't1', name: 'Teacher 1' },
                      { id: 't2', name: 'Teacher 2' },
                      { id: 't3', name: 'Teacher 3' },
                    ]}
                    labelKey="name"
                    valueKey="id"
                    error={formik.touched.teachers && Boolean(formik.errors.teachers)}
                    helperText={(formik.touched.teachers && formik.errors.teachers) as string}
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </Grid>
              )}

              {/* Students */}
              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Autocomplete
                    loading={isLoading}
                    fullWidth
                    disableCloseOnSelect
                    value={formik.values.students}
                    disabled={!formik.values.divisions}
                    onChange={(e, value: any) => {
                      formik.setFieldValue('students', value);
                      formik.setFieldTouched('students', false);
                    }}
                    options={tableData}
                    getOptionLabel={(option: any) => option?.name || ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option.id}>
                        <Checkbox
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.name}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Student *"
                        fullWidth
                        error={!!(formik.touched.students && formik.errors.students)}
                        helperText={(formik.touched.students && formik.errors.students) as string}
                      />
                    )}
                  />
                </Grid>
              )}

              {/* From Date */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.fromDate && formik.errors.fromDate)}>
                    <DatePicker
                      label="From Date *"
                      format="DD/MM/YYYY"
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
                      label="To Date *"
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

              {/* Submit */}
              <Grid size={12} display="flex" justifyContent="flex-end">
                <Button
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  type="submit"
                  disabled={!formik.values.report}
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

export default AssignmentManagementReports;
