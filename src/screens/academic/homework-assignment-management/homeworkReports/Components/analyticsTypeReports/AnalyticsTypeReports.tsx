'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Card, Button } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import {
  HomeworkAssignmentAnalyticReportTitle,
  HomeworkAssignmentAnalyticReportTitleOptions,
} from 'src/enums/homeworkAssignmentAnalytic-report';
import { useTeacherSelection } from 'src/screens/academic/curriculum-management/subjectAssignment/component/subjectAssignmentForm/hooks/useTeacherSelection';

import { getHomeworkAssignmentAnalyticsValidationSchema } from './AnalyticsReportsValidation';

type EmployeeOption = { id: string; label: string };

interface HomeworkAssignmentAnalyticsFormValues {
  report: HomeworkAssignmentAnalyticReportTitle;
  organization: string;
  class: string;
  divisions: string[];
  subjects: string[];
  teachers: string[];
  students: string[];
}

const analyticsInitialValues: HomeworkAssignmentAnalyticsFormValues = {
  report: '' as unknown as HomeworkAssignmentAnalyticReportTitle,
  organization: '',
  class: '',
  divisions: [],
  subjects: [],
  teachers: [],
  students: [],
};

const HomeworkAssignmentAnalyticReportFieldsMap: Record<
  HomeworkAssignmentAnalyticReportTitle,
  string[]
> = {
  [HomeworkAssignmentAnalyticReportTitle.HomeworkLoadAnalysisReport]: [
    'organization',
    'class',
    'divisions',
    'subjects',
  ],
  [HomeworkAssignmentAnalyticReportTitle.AssignmentLoadAnalysisReport]: [
    'organization',
    'class',
    'divisions',
    'subjects',
  ],
  [HomeworkAssignmentAnalyticReportTitle.TeacherPerformanceInHomeworkEvaluationReport]: [
    'organization',
    'teacher',
    'subjects',
    'class',
    'divisions',
  ],
  [HomeworkAssignmentAnalyticReportTitle.StudentPerformanceTrendReport]: [
    'organization',
    'class',
    'divisions',
    'students',
    'subjects',
  ],
  [HomeworkAssignmentAnalyticReportTitle.ClasswiseOverallHomeworkAssignmentReport]: [
    'organization',
    'class',
    'divisions',
  ],
};

const HomeworkAssignmentAnalyticRequiredFieldsMap: Record<
  HomeworkAssignmentAnalyticReportTitle,
  string[]
> = {
  [HomeworkAssignmentAnalyticReportTitle.HomeworkLoadAnalysisReport]: ['organization', 'class'],
  [HomeworkAssignmentAnalyticReportTitle.AssignmentLoadAnalysisReport]: ['organization', 'class'],
  [HomeworkAssignmentAnalyticReportTitle.TeacherPerformanceInHomeworkEvaluationReport]: [
    'organization',
    'teacher',
    'subjects',
    'class',
  ],
  [HomeworkAssignmentAnalyticReportTitle.StudentPerformanceTrendReport]: [
    'organization',
    'class',
    'students',
  ],
  [HomeworkAssignmentAnalyticReportTitle.ClasswiseOverallHomeworkAssignmentReport]: [
    'organization',
    'class',
  ],
};

const normalizeArray = (input: any): any[] =>
  input?.data?.items ?? input?.items ?? input?.records ?? (Array.isArray(input) ? input : []);

const removeAllToken = (values: string[]) => values.filter((id) => id !== 'all');

type HomeworkAssignmentAnalyticsReportsProps = {
  report: string;
};

