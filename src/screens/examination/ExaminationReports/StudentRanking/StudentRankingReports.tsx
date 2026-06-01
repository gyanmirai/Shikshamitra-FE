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
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { ExamReportTitle, StudentRankingBrightWeakReportMap } from 'src/enums/examination-reports';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import { useGetExamMarksQuery } from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import { getExamValidationSchema } from '../getExamReportValidationSchema';

const resolveMultiSelectValues = (
  selectedValues: string[],
  previousValues: string[],
  allRealIds: string[]
): string[] => {
  const hasAllInSelection = selectedValues.includes('all');
  const wasAllPreviouslySelected = previousValues.includes('all');

  if (hasAllInSelection && !wasAllPreviouslySelected) {
    return ['all', ...allRealIds];
  }

  if (!hasAllInSelection && wasAllPreviouslySelected) {
    return [];
  }

  if (hasAllInSelection && wasAllPreviouslySelected) {
    return selectedValues.filter((id) => id !== 'all');
  }

  const selectedRealIds = selectedValues.filter((id) => id !== 'all');

  if (
    selectedRealIds.length === allRealIds.length &&
    allRealIds.every((id) => selectedRealIds.includes(id))
  ) {
    return ['all', ...allRealIds];
  }

  return selectedRealIds;
};

const getApiItems = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.records)) return response.records;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const StudentRankingReportFieldsMap: Partial<Record<ExamReportTitle, string[]>> = {
  [ExamReportTitle.BrightStudentAnalysis]: [
    'organizations',
    'standards',
    'divisions',
    'exam',
    'grade',
  ],
  [ExamReportTitle.BrightStudentListSubjectWise]: [
    'organizations',
    'standards',
    'divisions',
    'subject',
    'exam',
    'grade',
  ],
  [ExamReportTitle.WeakStudentAnalysis]: ['organizations', 'standards', 'divisions', 'exam'],
  [ExamReportTitle.WeakStudentAnalysisSubjectWise]: [
    'organizations',
    'standards',
    'divisions',
    'subject',
    'exam',
  ],
  [ExamReportTitle.StudentGradeAnalysis]: ['organizations', 'standards', 'divisions', 'exam'],
  [ExamReportTitle.ResultListPassFailOverAllAnalysis]: [
    'organizations',
    'standard_single',
    'divisions',
    'exam',
  ],
  [ExamReportTitle.ResultListOverallGradeAnalysis]: [
    'organizations',
    'standard_single',
    'divisions',
    'exam',
  ],
};

const StudentRankingReportRequiredFieldsMap: Partial<Record<ExamReportTitle, string[]>> = {
  [ExamReportTitle.BrightStudentAnalysis]: ['organizations', 'standards', 'exam', 'grade'],
  [ExamReportTitle.BrightStudentListSubjectWise]: [
    'organizations',
    'standards',
    'subject',
    'exam',
    'grade',
  ],
  [ExamReportTitle.WeakStudentAnalysis]: ['organizations', 'standards', 'exam'],
  [ExamReportTitle.WeakStudentAnalysisSubjectWise]: [
    'organizations',
    'standards',
    'subject',
    'exam',
  ],
  [ExamReportTitle.StudentGradeAnalysis]: ['organizations', 'standards', 'exam'],
  [ExamReportTitle.ResultListPassFailOverAllAnalysis]: ['organizations', 'standard_single', 'exam'],
  [ExamReportTitle.ResultListOverallGradeAnalysis]: ['organizations', 'standard_single', 'exam'],
};

const examReportInitialValues = {
  report: '' as unknown as ExamReportTitle,
  organizations: [] as string[],
  standards: [] as string[],
  standard: '',
  divisions: [] as string[],
  exam: '',
  subject: '',
  grade: [] as string[],
};

