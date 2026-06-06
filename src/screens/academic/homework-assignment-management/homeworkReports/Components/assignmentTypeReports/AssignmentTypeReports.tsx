'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Card, Button } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import {
  AssignmentReportTitle,
  AssignmentReportTitleOptions,
} from 'src/enums/assignment-wise-report';
import { useGetAssignmentsQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-api';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import { useTeacherSelection } from 'src/screens/academic/curriculum-management/subjectAssignment/component/subjectAssignmentForm/hooks/useTeacherSelection';

import { getAssignmentValidationSchema } from './AssignmentTypeReportValidation';

type EmployeeOption = { id: string; label: string };
type AssignmentSelectMode = 'single' | 'multiple';

interface AssignmentReportFormValues {
  report: AssignmentReportTitle;
  organization: string;
  class: string;
  divisions: string[];
  subjects: string[];
  teachers: string[];
  students: string[];
  assignments: string[];
  fromDate: Dayjs | null;
  toDate: Dayjs | null;
}

const assignmentInitialValues: AssignmentReportFormValues = {
  report: '' as unknown as AssignmentReportTitle,
  organization: '',
  class: '',
  divisions: [],
  subjects: [],
  teachers: [],
  students: [],
  assignments: [],
  fromDate: null,
  toDate: null,
};

const AssignmentReportFieldsMap: Record<AssignmentReportTitle, string[]> = {
  [AssignmentReportTitle.AssignmentIssuanceReport]: [
    'organization',
    'class',
    'divisions',
    'subjects',
    'teachers',
    'fromDate',
    'toDate',
  ],
  [AssignmentReportTitle.AssignmentSubmissionReport]: [
    'organization',
    'class',
    'divisions',
    'subjects',
    'students',
    'fromDate',
    'toDate',
  ],
  [AssignmentReportTitle.AssignmentEvaluationReport]: [
    'organization',
    'teachers',
    'subjects',
    'class',
    'divisions',
    'fromDate',
    'toDate',
  ],
  [AssignmentReportTitle.AssignmentMarksReport]: [
    'organization',
    'class',
    'divisions',
    'subjects',
    'assignments',
    'students',
    'fromDate',
    'toDate',
  ],
  [AssignmentReportTitle.LateSubmissionReport]: [
    'organization',
    'class',
    'divisions',
    'subjects',
    'students',
    'fromDate',
    'toDate',
  ],
  [AssignmentReportTitle.MissingAssignmentReport]: [
    'organization',
    'class',
    'divisions',
    'subjects',
    'students',
    'fromDate',
    'toDate',
  ],
  [AssignmentReportTitle.AssignmentFeedbackReport]: [
    'organization',
    'class',
    'divisions',
    'teachers',
    'subjects',
    'students',
  ],
  [AssignmentReportTitle.AssignmentGradeDistributionReport]: [
    'organization',
    'class',
    'divisions',
    'subjects',
    'assignments',
    'fromDate',
    'toDate',
  ],
  [AssignmentReportTitle.AssignmentPerformanceReport]: [
    'organization',
    'class',
    'divisions',
    'subjects',
    'teachers',
    'students',
    'fromDate',
    'toDate',
  ],
};

const AssignmentReportRequiredFieldsMap: Record<AssignmentReportTitle, string[]> = {
  [AssignmentReportTitle.AssignmentIssuanceReport]: ['organization', 'class', 'fromDate', 'toDate'],
  [AssignmentReportTitle.AssignmentSubmissionReport]: ['organization', 'fromDate', 'toDate'],
  [AssignmentReportTitle.AssignmentEvaluationReport]: ['organization', 'fromDate', 'toDate'],
  [AssignmentReportTitle.AssignmentMarksReport]: ['organization', 'fromDate', 'toDate'],
  [AssignmentReportTitle.LateSubmissionReport]: ['organization', 'fromDate', 'toDate'],
  [AssignmentReportTitle.MissingAssignmentReport]: ['organization', 'fromDate', 'toDate'],
  [AssignmentReportTitle.AssignmentFeedbackReport]: ['organization', 'class'],
  [AssignmentReportTitle.AssignmentGradeDistributionReport]: [
    'organization',
    'class',
    'assignments',
    'fromDate',
    'toDate',
  ],
  [AssignmentReportTitle.AssignmentPerformanceReport]: ['organization', 'fromDate', 'toDate'],
};

const AssignmentSelectModeMap: Partial<Record<AssignmentReportTitle, AssignmentSelectMode>> = {
  [AssignmentReportTitle.AssignmentMarksReport]: 'multiple',
  [AssignmentReportTitle.AssignmentGradeDistributionReport]: 'multiple',
};

const normalizeArray = (input: any): any[] =>
  input?.data?.items ?? input?.items ?? input?.records ?? (Array.isArray(input) ? input : []);

const removeAllToken = (values: string[]) => values.filter((id) => id !== 'all');

const AssignmentManagementReports = ({ report }: { report: string }) => {
  const mappedReport = AssignmentReportTitleOptions.find((opt) => opt.label === report)?.name;

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [dynamicSchema, setDynamicSchema] = useState(
    getAssignmentValidationSchema([], [], currentYear)
  );

  const formik = useFormik({
    initialValues: {
      ...assignmentInitialValues,
      report: mappedReport as AssignmentReportTitle,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      const payload = {
        report: values.report,
        ...(currentFields.includes('organization') && { organizationId: values.organization }),
        ...(currentFields.includes('class') && { classId: values.class || null }),
        ...(currentFields.includes('divisions') && {
          divisionIds: removeAllToken(values.divisions),
        }),
        ...(currentFields.includes('subjects') && { subjectIds: removeAllToken(values.subjects) }),
        ...(currentFields.includes('teachers') && { teacherIds: removeAllToken(values.teachers) }),
        ...(currentFields.includes('students') && { studentIds: removeAllToken(values.students) }),
        ...(currentFields.includes('assignments') && {
          assignmentIds: removeAllToken(values.assignments),
        }),
        ...(currentFields.includes('fromDate') && {
          fromDate: values.fromDate ? dayjs(values.fromDate).format('YYYY-MM-DD') : null,
        }),
        ...(currentFields.includes('toDate') && {
          toDate: values.toDate ? dayjs(values.toDate).format('YYYY-MM-DD') : null,
        }),
      };

      // Keep existing report workflow behavior while providing config-aligned payload generation.
      // eslint-disable-next-line no-console
      window.alert('Assignment report generated...');
      setSubmitting(false);
    },
  });

  const currentFields = useMemo(
    () => AssignmentReportFieldsMap[mappedReport as AssignmentReportTitle] || [],
    [mappedReport]
  );

  const currentRequiredFields = useMemo(
    () => AssignmentReportRequiredFieldsMap[mappedReport as AssignmentReportTitle] || [],
    [mappedReport]
  );

  const assignmentSelectMode =
    AssignmentSelectModeMap[mappedReport as AssignmentReportTitle] || 'multiple';

  const isAssignmentMultiple = assignmentSelectMode === 'multiple';

  const showField = useCallback(
    (fieldName: string) => currentFields.includes(fieldName),
    [currentFields]
  );
  const isRequired = useCallback(
    (fieldName: string) => currentRequiredFields.includes(fieldName),
    [currentRequiredFields]
  );

  const withRequired = (label: string, fieldName: string) =>
    `${label}${isRequired(fieldName) ? ' *' : ''}`;

  const { data: subjectData, isLoading: isSubjectLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (medium as Medium)?.id },
    options: {
      skip: !showField('subjects') || !(medium as Medium)?.id,
    },
  });

  const subjectOptions = useMemo(() => normalizeArray(subjectData), [subjectData]);

  const { fetchPrimaryTeacherOptions: fetchTeacherOptions } = useTeacherSelection({
    primaryTeacherId: '',
    secondaryTeacherIds: [],
  });

  const [teacherObjs, setTeacherObjs] = useState<EmployeeOption[]>([]);

  const selectedSubjectId = useMemo(
    () => removeAllToken(formik.values.subjects)[0],
    [formik.values.subjects]
  );

  const canLoadAssignments =
    showField('assignments') &&
    !!(medium as Medium)?.id &&
    !!formik.values.class &&
    !!selectedSubjectId;

  const {
    data: assignmentData,
    isLoading: isAssignmentLoading,
    isError: isAssignmentError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentsQuery,
    params: {
      academicMediumId: (medium as Medium)?.id,
      StandardId: formik.values.class,
      DivisionId: formik.values.divisions[0],
      SubjectId: selectedSubjectId,
    },
    options: {
      skip: !canLoadAssignments,
    },
  });

  const assignmentOptions = useMemo(
    () =>
      normalizeArray(assignmentData).map((item: any) => ({
        id: item.id,
        name:
          item.title ||
          item.assignmentTitle ||
          item.name ||
          item.assignmentName ||
          item.topic ||
          'Untitled Assignment',
      })),
    [assignmentData]
  );

  const assignmentHelperText =
    (formik.touched.assignments && (formik.errors.assignments as string)) ||
    (isAssignmentError ? 'Unable to load assignments. Please retry.' : '') ||
    (canLoadAssignments && !isAssignmentLoading && assignmentOptions.length === 0
      ? 'No assignments found for selected filters.'
      : '');

  const [getStudents, { data: studentsData, isLoading: isStudentsLoading }] =
    useLazyGetFilterStudentsQuery();

  const studentOptions = useMemo(
    () =>
      studentsData?.items?.map((item: any) => ({
        id: item.id,
        name: [item.firstName, item.middleName, item.lastName].filter(Boolean).join(' '),
      })) || [],
    [studentsData?.items]
  );

  useEffect(() => {
    setDynamicSchema(
      getAssignmentValidationSchema(currentFields, currentRequiredFields, currentYear)
    );
  }, [currentFields, currentRequiredFields, currentYear]);

  useEffect(() => {
    setAllOrganization(cloneDeep(medium?.educationMediumStages || []));
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    const standards =
      allOrganization.find((org: any) => org?.id === formik.values.organization)?.standards || [];
    setAllClass(standards);
  }, [allOrganization, formik.values.organization]);

  useEffect(() => {
    if (!formik.values.class) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    const selectedClass = allClass.find((cls) => cls.id === formik.values.class);
    setAllDivision(selectedClass?.divisions || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.class]);

  useEffect(() => {
    if (!showField('students') || !formik.values.class) return;

    getStudents({
      academicYearId: currentYear?.id,
      academicMediumId: (medium as Medium)?.id,
      standardId: formik.values.class,
      divisionId: formik.values.divisions[0],
    });
  }, [
    currentYear?.id,
    formik.values.class,
    formik.values.divisions,
    getStudents,
    medium,
    showField,
  ]);

  useEffect(() => {
    if (!showField('assignments')) return;

    const validAssignmentIds = new Set(assignmentOptions.map((item: any) => item.id));
    const nextAssignments = formik.values.assignments.filter((id) => validAssignmentIds.has(id));

    if (nextAssignments.length !== formik.values.assignments.length) {
      formik.setFieldValue('assignments', nextAssignments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentOptions, showField]);

  useEffect(() => {
    setTeacherObjs([]);
    formik.setFieldValue('teachers', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappedReport]);

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
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
                        formik.setValues({
                          ...formik.values,
                          organization: val as string,
                          class: '',
                          divisions: [],
                          subjects: [],
                          assignments: [],
                          teachers: [],
                          students: [],
                          fromDate: null,
                          toDate: null,
                        });
                        setTeacherObjs([]);
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

              {showField('class') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.class && formik.errors.class)}>
                    <CustomSelect
                      options={allClass}
                      label={withRequired('Class', 'class')}
                      value={formik.values.class}
                      multiple={false}
                      onChange={(val) => {
                        const selectedClass = allClass.find((cls) => cls.id === val);
                        const divisions = selectedClass?.divisions || [];

                        setAllDivision(divisions);
                        formik.setValues({
                          ...formik.values,
                          class: val as string,
                          divisions: [],
                          subjects: [],
                          assignments: [],
                          teachers: [],
                          students: [],
                        });
                        setTeacherObjs([]);
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

              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
                    <CustomSelect
                      options={allDivision}
                      label={withRequired('Division', 'divisions')}
                      multiple
                      disabled={showField('class') && !formik.values.class}
                      value={formik.values.divisions}
                      onChange={(val) => {
                        formik.setValues({
                          ...formik.values,
                          divisions: val as string[],
                          subjects: [],
                          assignments: [],
                          teachers: [],
                          students: [],
                        });
                        setTeacherObjs([]);
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

              {showField('subjects') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.subjects && formik.errors.subjects)}>
                    <ResponsiveMultiSelect
                      label={withRequired('Subject', 'subjects')}
                      options={subjectOptions}
                      value={formik.values.subjects}
                      getOptionLabel={(opt: any) => opt?.name ?? ''}
                      getOptionValue={(opt: any) => opt?.id ?? ''}
                      disabled={
                        !formik.values.organization || (showField('class') && !formik.values.class)
                      }
                      isLoading={isSubjectLoading}
                      onChange={(selectedValues) => {
                        formik.setValues({
                          ...formik.values,
                          subjects: selectedValues,
                          assignments: [],
                        });
                      }}
                      error={formik.touched.subjects && Boolean(formik.errors.subjects)}
                      helperText={(formik.touched.subjects && formik.errors.subjects) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('assignments') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.assignments && formik.errors.assignments)}
                  >
                    {isAssignmentMultiple ? (
                      <ResponsiveMultiSelect
                        label={withRequired('Assignment', 'assignments')}
                        options={assignmentOptions}
                        value={formik.values.assignments}
                        getOptionLabel={(opt: any) => opt?.name ?? ''}
                        getOptionValue={(opt: any) => opt?.id ?? ''}
                        disabled={!canLoadAssignments}
                        isLoading={isAssignmentLoading}
                        onChange={(selectedValues) => {
                          formik.setFieldValue('assignments', selectedValues);
                        }}
                        error={formik.touched.assignments && Boolean(formik.errors.assignments)}
                        helperText={assignmentHelperText}
                      />
                    ) : (
                      <CustomSelect
                        options={assignmentOptions}
                        label={withRequired('Assignment', 'assignments')}
                        value={formik.values.assignments[0] || ''}
                        onChange={(val) => {
                          formik.setFieldValue('assignments', val ? [val as string] : []);
                        }}
                        onBlur={() => formik.setFieldTouched('assignments', true)}
                        error={formik.touched.assignments && Boolean(formik.errors.assignments)}
                        helperText={assignmentHelperText}
                        labelKey="name"
                        valueKey="id"
                        disabled={!canLoadAssignments || isAssignmentLoading}
                        formControlProps={{ sx: { width: '100%' } }}
                      />
                    )}
                  </ShakingTextField>
                </Grid>
              )}

              {showField('teachers') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.teachers && formik.errors.teachers)}>
                    <PaginatedSearchSelect
                      multiple
                      disableCloseOnSelect
                      label={withRequired('Teacher', 'teachers')}
                      fetchOptions={fetchTeacherOptions}
                      value={teacherObjs}
                      onChange={(_: unknown, newValues: EmployeeOption[]) => {
                        const values = newValues || [];
                        setTeacherObjs(values);
                        formik.setFieldValue(
                          'teachers',
                          values.map((item) => item.id)
                        );
                      }}
                      onBlur={() => formik.setFieldTouched('teachers', true)}
                      getOptionLabel={(option: EmployeeOption) => option?.label || ''}
                      isOptionEqualToValue={(option: EmployeeOption, val: EmployeeOption) =>
                        option.id === val.id
                      }
                      debounceMs={400}
                      minChars={0}
                      size="small"
                      fullWidth
                      error={formik.touched.teachers && Boolean(formik.errors.teachers)}
                      helperText={(formik.touched.teachers && formik.errors.teachers) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.students && formik.errors.students)}>
                    <ResponsiveMultiSelect
                      label={withRequired('Student', 'students')}
                      options={studentOptions}
                      value={formik.values.students}
                      getOptionLabel={(opt: any) => opt?.name ?? ''}
                      getOptionValue={(opt: any) => opt?.id ?? ''}
                      disabled={showField('class') && !formik.values.class}
                      isLoading={isStudentsLoading}
                      onChange={(selectedValues) => {
                        formik.setFieldValue('students', selectedValues);
                      }}
                      error={formik.touched.students && Boolean(formik.errors.students)}
                      helperText={(formik.touched.students && formik.errors.students) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.fromDate && formik.errors.fromDate)}>
                    <DatePicker
                      label={withRequired('From Date', 'fromDate')}
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

              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.toDate && formik.errors.toDate)}>
                    <DatePicker
                      label={withRequired('To Date', 'toDate')}
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

              <Grid size={12} display="flex" justifyContent="flex-end">
                <Button
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  type="submit"
                  variant="contained"
                  disabled={
                    formik.values.report === ('' as unknown as AssignmentReportTitle) ||
                    formik.values.report === null ||
                    formik.values.report === undefined
                  }
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