const HomeworkAssignmentAnalyticsReports = ({
  report,
}: HomeworkAssignmentAnalyticsReportsProps) => {
  const mappedReport = HomeworkAssignmentAnalyticReportTitleOptions.find(
    (opt) => opt.label === report
  )?.name;

  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [dynamicSchema, setDynamicSchema] = useState(
    getHomeworkAssignmentAnalyticsValidationSchema([], [])
  );

  const formik = useFormik({
    initialValues: {
      ...analyticsInitialValues,
      report: mappedReport as HomeworkAssignmentAnalyticReportTitle,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      const payload = {
        report: values.report,
        academicYearId: currentYear?.id,
        ...(currentFields.includes('organization') && { organizationId: values.organization }),
        ...(currentFields.includes('class') && { classId: values.class || null }),
        ...(currentFields.includes('divisions') && {
          divisionIds: removeAllToken(values.divisions),
        }),
        ...(currentFields.includes('subjects') && { subjectIds: removeAllToken(values.subjects) }),
        ...(currentFields.includes('teacher') && { teacherIds: removeAllToken(values.teachers) }),
        ...(currentFields.includes('students') && { studentIds: removeAllToken(values.students) }),
      };

      // eslint-disable-next-line no-console
      window.alert('Homework/Assignment Analytics Report Generated');
      setSubmitting(false);
    },
  });

  const currentFields = useMemo(
    () =>
      HomeworkAssignmentAnalyticReportFieldsMap[
        mappedReport as HomeworkAssignmentAnalyticReportTitle
      ] || [],
    [mappedReport]
  );

  const currentRequiredFields = useMemo(
    () =>
      HomeworkAssignmentAnalyticRequiredFieldsMap[
        mappedReport as HomeworkAssignmentAnalyticReportTitle
      ] || [],
    [mappedReport]
  );

  const showField = useCallback((field: string) => currentFields.includes(field), [currentFields]);
  const isRequired = useCallback(
    (field: string) => currentRequiredFields.includes(field),
    [currentRequiredFields]
  );

  const withRequired = (label: string, field: string) => `${label}${isRequired(field) ? ' *' : ''}`;

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
      getHomeworkAssignmentAnalyticsValidationSchema(currentFields, currentRequiredFields)
    );
  }, [currentFields, currentRequiredFields]);

  useEffect(() => {
    setAllOrganization(cloneDeep(medium?.educationMediumStages || []));
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    const standards =
      allOrganization.find((org) => org?.id === formik.values.organization)?.standards || [];
    setAllClass(standards);
  }, [allOrganization, formik.values.organization]);

  useEffect(() => {
    if (!formik.values.class) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    const selected = allClass.find((cls) => cls.id === formik.values.class);
    setAllDivision(selected?.divisions || []);
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
    if (!showField('students')) {
      formik.setFieldValue('students', []);
      return;
    }

    const validStudentIds = new Set(studentOptions.map((item: any) => item.id));
    const nextStudents = formik.values.students.filter((id) => validStudentIds.has(id));

    if (nextStudents.length !== formik.values.students.length) {
      formik.setFieldValue('students', nextStudents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showField, studentOptions]);

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
                          teachers: [],
                          students: [],
                        });
                        setTeacherObjs([]);
                      }}
                      onBlur={() => formik.setFieldTouched('organization', true)}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { width: '100%' } }}
                      error={formik.touched.organization && Boolean(formik.errors.organization)}
                      helperText={
                        (formik.touched.organization && formik.errors.organization) as string
                      }
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
                      onChange={(val) => {
                        formik.setValues({
                          ...formik.values,
                          class: val as string,
                          divisions: [],
                          subjects: [],
                          students: [],
                        });
                      }}
                      onBlur={() => formik.setFieldTouched('class', true)}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { width: '100%' } }}
                      error={formik.touched.class && Boolean(formik.errors.class)}
                      helperText={(formik.touched.class && formik.errors.class) as string}
                      disabled={!formik.values.organization}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
                    <CustomSelect
                      multiple
                      options={allDivision}
                      label={withRequired('Division', 'divisions')}
                      value={formik.values.divisions}
                      onChange={(val) => {
                        formik.setValues({
                          ...formik.values,
                          divisions: val as string[],
                          students: [],
                        });
                      }}
                      onBlur={() => formik.setFieldTouched('divisions', true)}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { width: '100%' } }}
                      error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                      disabled={showField('class') && !formik.values.class}
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
                      disabled={!formik.values.organization || !formik.values.class}
                      isLoading={isSubjectLoading}
                      onChange={(selectedValues) => {
                        formik.setFieldValue('subjects', selectedValues);
                      }}
                      error={formik.touched.subjects && Boolean(formik.errors.subjects)}
                      helperText={(formik.touched.subjects && formik.errors.subjects) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('teacher') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.teachers && formik.errors.teachers)}>
                    <PaginatedSearchSelect
                      multiple
                      disableCloseOnSelect
                      label={withRequired('Teacher', 'teacher')}
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
                      disabled={!formik.values.class}
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

              <Grid size={12} display="flex" justifyContent="flex-end">
                <Button
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  variant="contained"
                  size="small"
                  type="submit"
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