const StudentRankingReports = ({ report }: { report: string }) => {
  const mappedReport = StudentRankingBrightWeakReportMap.find((opt) => opt.label === report)
    ?.name as ExamReportTitle;

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const currentFields = useMemo(
    () => StudentRankingReportFieldsMap[mappedReport] || [],
    [mappedReport]
  );
  const currentRequiredFields = useMemo(
    () => StudentRankingReportRequiredFieldsMap[mappedReport] || [],
    [mappedReport]
  );

  const showField = useCallback((field: string) => currentFields.includes(field), [currentFields]);
  const isRequired = useCallback(
    (field: string) => currentRequiredFields.includes(field),
    [currentRequiredFields]
  );

  const [dynamicSchema, setDynamicSchema] = useState(
    getExamValidationSchema(currentFields, currentRequiredFields)
  );

  const formik = useFormik({
    initialValues: {
      ...examReportInitialValues,
      report: mappedReport,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (_values, { setSubmitting }) => {
      window.alert('Report Generated Successfully!');
      setSubmitting(false);
    },
  });

  const selectedClassIds = useMemo(() => {
    if (showField('standard_single')) {
      return formik.values.standard ? [formik.values.standard] : [];
    }

    return formik.values.standards.filter((id) => id !== 'all');
  }, [formik.values.standards, formik.values.standard, showField]);

  const selectedDivisionIds = useMemo(
    () => formik.values.divisions.filter((id) => id !== 'all'),
    [formik.values.divisions]
  );

  const shouldLoadExams = showField('exam') && Boolean((medium as Medium)?.id);
  const shouldLoadSubjects =
    showField('subject') && Boolean((medium as Medium)?.id) && selectedClassIds.length > 0;

  const shouldLoadGrades =
    showField('grade') &&
    Boolean(formik.values.exam) &&
    selectedClassIds.length > 0 &&
    (!showField('subject') || Boolean(formik.values.subject));

  const {
    data: examData,
    isLoading: isExamLoading,
    isFetching: isExamFetching,
    isError: isExamError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamsQuery,
    params: {
      AcademicMediumId: (medium as Medium)?.id,
      Status: examScheduledStatus.Completed,
    },
    options: {
      skip: !shouldLoadExams,
    },
  });

  const {
    data: subjectData,
    isLoading: isSubjectLoading,
    isFetching: isSubjectFetching,
    isError: isSubjectError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (medium as Medium)?.id },
    options: {
      skip: !shouldLoadSubjects,
    },
  });

  const gradeQuery = useMemo(
    () => ({
      page: 1,
      pageSize: 500,
    }),
    []
  );

  const allParamsReadyForGrade = shouldLoadGrades;

  const {
    data: gradingData,
    isLoading: isGradeLoading,
    isFetching: isGradeFetching,
    isError: isGradeError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamMarksQuery,
    params: {
      ExamId: formik.values.exam,
      SubjectId: formik.values.subject || undefined,
      DivisionId: selectedDivisionIds[0] || undefined,
      StandardId: selectedClassIds[0] || undefined,
      ...gradeQuery,
    },
    options: {
      skip: !allParamsReadyForGrade,
    },
  });

  const examOptions = useMemo(
    () =>
      getApiItems(examData)
        .map((exam: any) => ({
          id: exam.examId ?? exam.id ?? '',
          name: exam.examName ?? exam.name ?? '',
        }))
        .filter((option: { id: string; name: string }) => option.id && option.name),
    [examData]
  );

  const subjectOptions = useMemo(
    () =>
      getApiItems(subjectData)
        .map((subject: any) => ({
          id: subject.subjectId ?? subject.id ?? '',
          name: subject.subjectName ?? subject.name ?? '',
        }))
        .filter((option: { id: string; name: string }) => option.id && option.name),
    [subjectData]
  );

  const gradeOptions = useMemo(() => {
    const gradeSet = new Set<string>();
    getApiItems(gradingData).forEach((item: any) => {
      const rawGrade = item?.grade;
      if (rawGrade === null || rawGrade === undefined) return;
      const normalizedGrade = String(rawGrade).trim();
      if (!normalizedGrade) return;
      gradeSet.add(normalizedGrade);
    });

    return Array.from(gradeSet)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((grade) => ({ id: grade, name: grade }));
  }, [gradingData]);

  const examNoOptionsMessage = useMemo(() => {
    if (isExamError) return 'Unable to load exams';
    if (shouldLoadExams && !isExamLoading && !isExamFetching && examOptions.length === 0) {
      return 'No exams found';
    }
    return 'No data available';
  }, [examOptions.length, isExamError, isExamFetching, isExamLoading, shouldLoadExams]);

  const subjectNoOptionsMessage = useMemo(() => {
    if (isSubjectError) return 'Unable to load subjects';
    if (
      shouldLoadSubjects &&
      !isSubjectLoading &&
      !isSubjectFetching &&
      subjectOptions.length === 0
    ) {
      return 'No subjects found';
    }
    return 'No data available';
  }, [
    isSubjectError,
    shouldLoadSubjects,
    isSubjectLoading,
    isSubjectFetching,
    subjectOptions.length,
  ]);

  const gradeNoOptionsMessage = useMemo(() => {
    if (isGradeError) return 'Unable to load grades';
    if (shouldLoadGrades && !isGradeLoading && !isGradeFetching && gradeOptions.length === 0) {
      return 'No grades found';
    }
    return 'No data available';
  }, [isGradeError, shouldLoadGrades, isGradeLoading, isGradeFetching, gradeOptions.length]);

  useEffect(() => {
    setDynamicSchema(getExamValidationSchema(currentFields, currentRequiredFields));
  }, [currentFields, currentRequiredFields]);

  useEffect(() => {
    if (!medium?.educationMediumStages) {
      setAllOrganization([]);
      return;
    }

    const organizations = cloneDeep(medium.educationMediumStages);
    setAllOrganization([
      {
        id: 'all',
        name: 'All',
        creationTime: '',
        creatorId: '',
        lastModificationTime: '',
        lastModifierId: '',
        educationMediumStageId: '',
        divisions: [],
      },
      ...organizations,
    ]);
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    const selectedOrgIds = formik.values.organizations.filter((id) => id !== 'all');

    if (selectedOrgIds.length === 0) {
      setAllClass([]);
      formik.setFieldValue('standards', []);
      formik.setFieldValue('standard', '');
      formik.setFieldValue('divisions', []);
      formik.setFieldValue('subject', '');
      formik.setFieldValue('exam', '');
      formik.setFieldValue('grade', []);
      return;
    }

    const standards = allOrganization
      .filter((org: any) => selectedOrgIds.includes(org.id))
      .flatMap((org: any) => (Array.isArray(org.standards) ? org.standards : []));

    setAllClass(standards);

    const allClassIds = standards.map((item: any) => item.id);
    if (showField('standard_single')) {
      formik.setFieldValue('standard', '');
      formik.setFieldValue('standards', []);
    } else {
      formik.setFieldValue('standards', allClassIds.length > 0 ? ['all', ...allClassIds] : []);
      formik.setFieldValue('standard', '');
    }
    formik.setFieldValue('subject', '');
    formik.setFieldValue('grade', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOrganization, formik.values.organizations, currentFields]);

  useEffect(() => {
    if (selectedClassIds.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      formik.setFieldValue('subject', '');
      formik.setFieldValue('grade', []);
      return;
    }

    if (selectedClassIds.length === 1) {
      const selectedClass = allClass.find((item: any) => item.id === selectedClassIds[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);
      const divisionIds = divisions.map((item: any) => item.id);
      formik.setFieldValue('divisions', divisionIds.length > 0 ? ['all', ...divisionIds] : []);
    } else {
      setAllDivision([]);
      formik.setFieldValue('divisions', ['all']);
    }

    formik.setFieldValue('subject', '');
    formik.setFieldValue('grade', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, selectedClassIds.join(',')]);

  useEffect(() => {
    formik.setFieldValue('grade', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.exam]);

  useEffect(() => {
    if (!showField('subject')) return;
    if (
      formik.values.subject &&
      !subjectOptions.some((subject) => subject.id === formik.values.subject)
    ) {
      formik.setFieldValue('subject', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectOptions, currentFields]);

  useEffect(() => {
    if (!showField('grade')) return;
    const validIds = new Set(gradeOptions.map((grade) => grade.id));
    const nextGrades = formik.values.grade.filter((id) => validIds.has(id));
    if (nextGrades.length !== formik.values.grade.length) {
      formik.setFieldValue('grade', nextGrades);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeOptions, currentFields]);

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {showField('organizations') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!formik.errors.organizations && !!formik.touched.organizations}
                  >
                    <ResponsiveMultiSelect
                      label={`Organization${isRequired('organizations') ? ' *' : ''}`}
                      options={[
                        { id: 'all', name: 'All' },
                        ...allOrganization.filter((organization) => organization.id !== 'all'),
                      ]}
                      value={formik.values.organizations}
                      getOptionLabel={(option: any) => option?.name}
                      getOptionValue={(option: any) => option?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = allOrganization
                          .filter((organization) => organization.id !== 'all')
                          .map((organization) => organization.id);

                        const nextValues = resolveMultiSelectValues(
                          selectedValues,
                          formik.values.organizations,
                          allRealIds
                        );

                        formik.setFieldValue('organizations', nextValues);
                      }}
                      error={!!(formik.touched.organizations && formik.errors.organizations)}
                      helperText={
                        formik.touched.organizations &&
                        typeof formik.errors.organizations === 'string'
                          ? formik.errors.organizations
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.standards && !!formik.touched.standards}>
                    <ResponsiveMultiSelect
                      label={`Class${isRequired('standards') ? ' *' : ''}`}
                      options={[{ id: 'all', name: 'All' }, ...allClass]}
                      value={formik.values.standards}
                      getOptionLabel={(option: any) => option?.name}
                      getOptionValue={(option: any) => option?.id}
                      disabled={formik.values.organizations.length === 0}
                      onChange={(selectedValues) => {
                        const allRealIds = allClass.map((item) => item.id);

                        const nextValues = resolveMultiSelectValues(
                          selectedValues,
                          formik.values.standards,
                          allRealIds
                        );

                        formik.setFieldValue('standards', nextValues);
                      }}
                      error={formik.touched.standards && Boolean(formik.errors.standards)}
                      helperText={(formik.touched.standards && formik.errors.standards) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('standard_single') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.standard && !!formik.touched.standard}>
                    <CustomSelect
                      label={`Class${isRequired('standard_single') ? ' *' : ''}`}
                      options={allClass}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.standard}
                      onChange={(value) => {
                        formik.setFieldValue('standard', value);
                        formik.setFieldValue('divisions', []);
                        formik.setFieldValue('subject', '');
                        formik.setFieldValue('grade', []);
                      }}
                      error={formik.touched.standard && Boolean(formik.errors.standard)}
                      helperText={(formik.touched.standard && formik.errors.standard) as string}
                      disabled={formik.values.organizations.length === 0}
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.divisions && !!formik.touched.divisions}>
                    <ResponsiveMultiSelect
                      label={`Division${isRequired('divisions') ? ' *' : ''}`}
                      options={[{ id: 'all', name: 'All' }, ...allDivision]}
                      value={formik.values.divisions}
                      getOptionLabel={(option: any) => option?.name}
                      getOptionValue={(option: any) => option?.id}
                      disabled={formik.values.standards.length === 0}
                      onChange={(selectedValues) => {
                        if (
                          selectedClassIds.length > 1 ||
                          formik.values.standards.includes('all')
                        ) {
                          formik.setFieldValue('divisions', ['all']);
                          return;
                        }

                        const allRealIds = allDivision.map((item) => item.id);

                        const nextValues = resolveMultiSelectValues(
                          selectedValues,
                          formik.values.divisions,
                          allRealIds
                        );

                        formik.setFieldValue('divisions', nextValues);
                      }}
                      error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('exam') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.exam && !!formik.touched.exam}>
                    <CustomSelect
                      label={`Exam${isRequired('exam') ? ' *' : ''}`}
                      options={examOptions}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.exam}
                      onChange={(value) => formik.setFieldValue('exam', value)}
                      error={formik.touched.exam && Boolean(formik.errors.exam)}
                      helperText={(formik.touched.exam && formik.errors.exam) as string}
                      disabled={!shouldLoadExams}
                      isLoading={isExamLoading || isExamFetching}
                      noOptionsMessage={examNoOptionsMessage}
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('subject') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.subject && !!formik.touched.subject}>
                    <CustomSelect
                      label={`Subject${isRequired('subject') ? ' *' : ''}`}
                      options={subjectOptions}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.subject}
                      onChange={(value) => {
                        formik.setFieldValue('subject', value);
                        formik.setFieldValue('grade', []);
                      }}
                      error={formik.touched.subject && Boolean(formik.errors.subject)}
                      helperText={(formik.touched.subject && formik.errors.subject) as string}
                      disabled={!shouldLoadSubjects}
                      isLoading={isSubjectLoading || isSubjectFetching}
                      noOptionsMessage={subjectNoOptionsMessage}
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('grade') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.grade && !!formik.touched.grade}>
                    <ResponsiveMultiSelect
                      label={`Grade${isRequired('grade') ? ' *' : ''}`}
                      options={gradeOptions}
                      value={formik.values.grade}
                      getOptionLabel={(option: any) => option?.name ?? ''}
                      getOptionValue={(option: any) => option?.id ?? ''}
                      disabled={!shouldLoadGrades}
                      isLoading={isGradeLoading || isGradeFetching}
                      onChange={(selectedValues) => {
                        formik.setFieldValue('grade', selectedValues);
                      }}
                      error={formik.touched.grade && Boolean(formik.errors.grade)}
                      helperText={
                        ((formik.touched.grade && formik.errors.grade) as string)
                          ? ((formik.touched.grade && formik.errors.grade) as string)
                          : gradeNoOptionsMessage === 'No grades found' && shouldLoadGrades
                            ? 'No grades found for selected filters'
                            : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              <Grid size={12} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="small"
                  type="submit"
                  startIcon={<Iconify icon={GlobalIcons.report} />}
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

export default StudentRankingReports;
